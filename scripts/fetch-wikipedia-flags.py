#!/usr/bin/env python3
"""Snapshot the first national flag in each English Wikipedia country infobox.

Uses Wikimedia APIs during maintenance only; the site serves local SVG/PNG assets.
Run from any directory. Cached API responses are kept outside the repository.
"""
import concurrent.futures, datetime, hashlib, json, re, time
from pathlib import Path
from urllib.parse import urlencode, quote, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path('/private/tmp/world-atlas-wikipedia-flags') / datetime.date.today().isoformat()
CACHE.mkdir(parents=True, exist_ok=True)
UA = 'WorldAtlasFlagSnapshot/1.0 (https://github.com/ebrahimMc/world-atlas)'

def fetch(url):
    cache = CACHE / hashlib.sha256(url.encode()).hexdigest()
    if cache.exists():
        return cache.read_bytes()
    for attempt in range(4):
        try:
            with urlopen(Request(url, headers={'User-Agent': UA}), timeout=90) as response:
                data = response.read()
            cache.write_bytes(data)
            return data
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)

def api(host, **params):
    return json.loads(fetch(f'https://{host}/w/api.php?' + urlencode({'format':'json', **params})))

countries = json.loads(re.search(r'const COUNTRIES\s*=\s*(\[.*?\]);', (ROOT/'index.html').read_text()).group(1))
overrides = {'IE':'Republic of Ireland', 'GE':'Georgia (country)', 'CG':'Republic of the Congo', 'CD':'Democratic Republic of the Congo', 'VA':'Vatican City', 'PS':'State of Palestine', 'FM':'Federated States of Micronesia'}
titles = {c['code']:overrides.get(c['code'],c['name']) for c in countries}
records = {}
for start in range(0,len(countries),15):
    batch = countries[start:start+15]
    result = api('en.wikipedia.org', action='query', prop='revisions', rvprop='content|ids', rvslots='main', redirects=1, titles='|'.join(titles[c['code']] for c in batch))
    redirects = {r['from']:r['to'] for r in result['query'].get('redirects',[])}
    pages = {p['title']:p for p in result['query']['pages'].values()}
    for c in batch:
        title = titles[c['code']]
        while title in redirects:
            title = redirects[title]
        p = pages[title]
        text = p['revisions'][0]['slots']['main']['*']
        matches = re.findall(r'^\s*\|\s*image_flag\s*=\s*(.*?)\s*$', text, re.M)
        flag = re.sub(r'<!--.*?-->', '', matches[0]).strip() if matches else ''
        if flag.startswith('[[File:'):
            flag = flag[7:].split('|',1)[0].removesuffix(']]').strip()
        flag = flag.removeprefix('File:').replace('_',' ').strip()
        if not flag or '{{' in flag or '[[' in flag:
            raise ValueError(f"{c['code']} {title}: inspect image_flag={flag!r}")
        records[c['code']] = {'country':c['name'], 'article':f'https://en.wikipedia.org/wiki/{quote(title.replace(" ","_"))}', 'revision':p['revisions'][0]['revid'], 'file':flag, 'retrieved':datetime.date.today().isoformat()}
    print(f'Wikipedia country infoboxes: {min(start+15,len(countries))}/{len(countries)}', flush=True)
print('All infobox flag selections resolved.', flush=True)

files = list(dict.fromkeys(r['file'] for r in records.values()))
file_info = {}
for start in range(0,len(files),25):
    result = api('commons.wikimedia.org', action='query', prop='imageinfo', iiprop='url|extmetadata', redirects=1, titles='|'.join('File:'+name for name in files[start:start+25]))
    for p in result['query']['pages'].values():
        if 'imageinfo' not in p:
            raise ValueError('Missing Commons file: '+p['title'])
        file_info[p['title'].removeprefix('File:')] = p['imageinfo'][0]
    # Follow normalization and redirects before matching the requested filenames.
    mappings = {m['from'].removeprefix('File:'):m['to'].removeprefix('File:') for m in result['query'].get('normalized',[]) + result['query'].get('redirects',[])}
    for original in mappings:
        target = original
        while target in mappings:
            target = mappings[target]
        file_info[original] = file_info[target]
    print(f'Wikimedia image metadata: {min(start+25,len(files))}/{len(files)}',flush=True)

def download(item):
    code, record = item
    info = file_info[record['file'].replace('_',' ')]
    suffix = Path(urlsplit(info['url']).path).suffix.lower()
    if suffix not in ('.svg','.png'):
        raise ValueError('Unsupported flag format: '+info['url'])
    content = fetch(info['url'])
    if suffix == '.svg' and (b'<svg' not in content or b'<script' in content.lower()):
        raise ValueError('Invalid SVG: '+code)
    path = f'assets/flags/{code.lower()}{suffix}'
    (ROOT/path).write_bytes(content)
    metadata = info.get('extmetadata',{})
    record.update({'path':path, 'imageUrl':info['url'], 'descriptionUrl':info['descriptionurl'], 'license':metadata.get('LicenseShortName',{}).get('value',''), 'licenseUrl':metadata.get('LicenseUrl',{}).get('value',''), 'artist':metadata.get('Artist',{}).get('value',''), 'credit':metadata.get('Credit',{}).get('value',''), 'sha256':hashlib.sha256(content).hexdigest()})
    return code

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for n, code in enumerate(pool.map(download,records.items()),1):
        if n%25 == 0 or n == len(records):
            print(f'Local flag assets: {n}/{len(records)}',flush=True)
(ROOT/'data/wikipedia-flags.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
print('All Wikipedia flags and provenance saved.')
