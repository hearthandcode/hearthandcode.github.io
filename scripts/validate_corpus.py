from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import re,json,sys
import yaml
root=Path(__file__).resolve().parents[1]
articles=json.loads((root/'publication.json').read_text())['articles']
contract=yaml.safe_load((root/'fieldcraft-contract.yaml').read_text())
expected_total=int(sys.argv[1]) if len(sys.argv)>1 else contract['corpus']['required_total']
assert len(articles)==expected_total,f'Expected {expected_total} articles, got {len(articles)}'
assert {a['id'] for a in articles}=={f'FC-{i:03}' for i in range(1,expected_total+1)},'Noncontiguous IDs'
headings=contract['article']['section_order']
words={}
for a in articles:
 assert set(contract['article']['metadata_required']) <= a.keys(),f'{a["id"]}: contract metadata missing'
 slug=a['slug'];text=(root/'content'/f'{slug}.md').read_text()
 pos=[text.find('## '+h) for h in headings]
 assert all(i>=0 for i in pos) and pos==sorted(pos),f'{slug}: headings/order'
 assert not re.search(r'^undefined\s*$',text,re.M),f'{slug}: unresolved source note'
 assert '/* fixture input */' not in text,f'{slug}: non-runnable invocation placeholder'
 assert text.count('<!--DEMO-->')==1,f'{slug}: demo marker'
 prose=re.sub(r'```[\s\S]*?```','',text);prose=re.sub(r'</?[A-Za-z][A-Za-z0-9]*(?:\s+[^<>]*?)?/?>|<!--[\s\S]*?-->',' ',prose)
 words[slug]=len(re.findall(r"\b[\w’-]+\b",prose))
 if a['id']!='FC-001':
  assert 400<=words[slug]<=950,f'{slug}: {words[slug]} words (target 400–900, tolerance 50 for notation)'
  module=(root/'examples'/f'{slug}.mjs').read_text().strip()
  fences=re.findall(r'```(?:javascript|js|mjs)\n([\s\S]*?)```',text)
  normalize=lambda s:re.sub(r'\s+','',s)
  assert any(normalize(module)==normalize(f.strip()) for f in fences),f'{slug}: article/module code drift'
  assert not re.search(r'\b(fetch|eval|localStorage|sessionStorage)\s*\(',module),f'{slug}: forbidden effect'
 assert a['category'] in ['engineering','knowledge','creative']
 assert a['verified'] is False
 assert a['source_refs'],f'{slug}: missing sources'
 assert (root/'site'/f'{slug}.html').exists()
class Links(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.fragments=[]
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k=='id':self.ids.append(v)
   if k in ('src','href') and v and not urlsplit(v).scheme:
    target=urlsplit(v);path=root/'site'/target.path
    if target.path:assert path.exists(),str(path)
    elif target.fragment:self.fragments.append(target.fragment)
for file in (root/'site').glob('*.html'):
 parser=Links();parser.feed(file.read_text());assert len(parser.ids)==len(set(parser.ids)),f'{file}: duplicate IDs'
 assert all(f in parser.ids for f in parser.fragments),f'{file}: missing local fragment'
print(json.dumps({'articles':len(articles),'word_counts':words,'checks':'IDs, sections, words, code identity, local links, fragment targets, metadata'},indent=2))
