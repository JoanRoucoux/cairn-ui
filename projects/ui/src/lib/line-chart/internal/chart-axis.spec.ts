import { type TickLabel, axisTicks, tickLabels } from './chart-axis';
import type { PlottedPoint } from './chart-scale';

const pointAt = (t: number): PlottedPoint => ({ t, v: t, x: t, y: t });

describe('axisTicks', () => {
  it('should return every point when there are 5 or fewer', () => {
    const points = [0, 1, 2].map(pointAt);

    expect(axisTicks(points)).toEqual(points);
  });

  it('should pick 5 evenly-spaced points, including the first and the last, from a longer series', () => {
    const points = Array.from({ length: 20 }, (_, index) => pointAt(index));

    const ticks = axisTicks(points);

    expect(ticks).toHaveLength(5);
    expect(ticks[0]).toEqual(points[0]);
    expect(ticks.at(-1)).toEqual(points[19]);
  });

  it('should cap the tick count with maxTicks', () => {
    const points = Array.from({ length: 20 }, (_, index) => pointAt(index));

    expect(axisTicks(points, 3)).toHaveLength(3);
  });
});

describe('tickLabels', () => {
  const run = (labels: string[], mode: 3 | 5 | 'auto'): (TickLabel | null)[] =>
    tickLabels(
      labels.map((_, t) => ({ t })),
      (t) => labels[t]!,
      mode,
    );
  const classes = (labels: string[], mode: 3 | 5 | 'auto'): (string | null)[] =>
    run(labels, mode).map((label) => label && label.classes);
  const texts = (labels: string[], mode: 3 | 5 | 'auto'): (string | null)[] =>
    run(labels, mode).map((label) => label && label.text);

  it('drops a label equal to the previous one, on every tick', () => {
    expect(texts(['a', 'a', 'b', 'b', 'c'], 5)).toEqual(['a', null, 'b', null, 'c']);
  });

  it('hides non-core ticks below sm with auto, and nothing else when labels are distinct', () => {
    expect(classes(['a', 'b', 'c', 'd', 'e'], 'auto')).toEqual(['', 'max-sm:hidden', '', 'max-sm:hidden', '']);
  });

  it('lets a core label stay below sm when only a hidden neighbour repeats it', () => {
    expect(classes(['a', 'b', 'b', 'c', 'c'], 'auto')).toEqual([
      '',
      'max-sm:hidden',
      'sm:hidden',
      'max-sm:hidden',
      'sm:hidden',
    ]);
  });

  it('hides a repeated label with axisTicks 5 on every viewport', () => {
    expect(classes(['a', 'b', 'b', 'c', 'c'], 5)).toEqual(['', '', 'hidden', '', 'hidden']);
  });

  it('counts only the core ticks with axisTicks 3', () => {
    expect(classes(['a', 'b', 'b', 'c', 'c'], 3)).toEqual(['', null, '', null, '']);
  });

  it('drops a core tick that repeats the previous core tick with axisTicks 3', () => {
    expect(texts(['a', 'b', 'c', 'c', 'c'], 3)).toEqual(['a', null, 'c', null, null]);
  });
});
