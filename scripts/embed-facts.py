#!/usr/bin/env python3
"""Embed curated bilingual facts in the offline page. No network dependency."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
p=root/'index.html';text=p.read_text();data=json.loads((root/'data/country-facts.json').read_text())
countries=json.loads(re.search(r'const COUNTRIES\s*=\s*(\[.*?\]);',text).group(1))
assert set(data)=={c['code'] for c in countries}, 'Country coverage differs'
for code,facts in data.items():
 assert re.search(r'[\u0600-\u06ff]',facts['capitalFa']) and not re.search(r'[A-Za-z]',facts['capitalFa']), f'{code}: missing Persian capital'
 cities=facts['citiesFa']
 original=next(c for c in countries if c['code']==code)['cities']
 assert len(cities)==len(original) and all(re.search(r'[\u0600-\u06ff]',v) and not re.search(r'[A-Za-z]',v) for v in cities), f'{code}: missing Persian cities'
 assert facts['sources'], f'{code}: missing source'
 for language in facts['languages']:
  assert language['en'] and re.search(r'[\u0600-\u06ff]',language['fa']), f'{code}: missing translation'
 assert facts['languages'] or all(facts['languageNote'].values()), f'{code}: unexplained empty languages'
 assert all(facts['religion'][lang] for lang in ('en','fa')), f'{code}: missing religion'
 assert isinstance(facts['religion']['official'],bool), f'{code}: missing legal status'
 if not facts['religion']['official']:
  population=facts['populationReligion']
  assert all(population[lang] for lang in ('en','fa')), f'{code}: missing population translation'
  assert population['year'] in (2020,2023) and population['source'].startswith('https://')
  assert population['share'] is None or 0<=population['share']<=100
  assert isinstance(population['majority'],bool)
 assert all(source['url'].startswith('https://') for source in facts['sources'])
serialized=json.dumps(data,ensure_ascii=False,separators=(',',':'))
text,n=re.subn(r'const COUNTRY_FACTS = .*?;\n',lambda _:f'const COUNTRY_FACTS = {serialized};\n',text,count=1)
assert n==1, 'Embedded facts marker missing'
print(f'Validated {len(data)} country records.')

# Keep country flag URLs embedded so browsing needs no runtime metadata request.
flags=json.loads((root/'data/wikipedia-flags.json').read_text())
assert set(flags)=={c['code'] for c in countries}, 'Flag coverage differs'
for code,flag in flags.items():
 assert (root/flag['path']).is_file(), f'{code}: missing local flag asset'
paths=json.dumps({code:flag['path'] for code,flag in flags.items()},separators=(',',':'))
# Emoji glyphs are no longer part of the runtime country data.
for country in countries:
 country.pop('flag',None)
text=re.sub(r'const COUNTRIES\s*=\s*\[.*?\];',lambda _: 'const COUNTRIES = '+json.dumps(countries,ensure_ascii=False,separators=(',',':'))+';',text,count=1)
text=re.sub(r'const FLAG_FILES = .*?;\n','',text,count=1)
text=text.replace('const COUNTRY_FACTS = ',f'const FLAG_FILES = {paths};\nconst COUNTRY_FACTS = ',1)
geography=json.loads((root/'data/country-regions.json').read_text())
assert set(geography)=={c['code'] for c in countries}, 'Geographic region coverage differs'
assert all(v['en'] and re.search(r'[\u0600-\u06ff]',v['fa']) and v['source'].startswith('https://unstats.un.org/') for v in geography.values()), 'Missing region translation or source'
region_payload=json.dumps({code:{'en':v['en'],'fa':v['fa']} for code,v in geography.items()},ensure_ascii=False,separators=(',',':'))
text=re.sub(r'const COUNTRY_REGIONS = .*?;\n','',text,count=1)
text=text.replace('const FLAG_FILES = ',f'const COUNTRY_REGIONS = {region_payload};\nconst FLAG_FILES = ',1)
p.write_text(text)
print(f'Embedded and validated {len(flags)} local Wikipedia flags and {len(geography)} geographic regions.')
