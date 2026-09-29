import { scaleLinear } from 'd3-scale';
import { curveMonotoneX, line } from 'd3-shape';

export type ChartPoint = {
  t: number;
  v: number;
};

export type PlottedPoint = ChartPoint & { x: number; y: number };

export type ChartGeometry = {
  line: string;
  end: { x: number; y: number };
  start: { y: number };
  points: PlottedPoint[];
  plotBottom: number;
  plotTop: number;
};

export type GeometryPadding = { x?: number; top?: number; bottom?: number };

export const CURVE = curveMonotoneX;

export const buildGeometry = (
  points: ChartPoint[],
  width: number,
  height: number,
  padding: GeometryPadding = {},
): ChartGeometry | null => {
  if (points.length === 0) {
    return null;
  }

  const { x: paddingX = 4, top: paddingTop = 4, bottom: paddingBottom = 4 } = padding;
  const plotTop = paddingTop;
  const plotBottom = height - paddingBottom;

  const times = points.map((point) => point.t);
  const values = points.map((point) => point.v);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const x = scaleLinear()
    .domain([Math.min(...times), Math.max(...times)])
    .range([paddingX, width - paddingX]);

  const y =
    minValue === maxValue
      ? () => (plotTop + plotBottom) / 2
      : scaleLinear().domain([minValue, maxValue]).range([plotBottom, plotTop]);

  const toX = (point: ChartPoint): number => (points.length === 1 ? paddingX : x(point.t));

  const lineGenerator = line<ChartPoint>()
    .x(toX)
    .y((point) => y(point.v))
    .curve(CURVE);

  const first = points[0] as ChartPoint;
  const last = points.at(-1) as ChartPoint;

  return {
    line: lineGenerator(points) as string,
    end: { x: toX(last), y: y(last.v) },
    start: { y: y(first.v) },
    points: points.map((point) => ({ ...point, x: toX(point), y: y(point.v) })),
    plotBottom,
    plotTop,
  };
};
