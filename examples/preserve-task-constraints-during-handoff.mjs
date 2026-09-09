export function evaluate(input) {
  const original = input?.original;
  const handoff = input?.handoff;
  const sameList = (left, right) => Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((item, index) => item === right[index]);
  const checks = [];
  checks.push({name: "must-preserved", pass: sameList(original?.must, handoff?.must)});
  const optional = Array.isArray(original?.should) && Array.isArray(handoff?.should);
  checks.push({name: "optional-preserved", pass: optional && original.should.every(item => handoff.should.includes(item))});
  checks.push({name: "handoff-has-task", pass: typeof handoff?.task === "string" && handoff.task.length > 0});
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The handoff carries the task constraints needed for review." : "The handoff dropped or changed a declared task constraint.", checks};
}
