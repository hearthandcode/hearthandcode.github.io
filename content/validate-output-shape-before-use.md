Many failures happen one step after generation. A formatter expects an array and receives a paragraph. A renderer expects `items` and receives `entries`. The output may sound right to a person while the next operation sees `undefined`. Treat the boundary between steps as a small interface with a check of its own.

The technique is to write the minimum shape the next step needs, then inspect that shape independently. This example requires an object, a required-key list, an `items` array and a declared item type. It intentionally says nothing about whether the strings are useful. Shape and meaning are separate predicates.

## 01 / State the predicate

Let `O` be a candidate output, `R` a finite list of required keys, and `τ` an item type. Define `V(O,R,τ) ≔ object(O) ∧ R⊆keys(O) ∧ array(O.items) ∧ ∀x∈O.items:type(x)=τ`. `∀` means “for every”; `⊆` means each required key occurs in the output; and `τ` is `string` in the demo.

The glossary is: `O` is the received object, `R` is the required-key list, `keys` returns own keys, and `items` is the collection the next step will iterate. The assumptions are that JSON-like objects are the input domain and that an empty array is permitted. In prose: every required container exists and every member has the expected primitive type.

## 02 / Give the agent a bounded task

Use a prompt that exposes the handoff contract:

```text
Return an object with required keys title and items.
items must be an array of strings. An empty array is allowed.
Return JSON only; do not add a prose wrapper.
```

The task is intentionally narrow. It gives the generator a clear target while reserving the right to reject a response that does not meet the shape. The contract does not claim that `title` is accurate or that the list answers the underlying question. Those are later checks with different evidence.

## 03 / Run the independent check

Save the module as `validate-output-shape-before-use.mjs`. Invoke it with `node --input-type=module -e 'import("./validate-output-shape-before-use.mjs").then(({evaluate}) => console.log(evaluate({output:{title:"A",items:["one"]},required:["title","items"],itemType:"string"})))'`. The same exported function is safe to call from the browser demo.

```javascript
export function evaluate(input) {
  const output = input?.output;
  const required = Array.isArray(input?.required) ? input.required : [];
  const itemType = input?.itemType || "string";
  const checks = [];
  const requiredList = Array.isArray(input?.required) && input.required.length > 0 && input.required.every(key => typeof key === "string" && key.length > 0);
  checks.push({name: "required-list", pass: requiredList});
  const object = output !== null && typeof output === "object" && !Array.isArray(output);
  checks.push({name: "plain-object", pass: object});
  const requiredKeys = object && required.every(key => Object.prototype.hasOwnProperty.call(output, key));
  checks.push({name: "required-keys", pass: requiredKeys});
  const items = object && Array.isArray(output.items);
  checks.push({name: "items-array", pass: items});
  const typed = items && output.items.every(item => typeof item === itemType);
  checks.push({name: "items-type", pass: typed});
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The output matches the declared structural checks." : "The output shape is incomplete or has the wrong types.", checks};
}
```

The initial fixture passes with all five checks true. The exact expected result is the returned object with `pass: true`, the summary above, and checks named `required-list`, `plain-object`, `required-keys`, `items-array`, and `items-type`.

## 04 / Try the counterexample

Remove `items` while leaving `title`. The required-key check and the array check fail, and the type check fails because there is no array to inspect. Try an array containing `3` next: the container passes, but `items-type` fails. These are different defects and should remain visible as different checks.

<!--DEMO-->

## 05 / Keep the claim bounded

A passing result establishes only the declared structural predicates for one in-memory value. It does not establish a schema for every producer, semantic relevance, truth, completeness or permission to use the result. Real interfaces may need bounds on lengths, allowed keys, numeric ranges and version fields. Add those predicates explicitly; do not make a shape check carry claims about meaning.

## Source and formulation note

This is an original local formulation of a boundary check. It follows the documented JavaScript distinction between objects and arrays and the JSON-shaped data domain; MDN’s `JSON.parse()` reference is a public explanation of parsing, not a claim that parsed data is valid for a particular application. Inputs are synthetic. The example has no network, storage or provider behavior and makes no claim about the quality of generated outputs.
