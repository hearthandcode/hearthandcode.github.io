A release function accepts any article record, including a draft whose review gate never ran. A string-valued state check can catch that at runtime, but callers can forget to invoke it. The technique is to represent `Article<Draft>` and `Article<Reviewed>` as different Rust types, then implement the release-candidate method only for the reviewed type.

## 01 / State the predicate

Let S = {Draft, Reviewed} be marker types and O the operation set. Define availability A: S → ℘(O) with A(Draft) = {review} and A(Reviewed) = {release-candidate}. Admission V(s, o) is true exactly when o ∈ A(s).

Glossary: `typestate` represents lifecycle state in a type parameter; `marker` carries compile-time distinction; `PhantomData<State>` associates the marker with a value without storing a State payload; `availability` is the method set exposed for a concrete type. Assumptions: constructors are controlled and transitions consume the prior value. In prose, code holding a draft cannot call a method that exists only on reviewed articles. This formulation does not prove that review was performed well, or even by a human. The `review(self)` constructor is a typed transition mechanism; authorization and review evidence must be checked before calling it.

## 02 / Give the agent a bounded task

Ask the agent to model only two states and one directional transition. Keep publication outside the example: `release_candidate` returns a string and causes no effect. The browser evaluator demonstrates the state table interactively; the Rust companion demonstrates a different claim through compilation.

The browser model is not compiler proof. It checks runtime strings. The Rust proof is narrower and stronger: the draft type has no `release_candidate` method, and the compile-fail doctest confirms that call is rejected.

## 03 / Run the independent check

```javascript
export function evaluate(input) {
  const allowed = { draft: ["review"], reviewed: ["release-candidate"] };
  const valid = input !== null && typeof input === "object" &&
    typeof input.state === "string" && typeof input.operation === "string";
  if (!valid) {
    return { pass: false, summary: "Invalid state input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected state and operation." }
    ] };
  }
  const stateKnown = Object.hasOwn(allowed, input.state);
  const operationAllowed = stateKnown && allowed[input.state].includes(input.operation);
  return {
    pass: operationAllowed,
    summary: operationAllowed ? `${input.operation} is available for ${input.state}.` : "Operation unavailable in this state.",
    checks: [
      { name: "state-known", pass: stateKnown, detail: input.state },
      { name: "operation-available", pass: operationAllowed, detail: input.operation }
    ]
  };
}
```

Save the module as `encode-review-state-with-rust-typestate.mjs`, then run:

```bash
node --input-type=module -e 'import {evaluate} from "./encode-review-state-with-rust-typestate.mjs"; console.log(JSON.stringify(evaluate({"state":"reviewed","operation":"release-candidate"})))'
```

Expected result:

```json
{"pass":true,"summary":"release-candidate is available for reviewed.","checks":[{"name":"state-known","pass":true,"detail":"reviewed"},{"name":"operation-available","pass":true,"detail":"release-candidate"}]}
```

Rust companion:

````rust
use std::marker::PhantomData;

/// A draft has no `release_candidate` method.
///
/// ```compile_fail,E0599
/// use std::marker::PhantomData;
/// struct Draft;
/// struct Reviewed;
/// struct Article<State> { _state: PhantomData<State> }
/// impl Article<Reviewed> { fn release_candidate(&self) {} }
/// let draft = Article::<Draft> { _state: PhantomData };
/// draft.release_candidate();
/// ```
#[allow(dead_code)]
fn draft_release_is_unavailable() {}

struct Draft;
struct Reviewed;

struct Article<State> {
    title: String,
    _state: PhantomData<State>,
}

impl Article<Draft> {
    fn new(title: &str) -> Self {
        Self { title: title.into(), _state: PhantomData }
    }

    fn review(self) -> Article<Reviewed> {
        Article { title: self.title, _state: PhantomData }
    }
}

impl Article<Reviewed> {
    fn release_candidate(&self) -> String {
        format!("candidate:{}", self.title)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reviewed_article_exposes_release_candidate() {
        let reviewed = Article::<Draft>::new("Guarded states").review();
        assert_eq!(reviewed.release_candidate(), "candidate:Guarded states");
    }
}

fn main() {
    let draft = Article::<Draft>::new("Guarded states");
    let reviewed = draft.review();
    println!("{}", reviewed.release_candidate());
}
````

Compile and run with `rustc encode-review-state-with-rust-typestate.rs -o /tmp/fc029 && /tmp/fc029`; expected output is `candidate:Guarded states`. Run `rustdoc --test encode-review-state-with-rust-typestate.rs`; the expected result is one passing compile-fail doctest.

## 04 / Try the counterexample

In the demo, request `release-candidate` from `draft`; it fails. In Rust, the matching draft call is embedded as an `E0599` compile-fail doctest. The compiler rejects the missing method rather than returning a runtime boolean.

<!--DEMO-->

## 05 / Keep the claim bounded

Typestate controls which methods type-check; it does not authenticate reviewers, store receipts, prevent alternate constructors elsewhere, or publish anything. Marker types improve an API only when module visibility protects invalid construction. The successful compilation verifies this companion under the tested toolchain; it does not verify a broader application or establish human review.

## Source and formulation note

The Rust marker and typestate approach follows the official Rust documentation cited above. The two-state article API and browser table are original Fieldcraft examples informed by the ESS artifact-state distinction. Browser evaluation and Rust compilation support separate claims and must not be conflated.
