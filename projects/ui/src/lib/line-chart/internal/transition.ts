import type { ChartGeometry, ChartPoint } from './chart-scale';

export const TRANSITION_SAMPLES = 120;
export const TRANSITION_DURATION = 260;

export type Vertex = { x: number; y: number };

export type ShapeTransition = { xs: number[]; from: number[]; to: number[] };

export const easeOutQuint = (t: number): number => 1 - (1 - t) ** 5;

export const durationFrom = (value: string): number => {
  const match = /^\s*([\d.]+)(ms|s)\s*$/.exec(value);
  const duration = match ? Number(match[1]) * (match[2] === 's' ? 1000 : 1) : Number.NaN;

  return Number.isFinite(duration) ? duration : TRANSITION_DURATION;
};

export const sameSeries = (a: readonly ChartPoint[], b: readonly ChartPoint[] | null): boolean =>
  a === b ||
  (b !== null &&
    a.length === b.length &&
    a.every((point, index) => point.t === b[index]!.t && point.v === b[index]!.v));

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

const sampleMonotone = (points: readonly Vertex[], sampleXs: readonly number[]): number[] => {
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

export const polyline = (xs: readonly number[], ys: readonly number[]): string =>
  xs.map((x, index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${ys[index]!.toFixed(2)}`).join(' ');

export const shapeTransition = (from: readonly Vertex[], to: readonly Vertex[]): ShapeTransition => {
  const left = to[0]!.x;
  const right = to.at(-1)!.x;
  const xs = Array.from(
    { length: TRANSITION_SAMPLES },
    (_, index) => left + ((right - left) * index) / (TRANSITION_SAMPLES - 1),
  );

  return { xs, from: sampleMonotone(from, xs), to: sampleMonotone(to, xs) };
};

export const shapeAt = (transition: ShapeTransition, progress: number): number[] =>
  transition.from.map((fromY, index) => fromY + (transition.to[index]! - fromY) * progress);

export const animateShape = (
  from: readonly Vertex[],
  to: readonly Vertex[],
  duration: number,
  draw: (shape: Vertex[], line: string) => void,
  done: () => void,
): (() => void) => {
  const transition = shapeTransition(from, to);
  const start = performance.now();
  let frame = 0;

  const step = (now: number): void => {
    const t = Math.min(1, Math.max(0, (now - start) / duration));

    if (t === 1) {
      done();
      return;
    }

    const ys = shapeAt(transition, easeOutQuint(t));

    draw(
      transition.xs.map((x, index) => ({ x, y: ys[index]! })),
      polyline(transition.xs, ys),
    );
    frame = requestAnimationFrame(step);
  };

  frame = requestAnimationFrame(step);

  return () => cancelAnimationFrame(frame);
};

export type ShapeView = {
  hold: (geometry: ChartGeometry | null) => void;
  draw: (line: string, end: Vertex) => void;
};

export type ShapeMotionOptions = { reduced: boolean; duration: () => number; rangeKey: string | null };

export class ShapeMotion {
  readonly #view: ShapeView;
  #points: readonly ChartPoint[] | null = null;
  #rangeKey: string | null = null;
  #target: ChartGeometry | null = null;
  #held: ChartGeometry | null = null;
  #drawn: readonly Vertex[] | null = null;
  #stop: (() => void) | null = null;

  constructor(view: ShapeView) {
    this.#view = view;
  }

  follow(points: readonly ChartPoint[], geometry: ChartGeometry | null, options: ShapeMotionOptions): void {
    const newSeries = !sameSeries(points, this.#points);
    const newRange = options.rangeKey === null || options.rangeKey !== this.#rangeKey;

    this.#points = points;
    if (newSeries) {
      this.#rangeKey = options.rangeKey;
    }

    if (this.#stop && !newSeries && !options.reduced && geometry?.line === this.#target?.line) {
      this.#target = geometry;
      return;
    }

    const from = this.#drawn;
    const held = this.#held ?? this.#target;

    this.#target = geometry;
    this.stop();

    if (
      !newSeries ||
      !newRange ||
      !geometry ||
      !from ||
      from.length < 2 ||
      geometry.points.length < 2 ||
      options.reduced
    ) {
      this.#settle(geometry);
      return;
    }

    const duration = options.duration();

    if (duration <= 0) {
      this.#settle(geometry);
      return;
    }

    this.#hold(held);
    this.#stop = animateShape(
      from,
      geometry.points,
      duration,
      (shape, line) => this.#draw(shape, line, shape.at(-1)!),
      () => this.#settle(geometry),
    );
  }

  stop(): void {
    this.#stop?.();
    this.#stop = null;
  }

  #hold(geometry: ChartGeometry | null): void {
    this.#held = geometry;
    this.#view.hold(geometry);
  }

  #settle(geometry: ChartGeometry | null): void {
    this.#stop = null;
    this.#hold(null);
    this.#drawn = null;

    if (geometry) {
      this.#draw(geometry.points, geometry.line, geometry.end);
    }
  }

  #draw(shape: readonly Vertex[], line: string, end: Vertex): void {
    this.#drawn = shape;
    this.#view.draw(line, end);
  }
}
