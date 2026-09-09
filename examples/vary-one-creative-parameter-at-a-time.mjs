export function evaluate(input) {
  const base = input?.base;
  const candidate = input?.candidate;
  const declared = Array.isArray(input?.changed) ? input.changed : [];
  const keys = base && candidate && typeof base === "object" && !Array.isArray(base) && typeof candidate === "object" && !Array.isArray(candidate) ? Array.from(new Set([...Object.keys(base), ...Object.keys(candidate)])) : [];
  const actual = keys.filter(key => JSON.stringify(base?.[key]) !== JSON.stringify(candidate?.[key]));
  const same = actual.length === declared.length && actual.every(key => declared.includes(key));
  const checks = [
    {name: "objects-present", pass: Boolean(base !== null && candidate !== null && typeof base === "object" && !Array.isArray(base) && typeof candidate === "object" && !Array.isArray(candidate))},
    {name: "one-change", pass: actual.length === 1},
    {name: "declared-change-matches", pass: same}
  ];
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The candidate varies one declared parameter." : "The candidate varies zero or multiple parameters, or the declaration is wrong.", checks};
}
