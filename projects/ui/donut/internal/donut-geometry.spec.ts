import { CIRCUMFERENCE, positionSlices } from './donut-geometry';
import { rankSlices } from './donut-slices';

describe('positionSlices', () => {
  it('lays each slice on the same circle, a 2 unit gap shorter than its share, starting where the previous one ends', () => {
    const ranked = rankSlices(
      [
        { id: 'a', label: 'A', value: 60 },
        { id: 'b', label: 'B', value: 40 },
      ],
      'Others',
    );

    const [first, second] = positionSlices(ranked);

    expect(first?.dash).toBe(
      `${(0.6 * CIRCUMFERENCE - 2).toFixed(2)} ${(CIRCUMFERENCE - (0.6 * CIRCUMFERENCE - 2)).toFixed(2)}`,
    );
    expect(first?.offset).toBe('0.00');
    expect(second?.dash).toBe(
      `${(0.4 * CIRCUMFERENCE - 2).toFixed(2)} ${(CIRCUMFERENCE - (0.4 * CIRCUMFERENCE - 2)).toFixed(2)}`,
    );
    expect(second?.offset).toBe((-0.6 * CIRCUMFERENCE).toFixed(2));
  });

  it('never draws a negative arc for a vanishing slice', () => {
    const ranked = rankSlices(
      [
        { id: 'a', label: 'A', value: 100000 },
        { id: 'b', label: 'B', value: 1 },
      ],
      'Others',
    );

    const [, tiny] = positionSlices(ranked);

    expect(tiny?.dash.startsWith('0.00 ')).toBe(true);
  });

  it('returns an empty array for an empty input', () => {
    expect(positionSlices([])).toEqual([]);
  });

  it('keeps the ranked slice data alongside its geometry', () => {
    const ranked = rankSlices([{ id: 'only', label: 'Only', value: 10 }], 'Others');

    const [slice] = positionSlices(ranked);

    expect(slice?.id).toBe('only');
    expect(slice?.ramp).toBe(1);
    expect(slice?.share).toBe(1);
  });
});
