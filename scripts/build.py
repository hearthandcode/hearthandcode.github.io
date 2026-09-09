"""Render the explicitly released Fieldcraft corpus without reading private sources."""
from pathlib import Path
import markdown, json, shutil, hashlib, html, re
import xml.etree.ElementTree as ET
from datetime import date
from urllib.parse import urlsplit
root=Path(__file__).resolve().parents[1];out=root/'site';out.mkdir(exist_ok=True)
articles=json.loads((root/'publication.json').read_text())['articles']
assert len({a['id'] for a in articles})==len(articles),'Duplicate article ID'
assert len({a['slug'] for a in articles})==len(articles),'Duplicate slug'
for a in articles:
 assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',a['slug']),'Invalid slug'
 source=root/'content'/f"{a['slug']}.md"
 assert hashlib.sha256(source.read_bytes()).hexdigest()==a['export_sha256'],'Content drift: re-export the master'
for name in ['style.css','app.js']:shutil.copy2(root/'web'/name,out/name)
for name in ['examples','fixtures','content']:
 (out/name).mkdir(exist_ok=True)
# Copy only manifest-owned companions, not incidental files in source folders.
for a in articles:
 slug=a['slug'];shutil.copy2(root/'content'/f'{slug}.md',out/'content'/f'{slug}.md')
 if a['id']=='FC-001':shutil.copy2(root/'examples/check.mjs',out/'examples/check.mjs')
 else:
  for folder,ext in [('examples','mjs'),('fixtures','json')]:shutil.copy2(root/folder/f'{slug}.{ext}',out/folder/f'{slug}.{ext}')
  rust=root/'examples'/f'{slug}.rs'
  if rust.exists():shutil.copy2(rust,out/'examples'/rust.name)
shutil.copy2(root/'publication.json',out/'publication.json')
if (root/'fieldcraft-contract.yaml').exists():shutil.copy2(root/'fieldcraft-contract.yaml',out/'fieldcraft-contract.yaml')
header=(root/'web/header.html').read_text();legacy_demo=(root/'web/demo.html').read_text()
detail_pages=json.loads((root/'web/detail-pages.json').read_text())
def e(value):return html.escape(str(value),quote=True)
def demo(a):
 if a['id']=='FC-001':return legacy_demo
 slug=a['slug'];data=json.loads((root/'fixtures'/f'{slug}.json').read_text())
 config=json.dumps(dict(slug=slug,initial=data['initial'],counterexample=data['counterexample']),ensure_ascii=False).replace('<','\\u003c')
 return f'''<section class="demo" aria-labelledby="demo-title"><div class="demo-top"><span class="eyebrow">WORKING EXAMPLE / LOCAL EXECUTION</span><h3 id="demo-title">Change the input. Inspect the result.</h3></div><div class="demo-grid"><div><label for="demo-input">Example input · JSON</label><textarea id="demo-input" rows="12" spellcheck="false">{e(json.dumps(data['initial'],indent=2,ensure_ascii=False))}</textarea><div class="demo-actions"><button id="demo-run" class="primary">Run the check ↗</button><button id="demo-fail">Failing fixture</button><button id="demo-reset">Reset</button></div></div><div class="result" aria-live="polite" aria-atomic="true"><span class="eyebrow">EXAMPLE RESULT</span><h3 id="demo-verdict">Loading example</h3><p id="demo-summary"></p><pre id="demo-result"></pre><p class="note">Synthetic input. No model call. No data leaves this page.</p></div></div><script id="demo-config" type="application/json">{config}</script></section>'''
