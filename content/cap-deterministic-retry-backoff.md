A failing operation retries forever, or its exponential delay grows beyond a useful window. Either behavior turns recovery into an unbounded process. The technique is to declare two ceilings: the last retryable attempt and the maximum delay. Compute the delay deterministically so fixtures can inspect the exact schedule.

## 01 / State the predicate

Let a be a zero-based non-negative attempt index, m ≥ 1 the attempt ceiling, b ≥ 0 the base delay in milliseconds, and c ≥ 0 the delay cap. Retry is permitted exactly when a < m. When permitted, d(a) = min(b × 2ᵃ, c); otherwise d(a) = 0.

Glossary: `attempt` counts the retry decision being considered; `maxAttempts` is the exclusive ceiling; `baseDelayMs` is the uncapped delay at attempt zero; `capMs` is the maximum returned delay; `deterministic` means identical inputs return identical results. Assumptions: all values are safe integers, and a is bounded to 30 to prevent impractical exponent growth in this demo. In prose, each retry doubles from the base until it reaches the cap, and no retry occurs at or beyond the budget. This formulation does not add jitter, classify errors as retryable, sleep, schedule work, or execute an operation.

## 02 / Give the agent a bounded task

Provide the four integer parameters and ask the agent for one retry decision. Keep error classification outside this function: call it only after another policy has declared the failure retryable. This separation makes the numerical budget testable without pretending every failure deserves another attempt.

The initial fixture computes attempt two as 100 × 2² = 400 milliseconds. The boundary fixture would produce 1,600 milliseconds before capping, so it returns exactly 500.

## 03 / Run the independent check

```javascript
export function evaluate(input) {
  const integer = value => Number.isSafeInteger(value);
  const valid = input !== null && typeof input === "object" && integer(input.attempt) &&
    integer(input.maxAttempts) && integer(input.baseDelayMs) && integer(input.capMs) &&
    input.attempt >= 0 && input.attempt <= 30 && input.maxAttempts >= 1 &&
    input.baseDelayMs >= 0 && input.capMs >= 0;
  if (!valid) {
    return { pass: false, summary: "Invalid retry budget.", checks: [
      { name: "input-shape", pass: false, detail: "Expected bounded non-negative safe integers." }
    ] };
  }
  const retry = input.attempt < input.maxAttempts;
  const delayMs = retry ? Math.min(input.baseDelayMs * (2 ** input.attempt), input.capMs) : 0;
  return {
    pass: retry,
    summary: retry ? `Retry after ${delayMs} ms.` : "Retry budget exhausted.",
    checks: [
      { name: "attempt-remaining", pass: retry, detail: `${input.attempt}/${input.maxAttempts}` },
      { name: "delay-capped", pass: delayMs <= input.capMs, detail: `${delayMs}<=${input.capMs}` }
    ]
  };
}
```

Save the module as `cap-deterministic-retry-backoff.mjs`, then run:

```bash
node --input-type=module -e 'import {evaluate} from "./cap-deterministic-retry-backoff.mjs"; console.log(JSON.stringify(evaluate({"attempt":2,"maxAttempts":5,"baseDelayMs":100,"capMs":1000})))'
```

Expected result:

```json
{"pass":true,"summary":"Retry after 400 ms.","checks":[{"name":"attempt-remaining","pass":true,"detail":"2/5"},{"name":"delay-capped","pass":true,"detail":"400<=1000"}]}
```

## 04 / Try the counterexample

Set `attempt` and `maxAttempts` both to 5. The attempt budget is exhausted, `pass` is false, and the reported delay is zero. Then try the capping fixture to see exponential growth stop at the declared ceiling.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass establishes only that one numerical retry falls inside this budget. It does not identify transient failures, guarantee eventual success, manage concurrency, account for a server's retry-after instruction, or schedule a timer. This model deliberately makes no jitter claim. Distributed clients often add randomized jitter, but that would require its own declared algorithm and deterministic test seam.

## Source and formulation note

The bounded workflow and cost-ceiling posture is adapted from the cited Exocore and ESS sources. The particular exponential formula and input ceiling are original pedagogical choices, not a claim about an installed retry policy or a normative ESS rule.
