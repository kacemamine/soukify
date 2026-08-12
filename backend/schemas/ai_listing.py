from pydantic import BaseModel
from typing import List

class AIListingResponse(BaseModel):
    title: str
    description_fr: str
    description_ar: str
    category: str
    material: str
    style: str
    colors: List[str]
    tags: List[str]
   