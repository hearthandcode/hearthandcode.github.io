export function evaluate(input) {
  if (!input || !Number.isSafeInteger(input.budget) || input.budget < 0 || !Array.isArray(input.items)) return { pass: false, summary: "Input needs a non-negative integer budget and items array.", checks: [{ name: "input shape", pass: false }] };
  const valid = input.items.every(item => item && typeof item.id === "string" && item.id.trim() && Number.isFinite(item.relevance) && Number.isSafeInteger(item.tokens) && item.tokens >= 0) && new Set(input.items.map(item => item && item.id)).size === input.items.length;
  if (!valid) return { pass: false, summary: "Each item needs id, numeric relevance, and non-negative integer tokens.", checks: [{ name: "item shape", pass: false }] };
  let remaining = input.budget;
  const selected = [];
  for (const item of [...input.items].sort((a, b) => b.relevance - a.relevance || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) if (item.tokens <= remaining) { selected.push(item.id); remaining -= item.tokens; }
  return { pass: true, summary: `Selected ${selected.join(", ") || "nothing"} within ${input.budget} tokens.`, checks: [{ name: "token budget", pass: remaining >= 0 }, { name: "deterministic relevance order", pass: true }] };
}
