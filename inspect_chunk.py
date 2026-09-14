import requests

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

chunk_url = "https://www.lamhaartsandcraft.com/_next/static/chunks/070thee0q8t4x.js"
resp = session.get(chunk_url)
text = resp.text

pos = text.find('diwali-festive')
print(text[pos-200:pos+800])
