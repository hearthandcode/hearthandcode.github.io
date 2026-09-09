A page fetched yesterday cannot answer a question requiring evidence fresh within one minute. Record both times and the permitted age. The technique is to state one small predicate, run it independently, and return the particular failure instead of a flattering substitute.

## 01 / State the predicate

For retrieved timestamp t_r, comparison time t_n, and maximum age M at least zero, define F when zero is at most t_n - t_r and t_n - t_r is at most M. The domain uses ISO timestamp strings parsed to milliseconds and a nonnegative integer maxAgeMs. The boundary is inclusive.

ISO UTC milliseconds make the comparison unambiguous. The inclusive boundary is explicit: exactly the maximum age passes, and one more millisecond fails.

## 02 / Give the agent a bounded task

Require retrieval time, evaluation time, and maximum age whenever freshness matters. Do not ask an agent to decide “recent enough” from prose. The three fields make the time assumption inspectable and let tasks choose their own boundary without silently borrowing one another’s policy.

Persist a UTC retrieval timestamp when evidence enters the working set, then compare it with a declared evaluation time at the point it is used. This prevents “recent” from becoming an untested adjective.

## 03 / Run the independent check

The module parses timestamps, rejects a backwards order, then compares age to the limit. The passing fixture is exactly 60,000 milliseconds old against a 60,000-millisecond maximum. Advancing now by one millisecond fails. A third fixture rejects a now time that precedes retrieval before calculating freshness.

Save this complete browser-safe module as `reject-stale-retrieval-evidence.mjs` and run it with Node.js 18 or newer.

```javascript
export function evaluate(input) {
  if (!input || typeof input.retrievedAt !== "string" || typeof input.now !== "string" || !Number.isSafeInteger(input.maxAgeMs) || input.maxAgeMs < 0) return { pass: false, summary: "Input needs ISO timestamps and a non-negative integer maxAgeMs.", checks: [{ name: "input shape", pass: false }] };
  const isoZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
  if (!isoZ.test(input.retrievedAt) || !isoZ.test(input.now)) return { pass: false, summary: "Timestamps must use ISO UTC milliseconds ending in Z.", checks: [{ name: "timestamp form", pass: false }] };
  const parseStrict = text => { const normalized = text.includes(".") ? text : text.replace("Z", ".000Z"); const value = Date.parse(normalized); return Number.isFinite(value) && new Date(value).toISOString() === normalized ? value : NaN; };
  const retrieved = parseStrict(input.retrievedAt), now = parseStrict(input.now);
  if (!Number.isFinite(retrieved) || !Number.isFinite(now) || now < retrieved) return { pass: false, summary: "Timestamps must parse and now must not precede retrieval.", checks: [{ name: "timestamp form", pass: true }, { name: "timestamp order", pass: false }] };
  const age = now - retrieved, fresh = age <= input.maxAgeMs;
  return { pass: fresh, summary: fresh ? `Retrieval age ${age}ms is within the ${input.maxAgeMs}ms limit.` : `Retrieval age ${age}ms exceeds the ${input.maxAgeMs}ms limit.`, checks: [{ name: "timestamp form", pass: true }, { name: "timestamp order", pass: true }, { name: "max age", pass: fresh }] };
}
```

Invocation: `node --input-type=module -e 'import { evaluate } from "./reject-stale-retrieval-evidence.mjs"; console.log(JSON.stringify(evaluate({"retrievedAt":"2026-09-09T12:00:00.000Z","now":"2026-09-09T12:01:00.000Z","maxAgeMs":60000})))'`.

Expected result: `{"pass":true,"summary":"Retrieval age 60000ms is within the 60000ms limit.","checks":[{"name":"timestamp form","pass":true},{"name":"timestamp order","pass":true},{"name":"max age","pass":true}]}`.

The browser demo and fixture runner import this same function. It accepts JSON, makes no network or storage request, and does not mutate its input.

## 04 / Try the counterexample

Passing establishes only that recorded timestamps fit this maximum-age predicate. It does not confirm retrieval success, unchanged content, source trustworthiness, or a correct system clock. Pair freshness with explicit revision identity when both currentness and identity matter.

Fail the freshness fixture by setting now to `2026-09-09T12:01:00.001Z` with maxAgeMs 60000. The age is 60001ms, max age is false, and the summary reports that it exceeds the limit.

<!--DEMO-->

## 05 / Keep the claim bounded

The public reference documents the parsing function used by the example. The inclusive freshness policy and its tests are original local pedagogy.

A pass means the timestamps use the required ISO UTC form, time does not move backwards, and the age is at or below the maximum. It does not prove that the source content has remained unchanged.

The evaluator accepts ISO UTC seconds with optional three-digit milliseconds, then round-trips the parsed time to reject normalized impossible dates such as February 30. This closes a parser convenience that a regular expression alone cannot detect.

## Source and formulation note

The public Date.parse reference supports the parser. This UTC freshness policy is original Fieldcraft pedagogy.

All inputs are synthetic. The source relationship is adaptation of public methodology into an original educational checker. Internal lineage is intentionally excluded from this public article.
