“This looks good” is a weak comparison. Without a baseline, a small improvement can be mistaken for meaningful progress, or a polished candidate can hide a regression. A baseline does not need to be sophisticated. A small, declared scorecard is often enough to make the first question answerable: did this candidate reach the reference point?

The technique is to freeze the baseline fields, define how their values combine, and state any required margin before looking at the candidate. This demo adds two numeric fields and sums them. The arithmetic is intentionally transparent so a reviewer can reproduce it without trusting a hidden evaluator.

## 01 / State the predicate

For candidate `C`, baseline `B`, and margin `m`, let `S(x)=Σ values(x)` when every value is finite. The predicate is `V(C,B,m) ≔ valid(C) ∧ valid(B) ∧ keys(C)=keys(B) ∧ finite(m) ∧ S(C)≥S(B)+m`. `Σ` means the sum over the declared fields, `≥` means at least, and `valid` means a non-array object of finite numeric values.

The typed domains are `C,B : object<string, number>` and `m : number`. The assumptions are that the same fields are intended on both objects, the margin is finite, and a sum is meaningful for this synthetic scorecard. The module does not enforce the prompt's illustrative 0–5 scale; add that as a separate range predicate when the scale matters. In prose: the candidate must use the same metrics, pass numeric preconditions, and meet the reference total plus the declared margin. This arithmetic is a comparison aid, not a quality model.

## 02 / Give the agent a bounded task

Ask for the candidate and the reference together:

```text
Return scores for clarity and fit, each from 0 through 5.
The baseline is clarity 3 and fit 3. Reach its total, or exceed it by margin 1.
Return only the score object and a one-sentence rationale.
```

The prompt makes the comparison legible. The baseline is not an invisible expectation, and the margin is not invented after seeing a result. If a different scale or weighting is needed, change the declared predicate before comparing runs.

## 03 / Run the independent check

Save `compare-against-a-simple-baseline.mjs` and invoke it with `node --input-type=module -e 'import("./compare-against-a-simple-baseline.mjs").then(({evaluate}) => console.log(evaluate({candidate:{clarity:4,fit:3},baseline:{clarity:3,fit:3},margin:1})))'`.

```javascript
export function evaluate(input) {
  const candidate = input?.candidate;
  const baseline = input?.baseline;
  const margin = input?.margin ?? 0;
  const valid = value => value !== null && typeof value === "object" && !Array.isArray(value) && Object.values(value).every(score => Number.isFinite(score));
  const sameMetrics = valid(candidate) && valid(baseline) && Object.keys(candidate).length === Object.keys(baseline).length && Object.keys(candidate).every(key => Object.prototype.hasOwnProperty.call(baseline, key));
  const checks = [];
  checks.push({name: "baseline-valid", pass: valid(baseline)});
  checks.push({name: "candidate-valid", pass: valid(candidate)});
  checks.push({name: "same-metrics", pass: sameMetrics});
  const score = value => valid(value) ? Object.values(value).reduce((total, item) => total + item, 0) : NaN;
  const candidateScore = score(candidate);
  const baselineScore = score(baseline);
  checks.push({name: "margin-valid", pass: Number.isFinite(margin)});
  checks.push({name: "candidate-reaches-baseline", pass: sameMetrics && Number.isFinite(candidateScore) && Number.isFinite(baselineScore) && Number.isFinite(margin) && candidateScore >= baselineScore + margin});
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The candidate reaches the declared baseline." : "The candidate does not reach the declared baseline or margin.", checks};
}
```

The initial fixture reaches the baseline and the boundary fixture reaches it by exactly the required margin. The expected result is the complete returned object with `baseline-valid`, `candidate-valid`, `same-metrics`, `margin-valid` and `candidate-reaches-baseline` all true.

## 04 / Try the counterexample

Give the candidate clarity 2 and fit 3 while keeping the baseline at 3 and 3. Its total is one lower, so `candidate-reaches-baseline` fails. A passing shape does not rescue a failing comparison: validity and attainment are separate observations.

<!--DEMO-->

## 05 / Keep the claim bounded

The check says only that finite numbers in this small scorecard use the same metric keys, have a finite margin, and meet a declared sum. It does not show that the score dimensions are complete, that the dimensions are independent, or that a one-point difference matters to people. A baseline can be poorly chosen. Record the scale, fields, weighting and provenance of the baseline, and treat the result as evidence for this comparison rather than a general quality ranking.

## Source and formulation note

The score predicate is an original pedagogical construction. NIST’s AI Risk Management Framework is a public reference for managing and evaluating risks, not a source for this particular sum. All values are synthetic, and no model-quality measurement is claimed. The module has no effects and reports only its named arithmetic checks.
