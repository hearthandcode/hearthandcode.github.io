A fluent answer can still violate the task. When you ask an agent for a bounded set of items, move the acceptance condition out of the prose and into a predicate you can run.

The technique is simple: **declare the constraint, produce a candidate, then check the candidate independently.** Keep the check separate from the generator so that the generator cannot quietly redefine success.

## 01 / State the predicate

For this example, let X be a finite sequence of strings and k a non-negative integer capacity. Let N(X) trim each string and remove empty strings. Define:

<div class="equation"><math display="block" aria-label="V of X comma k equals length of N of X at most k and length of unique N of X equals length of N of X"><mrow><mi>V</mi><mo>(</mo><mi>X</mi><mo>,</mo><mi>k</mi><mo>)</mo><mo>≔</mo><mo>|</mo><mi>N</mi><mo>(</mo><mi>X</mi><mo>)</mo><mo>|</mo><mo>≤</mo><mi>k</mi><mo>∧</mo><mo>|</mo><mi>unique</mi><mo>(</mo><mi>N</mi><mo>(</mo><mi>X</mi><mo>)</mo><mo>)</mo><mo>|</mo><mo>=</mo><mo>|</mo><mi>N</mi><mo>(</mo><mi>X</mi><mo>)</mo><mo>|</mo></mrow></math></div>

Here, |·| means sequence length, unique removes exact duplicates, and ∧ means both conditions must hold. In prose: **the normalized candidate fits within the capacity and contains no repeated item.** Equality is case-sensitive. Empty input passes because this is a capacity ceiling, not a minimum-content requirement.

This is a pedagogical predicate inspired by the ESS distinction between a declared constraint and evidence that a candidate satisfies it. It is not normative ESS notation or a complete ESS validator.

## 02 / Give the agent a bounded task

```text
Propose at most four checks for a document ingestion step.
Return one check per line. Do not repeat a check.
The list may contain fewer than four useful items.
```

An illustrative candidate is:

```text
Check file encoding
Validate required metadata
Record source digest
```

A capacity is an upper bound. Adding filler to reach four would satisfy the count while weakening the answer. The predicate deliberately does not reward filling every slot.

## 03 / Run the independent check

Save the following as check.mjs and run `node check.mjs` with Node.js 18 or newer. The browser demonstration uses the same function.

```javascript
export function check(text, capacity) {
  if (!Number.isSafeInteger(capacity) || capacity < 0) {
    throw new RangeError("Capacity must be a non-negative safe integer");
  }
  const items = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const withinCapacity = items.length <= capacity;
  const unique = new Set(items).size === items.length;
  return { count: items.length, withinCapacity, unique,
    pass: withinCapacity && unique };
}
console.log(check("Check encoding\nRecord digest", 4));
```

Expected output: `count: 2`, `withinCapacity: true`, `unique: true`, `pass: true`. Repeat either line and `unique` becomes false. Add distinct items beyond the capacity and `withinCapacity` becomes false.

## 04 / Try the counterexample

Change the capacity and the list below. Use the failing fixture to see both violated conditions. The check runs entirely in your browser.

<!--DEMO-->

## 05 / Keep the claim bounded

Passing establishes two properties of the normalized list: capacity compliance and exact-string uniqueness. It does not establish relevance, factual correctness, semantic distinctness or authorization to execute the checks. “Check encoding” and “Validate encoding” count as different strings even if they mean the same thing.

For a real workflow, compose independent checks: parseability, schema conformance, task constraints and a separately reviewed semantic assessment. Each result should name its predicate and input revision. A successful check is evidence about those predicates; deciding whether to use the result remains a separate step.

## Source and formulation note

This original teaching example interprets Hearth & Code's ESS constraint/evidence methodology. The expression above is local to this article. All inputs are synthetic; no production Exocore behavior or model-quality result is claimed. The initial publication is a design preview for the Fieldcraft series.
