from pydantic import BaseModel

class ArtisanCreate(BaseModel):
    name:str
    region:str
    workshop:str
    categories:list[str]
    skills:list[str]
    available:bool=True
    
