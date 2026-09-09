export function evaluate(input) {
  const transitions = {
    "ready:dispatch": ["dispatched", "dispatch"],
    "dispatched:observe": ["observed", "record-observation"],
    "observed:complete": ["completed", "record-completion"],
    "observed:lose-continuity": ["indeterminate", "hold"],
    "indeterminate:inspect": ["indeterminate", "inspect-saved-state"]
  };
  const valid = input !== null && typeof input === "object" &&
    typeof input.state === "string" && typeof input.event === "string";
  if (!valid) {
    return { pass: false, summary: "Invalid lifecycle input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected state and event." }
    ] };
  }
  const key = `${input.state}:${input.event}`;
  const transition = transitions[key];
  const forbiddenRedispatch = input.state === "indeterminate" && input.event === "redispatch";
  const pass = Boolean(transition) && !forbiddenRedispatch;
  return {
    pass,
    summary: pass ? `${transition[1]}: ${input.state} -> ${transition[0]}` :
      forbiddenRedispatch ? "Redispatch forbidden; preserve the indeterminate step." : "Undefined transition; step held.",
    checks: [
      { name: "transition-defined", pass: Boolean(transition), detail: key },
      { name: "no-indeterminate-redispatch", pass: !forbiddenRedispatch, detail: forbiddenRedispatch ? "hold" : "clear" }
    ]
  };
}
