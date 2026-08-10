from fastapi import APIRouter, HTTPException , File , UploadFile
router = APIRouter(
    prefix="/api/listings",
    tags=["AI listings"]
)
@router.post("/analyze")
async def analyze_listing(image: UploadFile = File(...)):
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if image.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported image format")
    image_bytes=await image.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty image file")
    return {"message": "Image uploaded successfully", 
            "filename": image.filename, 
            "content_type": image.content_type,
            "size": len(image_bytes)}