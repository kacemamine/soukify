from datetime import datetime , timezone



def product_document(
    artisan_id: str,
    title: str,
    description_fr: str,
    description_ar: str,
    category: str,
    material: str,
    style: str,
    colors: list[str],
    tags: list[str],
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
        "style": style,
        "colors": colors,
        "tags": tags,
        "price": price,
        "status": status,
        "created_at": datetime.now(timezone.utc)
    }