from datetime import datetime, timezone
from unicodedata import name

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