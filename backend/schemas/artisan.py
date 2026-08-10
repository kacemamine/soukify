from pydantic import BaseModel

class ArtisanCreate(BaseModel):
    name:str
    region:str
    workshop:str