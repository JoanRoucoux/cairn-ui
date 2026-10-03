import type { PlottedPoint } from './chart-scale';

export const axisTicks = <T extends PlottedPoint>(points: readonly T[], maxTicks = 5): T[] => {
  if (points.length <= maxTicks) {
    return [...points];
  }

  const count = Math.max(3, Math.min(maxTicks, points.length));
  const step = (points.length - 1) / (count - 1);

  const indexes = new Set<number>();

  for (let tick = 0; tick < count; tick++) {
    indexes.add(Math.round(tick * step));
  }

  return [...indexes].sort((a, b) => a - b).map((index) => points[index] as T);
};

export const isCoreTick = (index: number, count: number): boolean => {
  if (count <= 3) {
    return true;
  }

  const middle = Math.floor((count - 1) / 2);

  return index === 0 || index === count - 1 || index === middle;
};

export type TickLabel = { text: string; classes: string };

const firstOfEachRun = (labels: readonly string[], included: (index: number) => boolean): boolean[] => {
  let previous: string | null = null;

  return labels.map((text, index) => {
    if (!included(index)) {
      return false;
    }

    const distinct = text !== previous;

    previous = text;

    return distinct;
  });
};

export const tickLabels = (
  ticks: readonly { t: number }[],
  format: (time: number) => string,
  mode: 3 | 5 | 'auto',
): (TickLabel | null)[] => {
  const labels = ticks.map((tick) => format(tick.t));
  const count = labels.length;
  const core = (index: number): boolean => isCoreTick(index, count);
  const everyTick = firstOfEachRun(labels, () => true);
  const coreTicks = firstOfEachRun(labels, core);

  return labels.map((text, index) => {
    const wide = mode === 3 ? coreTicks[index]! : everyTick[index]!;
    const narrow = coreTicks[index]!;

    if (!wide && !narrow) {
      return null;
    }

    const classes =
      mode === 'auto' ? `${narrow ? '' : 'max-sm:hidden'} ${wide ? '' : 'sm:hidden'}`.trim() : wide ? '' : 'hidden';

    return { text, classes };
  });
};
