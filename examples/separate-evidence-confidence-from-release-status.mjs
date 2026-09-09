export function evaluate(input) {
  if (!input || !input.evidence || !input.release || !Number.isFinite(input.evidence.confidence) || typeof input.release.status !== "string") return { pass: false, summary: "Input needs evidence confidence and release status.", checks: [{ name: "input shape", pass: false }] };
  const confidenceValid = input.evidence.confidence >= 0 && input.evidence.confidence <= 1;
  const releaseValid = ["draft", "reviewed", "released"].includes(input.release.status);
  const noDeclaredDerivation = !Object.hasOwn(input.release, "derivedFromConfidence");
  return { pass: confidenceValid && releaseValid && noDeclaredDerivation, summary: confidenceValid && releaseValid && noDeclaredDerivation ? `Confidence ${input.evidence.confidence} and ${input.release.status} are separate fields; this does not prove independence.` : "Confidence and release status need valid separate fields.", checks: [{ name: "confidence range", pass: confidenceValid }, { name: "release status", pass: releaseValid }, { name: "no declared derivation", pass: noDeclaredDerivation }] };
}
