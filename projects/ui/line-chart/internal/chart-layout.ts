export const START_LABEL_HEIGHT = 16;

const AXIS_ROW = 17;

export const TOOLTIP_SIZES = ['compact', 'large'] as const;
export type TooltipSize = (typeof TOOLTIP_SIZES)[number];

export const TOOLTIP_CLASSES: Record<TooltipSize, { box: string; value: string; delta: string }> = {
  compact: { box: '-top-3 px-2.5', value: 'text-label', delta: 'text-caption' },
  large: { box: 'top-0 px-3', value: 'text-body', delta: 'text-label' },
};

const PLOT_PADDING_RATIO = 16 / 240;
const SPARKLINE_PADDING = 4;
const START_LABEL_BASELINE_OFFSET = 4;
const TOOLTIP_OFFSET = 14;
const TOOLTIP_FLIP_RATIO = 0.55;

export const plotHeightFor = (height: number, sparkline: boolean, axisGap: number | 'auto', wide: boolean): number =>
  sparkline ? height : Math.max(height - resolveGap(axisGap, wide) - AXIS_ROW, 1);

export const plotPaddingFor = (plotHeight: number, sparkline: boolean): number =>
  sparkline ? SPARKLINE_PADDING : plotHeight * PLOT_PADDING_RATIO;

export const startLabelBaseline = (boxBottom: number): number => boxBottom - START_LABEL_BASELINE_OFFSET;

export const tooltipPlacement = (ratio: number): string => {
  const flipped = ratio > TOOLTIP_FLIP_RATIO;

  return `left: calc(${ratio * 100}% ${flipped ? '-' : '+'} ${TOOLTIP_OFFSET}px); transform: ${flipped ? 'translateX(-100%)' : 'none'}`;
};

export const deltaTone = (delta: number): string =>
  delta > 0 ? 'text-(--positive)' : delta < 0 ? 'text-(--negative)' : 'text-(--muted-foreground)';

export const DEFAULT_WIDTH = 640;
export const DEFAULT_HEIGHT = 240;

export const identityValue = (value: number): string => `${value}`;
export const identityDelta = (delta: number): string => `${delta > 0 ? '+' : ''}${delta}`;
export const identityTime = (time: number): string => new Date(time).toISOString();

export type AxisTicks = 3 | 5 | 'auto';

export const parseAxisTicks = (value: AxisTicks | string): AxisTicks =>
  value === 'auto' ? 'auto' : (Number(value) as 3 | 5);

const resolveGap = (gap: number | 'auto', wide: boolean): number => (gap === 'auto' ? (wide ? 16 : 12) : gap);

const resolveTooltip = (size: TooltipSize | 'auto', wide: boolean): TooltipSize =>
  size === 'auto' ? (wide ? 'large' : 'compact') : size;

export const tooltipClassesFor = (size: TooltipSize | 'auto', wide: boolean): (typeof TOOLTIP_CLASSES)[TooltipSize] =>
  TOOLTIP_CLASSES[resolveTooltip(size, wide)];
