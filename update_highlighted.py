import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
client = MongoClient(os.getenv("MONGO_DB_URL"))
col = client["lamha-art-and-crafts"]["products"]

# Update bestsellers to highlighted: True
res1 = col.update_many({"tag": "best_seller"}, {"$set": {"highlighted": True}})
print(f"Updated bestsellers with highlighted=True: {res1.modified_count}")

# Update the rest to highlighted: False
res2 = col.update_many({"highlighted": {"$exists": False}}, {"$set": {"highlighted": False}})
print(f"Updated rest with highlighted=False: {res2.modified_count}")

count_high = col.count_documents({"highlighted": True})
count_norm = col.count_documents({"highlighted": False})
print(f"MongoDB verification -> Highlighted: {count_high}, Regular: {count_norm}")

sample = col.find_one({"highlighted": True})
print("Sample highlighted product:", sample["name"], "highlighted:", sample.get("highlighted"))
