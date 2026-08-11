from fastapi import APIRouter, HTTPException , File , UploadFile
from services.vision_service import analyze_product_image
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

    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format"
        )

    image_bytes = await image.read()

    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Empty image file"
        )

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

    return {
        "filename": image.filename,
        "analysis": ai_result.model_dump()
    }