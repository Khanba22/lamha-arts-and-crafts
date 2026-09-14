import os
import json
import re
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

OCCASION_MAP = {
    "diwali-festive": {
        "label": "Diwali & Festive",
        "categories": ["Shubh Labh Hanging Decor", "T-Light Rangoli Set", "Toran (Bandhanwar)"]
    },
    "wedding-haldi": {
        "label": "Wedding & Haldi",
        "categories": ["Haldi Kumkum Platter", "Shagun Nariyal", "Shagun Envelopes"]
    },
    "pooja-housewarming": {
        "label": "Pooja & Housewarming",
        "categories": ["Shubh Labh Hanging Decor", "Toran (Bandhanwar)", "T-Light Rangoli Set"]
    },
    "shagun-gifting": {
        "label": "Shagun & Gifting",
        "categories": ["Shagun Envelopes", "Shagun Nariyal"]
    }
}

def get_occasions_for_category(category_name, product_name=""):
    matching = []
    for occ_id, config in OCCASION_MAP.items():
        if category_name in config["categories"]:
            matching.append(occ_id)
    
    # Sensible fallbacks for other traditional craft items
    if not matching:
        cat_lower = category_name.lower()
        if any(w in cat_lower for w in ["potli", "shagun", "gifting"]):
            matching = ["shagun-gifting"]
        elif any(w in cat_lower for w in ["bajot", "chorang", "sinhasan", "jhula", "ganpati", "backdrop"]):
            matching = ["pooja-housewarming", "diwali-festive"]
        elif any(w in cat_lower for w in ["runner", "plate", "haldi", "thali"]):
            matching = ["wedding-haldi"]
        else:
            matching = ["diwali-festive"]
            
    return matching

def fetch_all_products():
    print("Fetching homepage from https://www.lamhaartsandcraft.com/ ...")
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
    
    resp = session.get("https://www.lamhaartsandcraft.com/")
    resp.raise_for_status()
    
    raw_parts = re.findall(r'self\.__next_f\.push\(\[1,\s*"(.*?)"\]\)', resp.text, re.DOTALL)
    full_text = "".join([p.encode('utf-8').decode('unicode_escape', errors='ignore') for p in raw_parts])
    
    idx = full_text.find('"initialProducts"')
    if idx == -1:
        idx = full_text.find('initialProducts')
    if idx == -1:
        raise ValueError("Could not find initialProducts in Next.js RSC payload!")
        
    arr_start = full_text.find('[', idx)
    count = 0
    end = -1
    for i in range(arr_start, len(full_text)):
        if full_text[i] == '[':
            count += 1
        elif full_text[i] == ']':
            count -= 1
            if count == 0:
                end = i + 1
                break
                
    raw_products = json.loads(full_text[arr_start:end])
    print(f"Successfully extracted {len(raw_products)} raw products.")
    return raw_products, session

def download_image(session, img_url, dest_path):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        return True
    try:
        r = session.get(img_url, timeout=20)
        if r.status_code == 200:
            with open(dest_path, "wb") as f:
                f.write(r.content)
            return True
        else:
            print(f"Failed to download {img_url}: HTTP {r.status_code}")
    except Exception as e:
        print(f"Error downloading {img_url}: {e}")
    return False

def main():
    raw_products, session = fetch_all_products()
    
    # Download tasks: list of (url, target_file_path)
    download_tasks = []
    final_products = []
    
    print("Processing products, formatting tags, occasions, and preparing image downloads...")
    for prod in raw_products:
        prod_id = prod.get("id")
        name = prod.get("name", "").strip()
        price = prod.get("price", 0)
        discount_price = price
        one_liner = prod.get("shortDescription", "").strip()
        description = prod.get("description", "").strip()
        subcategory = prod.get("category", "").strip()
        
        # Determine tag
        if prod.get("isBestseller"):
            tag = "best_seller"
        else:
            tag = "" # or "new_arrival" / "sale"
            
        occasions = get_occasions_for_category(subcategory, name)
        primary_category = occasions[0] if occasions else "diwali-festive"
        
        # Prepare image folder
        prod_img_dir = os.path.join(IMAGES_DIR, str(prod_id))
        os.makedirs(prod_img_dir, exist_ok=True)
        
        raw_imgs = prod.get("images", [])
        local_image_paths = []
        
        for idx, img_url in enumerate(raw_imgs):
            ext = ".webp"
            if ".png" in img_url.lower():
                ext = ".png"
            elif ".jpg" in img_url.lower() or ".jpeg" in img_url.lower():
                ext = ".jpg"
                
            filename = f"{idx}{ext}"
            file_path = os.path.join(prod_img_dir, filename)
            rel_path = f"images/{prod_id}/{filename}"
            local_image_paths.append(rel_path)
            download_tasks.append((img_url, file_path))
            
        product_record = {
            "id": prod_id,
            "name": name,
            "price": price,
            "discount_price": discount_price,
            "one_liner": one_liner,
            "description": description,
            "category": primary_category,
            "occasion": occasions,
            "tag": tag,
            "subcategory": subcategory,
            "images": local_image_paths,
            "original_image_urls": raw_imgs,
            "product_url": f"https://www.lamhaartsandcraft.com/product/{prod_id}"
        }
        final_products.append(product_record)
        
    print(f"Downloading {len(download_tasks)} images concurrently...")
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(download_image, session, url, path): (url, path) for url, path in download_tasks}
        completed = 0
        for future in as_completed(futures):
            completed += 1
            if completed % 25 == 0 or completed == len(download_tasks):
                print(f"Downloaded {completed}/{len(download_tasks)} images...")
                
    output_file = os.path.join(BASE_DIR, "scraped_products.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(final_products, f, indent=2, ensure_ascii=False)
        
    print(f"\nCompleted! Scraped {len(final_products)} products.")
    print(f"Saved to: {output_file}")
    print(f"Images saved under: {IMAGES_DIR}")
    
    # Print sample
    print("\nSample extracted product (First):")
    print(json.dumps(final_products[0], indent=2))

if __name__ == "__main__":
    main()
