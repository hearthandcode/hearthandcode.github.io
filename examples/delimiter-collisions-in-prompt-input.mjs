export function evaluate(input) {
  const checks = [];
  const expected = Array.isArray(input?.expected) ? input.expected : null;
  const transport = input?.transport;
  checks.push({name: "expected-list", pass: expected !== null && expected.every(value => typeof value === "string")});
  let decoded = null;
  if (transport === "json" && typeof input?.value === "string") {
    try { decoded = JSON.parse(input.value); } catch { decoded = null; }
  } else if (transport === "delimiter" && typeof input?.value === "string" && typeof input?.delimiter === "string") {
    decoded = input.value.split(input.delimiter);
  }
  checks.push({name: "decoded-list", pass: Array.isArray(decoded) && decoded.every(value => typeof value === "string")});
  const exact = Array.isArray(decoded) && Array.isArray(expected) && decoded.length === expected.length && decoded.every((value, index) => value === expected[index]);
  checks.push({name: "round-trip-exact", pass: exact});
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The framing preserves every item exactly." : "The framing changed or could not represent the expected items.", checks};
}
