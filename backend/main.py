from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.mongodb import check_mongodb_connection
from routes.test_database import router as test_database_router
app = FastAPI(
    title="SKOUFY API",
    description="Backend API for the SOUKIFY AI-powered marketplace PoC",
    version="0.1.0",
)
app.include_router(test_database_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "SKOUFY API is running!"}

@app.get("/health")
def health_check():
    mongodb_status = check_mongodb_connection()
    return {        "api": "ok",
                    "mongodb": "connected" if mongodb_status else "disconnected"
        }
