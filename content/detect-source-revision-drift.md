A briefing names “the guide,” yet the guide exists in several editions. Compare the expected id and revision with the observed pair before using it. The technique is to state one small predicate, run it independently, and return the particular failure instead of a flattering substitute.

## 01 / State the predicate

Let E = (id_e, version_e) be a declared source identity and O = (id_o, version_o) be the observed identity. Define D(E, O) when id_e = id_o and version_e = version_o. The domain is pairs of nonempty labels. An id distinguishes a named source; a version is a publisher-supplied revision label. Both equalities must hold.

A source label is a routing aid, not a security proof. The useful assumption is that both labels are copied faithfully into the retrieval record.

## 02 / Give the agent a bounded task

Request a source by checkable identity: “use guide, revision v2, and report the identity observed.” A floating source name cannot show which revision informed a result. Put expected identity beside observed identity so a reviewer can compare them without reconstructing the request.

Start with an expected pair such as guide/v2 and an observed pair returned by retrieval. Keep the comparison next to the use decision, because a matching topic name is not a matching revision.

## 03 / Run the independent check

The module compares both fields exactly. Its passing fixture has guide/v2 on both sides. Its counterexample preserves guide but changes the observed revision to v3, so the version check fails while the source-id check remains true.

Save this complete browser-safe module as `detect-source-revision-drift.mjs` and run it with Node.js 18 or newer.

```javascript
export function evaluate(input) {
  const nonempty = value => typeof value === "string" && value.trim().length > 0;
  const valid = input && input.expected && input.observed &&
    nonempty(input.expected.id) && nonempty(input.expected.version) &&
    nonempty(input.observed.id) && nonempty(input.observed.version);
  if (!valid) return { pass: false, summary: "Expected and observed source identities need nonempty id and version strings.", checks: [{ name: "input shape", pass: false }] };
  const sameId = input.expected.id === input.observed.id;
  const sameVersion = input.expected.version === input.observed.version;
  return { pass: sameId && sameVersion, summary: sameId && sameVersion ? "Observed source matches the declared id and version." : "Observed source differs from the declared identity.", checks: [{ name: "source id", pass: sameId }, { name: "version", pass: sameVersion }] };
}
```

Invocation: `node --input-type=module -e 'import { evaluate } from "./detect-source-revision-drift.mjs"; console.log(JSON.stringify(evaluate({"expected":{"id":"guide","version":"v2"},"observed":{"id":"guide","version":"v2"}})))'`.

Expected result: `{"pass":true,"summary":"Observed source matches the declared id and version.","checks":[{"name":"source id","pass":true},{"name":"version","pass":true}]}`.

The browser demo and fixture runner import this same function. It accepts JSON, makes no network or storage request, and does not mutate its input.

## 04 / Try the counterexample

This detects declared-identity drift only. A matching version label does not prove byte identity, authenticity, completeness, or current content. When byte identity matters, a separately trusted digest process is needed.

Fail the fixture by changing observed.version from `v2` to `v3`: `{"expected":{"id":"guide","version":"v2"},"observed":{"id":"guide","version":"v3"}}`. The version check becomes false and the summary reports a differing identity.

<!--DEMO-->

## 05 / Keep the claim bounded

The expression is original local pedagogy, not canonical ESS semantics. It does not prove that any runtime retrieved, admitted, or securely verified a source.

A pass says that these four labels are nonblank and equal by exact string comparison. It cannot attest to source bytes or origin.

## Source and formulation note

The equality-operator reference supports the language feature used here. The source-identity contract is original Fieldcraft pedagogy.

All inputs are synthetic. The source relationship is adaptation of public methodology into an original educational checker. Internal lineage is intentionally excluded from this public article.
