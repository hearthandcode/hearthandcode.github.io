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
