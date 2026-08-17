from typing import Optional
from pydantic import BaseModel, Field

class ProductCreate(BaseModel):
    artisan_id: str
    title: str
    description_fr: str
    description_ar: str
    category: str
    material: str
    style: str
    colors: list[str]
    tags: list[str]
    price: float = Field(gt=0)
    status: str = "published"
    image_url: Optional[str] = None


class ProductResponse(ProductCreate):
    id: str
    status: str