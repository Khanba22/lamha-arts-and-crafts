import requests
import json
import re

chunk_url = "https://www.lamhaartsandcraft.com/_next/static/chunks/070thee0q8t4x.js"
resp = requests.get(chunk_url)
text = resp.text

# Find all category definitions and mapping
matches = re.findall(r'\{id:"([a-z\-]+)",label:"([^"]+)",image:"([^"]+)",categories:(\[[^\]]+\])\}', text)
for m in matches:
    print(m[0], "->", m[1], "categories:", m[3])
