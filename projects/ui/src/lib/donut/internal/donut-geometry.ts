import type { RankedSlice } from './donut-slices';

export type PositionedSlice = RankedSlice & { dash: string; offset: string };

export const RADIUS = 78;
export const RING_WIDTH = 30;
export const ACTIVE_RING_WIDTH = 38;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const GAP = 2;

export function positionSlices(slices: RankedSlice[]): PositionedSlice[] {
  let travelled = 0;

  return slices.map((slice) => {
    const length = slice.share * CIRCUMFERENCE;
    const drawn = Math.max(0, length - GAP);
    const positioned = {
      ...slice,
      dash: `${drawn.toFixed(2)} ${(CIRCUMFERENCE - drawn).toFixed(2)}`,
      offset: (-travelled).toFixed(2),
    };
    travelled += length;

    return positioned;
  });
}
