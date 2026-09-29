import type { ChartGeometry, PlottedPoint } from './chart-scale';

export const TRANSITION_SAMPLES = 120;
export const TRANSITION_DURATION = 260;

export const easeOutQuint = (t: number): number => 1 - (1 - t) ** 5;

export const prefersReducedMotion = (): boolean =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const monotoneTangents = (xs: readonly number[], ys: readonly number[]): number[] => {
  const n = xs.length;
  const slopes: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    const dx = xs[i + 1]! - xs[i]!;

    slopes.push(dx === 0 ? 0 : (ys[i + 1]! - ys[i]!) / dx);
  }

  const tangents = new Array<number>(n).fill(0);
  tangents[0] = slopes[0]!;
  tangents[n - 1] = slopes[n - 2]!;

  for (let i = 1; i < n - 1; i++) {
    const a = slopes[i - 1]!;
    const b = slopes[i]!;

    tangents[i] = a * b <= 0 ? 0 : (a + b) / 2;
  }

  for (let i = 0; i < n - 1; i++) {
    const slope = slopes[i]!;

    if (slope === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }

    const a = tangents[i]! / slope;
    const b = tangents[i + 1]! / slope;
    const s = a * a + b * b;

    if (s > 9) {
      const t = 3 / Math.sqrt(s);

      tangents[i] = t * a * slope;
      tangents[i + 1] = t * b * slope;
    }
  }

  return tangents;
};

const sampleMonotone = (points: readonly PlottedPoint[], sampleXs: readonly number[]): number[] => {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const tangents = monotoneTangents(xs, ys);

  let segment = 0;

  return sampleXs.map((x) => {
    while (segment < xs.length - 2 && x > xs[segment + 1]!) {
      segment++;
    }

    const x0 = xs[segment]!;
    const x1 = xs[segment + 1]!;
    const dx = x1 - x0;
    const f = dx === 0 ? 0 : (x - x0) / dx;
    const f2 = f * f;
    const f3 = f2 * f;
    const y0 = ys[segment]!;
    const y1 = ys[segment + 1]!;
    const m0 = tangents[segment]!;
    const m1 = tangents[segment + 1]!;

    return (2 * f3 - 3 * f2 + 1) * y0 + (f3 - 2 * f2 + f) * m0 * dx + (-2 * f3 + 3 * f2) * y1 + (f3 - f2) * m1 * dx;
  });
};

const buildPolyline = (xs: readonly number[], ys: readonly number[]): string =>
  xs.map((x, index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${ys[index]!.toFixed(2)}`).join(' ');

export const interpolateLine = (from: ChartGeometry, to: ChartGeometry, progress: number): string => {
  const left = to.points[0]!.x;
  const right = to.points.at(-1)!.x;
  const samples = Array.from(
    { length: TRANSITION_SAMPLES },
    (_, index) => left + ((right - left) * index) / (TRANSITION_SAMPLES - 1),
  );
  const fromYs = sampleMonotone(from.points, samples);
  const toYs = sampleMonotone(to.points, samples);

  return buildPolyline(
    samples,
    fromYs.map((fromY, index) => fromY + (toYs[index]! - fromY) * progress),
  );
};
