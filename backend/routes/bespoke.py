from fastapi import APIRouter

from database.mongodb import db
from schemas.bespoke import BespokeCreate
from models.bespoke import bespoke_document


router = APIRouter(
    prefix="/api/bespoke",
    tags=["Bespoke Commissions"]
)


@router.post("")
def create_bespoke_request(request: BespokeCreate):

    document = bespoke_document(
        category=request.category,
        region=request.region,
        description=request.description,
        dimensions=request.dimensions,
        material=request.material,
        colors=request.colors,
        inspiration=request.inspiration,
        budget=request.budget,
        deadline=request.deadline
    )

    result = db.bespoke_requests.insert_one(document)

    return {
        "message": "Bespoke request created successfully",
        "id": str(result.inserted_id)
    }


@router.get("")
def get_bespoke_requests():

    requests = []

    for request in db.bespoke_requests.find():
        request["id"] = str(request["_id"])
        del request["_id"]
        requests.append(request)

    return requests