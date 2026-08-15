from pydantic import BaseModel, Field

class BespokeCreate(BaseModel):
    category: str
    region: str
    description: str
    dimensions: str
    material: str
    colors: list[str]
    inspiration: str
    budget : float=Field(gt=0.0)
    deadline: str
