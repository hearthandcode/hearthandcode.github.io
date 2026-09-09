A public card is derived from an internal record. The private note is intentionally omitted, but the card arrives with no account of that omission. A later reader cannot distinguish deliberate redaction from accidental data loss. The technique is to return the projection together with a field-level loss report and verify that the report matches the transform.

## 01 / State the predicate

Let S and P be finite maps from field names to scalar JSON values. Let L be an ordered list of declarations `(field, disposition, reason)`, where disposition is `dropped` or `normalized`. Define actual(S, P) by sorting S's own keys: a missing key is dropped, and a present unequal scalar is normalized. V(S, P, L) is true exactly when every declaration has a non-empty reason and the `(field, disposition)` sequence in L equals actual(S, P).

Glossary: `projection` is a derived view; `dropped` means a source field is absent; `normalized` means its value changed; `lossless` means neither occurred in this bounded domain. Assumptions: values are strings, numbers, booleans, or null; comparison is shallow; key order is normalized by sorting. In prose, compute loss from the source and projection, then require the declaration to name the same changes in the same deterministic order. This formulation does not judge whether a loss was acceptable or whether the source was authorized for projection.

## 02 / Give the agent a bounded task

Give the agent one scalar source record and one intended projection. Ask it to emit a reason for every omitted or changed source field. Do not ask this small checker to traverse arrays or nested objects; complex transforms need a path-aware comparison and transformation-specific semantics.

The initial fixture drops `privateNote` for a stated public-boundary reason. The independent check confirms that the omission is visible without exposing the omitted value in the report.

## 03 / Run the independent check

```javascript
export function evaluate(input) {
  const plain = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const scalar = value => value === null || ["string", "number", "boolean"].includes(typeof value);
  const valid = input !== null && typeof input === "object" && plain(input.source) &&
    plain(input.projection) && Object.values(input.source).every(scalar) &&
    Object.values(input.projection).every(scalar) && Array.isArray(input.declaredLoss);
  if (!valid) {
    return { pass: false, summary: "Invalid projection input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected source, projection, and declaredLoss." }
    ] };
  }
  const actual = Object.keys(input.source).sort().flatMap(field => {
    if (!Object.hasOwn(input.projection, field)) return [{ field, disposition: "dropped" }];
    if (JSON.stringify(input.source[field]) !== JSON.stringify(input.projection[field])) {
      return [{ field, disposition: "normalized" }];
    }
    return [];
  });
  const declarationValid = input.declaredLoss.every(entry => entry &&
    typeof entry.field === "string" && ["dropped", "normalized"].includes(entry.disposition) &&
    typeof entry.reason === "string" && entry.reason.trim().length > 0);
  const declared = input.declaredLoss.filter(entry => entry).map(entry =>
    ({ field: entry.field, disposition: entry.disposition }));
  const complete = declarationValid && JSON.stringify(declared) === JSON.stringify(actual);
  return {
    pass: complete,
    summary: complete ? `Loss report accounts for ${actual.length} field(s).` : "Projection loss is missing or misclassified.",
    checks: [
      { name: "declarations-valid", pass: declarationValid, detail: `${input.declaredLoss.length} declared` },
      { name: "loss-complete", pass: complete, detail: actual.map(item => `${item.field}:${item.disposition}`).join(",") || "lossless" }
    ]
  };
}
```

Save the module as `return-a-projection-loss-report.mjs`, then run:

```bash
node --input-type=module -e 'import {evaluate} from "./return-a-projection-loss-report.mjs"; console.log(JSON.stringify(evaluate({"source":{"title":"Map","privateNote":"omit"},"projection":{"title":"Map"},"declaredLoss":[{"field":"privateNote","disposition":"dropped","reason":"not public"}]})))'
```

Expected result:

```json
{"pass":true,"summary":"Loss report accounts for 1 field(s).","checks":[{"name":"declarations-valid","pass":true,"detail":"1 declared"},{"name":"loss-complete","pass":true,"detail":"privateNote:dropped"}]}
```

## 04 / Try the counterexample

Keep the omitted `privateNote` but replace `declaredLoss` with an empty array. The checker reports the actual `privateNote:dropped` loss and fails. Try a `null` declaration too: malformed reporting returns a bounded failure instead of throwing.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass establishes completeness only for own, top-level scalar source fields under this comparator. It does not cover new fields introduced by the projection, nested semantic changes, reordered arrays, formatting loss, rights, or audience fitness. An empty report establishes only that every own source field is present with the same scalar value; projection-only fields may still exist. Review still decides whether each declared loss is acceptable.

## Source and formulation note

The requirement to carry visible loss adapts the cited ESS candidate manuscript. The shallow scalar domain is an original teaching simplification chosen to avoid misleading deep-equality claims. No private value is exported by the report, and the example does not claim a production projection or canonical ESS validator.
