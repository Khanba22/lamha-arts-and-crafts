import requests
import re
from bs4 import BeautifulSoup
import json

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

url = "https://www.lamhaartsandcraft.com/product/d8f0da56-2afc-4a5b-96b4-1a7115282d97"
resp = session.get(url)
print("Status:", resp.status_code)

raw_parts = re.findall(r'self\.__next_f\.push\(\[1,\s*"(.*?)"\]\)', resp.text, re.DOTALL)
full_text = "".join([p.encode('utf-8').decode('unicode_escape', errors='ignore') for p in raw_parts])

# Find product object in full_text
print("full_text len:", len(full_text))
idx = full_text.find('"d8f0da56-2afc-4a5b-96b4-1a7115282d97"')
print("product id index:", idx)
if idx != -1:
    print("Context around id:")
    print(full_text[max(0, idx-100):min(len(full_text), idx+600)])

soup = BeautifulSoup(resp.text, 'html.parser')
imgs = soup.find_all('img')
print("Images found via BS4:", len(imgs))
for img in imgs:
    print("  img:", img.get('src'), "alt:", img.get('alt'))
