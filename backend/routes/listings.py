from fastapi import APIRouter, HTTPException, File, UploadFile

from services.vision_service import analyze_product_image
from services.image_quality import check_image_quality


router = APIRouter(
    prefix="/api/listings",
    tags=["AI listings"]
)


@router.post("/analyze")
async def analyze_product_image_route(
    image: UploadFile = File(...)
):
    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    # Vérification du format
    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Format non supporté. Veuillez choisir une image JPEG, PNG ou WebP."
        )

    # Lecture de l'image une seule fois
    image_bytes = await image.read()

    # Vérification fichier vide
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Le fichier image est vide."
        )

    # -------------------------------------------------
    # Contrôle qualité de l'image
    # -------------------------------------------------

    quality = check_image_quality(image_bytes)

    if not quality["is_acceptable"]:
        raise HTTPException(
            status_code=422,
            detail=quality["message"]
        )

    # -------------------------------------------------
    # Analyse Gemini
    # -------------------------------------------------

    try:
        ai_result = analyze_product_image(
            image_bytes=image_bytes,
            content_type=image.content_type
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(error)}"
        )

    # -------------------------------------------------
    # Réponse
    # -------------------------------------------------

    return {
        "filename": image.filename,
        "quality": quality,
        "analysis": ai_result.model_dump()
    }