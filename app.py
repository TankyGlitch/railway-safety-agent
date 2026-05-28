from pymongo import MongoClient
from dotenv import load_dotenv
import os
import json
load_dotenv()

mongo_uri = os.getenv("MONGO_URI")

client = MongoClient(mongo_uri)

db = client["railway_emergency"]
trains_collection = db["trains"]
hospitals_collection = db["hospitals"]
responders_collection = db["responders"]


