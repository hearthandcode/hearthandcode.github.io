An agent can keep revising because “one more pass” sounds harmless. The cost is easy to lose when each pass is described as an improvement and no stopping condition is recorded. A bounded budget turns refinement into a finite experiment: the trace says how many attempts were allowed, how many occurred, and what each attempt changed.

The technique is not to guess the best number of revisions. It is to declare a ceiling before the run and preserve a compact record. A ceiling of zero is meaningful: it says the task is being evaluated without refinement. A run that reaches the ceiling may pass the budget check while still needing a human decision about whether to continue under a new release.

## 01 / State the predicate

Let `n,b∈N` be the observed iteration count and budget, and let `I` be the iteration record sequence. Define `V(n,b,I) ≔ n≥0 ∧ b≥0 ∧ n≤b ∧ |I|=n`. Here `N` is the non-negative integer domain, `|I|` is sequence length, and `∧` means all conditions hold.

The assumptions are that every refinement attempt creates exactly one record and that the budget is a ceiling, not a promise to use all available iterations. The prose bridge is direct: the trace cannot claim fewer iterations than it records, and it cannot exceed the allowed count. The predicate says nothing about whether a recorded improvement is real.

## 02 / Give the agent a bounded task

Use a task with a visible stopping rule:

```text
Refine the draft at most 3 times.
After each refinement, record one short change note.
Stop when the budget is reached; do not create a fourth attempt.
```

This wording gives the agent room to stop early. It also leaves a reviewable trace when it does. If a later decision grants a larger budget, that is a new bounded run with a new input, rather than an invisible extension of the old one.

## 03 / Run the independent check

Save the module as `stop-at-a-bounded-iteration-budget.mjs` and invoke it with `node --input-type=module -e 'import("./stop-at-a-bounded-iteration-budget.mjs").then(({evaluate}) => console.log(evaluate({iterations:2,budget:3,improvements:["draft","tighten"]})))'`.

```javascript
export function evaluate(input) {
  const iterations = input?.iterations;
  const budget = input?.budget;
  const improvements = input?.improvements;
  const checks = [];
  checks.push({name: "non-negative-integers", pass: Number.isSafeInteger(iterations) && iterations >= 0 && Number.isSafeInteger(budget) && budget >= 0});
  checks.push({name: "within-budget", pass: Number.isSafeInteger(iterations) && Number.isSafeInteger(budget) && iterations <= budget});
  checks.push({name: "one-record-per-iteration", pass: Array.isArray(improvements) && improvements.length === iterations});
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The refinement trace stops within its declared budget." : "The refinement trace exceeds, misstates, or lacks its declared budget.", checks};
}
```

The passing fixture records two attempts against a budget of three. The boundary fixture records exactly three. Both return the complete result with all checks true.

## 04 / Try the counterexample

Set `iterations` to 4 while keeping `budget` at 3 and provide four change notes. The record is internally consistent, but `within-budget` fails. That distinction matters: a truthful over-budget trace is still a held run until a new budget is explicitly declared.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass establishes only integer validity, a ceiling comparison and record-count consistency. It does not show that iteration was necessary, that changes improved the artifact, or that the budget was economically appropriate. An iteration note may be inaccurate. To make stronger claims, add separately reviewable checks for change identity, stop reasons, cost and outcome, while retaining this small ceiling check as the first guard.

## Source and formulation note

The notation and module are original teaching constructions about bounded work. NIST’s public AI Risk Management Framework is a contextual reference for managing risk and documenting decisions; it does not prescribe this specific budget predicate. Fixtures are synthetic. The module is synchronous, pure and browser-safe, and its pass result is evidence about the trace fields only.
