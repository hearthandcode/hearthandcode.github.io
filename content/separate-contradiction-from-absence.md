One note has no source; two other notes assert opposite values with support. Those are distinct failures with different next actions. The technique is to state one small predicate, run it independently, and return the particular failure instead of a flattering substitute.

## 01 / State the predicate

For a record r with claim key k, value v, and evidence name e, define missing(r) when e is blank. Define conflict(k) when two records with key k have unequal values. These predicates are distinct: a lack of evidence does not assert an opposite value. The domain is a synthetic evidence ledger.

Scalar values are required so object identity does not accidentally manufacture a contradiction. This is a data contract, not a theory of natural-language disagreement.

## 02 / Give the agent a bounded task

Give an agent a classification task: group by claim key; count blank evidence names; separately list keys holding incompatible values. Do not flatten both cases into “bad data.” Missing support asks for a source search; contradiction asks about scope, time, method, or real disagreement.

Record the claim key, a scalar asserted value, and an evidence name before classification. This lets a research return state whether it needs a missing source or an analysis of conflicting records.

## 03 / Run the independent check

The checker builds claim groups and compares values inside each group. Its passing fixture has one supported value. A missing-evidence fixture reports a missing count without calling it a contradiction. A supported yes/no pair produces a concrete contradiction for open.

Save this complete browser-safe module as `separate-contradiction-from-absence.mjs` and run it with Node.js 18 or newer.

```javascript
export function evaluate(input) {
  if (!input || !Array.isArray(input.records)) return { pass: false, summary: "Input needs a records array.", checks: [{ name: "input shape", pass: false }] };
  const scalar = value => typeof value === "string" || typeof value === "number" || typeof value === "boolean";
  const valid = input.records.every(record => record && typeof record.claim === "string" && record.claim.trim() && scalar(record.value) && typeof record.evidence === "string");
  if (!valid) return { pass: false, summary: "Each record needs a nonblank claim, scalar value, and evidence string.", checks: [{ name: "record shape", pass: false }] };
  const groups = new Map();
  for (const record of input.records) groups.set(record.claim, [...(groups.get(record.claim) || []), record]);
  const missing = input.records.filter(record => !record.evidence.trim()).length;
  const conflicting = [...groups.entries()].filter(([, records]) => new Set(records.map(record => record.value)).size > 1).map(([claim]) => claim);
  const checks = [{ name: "record shape", pass: true }, { name: "missing evidence", pass: missing === 0 }, { name: "contradictory claims", pass: conflicting.length === 0 }];
  const summary = conflicting.length ? `Contradiction for: ${conflicting.join(", ")}.` : missing ? `${missing} record(s) have missing evidence, without a contradiction.` : "No missing evidence or contradiction found.";
  return { pass: missing === 0 && conflicting.length === 0, summary, checks };
}
```

Invocation: `node --input-type=module -e 'import { evaluate } from "./separate-contradiction-from-absence.mjs"; console.log(JSON.stringify(evaluate({"records":[{"claim":"open","value":"yes","evidence":"r1"}]})))'`.

Expected result: `{"pass":true,"summary":"No missing evidence or contradiction found.","checks":[{"name":"record shape","pass":true},{"name":"missing evidence","pass":true},{"name":"contradictory claims","pass":true}]}`.

The browser demo and fixture runner import this same function. It accepts JSON, makes no network or storage request, and does not mutate its input.

## 04 / Try the counterexample

Exact comparison cannot establish whether two natural-language records really mean the same thing. It cannot resolve a time-qualified disagreement or evaluate reliability. It only keeps two local failure modes distinct so that their follow-up work is not confused.

Fail the fixture with two supported values for open: `{"records":[{"claim":"open","value":"yes","evidence":"r1"},{"claim":"open","value":"no","evidence":"r2"}]}`. The contradiction check is false and the summary names open.

<!--DEMO-->

## 05 / Keep the claim bounded

This is an original pedagogical classifier, not a normative ESS contradiction procedure. The records are synthetic and make no claim about an operational ledger.

A pass means all records have this small schema, none is blankly supported, and equal claim keys do not carry different scalar values. It does not resolve a disagreement.

## Source and formulation note

W3C PROV offers public context for support relations. The two-way diagnostic is original Fieldcraft pedagogy.

All inputs are synthetic. The source relationship is adaptation of public methodology into an original educational checker. Internal lineage is intentionally excluded from this public article.
