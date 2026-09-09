export function evaluate(input) {
  if (!input || !Array.isArray(input.claims)) return { pass: false, summary: "Input needs a claims array.", checks: [{ name: "input shape", pass: false }] };
  const validClaims = input.claims.every(claim => claim && typeof claim.id === "string" && claim.id.trim() && Array.isArray(claim.evidence));
  if (!validClaims) return { pass: false, summary: "Each claim needs a nonempty id and an evidence array.", checks: [{ name: "claim shape", pass: false }] };
  const checks = input.claims.map(claim => ({ name: claim.id, pass: claim.evidence.some(value => typeof value === "string" && value.trim()) }));
  const missing = checks.filter(check => !check.pass).length;
  return { pass: missing === 0, summary: missing === 0 ? "Every claim names supporting evidence." : `${missing} claim(s) lack named supporting evidence.`, checks };
}
