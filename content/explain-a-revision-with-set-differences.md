A change log says “updated requirements,” but readers cannot see which requirement entered or left. Start with added and removed labels. The technique is to state one small predicate, run it independently, and return the particular failure instead of a flattering substitute.

## 01 / State the predicate

Let P be the set of exact labels in a prior revision and C the set in a current revision. Define added as C minus P and removed as P minus C. The domain is finite arrays of strings converted to sets. Set difference means members in the left set absent from the right.

Exact membership intentionally ignores repeats but cannot detect a rename or edit inside one label. Those questions need a separate correspondence map.

## 02 / Give the agent a bounded task

Extract comparable labels first: clauses, requirements, sources, or records. Ask for sorted added and removed sets before writing a narrative. This gives review a stable base instead of relying on an uncheckable claim that “the document changed.”

Choose a stable label for each comparable element, reduce both revisions to labels, and show membership changes before claiming why they matter. This works well for clauses, requirements, or sources.

## 03 / Run the independent check

The module creates two sets and reports members present only in current and only in previous. The first fixture says c was added and a was removed. An invalid shape fails without coercing a string into a revision. Identical sets produce none for both differences at the boundary.

Save this complete browser-safe module as `explain-a-revision-with-set-differences.mjs` and run it with Node.js 18 or newer.

```javascript
export function evaluate(input) {
  if (!input || !Array.isArray(input.previous) || !Array.isArray(input.current) || ![...input.previous, ...input.current].every(value => typeof value === "string")) return { pass: false, summary: "Input needs previous and current arrays of strings.", checks: [{ name: "input shape", pass: false }] };
  const previous = new Set(input.previous), current = new Set(input.current);
  const added = [...current].filter(value => !previous.has(value)).sort();
  const removed = [...previous].filter(value => !current.has(value)).sort();
  return { pass: true, summary: `Added: ${added.join(", ") || "none"}. Removed: ${removed.join(", ") || "none"}.`, checks: [{ name: "added set", pass: true }, { name: "removed set", pass: true }] };
}
```

Invocation: `node --input-type=module -e 'import { evaluate } from "./explain-a-revision-with-set-differences.mjs"; console.log(JSON.stringify(evaluate({"previous":["a","b"],"current":["b","c"]})))'`.

Expected result: `{"pass":true,"summary":"Added: c. Removed: a.","checks":[{"name":"added set","pass":true},{"name":"removed set","pass":true}]}`.

The browser demo and fixture runner import this same function. It accepts JSON, makes no network or storage request, and does not mutate its input.

## 04 / Try the counterexample

Set difference does not explain order changes, edits inside an item, renames, meanings, reasons, or disposition. It can show a label left one set and another entered, but it cannot prove that they are unrelated. More complex identity relations need a separate mapping.

Fail the shape fixture with `{"previous":"a","current":[]}`. It returns pass false rather than treating the string as an iterable revision; the normal fixture reports c added and a removed.

<!--DEMO-->

## 05 / Keep the claim bounded

The revision protocol is original pedagogy using a public standard collection type. It does not establish a release history or approval.

A pass means two arrays of exact string labels were compared as sets. It does not detect reordered text, renames, semantic edits, rationale, or release disposition.

## Source and formulation note

The public Set reference supports the collection behavior. This revision protocol is original Fieldcraft pedagogy.

All inputs are synthetic. The source relationship is adaptation of public methodology into an original educational checker. Internal lineage is intentionally excluded from this public article.
