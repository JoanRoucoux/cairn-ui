import { type PieArcDatum, arc as d3Arc, pie as d3Pie } from 'd3-shape';

import type { RankedSlice } from './donut-slices';

export type PositionedSlice = RankedSlice & { path: string };

export const OUTER_RADIUS = 93;
export const INNER_RADIUS = 63;

const pieLayout = d3Pie<RankedSlice>()
  .value((slice) => slice.value)
  .sort(null);

const arcGenerator = d3Arc<PieArcDatum<RankedSlice>>().innerRadius(INNER_RADIUS).outerRadius(OUTER_RADIUS);

export function positionSlices(slices: RankedSlice[]): PositionedSlice[] {
  return pieLayout(slices).map((arc) => ({ ...arc.data, path: arcGenerator(arc) as string }));
}
