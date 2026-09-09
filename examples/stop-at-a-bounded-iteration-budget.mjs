export function evaluate(input) {
  const iterations = input?.iterations;
  const budget = input?.budget;
  const improvements = input?.improvements;
  const checks = [];
  checks.push({name: "non-negative-integers", pass: Number.isSafeInteger(iterations) && iterations >= 0 && Number.isSafeInteger(budget) && budget >= 0});
  checks.push({name: "within-budget", pass: Number.isSafeInteger(iterations) && Number.isSafeInteger(budget) && iterations <= budget});
  checks.push({name: "one-record-per-iteration", pass: Array.isArray(improvements) && improvements.length === iterations});
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The refinement trace stops within its declared budget." : "The refinement trace exceeds, misstates, or lacks its declared budget.", checks};
}
