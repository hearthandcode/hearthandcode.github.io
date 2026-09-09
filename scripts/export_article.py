"""Export one explicitly allowlisted master; never traverse the Hub."""
from pathlib import Path
import sys,json,hashlib
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1])
registry=json.loads((root/'publication.json').read_text())
entry=next((a for a in registry['articles'] if a['source_filename']==source.name),None)
if entry is None: raise SystemExit('Article is not in the publication allowlist')
raw=source.read_bytes(); text=raw.decode()
front,body=text.split('---',2)[1:]
if 'public_preview: true' not in front or f"id: {entry['id']}" not in front: raise SystemExit('Preview identity mismatch')
body=body.lstrip()
if '/home/' in body or 'api_key' in body.lower(): raise SystemExit('Review private content before export')
(root/'content'/f"{entry['slug']}.md").write_text(body)
entry['master_sha256']=hashlib.sha256(raw).hexdigest()
entry['export_sha256']=hashlib.sha256(body.encode()).hexdigest()
(root/'publication.json').write_text(json.dumps(registry,indent=2)+'\n')
