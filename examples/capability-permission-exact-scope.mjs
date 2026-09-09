export function evaluate(input) {
  const identifier = value => typeof value === "string" && value.trim().length > 0;
  const permission = value => value !== null && typeof value === "object" &&
    Object.keys(value).sort().join(",") === "action,scope" &&
    identifier(value.action) && identifier(value.scope);
  const valid = input !== null && typeof input === "object" &&
    Array.isArray(input.capabilities) && input.capabilities.every(identifier) &&
    Array.isArray(input.permissions) && input.permissions.every(permission) &&
    permission(input.request);
  if (!valid) {
    return { pass: false, summary: "Invalid authority input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected capabilities, permissions, and request." }
    ] };
  }
  const capable = input.capabilities.includes(input.request.action);
  const permitted = input.permissions.some(permission =>
    permission && permission.action === input.request.action &&
    permission.scope === input.request.scope);
  return {
    pass: capable && permitted,
    summary: capable && permitted ? "Capability and exact permission both match." : "Request held at the authority boundary.",
    checks: [
      { name: "capability", pass: capable, detail: input.request.action },
      { name: "exact-permission", pass: permitted, detail: `${input.request.action}@${input.request.scope}` }
    ]
  };
}
