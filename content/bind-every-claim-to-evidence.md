A summary can look sourced while one consequential sentence has no record a reviewer can open. Keep evidence names beside individual claims. The technique is to state one small predicate, run it independently, and return the particular failure instead of a flattering substitute.

## 01 / State the predicate

Let C be a finite list of claim records, each with an identifier and a set of evidence names. Define S(C) when every claim c has at least one nonblank evidence name. The domain is a local claim ledger. The evidence name is a reference to inspect; it is not the evidence itself.

This check asks only whether a review route is named. It deliberately leaves relevance, quality, and entailment to the reviewer.

## 02 / Give the agent a bounded task

Ask for a claim ledger rather than a general instruction to “be well sourced.” Each sentence-level or decision-level claim gets an id and one or more evidence record ids. An unsupported item then remains visible even if surrounding prose sounds careful.

Build the ledger while drafting: assign a claim id, then attach one evidence-record id before allowing the claim into synthesis. This makes support gaps actionable before citations become a formatting exercise.

## 03 / Run the independent check

The module reports one check per claim and passes only when every evidence array contains a nonblank name. The passing fixture has c1 and c2, each with a named record. The counterexample leaves c2 empty; the function identifies the support gap without judging c1's truth.

Save this complete browser-safe module as `bind-every-claim-to-evidence.mjs` and run it with Node.js 18 or newer.

```javascript
export function evaluate(input) {
  if (!input || !Array.isArray(input.claims)) return { pass: false, summary: "Input needs a claims array.", checks: [{ name: "input shape", pass: false }] };
  const validClaims = input.claims.every(claim => claim && typeof claim.id === "string" && claim.id.trim() && Array.isArray(claim.evidence));
  if (!validClaims) return { pass: false, summary: "Each claim needs a nonempty id and an evidence array.", checks: [{ name: "claim shape", pass: false }] };
  const checks = input.claims.map(claim => ({ name: claim.id, pass: claim.evidence.some(value => typeof value === "string" && value.trim()) }));
  const missing = checks.filter(check => !check.pass).length;
  return { pass: missing === 0, summary: missing === 0 ? "Every claim names supporting evidence." : `${missing} claim(s) lack named supporting evidence.`, checks };
}
```

Invocation: `node --input-type=module -e 'import { evaluate } from "./bind-every-claim-to-evidence.mjs"; console.log(JSON.stringify(evaluate({"claims":[{"id":"c1","evidence":["record-1"]},{"id":"c2","evidence":["record-2"]}]})))'`.

Expected result: `{"pass":true,"summary":"Every claim names supporting evidence.","checks":[{"name":"c1","pass":true},{"name":"c2","pass":true}]}`.

The browser demo and fixture runner import this same function. It accepts JSON, makes no network or storage request, and does not mutate its input.

## 04 / Try the counterexample

A named record might be irrelevant, weak, misquoted, dependent on another record, or never read. This checker does not assess entailment or source quality. It creates an inspectable obligation to name support before a reviewer evaluates it.

Fail the fixture by emptying c2’s evidence list: `{"claims":[{"id":"c1","evidence":["record-1"]},{"id":"c2","evidence":[]}]}`. The c2 check is false and the summary says one claim lacks named support.

<!--DEMO-->

## 05 / Keep the claim bounded

The construction is original pedagogy. Public provenance material gives context for retaining relationships; it does not make this small record shape a canonical evidence model.

A pass means every supplied claim has a nonblank evidence name. It does not decide whether the evidence supports the claim or whether it is adequate for a decision.

An empty claim ledger is accepted vacuously: there is no claim missing named support. A blank or missing claim id is different and is rejected as malformed input.

## Source and formulation note

W3C PROV offers public background on provenance relationships. This ledger predicate is original Fieldcraft pedagogy.

All inputs are synthetic. The source relationship is adaptation of public methodology into an original educational checker. Internal lineage is intentionally excluded from this public article.
