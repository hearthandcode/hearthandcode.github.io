A creative review becomes slippery when a candidate is called “strong” without saying what strong means. One reviewer may reward fit, another novelty, and a third legibility. A small scorecard cannot settle taste, but it can make one narrow question visible: does this candidate meet the criteria and threshold we declared before the comparison?

The technique is to name criteria, weights and maximums, then calculate an arithmetic total. Use the number to support a conversation about the brief. Do not turn it into a quality oracle. The synthetic example scores fit and clarity only so the calculation remains inspectable.

## 01 / State the predicate

Let criteria `K` map each name `k` to weight `wₖ` and maximum `mₖ`, and let candidate scores be `sₖ`. Define `T=Σₖ sₖwₖ` and `V ≔ valid(K) ∧ valid(s) ∧ T≥q`, where `q` is the declared minimum. `Σ` is a finite sum; `≥` means at least.

The typed domains are `wₖ,mₖ,sₖ,q : number`. Valid criteria have positive maxima and non-negative finite weights; valid scores lie between zero and their criterion maximum. The assumption is that these dimensions were chosen for this brief. In prose: the candidate reaches an arithmetic floor under the stated weighting. This is a check of arithmetic and declared fit, not a measurement of artistic quality.

## 02 / Give the agent a bounded task

Give a synthetic brief and make the criteria explicit:

```text
Create a poster concept for a quiet reading room.
Score the candidate from 0 to 5 for fit and clarity.
Use weights fit=2 and clarity=1. Pass at total 10 or higher.
Return the candidate, scores and a short rationale.
```

The agent can propose language or imagery, but the scorecard does not decide whether the concept should be made. A human can reject the criteria, change the weights or select a candidate for reasons the arithmetic does not represent.

## 03 / Run the independent check

Save `score-a-creative-candidate-with-explicit-criteria.mjs` and invoke it with `node --input-type=module -e 'import("./score-a-creative-candidate-with-explicit-criteria.mjs").then(({evaluate}) => console.log(evaluate({candidate:{scores:{fit:4,clarity:3}},criteria:{fit:{weight:2,max:5},clarity:{weight:1,max:5}},minimum:10})))'`. The score is `4×2 + 3×1 = 11`, so the initial fixture passes.

```javascript
export function evaluate(input) {
  const candidate = input?.candidate;
  const criteria = input?.criteria;
  const minimum = input?.minimum;
  const names = criteria && typeof criteria === "object" && !Array.isArray(criteria) ? Object.keys(criteria) : [];
  const criteriaValid = Boolean(names.length > 0 && names.every(name => Number.isFinite(criteria[name]?.weight) && criteria[name].weight >= 0 && Number.isFinite(criteria[name]?.max) && criteria[name].max > 0));
  const scoresValid = Boolean(criteriaValid && candidate && typeof candidate.scores === "object" && names.every(name => Number.isFinite(candidate.scores[name]) && candidate.scores[name] >= 0 && candidate.scores[name] <= criteria[name].max));
  const total = scoresValid ? names.reduce((sum, name) => sum + candidate.scores[name] * criteria[name].weight, 0) : NaN;
  const checks = [
    {name: "criteria-valid", pass: criteriaValid},
    {name: "scores-valid", pass: scoresValid},
    {name: "minimum-reached", pass: Number.isFinite(total) && Number.isFinite(minimum) && total >= minimum}
  ];
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The candidate reaches the declared arithmetic threshold." : "The candidate does not reach the declared arithmetic threshold.", checks};
}
```

The exact expected result is the returned object with all three checks true. The boundary fixture totals exactly 10 and also passes, showing that the predicate uses an inclusive threshold.

## 04 / Try the counterexample

Lower fit to 2 while keeping clarity at 3. The total becomes 7, and `minimum-reached` fails while the criteria and score ranges remain valid. That is a useful failure: it shows a candidate can be well-formed without meeting the declared brief threshold.

<!--DEMO-->

## 05 / Keep the claim bounded

Passing establishes valid numeric inputs and threshold attainment under this weighting. It does not establish originality, emotional resonance, accessibility, cultural fit, authorship, or readiness to publish. Criteria can encode bias or omit what matters. Keep a human review beside the arithmetic, record who chose the criteria, and let the reviewer explain exceptions rather than smuggling them into a score.

## Source and formulation note

The weighted score and notation are original pedagogical constructions. WCAG 2.2 is included as a public example of a domain where explicit criteria matter, but this article’s creative score is not a WCAG conformance test. The candidate, criteria and fixtures are synthetic. The module reports arithmetic only and makes no claim to measure creative quality or model performance.
