from datetime import datetime


def product_document(
    artisan_id: str,
    title: str,
    description_fr: str,
    description_ar: str,
    category: str,
    material: str,
    price: float,
    status: str = "draft"
):
    return {
        "artisan_id": artisan_id,
        "title": title,
        "description_fr": description_fr,
        "description_ar": description_ar,
        "category": category,
        "material": material,
        "price": price,
        "status": status,
        "created_at": datetime.utcnow()
    }