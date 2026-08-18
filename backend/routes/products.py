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
        # Validation de artisan_id pour s'assurer que le format ObjectId est correct
        artisan_object_id = ObjectId(product.artisan_id)

    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid artisan ID"
        )

    # Vérification de l'existence de l'artisan dans la base de données
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
    price=product.price,
    status=product.status,
    image_url=product.image_url
    )

    # Enregistrement du produit dans la base
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
        
        artisan_id = product.get("artisan_id")
        artisan_name = None
        if artisan_id:
            try:
                artisan = db.artisans.find_one({"_id": ObjectId(artisan_id)})
                if artisan and "name" in artisan:
                    artisan_name = artisan["name"]
            except InvalidId:
                pass
        # Enrichissement éventuel du produit avec artisan_name pour l'affichage
        product["artisan_name"] = artisan_name
        
        products.append(product)
    return products


@router.get("/price-suggestion")
def get_price_suggestion(
    category: str = "",
    material: str = ""
):
    try:
        # Suggestion de prix basée sur les produits similaires (même catégorie et matière)
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