import test_extract
products = test_extract.products
cats = set(p['category'] for p in products)
print('All categories in products:', cats)

k = [
  {'id': 'diwali-festive', 'label': 'Diwali & Festive', 'categories': ['Shubh Labh Hanging Decor', 'T-Light Rangoli Set', 'Toran (Bandhanwar)']},
  {'id': 'wedding-haldi', 'label': 'Wedding & Haldi', 'categories': ['Haldi Kumkum Platter', 'Shagun Nariyal', 'Shagun Envelopes']},
  {'id': 'pooja-housewarming', 'label': 'Pooja & Housewarming', 'categories': ['Shubh Labh Hanging Decor', 'Toran (Bandhanwar)', 'T-Light Rangoli Set']},
  {'id': 'shagun-gifting', 'label': 'Shagun & Gifting', 'categories': ['Shagun Envelopes', 'Shagun Nariyal']}
]

all_mapped = set()
for item in k:
    matched = [p for p in products if p['category'] in item['categories']]
    print(f"Occasion {item['id']}: {len(matched)} products matched. Categories: {item['categories']}")
    all_mapped.update(item['categories'])

print('Unmapped categories:', cats - all_mapped)
unmapped_prods = [p for p in products if p['category'] not in all_mapped]
print('Unmapped products count:', len(unmapped_prods))
for c in set(p['category'] for p in unmapped_prods):
    print(f"  Unmapped cat: {c}, count: {len([p for p in unmapped_prods if p['category'] == c])}")
