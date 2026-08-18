from fastapi import APIRouter, HTTPException
from bson import ObjectId

from database.mongodb import db


router = APIRouter(
    prefix="/api/matching",
    tags=["Matching"]
)


def normalize(value):
    return str(value).strip().lower()


@router.get("/{bespoke_id}")
def match_artisans(bespoke_id: str):
    """
    Calcule le matching entre une demande Bespoke et les artisans disponibles.
    Le scoring s'établit sur 100 points maximum :
    - Catégorie compatible : 50 points
    - Savoir-faire compatible : 20 points
    - Région identique : 20 points
    - Artisan disponible : 10 points
    """

    # Vérifier si l'ID MongoDB est valide
    if not ObjectId.is_valid(bespoke_id):
        raise HTTPException(
            status_code=400,
            detail="Identifiant Bespoke invalide."
        )

    # Récupérer la demande Bespoke
    bespoke = db["bespoke_requests"].find_one(
        {"_id": ObjectId(bespoke_id)}
    )

    if not bespoke:
        raise HTTPException(
            status_code=404,
            detail="Demande Bespoke introuvable."
        )

    # Récupérer tous les artisans
    artisans = list(db["artisans"].find())

    results = []

    # Informations de la demande
    requested_category = normalize(
        bespoke.get("category", "")
    )

    requested_region = normalize(
        bespoke.get("region", "")
    )

    request_text = " ".join([
        normalize(bespoke.get("description", "")),
        normalize(bespoke.get("material", "")),
        normalize(bespoke.get("inspiration", ""))
    ])

    # Comparer la demande avec chaque artisan
    for artisan in artisans:

        score = 0
        reasons = []

        # 1. Catégorie : 50 points
        artisan_categories = [
            normalize(category)
            for category in artisan.get("categories", [])
        ]

        if requested_category in artisan_categories:
            score += 50
            reasons.append("Catégorie compatible")

        # 2. Savoir-faire : 20 points
        matched_skills = []

        for skill in artisan.get("skills", []):
            normalized_skill = normalize(skill)

            if normalized_skill and normalized_skill in request_text:
                matched_skills.append(skill)

        if matched_skills:
            score += 20
            reasons.append(
                f"Savoir-faire compatible : {', '.join(matched_skills)}"
            )

        # 3. Région : 20 points
        artisan_region = normalize(
            artisan.get("region", "")
        )

        if (
            requested_region
            and requested_region == artisan_region
        ):
            score += 20
            reasons.append("Même région")

        # 4. Disponibilité : 10 points
        if artisan.get("available") is True:
            score += 10
            reasons.append("Artisan disponible")

        results.append({
            "artisan_id": str(artisan["_id"]),
            "name": artisan.get("name", ""),
            "score": score,
            "reasons": reasons
        })

    # Classer du meilleur au plus faible score pour mettre en avant les artisans les plus pertinents
    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return {
        "bespoke_id": bespoke_id,
        "matches": results
    }