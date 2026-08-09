import os 
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE","soukify")

client=MongoClient(MONGODB_URI)
db=client[MONGODB_DATABASE]

def check_mongodb_connection():
    try:
        # The ismaster command is cheap and does not require auth.
        client.admin.command('ping')
        return True
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        return False