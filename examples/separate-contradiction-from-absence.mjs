export function evaluate(input) {
  if (!input || !Array.isArray(input.records)) return { pass: false, summary: "Input needs a records array.", checks: [{ name: "input shape", pass: false }] };
  const scalar = value => typeof value === "string" || typeof value === "number" || typeof value === "boolean";
  const valid = input.records.every(record => record && typeof record.claim === "string" && record.claim.trim() && scalar(record.value) && typeof record.evidence === "string");
  if (!valid) return { pass: false, summary: "Each record needs a nonblank claim, scalar value, and evidence string.", checks: [{ name: "record shape", pass: false }] };
  const groups = new Map();
  for (const record of input.records) groups.set(record.claim, [...(groups.get(record.claim) || []), record]);
  const missing = input.records.filter(record => !record.evidence.trim()).length;
  const conflicting = [...groups.entries()].filter(([, records]) => new Set(records.map(record => record.value)).size > 1).map(([claim]) => claim);
  const checks = [{ name: "record shape", pass: true }, { name: "missing evidence", pass: missing === 0 }, { name: "contradictory claims", pass: conflicting.length === 0 }];
  const summary = conflicting.length ? `Contradiction for: ${conflicting.join(", ")}.` : missing ? `${missing} record(s) have missing evidence, without a contradiction.` : "No missing evidence or contradiction found.";
  return { pass: missing === 0 && conflicting.length === 0, summary, checks };
}
