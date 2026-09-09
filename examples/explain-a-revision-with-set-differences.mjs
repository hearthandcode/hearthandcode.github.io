export function evaluate(input) {
  if (!input || !Array.isArray(input.previous) || !Array.isArray(input.current) || ![...input.previous, ...input.current].every(value => typeof value === "string")) return { pass: false, summary: "Input needs previous and current arrays of strings.", checks: [{ name: "input shape", pass: false }] };
  const previous = new Set(input.previous), current = new Set(input.current);
  const added = [...current].filter(value => !previous.has(value)).sort();
  const removed = [...previous].filter(value => !current.has(value)).sort();
  return { pass: true, summary: `Added: ${added.join(", ") || "none"}. Removed: ${removed.join(", ") || "none"}.`, checks: [{ name: "added set", pass: true }, { name: "removed set", pass: true }] };
}
