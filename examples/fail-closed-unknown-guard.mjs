export function evaluate(input) {
  const valid = input !== null && typeof input === "object" &&
    ["allow", "deny", "unknown"].includes(input.guardState) &&
    typeof input.evidence === "string";
  if (!valid) {
    return { pass: false, summary: "Invalid guard input; transition held.", checks: [
      { name: "input-shape", pass: false, detail: "Expected guardState and evidence." }
    ] };
  }
  const known = input.guardState !== "unknown";
  const allowed = input.guardState === "allow" && input.evidence.trim().length > 0;
  return {
    pass: allowed,
    summary: allowed ? "Guard allows the transition." : "Transition held; state must be preserved.",
    checks: [
      { name: "guard-known", pass: known, detail: input.guardState },
      { name: "allow-with-evidence", pass: allowed, detail: allowed ? "evidence-present" : "not-authorized" }
    ]
  };
}
