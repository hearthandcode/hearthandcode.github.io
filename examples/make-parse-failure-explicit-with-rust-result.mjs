export function evaluate(input) {
  const valid = input !== null && typeof input === "object" && typeof input.text === "string" &&
    Number.isSafeInteger(input.min) && Number.isSafeInteger(input.max) &&
    input.min >= -2147483648 && input.max <= 2147483647 && input.min <= input.max;
  if (!valid) {
    return { pass: false, summary: "Invalid parser input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected text and ordered integer bounds." }
    ] };
  }
  const syntax = /^[+-]?\d+$/.test(input.text);
  const value = syntax ? Number(input.text) : null;
  const safe = syntax && Number.isSafeInteger(value);
  const inRange = safe && value >= input.min && value <= input.max;
  return {
    pass: inRange,
    summary: !syntax || !safe ? "Parse failed: invalid-integer." :
      !inRange ? "Parse failed: out-of-range." : `Parsed integer ${value}.`,
    checks: [
      { name: "integer-syntax", pass: syntax && safe, detail: input.text },
      { name: "range", pass: inRange, detail: `${input.min}..${input.max}` }
    ]
  };
}
