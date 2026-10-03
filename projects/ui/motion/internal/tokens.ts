export function readDuration(element: Element, name: string, fallback: number): number {
  const raw = getComputedStyle(element).getPropertyValue(name).trim();
  const value = parseFloat(raw);
  if (Number.isNaN(value)) {
    return fallback;
  }
  return raw.endsWith('ms') ? value : value * 1000;
}

export function readEasing(element: Element, name: string, fallback: string): string {
  return getComputedStyle(element).getPropertyValue(name).trim() || fallback;
}
