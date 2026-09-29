import { type ChartPoint, buildGeometry } from './chart-scale';
import { easeOutQuint, interpolateLine, prefersReducedMotion } from './transition';

const geometryOf = (points: ChartPoint[]): NonNullable<ReturnType<typeof buildGeometry>> =>
  buildGeometry(points, 300, 100)!;

describe('easeOutQuint', () => {
  it('starts at 0 and ends at 1', () => {
    expect(easeOutQuint(0)).toBe(0);
    expect(easeOutQuint(1)).toBe(1);
  });

  it('overshoots the linear midpoint, since it eases out', () => {
    expect(easeOutQuint(0.5)).toBeGreaterThan(0.5);
  });
});

describe('prefersReducedMotion', () => {
  let original: typeof matchMedia | undefined;

  beforeEach(() => {
    original = globalThis.matchMedia;
  });

  afterEach(() => {
    if (original) {
      globalThis.matchMedia = original;
    } else {
      Reflect.deleteProperty(globalThis, 'matchMedia');
    }
  });

  it('is false when matchMedia is unavailable', () => {
    Reflect.deleteProperty(globalThis, 'matchMedia');

    expect(prefersReducedMotion()).toBe(false);
  });

  it('reflects the media query when matchMedia is available', () => {
    globalThis.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof matchMedia;
    expect(prefersReducedMotion()).toBe(true);

    globalThis.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof matchMedia;
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe('interpolateLine', () => {
  const from = geometryOf([
    { t: 0, v: 100 },
    { t: 1, v: 200 },
  ]);
  const to = geometryOf([
    { t: 0, v: 100 },
    { t: 1, v: 150 },
    { t: 2, v: 400 },
  ]);

  it('draws a path starting with a move command and 120 points', () => {
    const line = interpolateLine(from, to, 0);

    expect(line).toMatch(/^M/);
    expect(line.split(' ')).toHaveLength(120);
  });

  it('settles exactly on the target geometry at progress 1', () => {
    const line = interpolateLine(from, to, 1);
    const last = line.split(' ').at(-1)!;
    const [, y] = last.slice(1).split(',').map(Number);

    expect(y).toBeCloseTo(to.end.y, 1);
  });

  it('starts exactly on the previous geometry at progress 0, resampled onto the target x range', () => {
    const line = interpolateLine(from, to, 0);
    const first = line.slice(1).split(' ')[0]!;
    const [, y] = first.split(',').map(Number);

    expect(y).toBeCloseTo(from.points[0]!.y, 1);
  });

  it('never produces NaN across a segment with a repeated timestamp', () => {
    const withDuplicate = geometryOf([
      { t: 0, v: 10 },
      { t: 0, v: 10 },
      { t: 5, v: 50 },
    ]);

    expect(interpolateLine(from, withDuplicate, 0.5)).not.toContain('NaN');
  });

  it('clamps the tangent for a sharply uneven step without producing NaN', () => {
    const unevenSteps = geometryOf([
      { t: 0, v: 0 },
      { t: 1, v: 1 },
      { t: 2, v: 1.01 },
      { t: 3, v: 100 },
    ]);

    expect(interpolateLine(from, unevenSteps, 0.5)).not.toContain('NaN');
  });

  it('never produces NaN for a series with a direction reversal', () => {
    const reversal = geometryOf([
      { t: 0, v: 10 },
      { t: 1, v: 200 },
      { t: 2, v: 5 },
    ]);

    expect(interpolateLine(from, reversal, 0.5)).not.toContain('NaN');
  });
});
