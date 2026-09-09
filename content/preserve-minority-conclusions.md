A review favors shipping, while a minority records a reason to wait. A synthesis that drops the minority has lost decision-relevant information. The technique is to state one small predicate, run it independently, and return the particular failure instead of a flattering substitute.

## 01 / State the predicate

Let L be the distinct conclusion texts in a source set and Y the conclusion texts retained by a synthesis. Define P(L, Y) when L is a subset of Y. The domain is conclusion labels supplied by a bounded review. A minority label records a position’s status; it does not measure truth, strength, or importance.

Literal retention is conservative: it exposes an omission but asks a human to decide whether a paraphrase kept the same qualification and meaning.

## 02 / Give the agent a bounded task

Ask for both observed conclusions and the conclusion texts retained in the synthesis. Mark majority or minority only when that label belongs to the input. The aim is not to manufacture balance. It is to stop a transformation from silently dropping a conclusion that a reviewer should still see.

Keep the source conclusion list and the synthesis list side by side. A reviewer can then see whether a minority rationale survives even when the main recommendation is stated first.

## 03 / Run the independent check

The module compares distinct supplied texts with the synthesis array and separately tests retained minority texts. The passing fixture retains ship and wait. The counterexample keeps only ship, names wait as omitted, and fails both checks. A no-minority boundary still passes when every supplied conclusion remains.

Save this complete browser-safe module as `preserve-minority-conclusions.mjs` and run it with Node.js 18 or newer.

```javascript
export function evaluate(input) {
  if (!input || !Array.isArray(input.conclusions) || !Array.isArray(input.synthesis)) return { pass: false, summary: "Input needs conclusions and synthesis arrays.", checks: [{ name: "input shape", pass: false }] };
  const validConclusions = input.conclusions.every(item => item && typeof item.text === "string" && item.text.trim() && ["majority", "minority"].includes(item.position));
  const validSynthesis = input.synthesis.every(value => typeof value === "string" && value.trim());
  if (!validConclusions || !validSynthesis) return { pass: false, summary: "Conclusions need nonempty text and a known position; synthesis needs nonempty text.", checks: [{ name: "conclusion shape", pass: false }] };
  const distinct = [...new Set(input.conclusions.map(item => item.text))];
  const synthesized = new Set(input.synthesis.filter(value => typeof value === "string"));
  const absent = distinct.filter(value => !synthesized.has(value));
  const minority = input.conclusions.filter(item => item.position === "minority").map(item => item.text);
  const minorityKept = minority.every(value => synthesized.has(value));
  return { pass: absent.length === 0 && minorityKept, summary: absent.length ? `Synthesis omits: ${absent.join(", ")}.` : minorityKept ? "Synthesis retains every conclusion, including minority conclusions." : "Minority conclusions are not retained.", checks: [{ name: "all conclusions retained", pass: absent.length === 0 }, { name: "minority conclusions retained", pass: minorityKept }] };
}
```

Invocation: `node --input-type=module -e 'import { evaluate } from "./preserve-minority-conclusions.mjs"; console.log(JSON.stringify(evaluate({"conclusions":[{"text":"ship","position":"majority"},{"text":"wait","position":"minority"}],"synthesis":["ship","wait"]})))'`.

Expected result: `{"pass":true,"summary":"Synthesis retains every conclusion, including minority conclusions.","checks":[{"name":"all conclusions retained","pass":true},{"name":"minority conclusions retained","pass":true}]}`.

The browser demo and fixture runner import this same function. It accepts JSON, makes no network or storage request, and does not mutate its input.

## 04 / Try the counterexample

Retention is not endorsement. The function cannot decide whether a conclusion is representative, well-supported, comparable, or actionable. It also treats paraphrases as different strings. Human review must decide whether a paraphrase faithfully retains the dissent.

Fail the fixture by removing wait from synthesis: `{"conclusions":[{"text":"ship","position":"majority"},{"text":"wait","position":"minority"}],"synthesis":["ship"]}`. The result names wait as omitted.

<!--DEMO-->

## 05 / Keep the claim bounded

This exact text-retention rule is original teaching material. It preserves a review route for difference without claiming a canonical synthesis practice.

A pass means every literal input conclusion appears in the synthesis list, including those marked minority. It does not validate voting, evidence strength, or the decision itself.

Empty conclusion and synthesis lists are accepted vacuously: there is no supplied conclusion to lose. Blank text or an unknown position is malformed input, not silent absence.

## Source and formulation note

Cochrane's qualitative-evidence chapter provides methodological context. This retention test is original Fieldcraft pedagogy.

All inputs are synthetic. The source relationship is adaptation of public methodology into an original educational checker. Internal lineage is intentionally excluded from this public article.
