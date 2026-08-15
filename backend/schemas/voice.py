from pydantic import BaseModel
from typing import Optional

class VoiceProductData(BaseModel):
    product_name: Optional[str]=None
    price: Optional[str]=None
    material: Optional[str]=None

class VoiceTextRequest(BaseModel):
    transcription: str