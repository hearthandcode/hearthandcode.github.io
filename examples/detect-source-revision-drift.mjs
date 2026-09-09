export function evaluate(input) {
  const nonempty = value => typeof value === "string" && value.trim().length > 0;
  const valid = input && input.expected && input.observed &&
    nonempty(input.expected.id) && nonempty(input.expected.version) &&
    nonempty(input.observed.id) && nonempty(input.observed.version);
  if (!valid) return { pass: false, summary: "Expected and observed source identities need nonempty id and version strings.", checks: [{ name: "input shape", pass: false }] };
  const sameId = input.expected.id === input.observed.id;
  const sameVersion = input.expected.version === input.observed.version;
  return { pass: sameId && sameVersion, summary: sameId && sameVersion ? "Observed source matches the declared id and version." : "Observed source differs from the declared identity.", checks: [{ name: "source id", pass: sameId }, { name: "version", pass: sameVersion }] };
}
