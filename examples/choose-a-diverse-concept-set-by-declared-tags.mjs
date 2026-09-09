export function evaluate(input) {
  const concepts = Array.isArray(input?.concepts) ? input.concepts : [];
  const required = Array.isArray(input?.requiredTags) ? input.requiredTags : [];
  const pick = input?.pick;
  const minDistinct = input?.minimumDistinctTags;
  const ids = concepts.map(concept => concept?.id);
  const uniqueIds = ids.every((id, index) => typeof id === "string" && ids.indexOf(id) === index);
  const tagLists = concepts.every(concept => Array.isArray(concept?.tags) && concept.tags.every(tag => typeof tag === "string"));
  const union = new Set(concepts.flatMap(concept => Array.isArray(concept?.tags) ? concept.tags : []));
  const checks = [
    {name: "requested-count", pass: Number.isSafeInteger(pick) && pick > 0 && concepts.length === pick},
    {name: "unique-concepts", pass: uniqueIds},
    {name: "declared-tags", pass: tagLists},
    {name: "required-coverage", pass: required.every(tag => union.has(tag))},
    {name: "minimum-diversity", pass: Number.isSafeInteger(minDistinct) && union.size >= minDistinct}
  ];
  const pass = checks.every(check => check.pass);
  return {pass, summary: pass ? "The selected set covers the declared tags and diversity floor." : "The selected set misses a declared tag, count, identity, or diversity floor.", checks};
}
