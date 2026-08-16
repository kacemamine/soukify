from fastapi import APIRouter, HTTPException
from schemas.product import ProductCreate
from database.mongodb import db
from schemas.product import ProductCreate
from models.product import product_document
from bson import ObjectId
from bson.errors import InvalidId
from services.price_service import suggest_price_range
router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)


@router.post("")
def create_product(product: ProductCreate):

    try:
        artisan_object_id = ObjectId(product.artisan_id)

    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid artisan ID"
        )

    artisan = db.artisans.find_one(
        {"_id": artisan_object_id}
    )

    if artisan is None:
        raise HTTPException(
            status_code=404,
            detail="Artisan not found"
        )

    document = product_document(
    artisan_id=product.artisan_id,
    title=product.title,
    description_fr=product.description_fr,
    description_ar=product.description_ar,
    category=product.category,
    material=product.material,
    style=product.style,
    colors=product.colors,
    tags=product.tags,
    price=product.price
    )

    result = db.products.insert_one(document)

    return {
        "message": "Product created successfully",
        "id": str(result.inserted_id)
    }

@router.get("")
def get_products():
    products = []
    for product in db.products.find():
        product["id"] = str(product["_id"])
        del product["_id"]
        products.append(product)
    return products


@router.get("/price-suggestion")
def get_price_suggestion(
    category: str = "",
    material: str = ""
):
    try:
        result = suggest_price_range(
            db,
            category.strip(),
            material.strip()
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la suggestion de prix : {str(e)}"
        )