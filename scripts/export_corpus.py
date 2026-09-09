"""One-way export from an explicit article allowlist. Never scan unrelated Hub content."""
from pathlib import Path
import sys, json, hashlib, re
import yaml
root=Path(__file__).resolve().parents[1]
master_root=Path(sys.argv[1]).resolve()
manifest=json.loads((root/'publication.json').read_text())
required=['id','slug','title','subject','category','date','status','verified','deck','description','reading_minutes','demo','source_refs']
for entry in manifest['articles']:
 name=entry['source_filename']
 if Path(name).name!=name: raise ValueError('Only flat allowlisted filenames are accepted')
 source=(master_root/name).resolve()
 if source.parent!=master_root:raise ValueError('Source escapes master root')
 raw=source.read_bytes();_,head,body=raw.decode().split('---',2);meta=yaml.safe_load(head)
 missing=set(required)-meta.keys()
 if missing: raise ValueError(f'{name}: missing metadata {missing}')
 if meta['id']!=entry['id'] or meta['slug']!=entry['slug']:raise ValueError('Identity mismatch')
 if meta['verified'] is not False:raise ValueError('Export does not confer a verification seal')
 if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',meta['slug']):raise ValueError('Invalid slug')
 body=body.strip()+'\n'
 if any(s in body for s in ['/home/','discord.com/channels/','-----BEGIN PRIVATE KEY','ghp_','sk-proj-']):raise ValueError('Private content pattern requires review')
 (root/'content'/f"{meta['slug']}.md").write_text(body)
 for key in required:
  entry[key]=str(meta[key]) if key=='date' else meta[key]
 entry['status']='seed-preview' if meta['id']!='FC-001' else 'design-preview'
 entry['master_sha256']=hashlib.sha256(raw).hexdigest();entry['export_sha256']=hashlib.sha256(body.encode()).hexdigest()
(root/'publication.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print(f'Exported {len(manifest["articles"])} explicitly allowlisted masters')