ordered=sorted(articles,key=lambda a:(a['date'],a['id']),reverse=True)
for index,a in enumerate(ordered):
 slug=a['slug'];body=markdown.markdown((root/'content'/f'{slug}.md').read_text(),extensions=['fenced_code','tables']).replace('<!--DEMO-->',demo(a))
 if a['id']!='FC-001':body=re.sub(r'(<h2>01 / State the predicate</h2>\s*)(<p>.*?</p>)',r'\1<div class="formulation">\2</div>',body,count=1,flags=re.S)
 refs=[]
 raw_refs=iter(a.get('source_refs',[]))
 pending=list(raw_refs);ref_index=0
 while ref_index<len(pending):
  ref=pending[ref_index];ref_index+=1
  if isinstance(ref,dict):url=ref.get('url','');title=ref.get('title',url)
  elif isinstance(ref,str) and ref.startswith('https://'):
   url=ref;parts=urlsplit(url);title=parts.netloc+' · '+(parts.fragment or parts.path.rstrip('/').split('/')[-1] or 'Reference')
  elif ref_index<len(pending) and isinstance(pending[ref_index],str) and pending[ref_index].startswith('https://'):
   title=ref;url=pending[ref_index];ref_index+=1
  else:url='';title=ref
  refs.append(f'<li><a href="{e(url)}">{e(title)}</a></li>' if url.startswith('https://') else f'<li>{e(title)}</li>')
 if refs:body+='<section class="article-references" aria-label="References"><h3>References</h3><ul>'+''.join(refs)+'</ul></section>'
 label='Design preview' if a['id']=='FC-001' else 'Seed edition'
 example='check.mjs' if a['id']=='FC-001' else f'{slug}.mjs'
 downloads=f'<p><a href="content/{slug}.md" download>Markdown ↓</a></p><p><a href="examples/{example}" download>Working example ↓</a></p>'
 if a['id']!='FC-001':downloads+=f'<p><a href="fixtures/{slug}.json" download>Test fixtures ↓</a></p>'
 if (root/'examples'/f'{slug}.rs').exists():downloads+=f'<p><a href="examples/{slug}.rs" download>Rust source ↓</a></p>'
 adjacent=[]
 if index+1<len(ordered):b=ordered[index+1];adjacent.append(f'<a href="{b["slug"]}.html">← {e(b["id"])} · {e(b["title"])}</a>')
 if index>0:b=ordered[index-1];adjacent.append(f'<a href="{b["slug"]}.html">{e(b["id"])} · {e(b["title"])} →</a>')
 page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="{e(a['description'])}"><title>{e(a['title'])} · Fieldcraft</title><link rel="stylesheet" href="style.css"><link rel="alternate" type="application/rss+xml" title="Fieldcraft" href="feed.xml"><script type="module" src="app.js"></script></head><body><a class="skip" href="#main">Skip to content</a>{header}<main id="main" class="article-layout"><aside class="article-aside"><a href="fieldcraft.html#library">← The collection</a><p class="eyebrow">FIELD NOTE {e(a['id'][3:])}</p><p>{e(a['subject'])}</p><hr><p><time datetime="{e(a['date'])}">{e(a['date'])}</time><span class="reading-time">{e(a['reading_minutes'])} MIN READ</span></p><span class="pill">{label}</span>{downloads}</aside><article><div class="eyebrow">{e(a['subject']).upper()}</div><h1>{e(a['title'])}</h1><p class="article-deck">{e(a['deck'])}</p>{body}<nav class="article-neighbors" aria-label="Adjacent field notes">{''.join(adjacent)}</nav><a class="back" href="fieldcraft.html#library">← Back to Fieldcraft</a></article></main><footer><span>HEARTH &amp; CODE · FIELDCRAFT</span><span>One technique. A working example. A visible result.</span><a href="feed.xml">RSS ↗</a></footer></body></html>'''
 (out/f'{slug}.html').write_text(page)
rows=''.join(f'<a class="collection-row" href="{a["slug"]}.html" data-category="{e(a["category"])}"><span class="row-number">{e(a["id"][3:])}</span><div><h3>{e(a["title"])}</h3><p>{e(a["subject"])} · {e(a["description"])}</p></div><span class="row-state available">Read + try ↗</span></a>' for a in ordered)
index=(root/'web/index.html').read_text().replace('<!--COLLECTION-->','<div class="collection">'+rows+'</div>').replace('<!--CORPUS_SUMMARY-->',f'{len(articles)} practical field notes. Each with a formulation, a working example, and a counterexample.').replace('</head>','<link rel="alternate" type="application/rss+xml" title="Fieldcraft" href="feed.xml"></head>').replace('Back to top ↑','Back to top ↑')
(out/'fieldcraft.html').write_text(index)
(out/'index.html').write_text((root/'web/root.html').read_text())
detail_nav=''.join(f'<a href="{e(page["slug"])}.html">{e(page["number"])} · {e(page["title"])}</a>' for page in detail_pages)
for page in detail_pages:
 sections=''.join('<section><h2>'+e(section['title'])+'</h2>'+''.join('<p>'+e(paragraph)+'</p>' for paragraph in section['body'].split('\n\n'))+'</section>' for section in page['sections'])
 visual=f'<figure class="detail-visual visual-{e(page["visual"])}" aria-hidden="true"><div class="visual-node node-a"></div><div class="visual-node node-b"></div><div class="visual-node node-c"></div><div class="visual-node node-d"></div><div class="visual-line line-a"></div><div class="visual-line line-b"></div><div class="visual-line line-c"></div><figcaption>{e(page["kicker"])}</figcaption></figure>'
 page_html=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="{e(page['deck'])}"><title>{e(page['title'])} · Hearth &amp; Code</title><link rel="stylesheet" href="style.css"></head><body class="detail-page"><a class="skip" href="#main">Skip to content</a>{header}<main id="main"><section class="detail-hero"><div><p class="eyebrow">{e(page['number'])} / {e(page['kicker'])}</p><h1>{e(page['title'])}</h1><p class="detail-deck">{e(page['deck'])}</p><p class="detail-summary">{e(page['summary'])}</p></div>{visual}</section><div class="detail-layout"><aside class="detail-aside"><a href="./">← Orientation</a><p class="eyebrow">EXPLORE THE LAYER</p>{detail_nav}<a class="fieldcraft-link" href="fieldcraft.html">Fieldcraft library ↗</a></aside><article class="detail-article">{sections}<section class="detail-limit"><p class="eyebrow">KEEP THE CLAIM BOUNDED</p><p>{e(page['limit'])}</p></section></article></div></main><footer><span>HEARTH &amp; CODE · PUBLIC ORIENTATION</span><span>SOURCE-AWARE / BOUNDED</span><a href="./">Back to orientation ↑</a></footer></body></html>'''
 (out/f'{page["slug"]}.html').write_text(page_html)
rss=ET.Element('rss',version='2.0');channel=ET.SubElement(rss,'channel')
for key,value in [('title','Hearth & Code · Fieldcraft'),('link','https://hearthandcode.github.io/'),('description','Practical techniques with working examples.')]:ET.SubElement(channel,key).text=value
for a in ordered:
 item=ET.SubElement(channel,'item');url=f'https://hearthandcode.github.io/{a["slug"]}.html'
 for key,value in [('title',a['title']),('link',url),('guid',url),('description',a['description']),('pubDate',date.fromisoformat(a['date']).strftime('%a, %d %b %Y 00:00:00 GMT'))]:ET.SubElement(item,key).text=value
ET.ElementTree(rss).write(out/'feed.xml',encoding='utf-8',xml_declaration=True)
(out/'.nojekyll').touch()
print(f'Built index, {len(articles)} articles, downloads and RSS; article digests verified')
