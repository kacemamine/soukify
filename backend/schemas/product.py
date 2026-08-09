from pydantic import BaseModel


class ProductCreate(BaseModel):
    artisan_id: str
    title: str
    description_fr: str
    description_ar: str
    category: str
    material: str
    price: float


class ProductResponse(ProductCreate):
    id: str
    status: str