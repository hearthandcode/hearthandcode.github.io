export function evaluate(input) {
  if (!input || typeof input.source !== "string" || !Array.isArray(input.spans)) return { pass: false, summary: "Input needs a source string and spans array.", checks: [{ name: "input shape", pass: false }] };
  const checks = input.spans.map((span, index) => { const valid = span && Number.isSafeInteger(span.start) && Number.isSafeInteger(span.end) && span.start >= 0 && span.end >= span.start && span.end <= input.source.length && typeof span.text === "string"; return { name: span && span.id || `span ${index + 1}`, pass: Boolean(valid && input.source.slice(span.start, span.end) === span.text) }; });
  const failed = checks.filter(check => !check.pass).length;
  return { pass: failed === 0, summary: failed === 0 ? "Every UTF-16 offset reproduces its recorded span." : `${failed} span offset(s) do not reproduce recorded text.`, checks };
}
