import requests
import re
from bs4 import BeautifulSoup

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

occasions = ["shagun-gifting", "pooja-housewarming", "wedding-haldi", "diwali-festive"]

for occ in occasions:
    url = f"https://www.lamhaartsandcraft.com/?occasion={occ}"
    resp = session.get(url)
    soup = BeautifulSoup(resp.text, "html.parser")
    links = soup.find_all("a", href=lambda h: h and "/product/" in h)
    print(f"Occasion {occ}: status {resp.status_code}, soup links: {len(links)}")
    # Also check if occasion is in any script or state
    raw_push = re.findall(r'self\.__next_f\.push\(\[1,\s*"(.*?)"\]\)', resp.text, re.DOTALL)
    unescaped = "".join([p.encode('utf-8').decode('unicode_escape', errors='ignore') for p in raw_push])
    print(f"Occasion {occ}: unescaped length: {len(unescaped)}, contains occ name? {occ in unescaped}")
