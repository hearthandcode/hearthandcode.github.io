A producer emits `{count: integer}` while its consumer expects `{id: string}`. Both components work alone, and their endpoints can be connected, yet the seam cannot carry the consumer's required input. The technique is to compare the consumer's required fields against the producer's offered fields before integration.

## 01 / State the predicate

Let F be field names and T be canonical type names. A producer schema is a finite relation P ⊆ F × T, and a consumer requirement is C ⊆ F × T. Define V(P, C) = true exactly when every `(f, t)` in C has an identical `(f, t)` in P.

Glossary: `producer` emits records; `consumer` reads them; `required` means absence blocks the seam; `type` is a canonical identifier such as `string` or `integer`; `compatible` means all required pairs are present exactly. Assumptions: types use one shared vocabulary and extra producer fields are permitted. The checker enforces unique non-empty names so lookup order cannot change the answer. In prose, every consumer obligation must be satisfied by a producer field with the same name and type. This formulation does not check optional fields, value constraints, nested schemas, version negotiation, or behavioral meaning.

## 02 / Give the agent a bounded task

Ask the agent to describe one producer as `fields` and one consumer as `required`. Keep the schema model intentionally small: each entry has only `name` and `type`. Run this independent check before writing adapter code or assuming that two similarly named interfaces compose.

The result returns one check per consumer requirement, so a missing field and a type mismatch remain distinct diagnostics. When the consumer requires nothing, the universal condition is vacuously true; that says nothing about usefulness.

## 03 / Run the independent check

```javascript
export function evaluate(input) {
  const validField = field => field && typeof field.name === "string" && field.name.trim().length > 0 &&
    typeof field.type === "string" && field.type.trim().length > 0;
  const valid = input !== null && typeof input === "object" && input.producer && input.consumer &&
    Array.isArray(input.producer.fields) && input.producer.fields.every(validField) &&
    Array.isArray(input.consumer.required) && input.consumer.required.every(validField);
  if (!valid) {
    return { pass: false, summary: "Invalid schema input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected producer fields and consumer requirements." }
    ] };
  }
  const duplicates = fields => fields.map(field => field.name).filter((name, index, names) =>
    names.indexOf(name) !== index);
  const producerDuplicates = duplicates(input.producer.fields);
  const consumerDuplicates = duplicates(input.consumer.required);
  if (producerDuplicates.length > 0 || consumerDuplicates.length > 0) {
    return { pass: false, summary: "Duplicate field names make the schema ambiguous.", checks: [
      { name: "field-name-uniqueness", pass: false,
        detail: `producer:${producerDuplicates.join(",") || "none"};consumer:${consumerDuplicates.join(",") || "none"}` }
    ] };
  }
  const checks = input.consumer.required.map(required => {
    const offered = input.producer.fields.find(field => field.name === required.name);
    const pass = Boolean(offered) && offered.type === required.type;
    return { name: required.name, pass, detail: !offered ? "missing" : `${offered.type}->${required.type}` };
  });
  const pass = checks.every(check => check.pass);
  return {
    pass,
    summary: pass ? "Producer satisfies every required consumer field." : "Producer and consumer schemas are incompatible.",
    checks
  };
}
```

Save the module as `check-producer-consumer-compatibility.mjs`, then run:

```bash
node --input-type=module -e 'import {evaluate} from "./check-producer-consumer-compatibility.mjs"; console.log(JSON.stringify(evaluate({"producer":{"fields":[{"name":"id","type":"string"},{"name":"count","type":"integer"}]},"consumer":{"required":[{"name":"id","type":"string"}]}})))'
```

Expected result:

```json
{"pass":true,"summary":"Producer satisfies every required consumer field.","checks":[{"name":"id","pass":true,"detail":"string->string"}]}
```

## 04 / Try the counterexample

Remove `id` from the producer. The result identifies it as `missing`. Then offer `id` as `integer`; presence alone does not satisfy a `string` requirement, and the diagnostic shows `integer->string`.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass proves only required-field inclusion under exact string equality. It does not establish JSON Schema compatibility, serialization behavior, numeric ranges, semantic equivalence, backwards compatibility, or successful runtime exchange. Real interfaces should use versioned schemas and fixtures that exercise accepted and rejected values. This predicate is useful as an early, cheap seam check.

## Source and formulation note

The typed-seam posture adapts the cited ESS candidate manuscript. The required-field relation is an original bounded model, not the manuscript's normative schema and not a complete subtyping algorithm. The synthetic field names make no claim about a deployed Exocore consumer.
