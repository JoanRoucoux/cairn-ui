import { navigateIndex, nearestPointIndex } from './chart-interaction';
import type { PlottedPoint } from './chart-scale';

const points: PlottedPoint[] = [
  { t: 0, v: 0, x: 0, y: 0 },
  { t: 1, v: 0, x: 10, y: 0 },
  { t: 2, v: 0, x: 20, y: 0 },
];

describe('nearestPointIndex', () => {
  it('picks the closest point to the given x', () => {
    expect(nearestPointIndex(points, 4)).toBe(0);
    expect(nearestPointIndex(points, 6)).toBe(1);
    expect(nearestPointIndex(points, 19)).toBe(2);
  });
});

describe('navigateIndex', () => {
  it('moves right from the current index, clamped to the last point', () => {
    expect(navigateIndex('ArrowRight', 0, 2)).toEqual({ index: 1, preventDefault: true });
    expect(navigateIndex('ArrowRight', 2, 2)).toEqual({ index: 2, preventDefault: true });
  });

  it('starts ArrowRight from the first point when nothing is active', () => {
    expect(navigateIndex('ArrowRight', null, 2)).toEqual({ index: 0, preventDefault: true });
  });

  it('moves left from the current index, clamped to the first point', () => {
    expect(navigateIndex('ArrowLeft', 2, 2)).toEqual({ index: 1, preventDefault: true });
    expect(navigateIndex('ArrowLeft', 0, 2)).toEqual({ index: 0, preventDefault: true });
  });

  it('starts ArrowLeft from the last point when nothing is active', () => {
    expect(navigateIndex('ArrowLeft', null, 2)).toEqual({ index: 2, preventDefault: true });
  });

  it('jumps to the first point on Home and the last on End', () => {
    expect(navigateIndex('Home', 1, 2)).toEqual({ index: 0, preventDefault: true });
    expect(navigateIndex('End', 1, 2)).toEqual({ index: 2, preventDefault: true });
  });

  it('clears the index on Escape without asking to prevent the default', () => {
    expect(navigateIndex('Escape', 1, 2)).toEqual({ index: null, preventDefault: false });
  });

  it('returns null for a key it does not handle', () => {
    expect(navigateIndex('Tab', 1, 2)).toBeNull();
  });
});
