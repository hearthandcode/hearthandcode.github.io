A client retries `job-7` after losing the response. If the new request has the same digest, returning the recorded result avoids duplicate work. If the same key now names different bytes, replay would hide a collision. The technique is to bind each idempotency key to one request digest and make new, replay, conflict, and corrupt-history cases explicit.

## 01 / State the predicate

Let K be keys, D request digests, and H a finite sequence of prior records `(k, d, result)`. For request r = `(kᵣ, dᵣ)`, let M be records in H whose key equals kᵣ. The decision is `accept-new` when |M| = 0, `replay` when |M| = 1 and its digest equals dᵣ, and `conflict` otherwise.

Glossary: `idempotency key` names one logical request; `digest` binds that name to request content; `replay` returns a previously recorded result; `conflict` holds a reused key with different content; `duplicate` means history contains more than one record for the key. Assumptions: digests were computed outside this function and prior storage should enforce key uniqueness. In prose, an unseen key may start work, an identical request may reuse evidence, and any ambiguity stops. This formulation does not prove digest collision resistance, storage atomicity, or whether replayed work originally succeeded correctly.

## 02 / Give the agent a bounded task

Provide a synthetic prior-record list and one keyed request. Ask the agent to classify the admission decision; do not let it perform the work. The stored `result` is carried only to make the record shape realistic. This evaluator does not return or trust that result because its job is collision detection.

Treat duplicate prior keys as a storage-integrity problem even when their digests agree. Arbitrarily choosing one record would conceal corrupted uniqueness.

## 03 / Run the independent check

```javascript
export function evaluate(input) {
  const validRecord = record => record && typeof record.key === "string" &&
    typeof record.digest === "string" && "result" in record;
  const valid = input !== null && typeof input === "object" && Array.isArray(input.prior) &&
    input.prior.every(validRecord) && input.request && typeof input.request.key === "string" &&
    typeof input.request.digest === "string";
  if (!valid) {
    return { pass: false, summary: "Invalid idempotency input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected prior records and keyed request." }
    ] };
  }
  const matches = input.prior.filter(record => record.key === input.request.key);
  const consistent = matches.every(record => record.digest === input.request.digest);
  const decision = matches.length === 0 ? "accept-new" : matches.length > 1 ? "duplicate" :
    consistent ? "replay" : "conflict";
  return {
    pass: decision === "accept-new" || decision === "replay",
    summary: decision === "accept-new" ? "New key may be accepted." :
      decision === "replay" ? "Same key and digest replay the recorded result." :
      decision === "duplicate" ? "Duplicate prior keys are ambiguous; request held." :
      "Same key carries a different digest; request held.",
    checks: [
      { name: "key-match-count", pass: matches.length <= 1, detail: String(matches.length) },
      { name: "digest-consistency", pass: consistent && matches.length <= 1, detail: decision }
    ]
  };
}
```

Save the module as `detect-idempotency-key-conflicts.mjs`, then run:

```bash
node --input-type=module -e 'import {evaluate} from "./detect-idempotency-key-conflicts.mjs"; console.log(JSON.stringify(evaluate({"prior":[{"key":"job-7","digest":"sha256:a","result":{"status":"done"}}],"request":{"key":"job-7","digest":"sha256:a"}})))'
```

Expected result:

```json
{"pass":true,"summary":"Same key and digest replay the recorded result.","checks":[{"name":"key-match-count","pass":true,"detail":"1"},{"name":"digest-consistency","pass":true,"detail":"replay"}]}
```

## 04 / Try the counterexample

Change the incoming digest to `sha256:b`. The same key now conflicts and the request is held. Also duplicate the prior record: even equal digests fail `key-match-count`, exposing an invariant breach instead of selecting a winner.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass selects a local admission class; it does not execute, persist, or return a prior result. Safe production handling needs an atomic uniqueness constraint, canonical request serialization, a real digest algorithm, and durable result storage. The current Exocore source requires idempotency metadata and includes a persistence shape binding workspace, key, request digest, status, and response, but this article does not claim this JavaScript is that implementation.

## Source and formulation note

The example adapts the cited Exocore contract and ESS idempotence posture into a compact teaching model. Its four-way decision and duplicate-history hold are original explanatory choices. Exocore remains an independently governed implementation; this seed draft neither changes it nor establishes current runtime behavior.
