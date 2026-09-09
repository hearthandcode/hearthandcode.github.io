A workflow reads a release register before moving a draft into execution. The register is temporarily unavailable. Treating that lookup failure as permission would turn missing evidence into an effect. The useful technique is to model the guard as three states and admit the transition only when an explicit `allow` carries evidence.

This makes uncertainty visible without pretending it is a denial about the underlying request. The current object stays where it is, and a later check can resume from preserved state.

## 01 / State the predicate

Let G = {allow, deny, unknown} be the guard-state domain and let E be the set of evidence strings. Define V: G × E → {true, false} by V(g, e) = true exactly when g = allow and trim(e) is non-empty.

Glossary: `allow` means the named guard positively passed; `deny` means it positively failed; `unknown` means it could not be evaluated; `evidence` names the record supporting the result; `true` means this one transition may proceed. Assumptions: guard labels arrive from a bounded upstream evaluator, and an evidence string is only a locator, not proof that its referent is valid. In prose, the checker requires both a positive decision and a visible basis. An unknown guard maps to a held transition, while remaining distinct from a substantive denial. This formulation does not establish that the evidence is authentic, that the transition is desirable, or that any runtime enforces the rule.

## 02 / Give the agent a bounded task

Ask for one proposed state transition with a `guardState` and an `evidence` locator. The agent may select only `allow`, `deny`, or `unknown`; it must not replace a missing register with a guessed value. Run the checker independently of the component that proposed the transition.

The passing fixture represents an evaluated release record. The boundary fixture uses `unknown` and an empty locator, which should produce a readable hold rather than an exception or silent success.

## 03 / Run the independent check

The module is synchronous, pure, and browser-safe. It returns JSON-safe data and performs no I/O.

```javascript
export function evaluate(input) {
  const valid = input !== null && typeof input === "object" &&
    ["allow", "deny", "unknown"].includes(input.guardState) &&
    typeof input.evidence === "string";
  if (!valid) {
    return { pass: false, summary: "Invalid guard input; transition held.", checks: [
      { name: "input-shape", pass: false, detail: "Expected guardState and evidence." }
    ] };
  }
  const known = input.guardState !== "unknown";
  const allowed = input.guardState === "allow" && input.evidence.trim().length > 0;
  return {
    pass: allowed,
    summary: allowed ? "Guard allows the transition." : "Transition held; state must be preserved.",
    checks: [
      { name: "guard-known", pass: known, detail: input.guardState },
      { name: "allow-with-evidence", pass: allowed, detail: allowed ? "evidence-present" : "not-authorized" }
    ]
  };
}
```

Save the module as `fail-closed-unknown-guard.mjs`, then run:

```bash
node --input-type=module -e 'import {evaluate} from "./fail-closed-unknown-guard.mjs"; console.log(JSON.stringify(evaluate({"guardState":"allow","evidence":"review-17"})))'
```

Expected result:

```json
{"pass":true,"summary":"Guard allows the transition.","checks":[{"name":"guard-known","pass":true,"detail":"allow"},{"name":"allow-with-evidence","pass":true,"detail":"evidence-present"}]}
```

## 04 / Try the counterexample

Change `guardState` to `unknown` and clear `evidence`. Both checks become false and the summary says to preserve state. Also try `deny` with a locator: the result still fails because evidence for a denial is not permission.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass establishes only that the two supplied fields satisfy this local admission predicate. It does not validate the evidence record, check expiry, execute a transition, or prove that the requested effect is safe. A failure means “do not move under this input,” not “the request can never be allowed.” Recovery consists of obtaining an evaluable guard result and running the same check again against unchanged state.

## Source and formulation note

The tri-state guard and state-preservation posture adapt the cited ESS candidate manuscript. The small V function, JSON shape, and example are original Fieldcraft teaching constructions. The manuscript is a candidate specification, and this seed draft does not claim canonical adoption, runtime conformance, or an implemented Exocore transition.
