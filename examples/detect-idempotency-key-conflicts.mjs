export function evaluate(input) {
  const validRecord = record => record && typeof record.key === "string" &&
    typeof record.digest === "string" && "result" in record;
  const valid = input !== null && typeof input === "object" && Array.isArray(input.prior) &&
    input.prior.every(validRecord) && input.request && typeof input.request.key === "string" &&
    typeof input.request.digest === "string";
  if (!valid) {
    return { pass: false, summary: "Invalid idempotency input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected prior records and keyed request." }
    ] };
  }
  const matches = input.prior.filter(record => record.key === input.request.key);
  const consistent = matches.every(record => record.digest === input.request.digest);
  const decision = matches.length === 0 ? "accept-new" : matches.length > 1 ? "duplicate" :
    consistent ? "replay" : "conflict";
  return {
    pass: decision === "accept-new" || decision === "replay",
    summary: decision === "accept-new" ? "New key may be accepted." :
      decision === "replay" ? "Same key and digest replay the recorded result." :
      decision === "duplicate" ? "Duplicate prior keys are ambiguous; request held." :
      "Same key carries a different digest; request held.",
    checks: [
      { name: "key-match-count", pass: matches.length <= 1, detail: String(matches.length) },
      { name: "digest-consistency", pass: consistent && matches.length <= 1, detail: decision }
    ]
  };
}
