A quotation can move when an emoji makes visible-character counts differ from JavaScript string indices. State the index unit and re-slice the literal text. The technique is to state one small predicate, run it independently, and return the particular failure instead of a flattering substitute.

## 01 / State the predicate

For source string s and a span (start, end, text), define Q(s, span) when s.slice(start, end) equals text, where start and end are UTF-16 code-unit indices and end is exclusive. The domain is JavaScript strings. A UTF-16 code unit is JavaScript’s indexing unit here, not a count of visible characters.

The exclusive end convention lets a final character end at source.length. Other systems use bytes or grapheme clusters, so index units must travel with the record.

## 02 / Give the agent a bounded task

Require an extraction to retain literal text, source identity, and index convention. In a JavaScript-facing record, say UTF-16 code units explicitly. A reviewer can then re-slice the exact source and detect shifted positions before associating a claim with the wrong passage.

Store the literal source string with every teaching span and use JavaScript’s offset convention consistently. This is enough to re-locate the quoted text inside one exact string revision.

## 03 / Run the independent check

The module checks bounds and compares source.slice(start, end) with recorded text. The fixture uses A, a face emoji, and B. The emoji starts at 1 and ends at 3 in UTF-16 code units. A mistaken end of 2 slices only half its surrogate pair and fails; B at 3–4 is the boundary pass.

Save this complete browser-safe module as `preserve-utf-16-source-offsets.mjs` and run it with Node.js 18 or newer.

```javascript
export function evaluate(input) {
  if (!input || typeof input.source !== "string" || !Array.isArray(input.spans)) return { pass: false, summary: "Input needs a source string and spans array.", checks: [{ name: "input shape", pass: false }] };
  const checks = input.spans.map((span, index) => { const valid = span && Number.isSafeInteger(span.start) && Number.isSafeInteger(span.end) && span.start >= 0 && span.end >= span.start && span.end <= input.source.length && typeof span.text === "string"; return { name: span && span.id || `span ${index + 1}`, pass: Boolean(valid && input.source.slice(span.start, span.end) === span.text) }; });
  const failed = checks.filter(check => !check.pass).length;
  return { pass: failed === 0, summary: failed === 0 ? "Every UTF-16 offset reproduces its recorded span." : `${failed} span offset(s) do not reproduce recorded text.`, checks };
}
```

Invocation: `node --input-type=module -e 'import { evaluate } from "./preserve-utf-16-source-offsets.mjs"; console.log(JSON.stringify(evaluate({"source":"A😀B","spans":[{"id":"face","start":1,"end":3,"text":"😀"}]})))'`.

Expected result: `{"pass":true,"summary":"Every UTF-16 offset reproduces its recorded span.","checks":[{"name":"face","pass":true}]}`.

The browser demo and fixture runner import this same function. It accepts JSON, makes no network or storage request, and does not mutate its input.

## 04 / Try the counterexample

Offsets identify a span only within an exact source revision. They do not prove authorship, license, interpretation, or relevance. Other systems may use bytes, code points, grapheme clusters, or line-column pairs, so index conventions cannot be silently exchanged.

Fail the emoji fixture by changing end from 3 to 2: `{"source":"A😀B","spans":[{"id":"face","start":1,"end":2,"text":"😀"}]}`. The face check is false because the slice does not reproduce the literal.

<!--DEMO-->

## 05 / Keep the claim bounded

The public JavaScript reference documents string behavior used here. This span record and verifier are original pedagogical material.

A pass means every span bounds and reproduces its recorded literal with UTF-16 slicing. It does not establish the source revision, rights, interpretation, or a cross-language offset convention.

## Source and formulation note

The public JavaScript string reference documents the relevant behavior. This span verifier is original Fieldcraft pedagogy.

All inputs are synthetic. The source relationship is adaptation of public methodology into an original educational checker. Internal lineage is intentionally excluded from this public article.
