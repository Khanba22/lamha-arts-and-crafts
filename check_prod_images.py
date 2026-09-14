import json

with open("test_extract.py") as f:
    pass

import test_extract
products = test_extract.products
print("Total products in initialProducts:", len(products))
all_with_imgs = [p for p in products if p.get('images')]
print("Products with images array in initialProducts:", len(all_with_imgs))
img_counts = [len(p.get('images', [])) for p in products]
print("Distribution of image counts:", {c: img_counts.count(c) for c in set(img_counts)})
sample = products[2]
print("Sample product:", sample["name"], sample["images"])
