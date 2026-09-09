export function evaluate(input) {
  if (!input || !input.graph || typeof input.graph !== "object" || Array.isArray(input.graph)) return { pass: false, summary: "Input needs a graph object.", checks: [{ name: "input shape", pass: false }] };
  const graph = input.graph, nodes = Object.keys(input.graph);
  if (!nodes.every(node => Array.isArray(graph[node]))) return { pass: false, summary: "Every graph node needs an adjacency array.", checks: [{ name: "adjacency lists", pass: false }] };
  const dangling = nodes.flatMap(node => graph[node].filter(next => !Object.hasOwn(graph, next)).map(next => `${node} -> ${next}`));
  if (dangling.length) return { pass: false, summary: `Unknown dependency: ${dangling.join(", ")}.`, checks: [{ name: "adjacency lists", pass: true }, { name: "known dependencies", pass: false }] };
  const visiting = new Set(), visited = new Set(), trail = [];
  let cycle = null;
  function visit(node) {
    if (visiting.has(node)) { cycle = [...trail.slice(trail.indexOf(node)), node]; return; }
    if (visited.has(node) || cycle) return;
    visiting.add(node); trail.push(node);
    for (const next of graph[node]) visit(next);
    trail.pop(); visiting.delete(node); visited.add(node);
  }
  for (const node of Object.keys(graph)) visit(node);
  return { pass: !cycle, summary: cycle ? `Dependency cycle: ${cycle.join(" -> ")}.` : "Dependency graph is acyclic.", checks: [{ name: "adjacency lists", pass: true }, { name: "known dependencies", pass: true }, { name: "acyclic", pass: !cycle }] };
}
