from io import BytesIO

from PIL import Image, ImageFilter, ImageStat, UnidentifiedImageError


def check_image_quality(image_bytes: bytes) -> dict:
    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except UnidentifiedImageError:
        return {
            "is_acceptable": False,
            "reason": "invalid_image",
            "message": "Le fichier fourni n'est pas une image valide."
        }

    width, height = image.size

    # 1. Résolution minimale
    if width < 400 or height < 400:
        return {
            "is_acceptable": False,
            "reason": "low_resolution",
            "message": (
                "La résolution de l'image est trop faible. "
                "Veuillez reprendre une photo plus nette et plus proche du produit."
            )
        }

    # Conversion en niveaux de gris
    gray = image.convert("L")

    # 2. Luminosité moyenne
    brightness = ImageStat.Stat(gray).mean[0]

    if brightness < 45:
        return {
            "is_acceptable": False,
            "reason": "too_dark",
            "message": (
                "La photo est trop sombre. "
                "Veuillez reprendre la photo dans un environnement mieux éclairé."
            )
        }

    if brightness > 225:
        return {
            "is_acceptable": False,
            "reason": "too_bright",
            "message": (
                "La photo est surexposée. "
                "Veuillez éviter une lumière trop forte et reprendre la photo."
            )
        }

    # 3. Estimation simple du flou
    edges = gray.filter(ImageFilter.FIND_EDGES)
    sharpness_score = ImageStat.Stat(edges).var[0]

    if sharpness_score < 150:
        return {
            "is_acceptable": False,
            "reason": "blurry",
            "message": (
                "La photo semble floue. "
                "Veuillez stabiliser l'appareil et reprendre une photo plus nette."
            )
        }

    return {
        "is_acceptable": True,
        "reason": None,
        "message": None,
        "metrics": {
            "width": width,
            "height": height,
            "brightness": round(brightness, 2),
            "sharpness": round(sharpness_score, 2),
        }
    }