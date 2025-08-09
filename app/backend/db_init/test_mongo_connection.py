from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

try:
    # Print list of databases to confirm connection
    print("Databases on server:", client.list_database_names())
    print("✅ MongoDB is connected successfully.")
except Exception as e:
    print("❌ Connection failed:", e)
