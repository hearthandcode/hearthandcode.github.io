"""Run the published Node invocation, not merely its companion fixture."""
from pathlib import Path
import re,shlex,subprocess,json
root=Path(__file__).resolve().parents[1]
articles=json.loads((root/'publication.json').read_text())['articles']
count=0
for article in articles:
 if article['id']=='FC-001':continue
 text=(root/'content'/f"{article['slug']}.md").read_text()
 commands=re.findall(r'`(node --input-type=module[^`]+)`',text)
 if not commands:
  for fence in re.findall(r'```(?:bash|sh|shell)\n([\s\S]*?)```',text):
   commands.extend(line for line in fence.splitlines() if line.startswith('node --input-type=module'))
 assert commands,f'{article["id"]}: no executable Node invocation'
 for command in commands:
  argv=shlex.split(command)
  assert argv[:3]==['node','--input-type=module','-e'],f'{article["id"]}: unexpected invocation'
  result=subprocess.run(argv,cwd=root/'examples',capture_output=True,text=True,timeout=10)
  assert result.returncode==0,f'{article["id"]}: invocation failed: {result.stderr}'
  assert re.search(r'(?:"pass"|pass)\s*:\s*true',result.stdout),f'{article["id"]}: example did not pass: {result.stdout}'
  count+=1
print(f'{count} published Node invocations execute and return a passing result')
