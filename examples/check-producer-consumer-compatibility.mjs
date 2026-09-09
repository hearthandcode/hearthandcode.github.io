export function evaluate(input) {
  const validField = field => field && typeof field.name === "string" && field.name.trim().length > 0 &&
    typeof field.type === "string" && field.type.trim().length > 0;
  const valid = input !== null && typeof input === "object" && input.producer && input.consumer &&
    Array.isArray(input.producer.fields) && input.producer.fields.every(validField) &&
    Array.isArray(input.consumer.required) && input.consumer.required.every(validField);
  if (!valid) {
    return { pass: false, summary: "Invalid schema input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected producer fields and consumer requirements." }
    ] };
  }
  const duplicates = fields => fields.map(field => field.name).filter((name, index, names) =>
    names.indexOf(name) !== index);
  const producerDuplicates = duplicates(input.producer.fields);
  const consumerDuplicates = duplicates(input.consumer.required);
  if (producerDuplicates.length > 0 || consumerDuplicates.length > 0) {
    return { pass: false, summary: "Duplicate field names make the schema ambiguous.", checks: [
      { name: "field-name-uniqueness", pass: false,
        detail: `producer:${producerDuplicates.join(",") || "none"};consumer:${consumerDuplicates.join(",") || "none"}` }
    ] };
  }
  const checks = input.consumer.required.map(required => {
    const offered = input.producer.fields.find(field => field.name === required.name);
    const pass = Boolean(offered) && offered.type === required.type;
    return { name: required.name, pass, detail: !offered ? "missing" : `${offered.type}->${required.type}` };
  });
  const pass = checks.every(check => check.pass);
  return {
    pass,
    summary: pass ? "Producer satisfies every required consumer field." : "Producer and consumer schemas are incompatible.",
    checks
  };
}
