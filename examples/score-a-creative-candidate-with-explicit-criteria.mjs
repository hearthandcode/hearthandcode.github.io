export function evaluate(input) {
  const candidate = input?.candidate;
  const criteria = input?.criteria;
  const minimum = input?.minimum;
  const names = criteria && typeof criteria === "object" && !Array.isArray(criteria) ? Object.keys(criteria) : [];
  const criteriaValid = Boolean(names.length > 0 && names.every(name => Number.isFinite(criteria[name]?.weight) && criteria[name].weight >= 0 && Number.isFinite(criteria[name]?.max) && criteria[name].max > 0));
  const scoresValid = Boolean(criteriaValid && candidate && typeof candidate.scores === "object" && names.every(name => Number.isFinite(candidate.scores[name]) && candidate.scores[name] >= 0 && candidate.scores[name] <= criteria[name].max));
  const total = scoresValid ? names.reduce((sum, name) => sum + candidate.scores[name] * criteria[name].weight, 0) : NaN;
  const checks = [
    {name: "criteria-valid", pass: criteriaValid},
    {name: "scores-valid", pass: scoresValid},
    {name: "minimum-reached", pass: Number.isFinite(total) && Number.isFinite(minimum) && total >= minimum}
  ];
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The candidate reaches the declared arithmetic threshold." : "The candidate does not reach the declared arithmetic threshold.", checks};
}
