from fastapi import APIRouter
from database.mongodb import db
from models.artisan import artisan_document
from schemas.artisan import ArtisanCreate

router=APIRouter(
    prefix="/api/artisans",
    tags=["Artisans"]
)
@router.post("")
def create_artisan(artisan: ArtisanCreate):
    document=artisan_document(
        name=artisan.name,
        region=artisan.region,
        workshop=artisan.workshop,
        categories=artisan.categories,
        skills=artisan.skills,
        available=artisan.available
    )
    result=db.artisans.insert_one(document)
    return {"message": "Artisan created successfully","id": str(result.inserted_id) }

@router.get("")
def get_artisans():
    artisans=[]
    for artisan in db.artisans.find():
        artisan["id"]=str(artisan["_id"])
        del artisan["_id"]
        artisans.append(artisan)
    return artisans
