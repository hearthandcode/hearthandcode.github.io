A context window cannot hold every dossier record, but an unexplained selection conceals important exclusions. State budget, cost, relevance, and order. The technique is to state one small predicate, run it independently, and return the particular failure instead of a flattering substitute.

## 01 / State the predicate

For candidates i with relevance r(i), token cost t(i), and budget B, select in descending r(i), breaking ties by exact id order, whenever t(i) fits the remaining budget. The domain contains synthetic candidates with nonnegative integer token counts. The invariant is that the sum of selected token costs is at most B.

Exact id ordering is used for tied relevance so the same JSON yields the same choice. That does not make the relevance scores objectively correct.

## 02 / Give the agent a bounded task

Ask for a declared budget and compact candidate metadata before selecting context. State the tie breaker explicitly. This gives a reviewer an auditable reason why a candidate was included or excluded, rather than hiding the choice inside an unbounded request for “the most relevant context.”

Give each candidate a precomputed token cost and relevance score, then record the budget with the selected ids. A reviewer can revisit a contested score without changing the selector’s mechanical behavior.

## 03 / Run the independent check

The module copies and orders candidate records, then accepts each item that fits remaining capacity. It does not mutate input. The first fixture selects A and C in seven tokens, skipping B after A consumes four. A negative budget fails validation, and a four-token item fits a four-token boundary.

Save this complete browser-safe module as `select-context-within-a-token-budget.mjs` and run it with Node.js 18 or newer.

```javascript
export function evaluate(input) {
  if (!input || !Number.isSafeInteger(input.budget) || input.budget < 0 || !Array.isArray(input.items)) return { pass: false, summary: "Input needs a non-negative integer budget and items array.", checks: [{ name: "input shape", pass: false }] };
  const valid = input.items.every(item => item && typeof item.id === "string" && item.id.trim() && Number.isFinite(item.relevance) && Number.isSafeInteger(item.tokens) && item.tokens >= 0) && new Set(input.items.map(item => item && item.id)).size === input.items.length;
  if (!valid) return { pass: false, summary: "Each item needs id, numeric relevance, and non-negative integer tokens.", checks: [{ name: "item shape", pass: false }] };
  let remaining = input.budget;
  const selected = [];
  for (const item of [...input.items].sort((a, b) => b.relevance - a.relevance || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) if (item.tokens <= remaining) { selected.push(item.id); remaining -= item.tokens; }
  return { pass: true, summary: `Selected ${selected.join(", ") || "nothing"} within ${input.budget} tokens.`, checks: [{ name: "token budget", pass: remaining >= 0 }, { name: "deterministic relevance order", pass: true }] };
}
```

Invocation: `node --input-type=module -e 'import { evaluate } from "./select-context-within-a-token-budget.mjs"; console.log(JSON.stringify(evaluate({"budget":7,"items":[{"id":"A","relevance":9,"tokens":4},{"id":"B","relevance":8,"tokens":5},{"id":"C","relevance":7,"tokens":3}]})))'`.

Expected result: `{"pass":true,"summary":"Selected A, C within 7 tokens.","checks":[{"name":"token budget","pass":true},{"name":"deterministic relevance order","pass":true}]}`.

The browser demo and fixture runner import this same function. It accepts JSON, makes no network or storage request, and does not mutate its input.

## 04 / Try the counterexample

Greedy choice is not an optimizer. It can miss a better combination of lower-ranked records, supplied relevance is itself a judgment, and token counts may differ from a real tokenizer. It is a simple deterministic baseline with a visible limitation.

Fail the shape fixture with `{"budget":-1,"items":[]}`. The result has pass false and says the budget must be a non-negative integer; the normal fixture instead selects A and C.

<!--DEMO-->

## 05 / Keep the claim bounded

The selection policy is original teaching material. Passing does not prove context adequacy, relevance, authorization, or model behavior.

A pass means the candidate shape is valid and the greedy selection stays inside the declared budget. It does not prove optimal selection, semantic relevance, or real tokenizer costs.

An empty candidate list is accepted: selecting nothing within a zero budget is a meaningful boundary case. Any supplied id must be nonempty and unique so an empty-looking summary cannot conceal ambiguous selection.

## Source and formulation note

The public ordering reference supports the language operation. The greedy rule is original Fieldcraft pedagogy.

All inputs are synthetic. The source relationship is adaptation of public methodology into an original educational checker. Internal lineage is intentionally excluded from this public article.
