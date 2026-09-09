export function evaluate(input) {
  const allowed = { draft: ["review"], reviewed: ["release-candidate"] };
  const valid = input !== null && typeof input === "object" &&
    typeof input.state === "string" && typeof input.operation === "string";
  if (!valid) {
    return { pass: false, summary: "Invalid state input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected state and operation." }
    ] };
  }
  const stateKnown = Object.hasOwn(allowed, input.state);
  const operationAllowed = stateKnown && allowed[input.state].includes(input.operation);
  return {
    pass: operationAllowed,
    summary: operationAllowed ? `${input.operation} is available for ${input.state}.` : "Operation unavailable in this state.",
    checks: [
      { name: "state-known", pass: stateKnown, detail: input.state },
      { name: "operation-available", pass: operationAllowed, detail: input.operation }
    ]
  };
}
