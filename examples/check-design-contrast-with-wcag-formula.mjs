function parseHex(value) {
  if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value)) return null;
  return [0, 2, 4].map(index => parseInt(value.slice(index + 1, index + 3), 16) / 255);
}

function luminance(rgb) {
  const linear = rgb.map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function evaluate(input) {
  const foreground = parseHex(input?.foreground);
  const background = parseHex(input?.background);
  const threshold = input?.threshold ?? 4.5;
  const checks = [];
  checks.push({name: "colors-valid", pass: foreground !== null && background !== null});
  const ratio = foreground && background ? (Math.max(luminance(foreground), luminance(background)) + 0.05) / (Math.min(luminance(foreground), luminance(background)) + 0.05) : NaN;
  checks.push({name: "threshold-valid", pass: Number.isFinite(threshold) && threshold > 0});
  checks.push({name: "contrast-meets-threshold", pass: Number.isFinite(ratio) && Number.isFinite(threshold) && ratio >= threshold, ratio: Number.isFinite(ratio) ? Number(ratio.toFixed(3)) : null});
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The color pair meets the declared contrast threshold." : "The color pair fails the declared contrast threshold or input format.", checks};
}
