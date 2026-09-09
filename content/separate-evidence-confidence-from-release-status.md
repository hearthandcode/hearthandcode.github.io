A high evidence score is sometimes mistaken for permission to release. Store an assessment and a lifecycle decision in separate fields. The technique is to state one small predicate, run it independently, and return the particular failure instead of a flattering substitute.

## 01 / State the predicate

Let confidence q belong to [0, 1] and release state r belong to {draft, reviewed, released}. Define I(q, r) when both fields are valid and r is not derived from q. The domain is a local evidence-and-lifecycle record. Independence here is a data-contract rule, not a statistical claim.

Separate fields do not prove causal or statistical independence. They only prevent this small record from declaring a release derived from confidence.

## 02 / Give the agent a bounded task

Ask for evidence assessment and release decision as separate fields. High confidence may inform review, but it does not authorize publication or use. A released artifact may retain uncertainty as well. Two fields give a reviewer two distinct decisions to examine and prevent a score from quietly becoming a release mechanism.

Place the assessment and lifecycle decision in adjacent fields, then record actual release reasons elsewhere. That keeps a score from being mistaken for a permission mechanism.

## 03 / Run the independent check

The module checks the confidence range, small release vocabulary, and absence of a derivation marker. Its passing fixture records confidence 0.98 with draft status. Confidence 1.1 fails the range check. A valid confidence with a derivedFromConfidence marker fails the independence check.

Save this complete browser-safe module as `separate-evidence-confidence-from-release-status.mjs` and run it with Node.js 18 or newer.

```javascript
export function evaluate(input) {
  if (!input || !input.evidence || !input.release || !Number.isFinite(input.evidence.confidence) || typeof input.release.status !== "string") return { pass: false, summary: "Input needs evidence confidence and release status.", checks: [{ name: "input shape", pass: false }] };
  const confidenceValid = input.evidence.confidence >= 0 && input.evidence.confidence <= 1;
  const releaseValid = ["draft", "reviewed", "released"].includes(input.release.status);
  const noDeclaredDerivation = !Object.hasOwn(input.release, "derivedFromConfidence");
  return { pass: confidenceValid && releaseValid && noDeclaredDerivation, summary: confidenceValid && releaseValid && noDeclaredDerivation ? `Confidence ${input.evidence.confidence} and ${input.release.status} are separate fields; this does not prove independence.` : "Confidence and release status need valid separate fields.", checks: [{ name: "confidence range", pass: confidenceValid }, { name: "release status", pass: releaseValid }, { name: "no declared derivation", pass: noDeclaredDerivation }] };
}
```

Invocation: `node --input-type=module -e 'import { evaluate } from "./separate-evidence-confidence-from-release-status.mjs"; console.log(JSON.stringify(evaluate({"evidence":{"confidence":0.98},"release":{"status":"draft"}})))'`.

Expected result: `{"pass":true,"summary":"Confidence 0.98 and draft are separate fields; this does not prove independence.","checks":[{"name":"confidence range","pass":true},{"name":"release status","pass":true},{"name":"no declared derivation","pass":true}]}`.

The browser demo and fixture runner import this same function. It accepts JSON, makes no network or storage request, and does not mutate its input.

## 04 / Try the counterexample

It does not calibrate confidence, estimate a probability, assess source quality, or authorize a release. The lifecycle words are only a small teaching vocabulary. A real release needs a named human authority, target, and review basis rather than this record alone.

Fail the derivation fixture with `{"evidence":{"confidence":0.5},"release":{"status":"reviewed","derivedFromConfidence":true}}`. The no-declared-derivation check is false and the summary asks for valid separate fields.

<!--DEMO-->

## 05 / Keep the claim bounded

NIST offers public risk-governance context. The field separation and checker are original pedagogy and do not claim a canonical release model.

A pass means confidence is in range, status is in the local vocabulary, and the record does not declare a derivation. It does not prove causal or statistical independence, calibrated confidence, or release authority.

## Source and formulation note

NIST provides public risk-governance context. This separate-field contract is original Fieldcraft pedagogy.

All inputs are synthetic. The source relationship is adaptation of public methodology into an original educational checker. Internal lineage is intentionally excluded from this public article.
