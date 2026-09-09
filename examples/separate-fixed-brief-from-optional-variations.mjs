export function evaluate(input) {
  const fixed = input?.brief?.fixed;
  const optional = input?.brief?.optional;
  const candidate = input?.candidate;
  const fixedKeys = fixed && typeof fixed === "object" && !Array.isArray(fixed) ? Object.keys(fixed) : [];
  const fixedPass = Boolean(fixedKeys.length > 0 && candidate && fixedKeys.every(key => JSON.stringify(candidate[key]) === JSON.stringify(fixed[key])));
  const optionalPass = Boolean(optional && typeof optional === "object" && !Array.isArray(optional) && candidate && Object.keys(candidate).every(key => fixedKeys.includes(key) || (Object.prototype.hasOwnProperty.call(optional, key) && (!Array.isArray(optional[key]) || optional[key].includes(candidate[key])))));
  const checks = [
    {name: "fixed-requirements", pass: fixedPass},
    {name: "optional-fields-declared", pass: optionalPass},
    {name: "candidate-present", pass: candidate !== null && typeof candidate === "object" && !Array.isArray(candidate)}
  ];
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The candidate keeps fixed brief requirements while using declared options." : "The candidate changes a fixed requirement or invents an option.", checks};
}
