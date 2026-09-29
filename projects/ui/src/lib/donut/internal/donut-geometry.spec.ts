import { positionSlices } from './donut-geometry';
import { rankSlices } from './donut-slices';

describe('positionSlices', () => {
  it('produces one path per ranked slice, each starting with a move command', () => {
    const ranked = rankSlices(
      [
        { id: 'a', label: 'A', value: 60 },
        { id: 'b', label: 'B', value: 40 },
      ],
      'Others',
    );

    const positioned = positionSlices(ranked);

    expect(positioned).toHaveLength(2);
    expect(positioned.every((slice) => slice.path.startsWith('M'))).toBe(true);
  });

  it('returns an empty array for an empty input', () => {
    expect(positionSlices([])).toEqual([]);
  });

  it('keeps the ranked slice data alongside its path', () => {
    const ranked = rankSlices([{ id: 'only', label: 'Only', value: 10 }], 'Others');

    const [slice] = positionSlices(ranked);

    expect(slice?.id).toBe('only');
    expect(slice?.ramp).toBe(1);
    expect(slice?.share).toBe(1);
  });
});
