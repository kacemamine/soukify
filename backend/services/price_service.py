def suggest_price_range(db, category: str, material: str):
    """
    Recherche dans MongoDB des produits de même catégorie et matière,
    calcule le prix min, max, moyen et le nombre de références.
    Retourne uniquement une indication de prix, jamais un prix imposé.
    """
    query = {}

    if category:
        query["category"] = {
            "$regex": f"^{category}$",
            "$options": "i"
        }

    if material:
        query["material"] = {
            "$regex": f"^{material}$",
            "$options": "i"
        }

    products = list(
        db["products"].find(
            query,
            {
                "_id": 0,
                "price": 1
            }
        )
    )

    prices = []

    for product in products:
        price = product.get("price")

        if isinstance(price, (int, float)) and price > 0:
            prices.append(float(price))

    if not prices:
        return {
            "min_price": None,
            "max_price": None,
            "average_price": None,
            "similar_products_count": 0
        }

    return {
        "min_price": round(min(prices), 2),
        "max_price": round(max(prices), 2),
        "average_price": round(
            sum(prices) / len(prices),
            2
        ),
        "similar_products_count": len(prices)
    }