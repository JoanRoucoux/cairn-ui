import { curveMonotoneX } from 'd3-shape';

import { CURVE, type ChartPoint, buildGeometry } from './chart-scale';

const series: ChartPoint[] = [
  { t: 0, v: 100 },
  { t: 1, v: 120 },
  { t: 2, v: 110 },
  { t: 3, v: 160 },
];

describe('buildGeometry', () => {
  it('should return null for an empty series, so the caller can render an empty state', () => {
    expect(buildGeometry([], 100, 50)).toBeNull();
  });

  it('should produce a path that starts with a move command', () => {
    expect(buildGeometry(series, 100, 50)?.line).toMatch(/^M/);
  });

  it('should place the highest value at the top of the box, inside the padding', () => {
    const geometry = buildGeometry(series, 100, 50, { x: 4, top: 4, bottom: 4 });

    expect(geometry?.end).toEqual({ x: 96, y: 4 });
  });

  it('should keep a flat series on the vertical centre rather than dividing by zero', () => {
    const flat: ChartPoint[] = [
      { t: 0, v: 42 },
      { t: 1, v: 42 },
    ];

    expect(buildGeometry(flat, 100, 50, { x: 4, top: 4, bottom: 4 })?.end.y).toBe(25);
  });

  it('should handle a single point', () => {
    const geometry = buildGeometry([{ t: 0, v: 42 }], 100, 50, { x: 4, top: 4, bottom: 4 });

    expect(geometry?.end).toEqual({ x: 4, y: 25 });
  });

  it('should default to a uniform 4px padding on every side', () => {
    const geometry = buildGeometry(series, 100, 50);

    expect(geometry?.end).toEqual({ x: 96, y: 4 });
  });

  it('should reserve a bottom band and a top margin separately, above/below where the curve is drawn', () => {
    const geometry = buildGeometry(series, 100, 100, { x: 4, top: 10, bottom: 30 });

    expect(geometry?.plotTop).toBe(10);
    expect(geometry?.plotBottom).toBe(70);
    expect(geometry?.end.y).toBe(10);
  });

  it('uses a monotone curve, which never overshoots the data between two points', () => {
    const geometry = buildGeometry(
      [
        { t: 0, v: 0 },
        { t: 1, v: 10 },
        { t: 2, v: 10 },
        { t: 3, v: 0 },
      ],
      300,
      100,
    );

    expect(CURVE).toBe(curveMonotoneX);
    expect(geometry?.line).not.toContain('NaN');
  });

  it('exposes the y of the starting value for the reference line', () => {
    const geometry = buildGeometry(
      [
        { t: 0, v: 100 },
        { t: 1, v: 200 },
      ],
      300,
      100,
      { top: 10, bottom: 20 },
    );

    expect(geometry?.start.y).toBe(80);
  });

  it('draws a flat series in the middle and a single point without NaN', () => {
    const flat = buildGeometry(
      [
        { t: 0, v: 5 },
        { t: 1, v: 5 },
      ],
      300,
      100,
    );
    const single = buildGeometry([{ t: 0, v: 5 }], 300, 100);

    expect(flat?.line).not.toContain('NaN');
    expect(single?.line).not.toContain('NaN');
    expect(flat?.start.y).toBe(50);
  });
});
