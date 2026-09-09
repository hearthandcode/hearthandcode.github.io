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
