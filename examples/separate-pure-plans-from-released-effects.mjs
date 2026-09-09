export function evaluate(input) {
  const validStep = step => step && typeof step.effect === "string" && typeof step.target === "string";
  const valid = input !== null && typeof input === "object" && ["plan", "execute"].includes(input.mode) &&
    Array.isArray(input.steps) && input.steps.every(validStep) &&
    Array.isArray(input.releases) && input.releases.every(validStep);
  if (!valid) {
    return { pass: false, summary: "Invalid plan input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected mode, steps, and releases." }
    ] };
  }
  const released = step => input.releases.some(release =>
    release.effect === step.effect && release.target === step.target);
  const checks = input.steps.map(step => ({
    name: `${step.effect}@${step.target}`,
    pass: input.mode === "plan" || released(step),
    detail: input.mode === "plan" ? "planned-only" : released(step) ? "exact-release" : "release-missing"
  }));
  const pass = checks.every(check => check.pass);
  return {
    pass,
    summary: input.mode === "plan" ? "Pure plan produced; no effects admitted." :
      pass ? "Every effect has an exact release." : "Execution held; at least one exact release is missing.",
    checks
  };
}
