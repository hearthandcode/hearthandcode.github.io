A planner hands a task packet to a worker, then continues mutating its old local copy. Now two actors appear to own one unit of work. The technique is to make the Rust handoff consume the packet and return a different completed type, so use-after-transfer becomes a compiler error for that value.

## 01 / State the predicate

Let R be resource records `(id, owner)` and H be transfers `(from, to)`. For a declared subsequent actor a, define V(R, H, a) as `(R.owner = H.from) ∧ (H.from ≠ H.to) ∧ (a = H.to)`.

Glossary: `owner` is the actor responsible for the current value; `move` transfers a non-Copy Rust value; `consume` means a function takes the value by ownership; `receiver` is the owner after handoff; `use-after-move` is an attempted use of the old binding after transfer. Assumptions: the packet does not implement `Copy` or `Clone`, the handoff function accepts it by value, and actor labels are canonical strings in the browser model. In prose, the current owner must be the sender, the receiver must differ, and only the receiver continues. This formulation does not provide distributed locking or prove organizational responsibility.

## 02 / Give the agent a bounded task

Provide one resource, one transfer, and the actor expected to continue. Use the browser checker to make the ownership story visible. Use the Rust companion to test the language property: `handoff(packet)` moves the value, so the old `packet` binding cannot be read afterward.

The browser model is not compiler proof. JavaScript object records can still be copied or aliased by other code. The Rust compile-fail doctest checks an `E0382` use-after-move failure for the small companion, while its unit test checks that data survives the handoff.

## 03 / Run the independent check

```javascript
export function evaluate(input) {
  const valid = input !== null && typeof input === "object" && input.resource && input.transfer &&
    typeof input.resource.id === "string" && typeof input.resource.owner === "string" &&
    typeof input.transfer.from === "string" && typeof input.transfer.to === "string" &&
    typeof input.subsequentActor === "string";
  if (!valid) {
    return { pass: false, summary: "Invalid transfer input.", checks: [
      { name: "input-shape", pass: false, detail: "Expected resource, transfer, and subsequentActor." }
    ] };
  }
  const currentOwnerMatches = input.resource.owner === input.transfer.from;
  const distinctOwners = input.transfer.from !== input.transfer.to && input.transfer.to.length > 0;
  const onlyReceiverContinues = input.subsequentActor === input.transfer.to;
  const pass = currentOwnerMatches && distinctOwners && onlyReceiverContinues;
  return {
    pass,
    summary: pass ? `Ownership of ${input.resource.id} transfers to ${input.transfer.to}.` : "Transfer boundary is inconsistent.",
    checks: [
      { name: "current-owner", pass: currentOwnerMatches, detail: input.resource.owner },
      { name: "distinct-receiver", pass: distinctOwners, detail: input.transfer.to },
      { name: "receiver-continues", pass: onlyReceiverContinues, detail: input.subsequentActor }
    ]
  };
}
```

Save the module as `transfer-rust-ownership-at-task-boundaries.mjs`, then run:

```bash
node --input-type=module -e 'import {evaluate} from "./transfer-rust-ownership-at-task-boundaries.mjs"; console.log(JSON.stringify(evaluate({"resource":{"id":"packet-7","owner":"planner"},"transfer":{"from":"planner","to":"worker"},"subsequentActor":"worker"})))'
```

Expected result:

```json
{"pass":true,"summary":"Ownership of packet-7 transfers to worker.","checks":[{"name":"current-owner","pass":true,"detail":"planner"},{"name":"distinct-receiver","pass":true,"detail":"worker"},{"name":"receiver-continues","pass":true,"detail":"worker"}]}
```

Rust companion:

````rust
/// A moved packet cannot be used again by the sender.
///
/// ```compile_fail,E0382
/// struct TaskPacket { id: String }
/// fn handoff(_packet: TaskPacket) {}
/// let packet = TaskPacket { id: "packet-7".into() };
/// handoff(packet);
/// println!("{}", packet.id);
/// ```
#[allow(dead_code)]
fn moved_packet_is_unavailable() {}

struct TaskPacket {
    id: String,
    payload: String,
}

struct CompletedPacket {
    id: String,
    payload: String,
}

fn handoff(packet: TaskPacket) -> CompletedPacket {
    CompletedPacket { id: packet.id, payload: packet.payload }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn handoff_preserves_packet_data() {
        let packet = TaskPacket { id: "packet-7".into(), payload: "bounded work".into() };
        let completed = handoff(packet);
        assert_eq!(completed.id, "packet-7");
        assert_eq!(completed.payload, "bounded work");
    }
}

fn main() {
    let packet = TaskPacket { id: "packet-7".into(), payload: "bounded work".into() };
    let completed = handoff(packet);
    println!("{}:{}", completed.id, completed.payload);
}
````

Compile and run with `rustc transfer-rust-ownership-at-task-boundaries.rs -o /tmp/fc031 && /tmp/fc031`; expected output is `packet-7:bounded work`. Run `rustdoc --test transfer-rust-ownership-at-task-boundaries.rs`; one compile-fail doctest should pass.

## 04 / Try the counterexample

In the demo, set `subsequentActor` to `planner`; the sender-continuation check fails. In Rust, the embedded negative example reads `packet.id` after `handoff(packet)` and is expected to fail compilation with the moved-value diagnostic.

<!--DEMO-->

## 05 / Keep the claim bounded

Rust ownership constrains values in one compiled program. It does not enforce one writer across services, databases, cloned payloads, or people. A task system still needs durable identity, leases or transitions, receipts, and recovery. The successful compile and compile-fail doctest establish only the stated properties of this small example.

## Source and formulation note

Move semantics follow the official Rust ownership chapter and compiler diagnostic cited above. The task packet types, browser predicate, and handoff story are original Fieldcraft material informed by Exocore's typed-boundary posture. No current Exocore task runtime behavior is claimed.
