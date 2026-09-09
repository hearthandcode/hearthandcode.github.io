export function evaluate(input) {
  const plain = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const scalar = value => value === null || ["string", "number", "boolean"].includes(typeof value);
  const valid = input !== null && typeof input === "object" && plain(input.source) &&
    plain(input.projection) && Object.values(input.source).every(scalar) &&
    Object.values(input.projection).every(scalar) && Array.isArray(input.declaredLoss);
  if (!valid) {
    return { pass: false, summary: "Invalid projection input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected source, projection, and declaredLoss." }
    ] };
  }
  const actual = Object.keys(input.source).sort().flatMap(field => {
    if (!Object.hasOwn(input.projection, field)) return [{ field, disposition: "dropped" }];
    if (JSON.stringify(input.source[field]) !== JSON.stringify(input.projection[field])) {
      return [{ field, disposition: "normalized" }];
    }
    return [];
  });
  const declarationValid = input.declaredLoss.every(entry => entry &&
    typeof entry.field === "string" && ["dropped", "normalized"].includes(entry.disposition) &&
    typeof entry.reason === "string" && entry.reason.trim().length > 0);
  const declared = input.declaredLoss.filter(entry => entry).map(entry =>
    ({ field: entry.field, disposition: entry.disposition }));
  const complete = declarationValid && JSON.stringify(declared) === JSON.stringify(actual);
  return {
    pass: complete,
    summary: complete ? `Loss report accounts for ${actual.length} field(s).` : "Projection loss is missing or misclassified.",
    checks: [
      { name: "declarations-valid", pass: declarationValid, detail: `${input.declaredLoss.length} declared` },
      { name: "loss-complete", pass: complete, detail: actual.map(item => `${item.field}:${item.disposition}`).join(",") || "lossless" }
    ]
  };
}
