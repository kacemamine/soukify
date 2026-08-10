from datetime import datetime, timezone


def artisan_document(
    name: str, 
    region: str,
    workshop: str):
    return {
        "name": name,
        "region": region,
        "workshop": workshop,
        "created_at": datetime.now(timezone.utc)
    }