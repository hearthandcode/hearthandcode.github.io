export function evaluate(input) {
  const output = input?.output;
  const required = Array.isArray(input?.required) ? input.required : [];
  const itemType = input?.itemType || "string";
  const checks = [];
  const requiredList = Array.isArray(input?.required) && input.required.length > 0 && input.required.every(key => typeof key === "string" && key.length > 0);
  checks.push({name: "required-list", pass: requiredList});
  const object = output !== null && typeof output === "object" && !Array.isArray(output);
  checks.push({name: "plain-object", pass: object});
  const requiredKeys = object && required.every(key => Object.prototype.hasOwnProperty.call(output, key));
  checks.push({name: "required-keys", pass: requiredKeys});
  const items = object && Array.isArray(output.items);
  checks.push({name: "items-array", pass: items});
  const typed = items && output.items.every(item => typeof item === itemType);
  checks.push({name: "items-type", pass: typed});
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The output matches the declared structural checks." : "The output shape is incomplete or has the wrong types.", checks};
}
