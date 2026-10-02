import { type ChartPoint, buildGeometry } from './chart-scale';
import { durationFrom, easeOutQuint, polyline, shapeAt, shapeTransition } from './transition';

const shapeOf = (points: ChartPoint[]): NonNullable<ReturnType<typeof buildGeometry>>['points'] =>
  buildGeometry(points, 300, 100)!.points;

describe('easeOutQuint', () => {
  it('starts at 0 and ends at 1', () => {
    expect(easeOutQuint(0)).toBe(0);
    expect(easeOutQuint(1)).toBe(1);
  });

  it('overshoots the linear midpoint, since it eases out', () => {
    expect(easeOutQuint(0.5)).toBeGreaterThan(0.5);
  });
});

describe('durationFrom', () => {
  it('reads a token in milliseconds or in seconds', () => {
    expect(durationFrom('260ms')).toBe(260);
    expect(durationFrom(' 0.4s')).toBe(400);
  });

  it('falls back to 260 ms for an empty, unreadable or zero token', () => {
    expect(durationFrom('')).toBe(260);
    expect(durationFrom('fast')).toBe(260);
    expect(durationFrom('0ms')).toBe(260);
  });
});

describe('polyline', () => {
  it('moves to the first vertex and draws a line to each next one', () => {
    expect(polyline([0, 1.5], [2, 3.25])).toBe('M0.00,2.00 L1.50,3.25');
  });
});

describe('shapeTransition', () => {
  const from = shapeOf([
    { t: 0, v: 100 },
    { t: 1, v: 200 },
  ]);
  const to = shapeOf([
    { t: 0, v: 100 },
    { t: 1, v: 150 },
    { t: 2, v: 400 },
  ]);

  it('resamples both shapes on 120 x positions across the target range', () => {
    const transition = shapeTransition(from, to);

    expect(transition.xs).toHaveLength(120);
    expect(transition.xs[0]).toBe(to[0]!.x);
    expect(transition.xs.at(-1)).toBe(to.at(-1)!.x);
    expect(transition.from).toHaveLength(120);
    expect(transition.to).toHaveLength(120);
  });

  it('starts exactly on the previous shape and settles exactly on the target', () => {
    const transition = shapeTransition(from, to);

    expect(shapeAt(transition, 0)[0]).toBeCloseTo(from[0]!.y, 6);
    expect(shapeAt(transition, 1).at(-1)).toBeCloseTo(to.at(-1)!.y, 6);
  });

  it('keeps a shape that is already resampled unchanged, so a restart starts from what is drawn', () => {
    const drawn = shapeTransition(from, to);
    const ys = shapeAt(drawn, 0.4);
    const restart = shapeTransition(
      drawn.xs.map((x, index) => ({ x, y: ys[index]! })),
      to,
    );

    restart.from.forEach((y, index) => expect(y).toBeCloseTo(ys[index]!, 6));
  });

  it('never produces NaN across a segment with a repeated timestamp', () => {
    const withDuplicate = shapeOf([
      { t: 0, v: 10 },
      { t: 0, v: 10 },
      { t: 5, v: 50 },
    ]);

    expect(shapeAt(shapeTransition(from, withDuplicate), 0.5).some(Number.isNaN)).toBe(false);
  });

  it('clamps the tangent for a sharply uneven step without producing NaN', () => {
    const unevenSteps = shapeOf([
      { t: 0, v: 0 },
      { t: 1, v: 1 },
      { t: 2, v: 1.01 },
      { t: 3, v: 100 },
    ]);

    expect(shapeAt(shapeTransition(from, unevenSteps), 0.5).some(Number.isNaN)).toBe(false);
  });

  it('never produces NaN for a series with a direction reversal', () => {
    const reversal = shapeOf([
      { t: 0, v: 10 },
      { t: 1, v: 200 },
      { t: 2, v: 5 },
    ]);

    expect(shapeAt(shapeTransition(from, reversal), 0.5).some(Number.isNaN)).toBe(false);
  });
});
