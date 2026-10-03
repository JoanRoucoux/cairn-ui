export type DonutSlice = {
  id: string;
  label: string;
  value: number;
  sublabel?: string;
};

export type Ramp = 1 | 2 | 3 | 4 | 5 | 6;

export type SharedSlice = DonutSlice & { share: number };

export type RankedSlice = DonutSlice & { share: number; ramp: Ramp; members: string[] };

const MAX_RAMP = 6;
const OTHERS_ID = 'others';

export function shareSlices(slices: DonutSlice[]): SharedSlice[] {
  const positive = slices.filter((slice) => slice.value > 0).sort((a, b) => b.value - a.value);
  const total = positive.reduce((sum, slice) => sum + slice.value, 0);

  return positive.map((slice) => ({ ...slice, share: slice.value / total }));
}

export function rankSlices(slices: DonutSlice[], othersLabel: string): RankedSlice[] {
  const shared = shareSlices(slices);

  const toRanked = (slice: SharedSlice, ramp: Ramp, members: string[] = []): RankedSlice => ({
    ...slice,
    ramp,
    members,
  });

  if (shared.length <= MAX_RAMP) {
    return shared.map((slice, index) => toRanked(slice, (index + 1) as Ramp));
  }

  const kept = shared.slice(0, MAX_RAMP - 1);
  const rest = shared.slice(MAX_RAMP - 1);
  const othersValue = rest.reduce((sum, slice) => sum + slice.value, 0);
  const othersShare = rest.reduce((sum, slice) => sum + slice.share, 0);

  return [
    ...kept.map((slice, index) => toRanked(slice, (index + 1) as Ramp)),
    toRanked(
      { id: OTHERS_ID, label: othersLabel, value: othersValue, share: othersShare },
      MAX_RAMP,
      rest.map((slice) => slice.label),
    ),
  ];
}
