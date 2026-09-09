export function evaluate(input) {
  if (!input || typeof input.retrievedAt !== "string" || typeof input.now !== "string" || !Number.isSafeInteger(input.maxAgeMs) || input.maxAgeMs < 0) return { pass: false, summary: "Input needs ISO timestamps and a non-negative integer maxAgeMs.", checks: [{ name: "input shape", pass: false }] };
  const isoZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
  if (!isoZ.test(input.retrievedAt) || !isoZ.test(input.now)) return { pass: false, summary: "Timestamps must use ISO UTC milliseconds ending in Z.", checks: [{ name: "timestamp form", pass: false }] };
  const parseStrict = text => { const normalized = text.includes(".") ? text : text.replace("Z", ".000Z"); const value = Date.parse(normalized); return Number.isFinite(value) && new Date(value).toISOString() === normalized ? value : NaN; };
  const retrieved = parseStrict(input.retrievedAt), now = parseStrict(input.now);
  if (!Number.isFinite(retrieved) || !Number.isFinite(now) || now < retrieved) return { pass: false, summary: "Timestamps must parse and now must not precede retrieval.", checks: [{ name: "timestamp form", pass: true }, { name: "timestamp order", pass: false }] };
  const age = now - retrieved, fresh = age <= input.maxAgeMs;
  return { pass: fresh, summary: fresh ? `Retrieval age ${age}ms is within the ${input.maxAgeMs}ms limit.` : `Retrieval age ${age}ms exceeds the ${input.maxAgeMs}ms limit.`, checks: [{ name: "timestamp form", pass: true }, { name: "timestamp order", pass: true }, { name: "max age", pass: fresh }] };
}
