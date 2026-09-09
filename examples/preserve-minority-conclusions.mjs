export function evaluate(input) {
  if (!input || !Array.isArray(input.conclusions) || !Array.isArray(input.synthesis)) return { pass: false, summary: "Input needs conclusions and synthesis arrays.", checks: [{ name: "input shape", pass: false }] };
  const validConclusions = input.conclusions.every(item => item && typeof item.text === "string" && item.text.trim() && ["majority", "minority"].includes(item.position));
  const validSynthesis = input.synthesis.every(value => typeof value === "string" && value.trim());
  if (!validConclusions || !validSynthesis) return { pass: false, summary: "Conclusions need nonempty text and a known position; synthesis needs nonempty text.", checks: [{ name: "conclusion shape", pass: false }] };
  const distinct = [...new Set(input.conclusions.map(item => item.text))];
  const synthesized = new Set(input.synthesis.filter(value => typeof value === "string"));
  const absent = distinct.filter(value => !synthesized.has(value));
  const minority = input.conclusions.filter(item => item.position === "minority").map(item => item.text);
  const minorityKept = minority.every(value => synthesized.has(value));
  return { pass: absent.length === 0 && minorityKept, summary: absent.length ? `Synthesis omits: ${absent.join(", ")}.` : minorityKept ? "Synthesis retains every conclusion, including minority conclusions." : "Minority conclusions are not retained.", checks: [{ name: "all conclusions retained", pass: absent.length === 0 }, { name: "minority conclusions retained", pass: minorityKept }] };
}
