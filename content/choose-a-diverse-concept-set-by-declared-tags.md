Three concepts can be three near-copies. Calling a set “varied” does not make its differences visible. Tags are a modest way to state what kinds of difference a selection is supposed to cover: quiet, bright, modular, organic, or another vocabulary chosen for the brief. They are a declared lens, not a universal definition of diversity.

The technique is to require a fixed pick count, unique IDs, coverage of required tags and a minimum number of distinct tags across the set. The checker cannot tell whether tags are insightful or whether a viewer experiences the concepts as distinct. It can make the selection rule inspectable before a human chooses among candidates.

## 01 / State the predicate

Let `P` be the selected concept sequence, `R` required tags, and `U=⋃ tags(p)` the union of tags. For requested count `k` and floor `d`, define `V ≔ |P|=k ∧ unique(ids(P)) ∧ R⊆U ∧ |U|≥d`.

The glossary is: `P` is the chosen set, `R` is the declared coverage list, `U` is every tag appearing in `P`, `k` is the requested count, and `d` is the minimum diversity floor. The assumptions are that tags are meaningful only within this brief and that duplicate IDs indicate a selection error. In prose: the set covers named categories and reaches the declared breadth.

## 02 / Give the agent a bounded task

Ask for a set with visible selection rules:

```text
Return exactly 3 concept cards with unique IDs.
Cover required tags quiet and modular.
Use at least 3 distinct tags across the selected cards.
Give each card a short title and its declared tags.
```

This task allows the generator to choose its concepts while making the set-level requirement testable. The vocabulary should come from the brief; do not treat the checker’s tag count as proof that the ideas are socially or aesthetically diverse.

## 03 / Run the independent check

Save `choose-a-diverse-concept-set-by-declared-tags.mjs` and invoke it with `node --input-type=module -e 'import("./choose-a-diverse-concept-set-by-declared-tags.mjs").then(({evaluate}) => console.log(evaluate({concepts:[{id:"a",tags:["quiet","grid"]},{id:"b",tags:["bright","organic"]},{id:"c",tags:["modular"]}],requiredTags:["quiet","modular"],minimumDistinctTags:3,pick:3})))'`.

```javascript
export function evaluate(input) {
  const concepts = Array.isArray(input?.concepts) ? input.concepts : [];
  const required = Array.isArray(input?.requiredTags) ? input.requiredTags : [];
  const pick = input?.pick;
  const minDistinct = input?.minimumDistinctTags;
  const ids = concepts.map(concept => concept?.id);
  const uniqueIds = ids.every((id, index) => typeof id === "string" && ids.indexOf(id) === index);
  const tagLists = concepts.every(concept => Array.isArray(concept?.tags) && concept.tags.every(tag => typeof tag === "string"));
  const union = new Set(concepts.flatMap(concept => Array.isArray(concept?.tags) ? concept.tags : []));
  const checks = [
    {name: "requested-count", pass: Number.isSafeInteger(pick) && pick > 0 && concepts.length === pick},
    {name: "unique-concepts", pass: uniqueIds},
    {name: "declared-tags", pass: tagLists},
    {name: "required-coverage", pass: required.every(tag => union.has(tag))},
    {name: "minimum-diversity", pass: Number.isSafeInteger(minDistinct) && union.size >= minDistinct}
  ];
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The selected set covers the declared tags and diversity floor." : "The selected set misses a declared tag, count, identity, or diversity floor.", checks};
}
```

The initial fixture passes all five checks. The boundary fixture reaches exactly two distinct required tags with a pick count of two, showing that the floor is inclusive.

## 04 / Try the counterexample

Give all three concepts only the `quiet` tag while requiring `quiet` and `modular`. The count and identities pass, but required coverage and minimum diversity fail. This is preferable to a single “diverse: false” result because the reviewer can decide whether coverage or breadth needs correction.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass establishes only the declared tag arithmetic, count and identity checks. It does not establish conceptual originality, cultural representation, accessibility, or perceptual difference. Tags can be copied mechanically or chosen badly. Review the tag vocabulary and inspect the concepts themselves; keep the deterministic result as a selection aid, not a verdict on diversity.

## Source and formulation note

The set predicate and tag union are original pedagogical constructions. NIST’s public framework is a contextual source for explicit criteria and risk-aware review, not a source for this creative taxonomy. All concepts and tags are synthetic. No model-quality, audience-response or social claim follows from a passing fixture.
