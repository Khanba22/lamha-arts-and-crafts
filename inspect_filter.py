import re

chunk_url = "https://www.lamhaartsandcraft.com/_next/static/chunks/070thee0q8t4x.js"
import requests
text = requests.get(chunk_url).text

# Let's see how category filtering works or how occasions filter products
# Search for .filter
pos = text.find('diwali-festive')
sub = text[pos:pos+4000]
print(sub[:1500])
