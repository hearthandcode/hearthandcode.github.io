from pathlib import Path
import subprocess,tempfile
root=Path(__file__).resolve().parents[1]
expected={
'encode-review-state-with-rust-typestate':'candidate:Guarded states',
'make-parse-failure-explicit-with-rust-result':'Ok(42)\nErr(InvalidInteger)',
 'transfer-rust-ownership-at-task-boundaries':'packet-7:bounded work'}
with tempfile.TemporaryDirectory(prefix='fieldcraft-rust-') as temp:
 temp=Path(temp)
 for index,(slug,output) in enumerate(expected.items()):
  binary=temp/f'positive{index}'
  compiled=subprocess.run(['rustc','--edition=2021','--crate-name',f'example{index}',str(root/'examples'/f'{slug}.rs'),'-o',str(binary)],capture_output=True,text=True)
  assert compiled.returncode==0,compiled.stderr
  run=subprocess.run([str(binary)],capture_output=True,text=True)
  assert run.returncode==0 and run.stdout.strip()==output,(slug,run.stdout,run.stderr)
  unit_binary=temp/f'unit{index}'
  unit_compile=subprocess.run(['rustc','--test','--edition=2021','--crate-name',f'unit{index}',str(root/'examples'/f'{slug}.rs'),'-o',str(unit_binary)],capture_output=True,text=True)
  assert unit_compile.returncode==0,unit_compile.stderr
  units=subprocess.run([str(unit_binary)],capture_output=True,text=True);assert units.returncode==0,units.stdout+units.stderr
  docs=subprocess.run(['rustdoc','--test','--edition=2021',str(root/'examples'/f'{slug}.rs')],capture_output=True,text=True);assert docs.returncode==0,docs.stdout+docs.stderr
 cases=[('encode-review-state-with-rust-typestate','let reviewed = draft.review();','let reviewed = draft;','E0599'),('transfer-rust-ownership-at-task-boundaries','let completed = handoff(packet);','let completed = handoff(packet);\n    println!("{}", packet.id);','E0382')]
 for index,(slug,old,new,diagnostic) in enumerate(cases):
  source=(root/'examples'/f'{slug}.rs').read_text();assert old in source
  negative=temp/f'negative{index}.rs';negative.write_text(source.replace(old,new))
  result=subprocess.run(['rustc','--edition=2021','--crate-name',f'negative{index}',str(negative),'-o',str(temp/f'negative{index}')],capture_output=True,text=True)
  assert result.returncode!=0 and diagnostic in result.stderr,(slug,result.stderr)
print('3 Rust programs compiled and ran; their unit tests and doctests passed; 2 independent invalid programs rejected (E0599, E0382)')
