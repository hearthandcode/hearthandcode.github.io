An agent produces a good deployment plan and immediately begins carrying it out because the steps are already structured. The plan's quality has been mistaken for permission. The technique is to give planning and execution different modes: planning may describe effects purely, while execution requires an exact release for every effect-and-target pair.

## 01 / State the predicate

Let E be effect names, T target names, S ⊆ E × T planned steps, and R ⊆ E × T released pairs. Let mode M = {plan, execute}. Define V(M, S, R) = true when M = plan, or when M = execute and S ⊆ R.

Glossary: `plan` is a value describing proposed work; `effect` is a world-changing operation; `target` bounds what the effect may touch; `release` is an exact effect-target pair; `admission` is the decision to permit execution. Assumptions: identifiers are canonical and exact, every step is well formed, and release currentness was checked elsewhere. In prose, producing a plan never needs authority to perform its contents, but switching to execution requires coverage for every individual step. Similar effect names or neighboring targets do not count. This formulation does not execute steps, authenticate releases, order dependencies, or roll back effects.

## 02 / Give the agent a bounded task

Provide a mode, a finite step list, and a finite release list. Ask the agent to classify admission without calling adapters. In `plan` mode, each check returns `planned-only`; this is a positive result about purity, not a statement that execution is authorized. In `execute` mode, every step must find an exact matching release.

Keep the plan as data. A later effect port can receive only the admitted descriptor, while the planner remains deterministic and safe to run during review.

## 03 / Run the independent check

```javascript
export function evaluate(input) {
  const validStep = step => step && typeof step.effect === "string" && typeof step.target === "string";
  const valid = input !== null && typeof input === "object" && ["plan", "execute"].includes(input.mode) &&
    Array.isArray(input.steps) && input.steps.every(validStep) &&
    Array.isArray(input.releases) && input.releases.every(validStep);
  if (!valid) {
    return { pass: false, summary: "Invalid plan input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected mode, steps, and releases." }
    ] };
  }
  const released = step => input.releases.some(release =>
    release.effect === step.effect && release.target === step.target);
  const checks = input.steps.map(step => ({
    name: `${step.effect}@${step.target}`,
    pass: input.mode === "plan" || released(step),
    detail: input.mode === "plan" ? "planned-only" : released(step) ? "exact-release" : "release-missing"
  }));
  const pass = checks.every(check => check.pass);
  return {
    pass,
    summary: input.mode === "plan" ? "Pure plan produced; no effects admitted." :
      pass ? "Every effect has an exact release." : "Execution held; at least one exact release is missing.",
    checks
  };
}
```

Save the module as `separate-pure-plans-from-released-effects.mjs`, then run:

```bash
node --input-type=module -e 'import {evaluate} from "./separate-pure-plans-from-released-effects.mjs"; console.log(JSON.stringify(evaluate({"mode":"plan","steps":[{"effect":"publish","target":"draft-7"}],"releases":[]})))'
```

Expected result:

```json
{"pass":true,"summary":"Pure plan produced; no effects admitted.","checks":[{"name":"publish@draft-7","pass":true,"detail":"planned-only"}]}
```

## 04 / Try the counterexample

Change mode to `execute` without adding a release. The same descriptive step now fails admission. Add `publish@draft-8`; it still fails because an adjacent target does not cover `draft-7`. Only the exact pair passes.

<!--DEMO-->

## 05 / Keep the claim bounded

A planning pass establishes that this function admitted no effect. An execution pass establishes only exact membership in the supplied release list. Neither result proves grant authenticity, expiry, target existence, sequencing, successful execution, or semantic value. Production systems should separate a pure planner, an authority-aware admission boundary, an effect adapter, and attempt receipts.

## Source and formulation note

The separation between plans, gates, and effect ports adapts the cited ESS candidate and Exocore architecture sources. The two-mode set-inclusion predicate and JavaScript module are original pedagogical constructions. This article creates no release and claims no current Exocore runtime adoption.
