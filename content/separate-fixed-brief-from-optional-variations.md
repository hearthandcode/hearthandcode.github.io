Creative briefs often mix a non-negotiable audience with a loose mood word. When both are written as suggestions, iteration can drift away from the actual assignment. When everything is fixed, exploration becomes pointless. Separate the brief into fixed requirements and optional variations so a candidate can be inventive without silently changing its purpose.

The technique is a two-part check. Fixed fields must match exactly. Optional fields must be declared, and when the brief lists allowed values the candidate must choose one of them. The example does not judge whether “warm” is a good palette; it checks whether the choice was permitted.

## 01 / State the predicate

Let `F` be fixed fields, `O` optional fields, and `C` a candidate map. Define `V(F,O,C) ≔ F≠∅ ∧ ∀k∈keys(F):C[k]=F[k] ∧ keys(C)⊆keys(F)∪keys(O)`. If `O[k]` is an array, the candidate value must also be in that array.

The glossary is straightforward: `F` is the part that cannot change, `O` describes permitted variation, and `C` is the proposed result. The assumptions are JSON-like values and exact comparison for fixed fields. In prose: preserve every fixed requirement, and do not invent an optional field or value. This says nothing about whether the brief itself is complete.

## 02 / Give the agent a bounded task

Use a synthetic design brief:

```text
Fixed: audience students; format poster.
Optional: palette warm or cool; motif grid.
Create one poster direction. Keep fixed fields and choose at most one optional palette.
```

The candidate can choose `cool` without asking the brief to decide the visual language. A human can later add a new allowed palette by changing the brief, rather than rewarding an untracked invention after the fact.

## 03 / Run the independent check

Save `separate-fixed-brief-from-optional-variations.mjs` and invoke it with `node --input-type=module -e 'import("./separate-fixed-brief-from-optional-variations.mjs").then(({evaluate}) => console.log(evaluate({brief:{fixed:{audience:"students",format:"poster"},optional:{palette:["warm","cool"],motif:["grid"]}},candidate:{audience:"students",format:"poster",palette:"cool"}})))'`.

```javascript
export function evaluate(input) {
  const fixed = input?.brief?.fixed;
  const optional = input?.brief?.optional;
  const candidate = input?.candidate;
  const fixedKeys = fixed && typeof fixed === "object" && !Array.isArray(fixed) ? Object.keys(fixed) : [];
  const fixedPass = Boolean(fixedKeys.length > 0 && candidate && fixedKeys.every(key => JSON.stringify(candidate[key]) === JSON.stringify(fixed[key])));
  const optionalPass = Boolean(optional && typeof optional === "object" && !Array.isArray(optional) && candidate && Object.keys(candidate).every(key => fixedKeys.includes(key) || (Object.prototype.hasOwnProperty.call(optional, key) && (!Array.isArray(optional[key]) || optional[key].includes(candidate[key])))));
  const checks = [
    {name: "fixed-requirements", pass: fixedPass},
    {name: "optional-fields-declared", pass: optionalPass},
    {name: "candidate-present", pass: candidate !== null && typeof candidate === "object" && !Array.isArray(candidate)}
  ];
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The candidate keeps fixed brief requirements while using declared options." : "The candidate changes a fixed requirement or invents an option.", checks};
}
```

The initial fixture passes, including the allowed `cool` value. The boundary fixture uses no optional field and still passes because optional choices are permission, not obligation.

## 04 / Try the counterexample

Change `format` from `poster` to `card`. The candidate remains well-formed and uses an allowed palette, but `fixed-requirements` fails. Try an undeclared `texture` field next: `optional-fields-declared` fails. Each failure names a different kind of drift.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass shows only that the candidate fits the fixed and optional maps supplied to the checker. It does not show that the brief expresses the true need, that the chosen variation is effective, or that the work is ready for a client. Exact comparison can be too rigid for normalized text; if aliases are allowed, write the normalization rule into the brief and test it as a separate decision.

## Source and formulation note

This fixed-versus-optional predicate is an original teaching construction about maintaining a creative brief. NIST’s framework is a public contextual reference for documenting criteria and context, not a source for these field semantics. Examples are synthetic, and the module makes no claim about creative quality, authorship or approval.
