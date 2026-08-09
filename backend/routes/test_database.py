from fastapi import APIRouter
from database.mongodb import db

router=APIRouter(
    prefix="/api/test",
    tags=["Databases test"]
)

@router.post("/products")
def create_test_product():
    product = {
        "title":"Vase artisanal marocain ",
        "categorie":"poterie",
        "materiel":"Ceramique",
        "price": 250,
        "status":"draft"
    }
    result = db.products.insert_one(product)
    return {"message": "Test product created", "id": str(result.inserted_id)}


