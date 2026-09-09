export function check(text, capacity) {
  if (!Number.isSafeInteger(capacity) || capacity < 0) {
    throw new RangeError("Capacity must be a non-negative safe integer");
  }
  const items = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const withinCapacity = items.length <= capacity;
  const unique = new Set(items).size === items.length;
  return { count: items.length, withinCapacity, unique,
    pass: withinCapacity && unique };
}

console.log(check("Check encoding\nRecord digest", 4));
