Color choices can look balanced on one screen and become difficult to read in a real interface. A visual review is essential, but a small arithmetic check catches an avoidable problem early: the foreground and background may not have enough relative luminance contrast for the declared text threshold.

The technique here follows the WCAG contrast calculation for solid sRGB colors. It converts each channel to linear light, computes relative luminance, then divides the lighter luminance plus 0.05 by the darker luminance plus 0.05. The demo uses 4.5 as a normal-text threshold. That threshold is one accessibility criterion, not a complete accessibility review.

## 01 / State the predicate

For colors `f,b`, let `L(x)` be relative luminance after sRGB channel conversion and `R(f,b)=(max(Lf,Lb)+0.05)/(min(Lf,Lb)+0.05)`. For threshold `q`, the predicate is `V(f,b,q) ≔ validHex(f) ∧ validHex(b) ∧ q>0 ∧ R(f,b)≥q`.

The glossary is `L` for luminance, `R` for contrast ratio, and `q` for the declared threshold. The assumptions are opaque, solid six-digit sRGB colors and text whose applicable threshold has already been chosen. WCAG 2.2 Success Criterion 1.4.3 describes 4.5:1 for ordinary text with exceptions such as large text; the local predicate does not decide those exceptions. In prose: calculate the ratio correctly, then compare it to the threshold for this use.

## 02 / Give the agent a bounded task

Use a synthetic interface brief:

```text
Design a reading-room card with foreground #ffffff and background #000000.
Check the pair against threshold 4.5 before proposing decoration.
Return the two colors, ratio check and any change needed.
```

The agent may propose a palette, but it should not hide the values behind names such as “high contrast.” Exact colors make the check reproducible. If the surface uses gradients, images or transparency, this simple solid-color predicate is not enough; choose a richer check.

## 03 / Run the independent check

Save `check-design-contrast-with-wcag-formula.mjs` and invoke it with `node --input-type=module -e 'import("./check-design-contrast-with-wcag-formula.mjs").then(({evaluate}) => console.log(evaluate({foreground:"#ffffff",background:"#000000",threshold:4.5})))'`. The initial fixture passes; white on black has the maximum 21:1 ratio for this formula.

```javascript
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
```

The complete expected result has `colors-valid`, `threshold-valid` and `contrast-meets-threshold` all true, with the reported ratio rounded to `21`. The boundary fixture sets the threshold to 21 and still passes exactly.

## 04 / Try the counterexample

Use `#777777` on `#ffffff` with threshold 4.5. The colors parse correctly, but the calculated ratio is below 4.5, so the contrast check fails. The correction might be a darker foreground, a lighter background or a different text size and criterion; the arithmetic does not choose the design.

<!--DEMO-->

## 05 / Keep the claim bounded

A pass establishes only the formula for two opaque six-digit sRGB colors and the threshold supplied to the module. It does not establish WCAG conformance for a whole page, suitability for large or bold text, focus visibility, non-text contrast, color-blind accessibility, or readability over imagery. W3C’s Technique G18 gives the formula and procedure; use it as a bounded check and perform the rest of the accessibility review separately.

## Source and formulation note

The conversion and ratio are adapted directly from the public W3C WCAG 2.2 contrast criterion and Technique G18, cited above. The surrounding predicate, fixtures and JavaScript implementation are an original educational rendering for solid sRGB pairs. The examples are synthetic. A passing arithmetic result is evidence for the named pair only, not a quality, compliance or user-outcome claim.
