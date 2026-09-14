with open('product_page.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
matches = re.findall(r'self\.__next_f\.push\(\[1,\s*"(.*?)"\]\)', text, re.DOTALL)
unescaped = ''.join([m.encode('utf-8').decode('unicode_escape', errors='ignore') for m in matches])
idx = unescaped.find('Evileye jute potli')
if idx != -1:
    print(unescaped[idx-100:idx+600])
