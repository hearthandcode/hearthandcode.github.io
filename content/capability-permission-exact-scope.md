A rendering service can generate both draft and final assets. A human released only `render@draft:42`, but a caller asks for `render@draft:43`. The action name looks familiar and the service is technically able to do it. Neither fact grants the requested scope. The technique is to test capability and permission as separate predicates, with exact action-and-scope matching.

## 01 / State the predicate

Let A be action names, S be scope names, C ⊆ A the actor's capabilities, and P ⊆ A × S its permissions. For request r = (a, s), define V(C, P, r) = (a ∈ C) ∧ ((a, s) ∈ P).

Glossary: `capability` records what the actor can technically perform; `permission` records an allowed action within a named scope; `request` is the action-scope pair under review; `∧` means both clauses must pass. Assumptions: strings are canonical identifiers and equality is exact and case-sensitive. In prose, first ask whether the actor can perform the action, then independently ask whether one permission matches both the action and the target scope. Similarity, prefix overlap, and neighboring identifiers do not widen permission. This formulation does not verify who granted a permission, whether it expired, or whether an otherwise allowed action should be executed now.

## 02 / Give the agent a bounded task

Provide a finite capability list, a finite permission list, and one request. Ask the agent to return the local admission result without inventing wildcard semantics. Each non-empty permission contains exactly `action` and `scope`; malformed members fail the input check. This example deliberately avoids roles, delegation, expiry, and policy inheritance so the separation stays inspectable.

Use the checker after planning and before any effect-bearing adapter. The generator may suggest the request, but it cannot declare its own suggestion authorized.

## 03 / Run the independent check

```javascript
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
```

Save the module as `capability-permission-exact-scope.mjs`, then run:

```bash
node --input-type=module -e 'import {evaluate} from "./capability-permission-exact-scope.mjs"; console.log(JSON.stringify(evaluate({"capabilities":["render"],"permissions":[{"action":"render","scope":"draft:42"}],"request":{"action":"render","scope":"draft:42"}})))'
```

Expected result:

```json
{"pass":true,"summary":"Capability and exact permission both match.","checks":[{"name":"capability","pass":true,"detail":"render"},{"name":"exact-permission","pass":true,"detail":"render@draft:42"}]}
```

## 04 / Try the counterexample

Remove the permission while keeping `render` in capabilities. The capability check passes, the permission check fails, and the request stays held. Then restore the permission with scope `draft:43`; that adjacent identifier still does not cover `draft:42`.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass proves an exact match within the supplied arrays. It does not prove grant authenticity, currentness, target existence, or successful execution. Production authorization usually adds actor identity, grant lineage, expiry, revocation, and a receipt. A failure identifies the missing local condition; it does not remove the actor's capability or reject every possible scope.

## Source and formulation note

The type separation and exact-cover posture adapt the cited ESS candidate manuscript. The finite-set predicate and JavaScript implementation are original pedagogical constructions. They do not claim that this data shape is a normative ESS schema or that any current Exocore host uses this evaluator.
