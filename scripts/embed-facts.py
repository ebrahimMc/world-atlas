#!/usr/bin/env python3
"""Embed curated bilingual facts in the offline page. No network dependency."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
p=root/'index.html';text=p.read_text();data=json.loads((root/'data/country-facts.json').read_text())
countries=json.loads(re.search(r'const COUNTRIES\s*=\s*(\[.*?\]);',text).group(1))
assert set(data)=={c['code'] for c in countries}, 'Country coverage differs'
for code,facts in data.items():
 assert facts['sources'], f'{code}: missing source'
 for language in facts['languages']:
  assert language['en'] and re.search(r'[\u0600-\u06ff]',language['fa']), f'{code}: missing translation'
 assert facts['languages'] or all(facts['languageNote'].values()), f'{code}: unexplained empty languages'
 assert all(facts['religion'][lang] for lang in ('en','fa')), f'{code}: missing religion'
 assert all(source['url'].startswith('https://') for source in facts['sources'])
serialized=json.dumps(data,ensure_ascii=False,separators=(',',':'))
text,n=re.subn(r'const COUNTRY_FACTS = .*?;\n',lambda _:f'const COUNTRY_FACTS = {serialized};\n',text,count=1)
assert n==1, 'Embedded facts marker missing'
p.write_text(text)
print(f'Embedded and validated {len(data)} country records.')
