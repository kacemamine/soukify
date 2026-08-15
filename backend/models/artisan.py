from datetime import datetime, timezone

from matplotlib.style import available


def artisan_document(
    name: str, 
    region: str,
    workshop: str,
    categories: list[str],
    skills: list[str],
    available: bool = True

):
    return {
        "name": name,
        "region": region,
        "workshop": workshop,
        "categories": categories,
        "skills": skills,
        "available": available,
        "created_at": datetime.now(timezone.utc)
    }

