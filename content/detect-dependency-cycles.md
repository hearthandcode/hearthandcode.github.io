A release waits for review, review waits for integration, and integration waits for release. The plan has no first move until the cycle is visible. The technique is to state one small predicate, run it independently, and return the particular failure instead of a flattering substitute.

## 01 / State the predicate

Let G = (V, E) be a directed graph where an edge a -> b means “a depends on b.” Define A(G) when no directed path begins and ends at the same vertex. The domain is an adjacency object mapping each node to an array of dependencies. A cycle is a path a -> ... -> a.

An incomplete graph is different from a cyclic graph. The module checks declared adjacency and known targets before depth-first traversal.

## 02 / Give the agent a bounded task

Represent a bounded plan as an adjacency list before assigning an order. Ask for either an acyclic result or one concrete cycle. This turns “the work is blocked” into a structural question and lets a reviewer find which relation must change before scheduling continues.

Declare every work item and every dependency target before trying to schedule. The checker can then return either a missing target or a concrete closed path, which are different repair queues.

## 03 / Run the independent check

The module uses a depth-first traversal. A visiting set marks the current path and a visited set marks completed nodes. Re-entering a visiting node produces a cycle. The passing fixture has plan -> build and build with no dependency; the counterexample returns a -> b -> a.

Save this complete browser-safe module as `detect-dependency-cycles.mjs` and run it with Node.js 18 or newer.

```javascript
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
```

Invocation: `node --input-type=module -e 'import { evaluate } from "./detect-dependency-cycles.mjs"; console.log(JSON.stringify(evaluate({"graph":{"plan":["build"],"build":[]}})))'`.

Expected result: `{"pass":true,"summary":"Dependency graph is acyclic.","checks":[{"name":"adjacency lists","pass":true},{"name":"known dependencies","pass":true},{"name":"acyclic","pass":true}]}`.

The browser demo and fixture runner import this same function. It accepts JSON, makes no network or storage request, and does not mutate its input.

## 04 / Try the counterexample

It establishes only acyclicity of the supplied graph. It cannot show that edges are real, estimates are sound, work is authorized, or an edge is safe to remove. Referenced nodes require their own adjacency list in this compact input shape.

Fail the fixture with `{"graph":{"a":["b"],"b":["a"]}}`. The acyclic check becomes false and the summary shows `a -> b -> a`; use `{"graph":{"plan":["missing"]}}` to see an unknown dependency instead.

<!--DEMO-->

## 05 / Keep the claim bounded

The graph predicate and presentation are original pedagogical formulation. It has no scheduler, network, or provider effect.

A pass means the provided graph has adjacency arrays, no dangling dependency target, and no directed cycle. It does not prove the plan’s dependencies are correct or authorized.

## Source and formulation note

The public JavaScript collection reference supports implementation vocabulary. This graph diagnostic is original Fieldcraft pedagogy.

All inputs are synthetic. The source relationship is adaptation of public methodology into an original educational checker. Internal lineage is intentionally excluded from this public article.
