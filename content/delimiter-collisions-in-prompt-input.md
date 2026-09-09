When a prompt asks for several fields separated by a character, the character can appear inside a legitimate field. `red|blue|green` does not tell you whether the intended values were three colors or `red|blue` followed by `green`. The failure is in the framing rule, before any model has a chance to reason about the content.

The practical technique is to name the transport and run a round-trip check on an example containing the delimiter. Structured framing such as a JSON array keeps the boundary explicit. A delimiter format can still be useful when its escaping rule is specified and tested, but an unescaped split is not a contract.

## 01 / State the predicate

Let `E` be a sequence of strings, `T` a transport mode, and `D(T, value)` the decoded sequence. The local predicate is `V(T,value,E) ≔ type(E)=string[] ∧ type(D)=string[] ∧ D=E`. The equality is positional and exact. Here, `string[]` means a finite array whose members are strings, and `∧` means every condition must hold.

The symbol glossary is deliberately small: `E` is the expected sequence, `T` is either `json` or `delimiter`, `D` is the decoder, and `=` means equal length and equal value at every index. The assumption is that the receiver uses the same decoder described by the input. In prose: the decoded values must be the values the sender intended, in the same order.

## 02 / Give the agent a bounded task

Ask for a transport example, not a general essay:

```text
Encode the two labels ["red|blue", "green"] for a handoff.
Name the transport mode and include the exact value the receiver will decode.
Do not assume that | is safe inside a field.
```

This task makes the collision visible. A JSON answer can represent the first label without changing it. A plain split answer needs an escaping rule, and the rule must be part of the task. The candidate does not become safer because it is fluent or because the labels look simple at a glance.

## 03 / Run the independent check

The checker below parses JSON arrays or deliberately models the naive delimiter split. It compares the resulting sequence with the expected sequence. Save it as `delimiter-collisions-in-prompt-input.mjs` and invoke it with `node --input-type=module -e 'import("./delimiter-collisions-in-prompt-input.mjs").then(({evaluate}) => console.log(evaluate({transport:"json",value:JSON.stringify(["red|blue","green"]),expected:["red|blue","green"]})))'`.

```javascript
export function evaluate(input) {
  const checks = [];
  const expected = Array.isArray(input?.expected) ? input.expected : null;
  const transport = input?.transport;
  checks.push({name: "expected-list", pass: expected !== null && expected.every(value => typeof value === "string")});
  let decoded = null;
  if (transport === "json" && typeof input?.value === "string") {
    try { decoded = JSON.parse(input.value); } catch { decoded = null; }
  } else if (transport === "delimiter" && typeof input?.value === "string" && typeof input?.delimiter === "string") {
    decoded = input.value.split(input.delimiter);
  }
  checks.push({name: "decoded-list", pass: Array.isArray(decoded) && decoded.every(value => typeof value === "string")});
  const exact = Array.isArray(decoded) && Array.isArray(expected) && decoded.length === expected.length && decoded.every((value, index) => value === expected[index]);
  checks.push({name: "round-trip-exact", pass: exact});
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The framing preserves every item exactly." : "The framing changed or could not represent the expected items.", checks};
}
```

For the passing fixture the result is `{pass:true, summary:"The framing preserves every item exactly.", checks:[...]}`. The fixture also contains an empty-array boundary and a failing naive split.

## 04 / Try the counterexample

Use `transport: "delimiter"`, `value: "red|blue|green"`, and expected values `[
"red|blue", "green"
]`. The decoder produces three pieces, so `round-trip-exact` is false. The failure is useful because the individual pieces are all strings; type checking alone would miss the boundary loss.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass establishes exact preservation for the supplied values and decoder. It does not prove that every future value is safe, that a receiver will use the same framing, or that the prompt is semantically clear. JSON parsing also does not validate the larger task or authorize an action. For production protocols, document escaping, encoding, maximum size and versioning separately, then test values chosen for their ability to collide with the framing rule.

## Source and formulation note

The predicate is an original teaching construction. It uses the public behavior of `JSON.parse()` and `String.prototype.split()` as documented by MDN; those references explain parsing and splitting, not a universal prompt protocol. No private source, identity or production transport is represented here. The demo is synthetic and synchronous. The claim is about this round-trip check only, not about model quality or reliable communication outside the declared decoder.
