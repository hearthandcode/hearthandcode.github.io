export function evaluate(input) {
  const candidate = input?.candidate;
  const baseline = input?.baseline;
  const margin = input?.margin ?? 0;
  const valid = value => value !== null && typeof value === "object" && !Array.isArray(value) && Object.values(value).every(score => Number.isFinite(score));
  const sameMetrics = valid(candidate) && valid(baseline) && Object.keys(candidate).length === Object.keys(baseline).length && Object.keys(candidate).every(key => Object.prototype.hasOwnProperty.call(baseline, key));
  const checks = [];
  checks.push({name: "baseline-valid", pass: valid(baseline)});
  checks.push({name: "candidate-valid", pass: valid(candidate)});
  checks.push({name: "same-metrics", pass: sameMetrics});
  const score = value => valid(value) ? Object.values(value).reduce((total, item) => total + item, 0) : NaN;
  const candidateScore = score(candidate);
  const baselineScore = score(baseline);
  checks.push({name: "margin-valid", pass: Number.isFinite(margin)});
  checks.push({name: "candidate-reaches-baseline", pass: sameMetrics && Number.isFinite(candidateScore) && Number.isFinite(baselineScore) && Number.isFinite(margin) && candidateScore >= baselineScore + margin});
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The candidate reaches the declared baseline." : "The candidate does not reach the declared baseline or margin.", checks};
}
