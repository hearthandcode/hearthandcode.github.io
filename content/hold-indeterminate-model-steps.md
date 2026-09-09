A worker dispatched a model request and saved that fact. The process restarted before it saved a terminal response. Sending the same step again might duplicate paid or consequential work; declaring it failed would invent an outcome. The technique is to mark lost continuity as `indeterminate`, preserve the record, and prohibit automatic redispatch.

## 01 / State the predicate

Let Q = {ready, dispatched, observed, completed, indeterminate} be states and Σ a set of events. Define a partial transition function δ: Q × Σ ⇀ Q. This example includes δ(observed, lose-continuity) = indeterminate and δ(indeterminate, inspect) = indeterminate, while δ(indeterminate, redispatch) is undefined.

Glossary: `observed` means provider work was seen but no terminal result is established; `indeterminate` means continuity was lost before the outcome could be resolved; `redispatch` means sending the same claimed step again; `inspect` reads saved state; `undefined` means hold the attempted transition. Assumptions: the original dispatch claim is durable and step identity is stable. In prose, uncertainty becomes a recorded state that can be inspected but cannot silently loop back into dispatch. This formulation does not establish provider outcome, billing state, cancellation, or a safe recovery action.

## 02 / Give the agent a bounded task

Give the agent one current state and one event. Ask it to classify only the transition in this small table. It must not call a provider or infer completion. When continuity loss is observed, the allowed action is `hold`; when the current state is already indeterminate, only inspection is defined.

Recovery belongs to a separate decision: reconcile external evidence if available, or create an explicitly authorized fresh run with a new identity. Neither path is encoded as automatic retry here.

## 03 / Run the independent check

```javascript
export function evaluate(input) {
  const transitions = {
    "ready:dispatch": ["dispatched", "dispatch"],
    "dispatched:observe": ["observed", "record-observation"],
    "observed:complete": ["completed", "record-completion"],
    "observed:lose-continuity": ["indeterminate", "hold"],
    "indeterminate:inspect": ["indeterminate", "inspect-saved-state"]
  };
  const valid = input !== null && typeof input === "object" &&
    typeof input.state === "string" && typeof input.event === "string";
  if (!valid) {
    return { pass: false, summary: "Invalid lifecycle input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected state and event." }
    ] };
  }
  const key = `${input.state}:${input.event}`;
  const transition = transitions[key];
  const forbiddenRedispatch = input.state === "indeterminate" && input.event === "redispatch";
  const pass = Boolean(transition) && !forbiddenRedispatch;
  return {
    pass,
    summary: pass ? `${transition[1]}: ${input.state} -> ${transition[0]}` :
      forbiddenRedispatch ? "Redispatch forbidden; preserve the indeterminate step." : "Undefined transition; step held.",
    checks: [
      { name: "transition-defined", pass: Boolean(transition), detail: key },
      { name: "no-indeterminate-redispatch", pass: !forbiddenRedispatch, detail: forbiddenRedispatch ? "hold" : "clear" }
    ]
  };
}
```

Save the module as `hold-indeterminate-model-steps.mjs`, then run:

```bash
node --input-type=module -e 'import {evaluate} from "./hold-indeterminate-model-steps.mjs"; console.log(JSON.stringify(evaluate({"state":"observed","event":"lose-continuity"})))'
```

Expected result:

```json
{"pass":true,"summary":"hold: observed -> indeterminate","checks":[{"name":"transition-defined","pass":true,"detail":"observed:lose-continuity"},{"name":"no-indeterminate-redispatch","pass":true,"detail":"clear"}]}
```

## 04 / Try the counterexample

Set the input to `{"state":"indeterminate","event":"redispatch"}`. The transition is undefined and the explicit no-redispatch guard fails. `inspect` is the boundary case: it passes while preserving `indeterminate` rather than pretending inspection resolved the outcome.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass means the requested pair appears in this teaching table. It does not mutate lifecycle state, query a provider, prove that a request was sent, or decide recovery. The indeterminate invariant is narrower than a general retry policy: it protects a specifically claimed step whose external outcome is unresolved. Fresh work needs a distinct identity and human-reviewed recovery path.

## Source and formulation note

This model is inspired by a prior Hearth & Code durable model-step repair and the cited ESS/Exocore workflow posture. It is explicitly pedagogical and does not describe or claim the current Exocore implementation. The transition table and browser module are original Fieldcraft constructions; no provider call or runtime activation occurred.
