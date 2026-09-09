Delegation often preserves the noun and loses the conditions. “Summarize this” reaches the next worker while “three bullets, plain language, keep the caveat” disappears. The receiver can then complete a different task perfectly. A handoff should carry the constraints that define success, not merely a shorter version of the request.

The technique is to separate requirements that must survive from preferences that should survive, then compare the incoming handoff with the original lists. This is a transport check, not a judgement about whether the constraints themselves are wise. If a requirement needs to change, record that as a new decision rather than silently dropping it.

## 01 / State the predicate

Let `M₀,M₁` be ordered lists of required constraints before and after handoff, `S₀,S₁` optional lists, and `t₁` the receiving task label. Define `V ≔ M₁=M₀ ∧ S₀⊆S₁ ∧ nonempty(t₁)`. Equality on `M` is positional; `⊆` means every original optional item remains somewhere in the receiving list.

The typed domains are `M,S : string[]` and `t : string`. The assumptions are that exact strings are the appropriate identity for this synthetic brief and that adding optional notes is allowed. In prose: all must-have constraints stay in the same order, every should-have constraint remains, and the receiver still has a task to perform.

## 02 / Give the agent a bounded task

A bounded handoff can be written like this:

```text
Original task: summarize the note.
Must: three bullets; plain language.
Should: keep caveat.
Handoff: preserve these fields exactly and add the receiving task label.
```

The receiver may add context, but it cannot replace a must-have constraint with a vague synonym and call the work equivalent. If the human owner changes the brief, update the original record first so the comparison has a current source.

## 03 / Run the independent check

Save `preserve-task-constraints-during-handoff.mjs` and invoke it with `node --input-type=module -e 'import("./preserve-task-constraints-during-handoff.mjs").then(({evaluate}) => console.log(evaluate({original:{task:"summarize",must:["three bullets","plain language"],should:["keep caveat"]},handoff:{task:"summarize",must:["three bullets","plain language"],should:["keep caveat"]}})))'`.

```javascript
export function evaluate(input) {
  const original = input?.original;
  const handoff = input?.handoff;
  const sameList = (left, right) => Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((item, index) => item === right[index]);
  const checks = [];
  checks.push({name: "must-preserved", pass: sameList(original?.must, handoff?.must)});
  const optional = Array.isArray(original?.should) && Array.isArray(handoff?.should);
  checks.push({name: "optional-preserved", pass: optional && original.should.every(item => handoff.should.includes(item))});
  checks.push({name: "handoff-has-task", pass: typeof handoff?.task === "string" && handoff.task.length > 0});
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The handoff carries the task constraints needed for review." : "The handoff dropped or changed a declared task constraint.", checks};
}
```

The initial fixture passes all three checks. The exact expected result is the complete returned object with `must-preserved`, `optional-preserved`, and `handoff-has-task` all true.

## 04 / Try the counterexample

Delete `plain language` from the receiving `must` list. The optional note still survives and the task label still exists, but `must-preserved` fails. This is the useful shape of a failure: it points to the boundary that changed instead of declaring the entire handoff mysterious.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass establishes list preservation for the supplied synthetic strings. It does not establish that a receiver interpreted a phrase correctly, that a constraint is complete, or that the original task was authorized. Exact matching can be too strict for a real system; if normalization or aliases are needed, specify them and test them separately. Do not hide a human change inside normalization.

## Source and formulation note

This is an original handoff predicate informed by the public risk-management idea that roles, context and constraints should remain reviewable. NIST’s AI Risk Management Framework is a contextual public source, not a source for this exact list comparison. All examples are synthetic, and the module performs no routing or external action.
