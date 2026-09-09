A configuration parser converts invalid text to zero and continues. The fallback erases whether the user entered `0`, `four`, or an out-of-range value. The technique is to return an explicit success-or-failure value and keep syntax failure separate from range failure.

## 01 / State the predicate

Let T be strings and B = {(m, n) ∈ i32 × i32 | m ≤ n}. Define parseBounded: T × B → Result<i32, ParseFailure>, where ParseFailure = {InvalidInteger, OutOfRange}. It returns Ok(v) when base-ten signed integer parsing yields v and m ≤ v ≤ n; otherwise it returns the corresponding error.

Glossary: `Result<T, E>` is an enum containing either `Ok(T)` or `Err(E)`; `i32` is Rust's signed 32-bit integer type; `InvalidInteger` means parsing failed; `OutOfRange` means parsing succeeded but violated local bounds. Assumptions: whitespace is not trimmed, an optional plus or minus sign is accepted, and the bounds themselves fit i32. In prose, parsing preserves the reason a value cannot be used instead of substituting a default. This formulation does not decide how the caller recovers or claim that every parse failure is safe to ignore.

## 02 / Give the agent a bounded task

Provide one text value and an inclusive minimum and maximum. Ask the agent to classify only this parse. The browser module mirrors the article's bounded decimal domain for interactive use; the Rust function uses `str::parse::<i32>()` and returns a typed `Result`.

The browser model is not Rust compiler proof. JavaScript uses safe-number checks and a regular expression, while Rust uses the standard parser and a concrete i32 result type. The fixtures align on the declared inputs, including an explicit `+42` case.

## 03 / Run the independent check

```javascript
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
```

Save the module as `make-parse-failure-explicit-with-rust-result.mjs`, then run:

```bash
node --input-type=module -e 'import {evaluate} from "./make-parse-failure-explicit-with-rust-result.mjs"; console.log(JSON.stringify(evaluate({"text":"42","min":0,"max":100})))'
```

Expected result:

```json
{"pass":true,"summary":"Parsed integer 42.","checks":[{"name":"integer-syntax","pass":true,"detail":"42"},{"name":"range","pass":true,"detail":"0..100"}]}
```

Rust companion:

```rust
#[derive(Debug, PartialEq)]
enum ParseFailure {
    InvalidInteger,
    OutOfRange,
}

fn parse_bounded(text: &str, min: i32, max: i32) -> Result<i32, ParseFailure> {
    let value = text.parse::<i32>().map_err(|_| ParseFailure::InvalidInteger)?;
    if value < min || value > max {
        return Err(ParseFailure::OutOfRange);
    }
    Ok(value)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reports_success_invalid_text_and_range_failure() {
        assert_eq!(parse_bounded("42", 0, 100), Ok(42));
        assert_eq!(parse_bounded("four", 0, 100), Err(ParseFailure::InvalidInteger));
        assert_eq!(parse_bounded("101", 0, 100), Err(ParseFailure::OutOfRange));
    }
}

fn main() {
    println!("{:?}", parse_bounded("42", 0, 100));
    println!("{:?}", parse_bounded("four", 0, 100));
}
```

Compile and run with `rustc make-parse-failure-explicit-with-rust-result.rs -o /tmp/fc030 && /tmp/fc030`; expected lines are `Ok(42)` and `Err(InvalidInteger)`. Compile tests with `rustc --test make-parse-failure-explicit-with-rust-result.rs -o /tmp/fc030-tests && /tmp/fc030-tests`; one test should pass.

## 04 / Try the counterexample

Enter `four`. The syntax check fails and no numeric default appears. Then enter `101` with bounds 0 through 100: syntax passes, range fails, and the result preserves that different reason.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass establishes parsing and range membership for this integer grammar. It does not validate units, business rules, locale conventions, or whether a caller should proceed. `Result` forces the Rust caller to receive one of two variants, but callers can still handle an error poorly. The test evidence applies only to this companion and toolchain.

## Source and formulation note

The `Result` semantics and error-propagation posture follow the official Rust documentation. The `ParseFailure` variants, range rule, browser projection, and fixtures are original teaching material. No production parser or broader Exocore policy is claimed.
