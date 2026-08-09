from fastapi import APIRouter, HTTPException
from database.mongodb import db
from schemas.product import ProductCreate
from models.product import product_document

router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)

@router.post("")
def creat_product(product: ProductCreate):
    document=product_document(
        artisan_id=product.artisan_id,
        title=product.title,
        description_fr=product.description_fr,  
        description_ar=product.description_ar,
        category=product.category,
        material=product.material,
        price=product.price
    )
    result = db.products.insert_one(document)
    return {"message": "Product created successfully","id": str(result.inserted_id) }

@router.get("")
def get_products():
    products = []
    for product in db.products.find():
        product["id"] = str(product["_id"])
        del product["_id"]
        products.append(product)
    return products


