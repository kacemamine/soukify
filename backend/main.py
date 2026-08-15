from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.mongodb import check_mongodb_connection
from routes.test_database import router as test_database_router
from routes.products import router as products_router
from routes.artisans import router as artisans_router
from routes.listings import router as listings_router
from routes.bespoke import router as bespoke_router
from routes.matching import router as matching_router
app = FastAPI(
    title="SOUKIFY API",
    description="Backend API for the SOUKIFY AI-powered marketplace PoC",
    version="0.1.0",
)
app.include_router(products_router)
app.include_router(artisans_router)
app.include_router(listings_router)
app.include_router(bespoke_router)
app.include_router(matching_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "SOUKIFY API is running!"}

@app.get("/health")
def health_check():
    mongodb_status = check_mongodb_connection()
    return {        "api": "ok",
                    "mongodb": "connected" if mongodb_status else "disconnected"
        }
