import { type DonutSlice, rankSlices, shareSlices } from './donut-slices';

const sixSlices: DonutSlice[] = [
  { id: 'a', label: 'A', value: 60 },
  { id: 'b', label: 'B', value: 50 },
  { id: 'c', label: 'C', value: 40 },
  { id: 'd', label: 'D', value: 30 },
  { id: 'e', label: 'E', value: 20 },
  { id: 'f', label: 'F', value: 10 },
];

const sevenSlices: DonutSlice[] = [...sixSlices, { id: 'g', label: 'G', value: 5 }];

describe('rankSlices', () => {
  it('keeps six ranks with no Others slice for exactly six slices', () => {
    const ranked = rankSlices(sixSlices, 'Others');

    expect(ranked).toHaveLength(6);
    expect(ranked.map((slice) => slice.id)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
    expect(ranked.map((slice) => slice.ramp)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(ranked.every((slice) => slice.members.length === 0)).toBe(true);
  });

  it('groups the two smallest slices into an Others slice on ramp 6 for seven slices', () => {
    const ranked = rankSlices(sevenSlices, 'Others');

    expect(ranked).toHaveLength(6);
    expect(ranked.map((slice) => slice.id)).toEqual(['a', 'b', 'c', 'd', 'e', 'others']);

    const others = ranked[5]!;
    expect(others.ramp).toBe(6);
    expect(others.label).toBe('Others');
    expect(others.members).toEqual(['F', 'G']);
    expect(others.value).toBe(15);
  });

  it('adds every share up to 1', () => {
    const ranked = rankSlices(sevenSlices, 'Others');
    const total = ranked.reduce((sum, slice) => sum + slice.share, 0);

    expect(total).toBeCloseTo(1);
  });

  it('drops zero and negative slices', () => {
    const withInvalid: DonutSlice[] = [
      { id: 'a', label: 'A', value: 60 },
      { id: 'zero', label: 'Zero', value: 0 },
      { id: 'negative', label: 'Negative', value: -10 },
    ];

    const ranked = rankSlices(withInvalid, 'Others');

    expect(ranked.map((slice) => slice.id)).toEqual(['a']);
  });

  it('returns an empty array for an empty input', () => {
    expect(rankSlices([], 'Others')).toEqual([]);
  });
});

describe('shareSlices', () => {
  it('sorts by value descending and computes a share of the total', () => {
    const shared = shareSlices([
      { id: 'small', label: 'Small', value: 25 },
      { id: 'big', label: 'Big', value: 75 },
    ]);

    expect(shared.map((slice) => slice.id)).toEqual(['big', 'small']);
    expect(shared[0]!.share).toBeCloseTo(0.75);
    expect(shared[1]!.share).toBeCloseTo(0.25);
  });

  it('drops zero and negative slices', () => {
    const shared = shareSlices([
      { id: 'a', label: 'A', value: 10 },
      { id: 'zero', label: 'Zero', value: 0 },
      { id: 'negative', label: 'Negative', value: -5 },
    ]);

    expect(shared.map((slice) => slice.id)).toEqual(['a']);
  });

  it('returns an empty array when nothing is positive', () => {
    expect(shareSlices([{ id: 'zero', label: 'Zero', value: 0 }])).toEqual([]);
  });
});
