import type { PlottedPoint } from './chart-scale';
import { placeStartLabel } from './start-label';

const box = { width: 400, height: 200 };
const label = { width: 130, height: 14 };
const flatAt = (y: number): PlottedPoint[] => Array.from({ length: 41 }, (_, i) => ({ t: i, v: 0, x: i * 10, y }));

describe('placeStartLabel', () => {
  it('sits above the dashed line at the right end when that space is free', () => {
    const placed = placeStartLabel(flatAt(180), 100, box, label);

    expect(placed).toEqual({ x: 400, y: 100 - 6, anchor: 'end' });
  });

  it('moves below the line when the curve runs just above it on the right', () => {
    const points = flatAt(180).map((p) => (p.x >= 270 ? { ...p, y: 92 } : p));

    expect(placeStartLabel(points, 100, box, label)).toMatchObject({ anchor: 'end' });
    expect(placeStartLabel(points, 100, box, label).y).toBeGreaterThan(100);
  });

  it('falls back to the least crowded slot and never returns a slot outside the box', () => {
    const zigzag = Array.from({ length: 41 }, (_, i) => ({ t: i, v: 0, x: i * 10, y: i % 2 ? 5 : 195 }));
    const placed = placeStartLabel(zigzag, 100, box, label);

    expect(placed.y).toBeGreaterThanOrEqual(label.height);
    expect(placed.y).toBeLessThanOrEqual(box.height);
  });

  it('moves to the left end when the curve crowds both slots at the right end', () => {
    const points = flatAt(180).map((p) => (p.x >= 270 ? { ...p, y: 100 } : p));

    expect(placeStartLabel(points, 100, box, label)).toEqual({ x: 0, y: 94, anchor: 'start' });
  });

  it('moves below the left end when the curve also crowds the left end above the line', () => {
    const points = flatAt(180).map((p) => {
      if (p.x >= 270) {
        return { ...p, y: 100 };
      }
      if (p.x <= 130) {
        return { ...p, y: 90 };
      }
      return p;
    });

    expect(placeStartLabel(points, 100, box, label)).toEqual({ x: 0, y: 120, anchor: 'start' });
  });

  it('falls back to the top-right corner when the four line-adjacent slots are all crowded', () => {
    const alternating = Array.from({ length: 41 }, (_, i) => ({ t: i, v: 0, x: i * 10, y: i % 2 ? 95 : 105 }));

    expect(placeStartLabel(alternating, 100, box, label)).toEqual({ x: 400, y: label.height, anchor: 'end' });
  });

  it('drops an above-the-line slot that would fall outside the box for a start line near the top edge', () => {
    const placed = placeStartLabel(flatAt(180), 2, box, label);

    expect(placed).toEqual({ x: 400, y: 22, anchor: 'end' });
  });

  it('drops a below-the-line slot that would fall outside the box for a start line near the bottom edge', () => {
    const placed = placeStartLabel(flatAt(180), 198, box, label);

    expect(placed).toEqual({ x: 400, y: label.height, anchor: 'end' });
  });
});

describe('placeStartLabel in a box with no room yet', () => {
  it('falls back to the top-right corner instead of throwing', () => {
    expect(placeStartLabel([], 0, { width: 300, height: 0 }, { width: 130, height: 17 })).toEqual({
      anchor: 'end',
      x: 300,
      y: 17,
    });
  });
});
