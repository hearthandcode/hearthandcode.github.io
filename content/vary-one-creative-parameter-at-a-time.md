If a concept changes palette, tempo and shape at once, a later preference tells you little about the cause. You may like the result, but you cannot tell which decision helped or hurt. Controlled variation is a modest discipline for creative exploration: hold a base candidate, change one named parameter, and record that change.

The technique does not turn creative work into a laboratory experiment. It gives one comparison a readable boundary. If several changes are intentionally bundled, name the bundle as a single parameter and accept that the result is about the bundle. The demo keeps the parameters scalar so equality is easy to inspect.

## 01 / State the predicate

Let `B` be a base map and `C` a candidate map over keys `K`. Let `Δ={k∈K : B[k]≠C[k]}` and `D` be the declared changed-key list. Define `V(B,C,D) ≔ object(B) ∧ object(C) ∧ |Δ|=1 ∧ Δ=D`.

Here `|Δ|` is the number of changed keys, and `=` compares the key lists after the module derives them. The typed domain is a JSON-like map whose parameter values are treated as scalar values in this teaching example. The assumption is that missing keys count as changes. In prose: one and only one parameter differs, and the declaration names it.

## 02 / Give the agent a bounded task

Start with a fixed synthetic concept:

```text
Base concept: warm palette, tempo 90, circle shape.
Create one variation by changing the palette only.
Return the complete parameter map and name changed: palette.
```

The instruction gives the agent a creative choice inside one boundary. A reviewer can now compare the two maps and discuss the palette without wondering whether tempo also moved. Later runs can vary tempo or shape, each with its own declaration.

## 03 / Run the independent check

Save `vary-one-creative-parameter-at-a-time.mjs` and invoke it with `node --input-type=module -e 'import("./vary-one-creative-parameter-at-a-time.mjs").then(({evaluate}) => console.log(evaluate({base:{palette:"warm",tempo:90,shape:"circle"},candidate:{palette:"cool",tempo:90,shape:"circle"},changed:["palette"]})))'`.

```javascript
export function evaluate(input) {
  const base = input?.base;
  const candidate = input?.candidate;
  const declared = Array.isArray(input?.changed) ? input.changed : [];
  const keys = base && candidate && typeof base === "object" && !Array.isArray(base) && typeof candidate === "object" && !Array.isArray(candidate) ? Array.from(new Set([...Object.keys(base), ...Object.keys(candidate)])) : [];
  const actual = keys.filter(key => JSON.stringify(base?.[key]) !== JSON.stringify(candidate?.[key]));
  const same = actual.length === declared.length && actual.every(key => declared.includes(key));
  const checks = [
    {name: "objects-present", pass: Boolean(base !== null && candidate !== null && typeof base === "object" && !Array.isArray(base) && typeof candidate === "object" && !Array.isArray(candidate))},
    {name: "one-change", pass: actual.length === 1},
    {name: "declared-change-matches", pass: same}
  ];
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The candidate varies one declared parameter." : "The candidate varies zero or multiple parameters, or the declaration is wrong.", checks};
}
```

The initial and one-change boundary fixtures pass with all three checks true. The function returns the complete result object for browser use and tests.

## 04 / Try the counterexample

Change both palette and tempo while declaring both names. The declaration is honest, but `one-change` fails because the run is no longer a one-parameter comparison. A different run can be valid as a multi-parameter exploration; it simply needs a different predicate and a different claim.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass establishes only one observed parameter difference under the module’s equality rule. It does not show that the variation is better, that the parameters are independent, or that a viewer will notice the difference. Nested values are compared through their JSON representation, so this example is best for scalar values. If richer structures matter, define a canonical comparison before drawing conclusions.

## Source and formulation note

The variation predicate is an original creative-practice construction. NIST’s public framework is a contextual reference for making evaluation boundaries explicit, not a source for this exact method. All concepts are synthetic. The module is deterministic and reports changed-key structure; it does not infer preference or measure creative quality.
