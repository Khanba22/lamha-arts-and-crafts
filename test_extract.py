import requests
import json
import re

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

url = "https://www.lamhaartsandcraft.com/"
resp = session.get(url)

# Find all push calls
# Format is self.__next_f.push([1,"..."])
raw_parts = re.findall(r'self\.__next_f\.push\(\[1,\s*"(.*?)"\]\)', resp.text, re.DOTALL)
print("Found parts:", len(raw_parts))

def unescape(s):
    # standard next.js string unescape
    return s.encode('utf-8').decode('unicode_escape', errors='ignore')

full_text = "".join(unescape(p) for p in raw_parts)
print("Full unescaped text length:", len(full_text))

idx = full_text.find('"initialProducts"')
if idx == -1:
    idx = full_text.find('initialProducts')
print("initialProducts index:", idx)

if idx != -1:
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
    arr_str = full_text[arr_start:end]
    products = json.loads(arr_str)
    print("Extracted products count:", len(products))
    print("First product:", json.dumps(products[0], indent=2))
    print("Categories present:", set(p.get("category") for p in products))
