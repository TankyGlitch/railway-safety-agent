import os
from pymongo import MongoClient
from dotenv import load_dotenv

# 1. Load the secret connection string from the .env file
load_dotenv()
mongo_uri = os.getenv("MONGO_URI")

try:
    # 2. Connect to your MongoDB Atlas cluster
    client = MongoClient(mongo_uri)
    
    # 3. Select your database and collection
    db = client["railway_emergency"]
    trains_collection = db["trains"]
    
    # 4. Try to fetch exactly ONE train document to verify it works
    test_train = trains_collection.find_one()
    
    if test_train:
        print("\n✅ SUCCESS: Python connected to MongoDB Atlas successfully!")
        print(f"👉 Found a live train in your DB: {test_train['train_name']} (ID: {test_train['train_id']})\n")
    else:
        print("\n❌ Connected, but the 'trains' collection looks empty.\n")
        
except Exception as e:
    print("\n❌ ERROR: Could not connect to MongoDB.")
    print(e, "\n")
    