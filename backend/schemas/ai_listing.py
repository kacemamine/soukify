from pydantic import BaseModel
from typing import List

class AIListingResponse(BaseModel):
   titre: str
   description_fr: str
   description_ar: str
   categorie: str
   materiel: str
   colors: List[str]
   tags: List[str]
   