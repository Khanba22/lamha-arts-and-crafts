import os
import json
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.binary import Binary

# Load environment variables from .env
load_dotenv()

MONGO_DB_URL = os.getenv("MONGO_DB_URL")
if not MONGO_DB_URL:
    raise ValueError("MONGO_DB_URL environment variable is not set!")

DB_NAME = "lamha-art-and-crafts"
COLLECTION_NAME = "products"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCRAPED_JSON_PATH = os.path.join(BASE_DIR, "scraped_products.json")

def load_image_as_binary(rel_path):
    full_path = os.path.join(BASE_DIR, rel_path.replace("/", os.sep))
    if not os.path.exists(full_path):
        print(f"Warning: Image file not found: {full_path}")
        return None
    with open(full_path, "rb") as f:
        data = f.read()
    return Binary(data)

def dump_to_mongodb():
    print(f"Connecting to MongoDB...")
    client = MongoClient(MONGO_DB_URL)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    print(f"Reading {SCRAPED_JSON_PATH}...")
    with open(SCRAPED_JSON_PATH, "r", encoding="utf-8") as f:
        products = json.load(f)

    print(f"Total products to process: {len(products)}")

    documents_to_insert = []

    for p in products:
        name = p.get("name", "")
        price = p.get("price", 0)
        discount_price = p.get("discount_price", price)
        tag = p.get("tag", "")
        # Requirement: "category: this should be the 'subcategory' field of the current json mapped to it"
        category = p.get("subcategory", "")
        occasions = p.get("occasion", [])
        one_liner = p.get("one_liner", "")
        description = p.get("description", "")

        # Read images as binary blobs (first image is primary index 0)
        image_blobs = []
        for img_rel in p.get("images", []):
            binary_blob = load_image_as_binary(img_rel)
            if binary_blob is not None:
                image_blobs.append(binary_blob)

        # MongoDB automatically generates _id (ObjectId)
        doc = {
            "name": name,
            "price": price,
            "discount_price": discount_price,
            "tag": tag,
            "category": category,
            "occasions": occasions,
            "images": image_blobs,
            "one_liner": one_liner,
            "description": description
        }
        documents_to_insert.append(doc)

    print(f"Clearing existing documents in collection '{COLLECTION_NAME}'...")
    collection.delete_many({})

    print(f"Inserting {len(documents_to_insert)} documents into MongoDB collection '{COLLECTION_NAME}'...")
    result = collection.insert_many(documents_to_insert)

    print(f"Successfully inserted {len(result.inserted_ids)} products into MongoDB!")
    print(f"Database: '{DB_NAME}', Collection: '{COLLECTION_NAME}'")

    # Verify first inserted document
    sample_doc = collection.find_one()
    if sample_doc:
        print("\nSample Document from MongoDB (images binary omitted for preview):")
        preview = {k: (f"<Binary BLOB: {len(v)} images>" if k == "images" else v) for k, v in sample_doc.items()}
        print(preview)

if __name__ == "__main__":
    dump_to_mongodb()
