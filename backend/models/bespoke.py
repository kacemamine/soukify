from datetime import datetime, timezone


def bespoke_document(
        category: str,
        region: str,
        description: str,
        dimensions: str,
        material: str,
        colors: list[str],
        inspiration: str,
        budget: float,
        deadline: str,
        status: str = "pending"
):
    return {
        "category": category,
        "region": region,
        "description": description,
        "dimensions": dimensions,
        "material": material,
        "colors": colors,
        "inspiration": inspiration,
        "budget": budget,
        "deadline": deadline,
        "status": status,
        "created_at": datetime.now(timezone.utc)
    }