import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(new URL('..',import.meta.url).pathname);
let checks=0;
for(const file of (await readdir(resolve(root,'fixtures'))).filter(f=>f.endsWith('.json')).sort()){
 const slug=file.slice(0,-5), fixture=JSON.parse(await readFile(resolve(root,'fixtures',file),'utf8'));
 const {evaluate}=await import(pathToFileURL(resolve(root,'examples',`${slug}.mjs`)));
 assert.equal(typeof evaluate,'function',slug);
 assert.ok(fixture.tests.length>=3,`${slug}: at least three fixtures`);
 assert.ok(fixture.tests.some(t=>t.expected.pass===true),`${slug}: missing passing case`);
 assert.ok(fixture.tests.some(t=>t.expected.pass===false),`${slug}: missing failing case`);
 assert.equal(evaluate(structuredClone(fixture.initial)).pass,true,`${slug}: initial must pass`);
 assert.equal(evaluate(structuredClone(fixture.counterexample)).pass,false,`${slug}: counterexample must fail`);
 for(const test of fixture.tests){
  const input=structuredClone(test.input), before=JSON.stringify(input), result=evaluate(input);
  assert.deepEqual(result,test.expected,`${slug}/${test.name}`);
  assert.equal(JSON.stringify(input),before,`${slug}/${test.name}: mutation`);
  assert.equal(typeof result.pass,'boolean');assert.equal(typeof result.summary,'string');assert.ok(Array.isArray(result.checks));
  for(const check of result.checks)assert.equal(typeof check.pass,'boolean',`${slug}: check result must be boolean`);
  if(result.pass)assert.ok(result.checks.every(c=>c.pass),`${slug}: overall pass contradicts check failure`);
  assert.deepEqual(evaluate(structuredClone(test.input)),result,`${slug}: nondeterministic`);
  assert.deepEqual(JSON.parse(JSON.stringify(result)),result,`${slug}: not JSON-safe`);
  checks++;
 }
 console.log(`${slug}: ${fixture.tests.length} checks passed`);
}
console.log(`${checks} corpus fixture checks passed`);
