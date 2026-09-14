import requests
import re

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

url = "https://www.lamhaartsandcraft.com/"
resp = session.get(url)

# Find all chunk js files
chunks = re.findall(r'/_next/static/chunks/[a-zA-Z0-9_\-\.]+\.js', resp.text)
print("Chunks found:", set(chunks))

for chunk_url in set(chunks):
    js_resp = session.get("https://www.lamhaartsandcraft.com" + chunk_url)
    for occ in ["shagun", "pooja", "wedding", "diwali", "occasion"]:
        if occ in js_resp.text.lower():
            print(f"Match '{occ}' in {chunk_url}")
            # print surrounding text
            pos = js_resp.text.lower().find(occ)
            print("   Context:", js_resp.text[max(0, pos-100):min(len(js_resp.text), pos+200)])
