export const AXIS_BAND = 29;
export const START_LABEL_HEIGHT = 16;

const PLOT_PADDING_RATIO = 16 / 240;
const SPARKLINE_PADDING = 4;
const START_LABEL_BASELINE_OFFSET = 4;
const TOOLTIP_OFFSET = 14;
const TOOLTIP_FLIP_RATIO = 0.55;

export const plotHeightFor = (height: number, sparkline: boolean): number =>
  sparkline ? height : Math.max(height - AXIS_BAND, 1);

export const plotPaddingFor = (plotHeight: number, sparkline: boolean): number =>
  sparkline ? SPARKLINE_PADDING : plotHeight * PLOT_PADDING_RATIO;

export const startLabelBaseline = (boxBottom: number): number => boxBottom - START_LABEL_BASELINE_OFFSET;

export const tooltipPlacement = (ratio: number): string => {
  const flipped = ratio > TOOLTIP_FLIP_RATIO;

  return `left: calc(${ratio * 100}% ${flipped ? '-' : '+'} ${TOOLTIP_OFFSET}px); transform: ${flipped ? 'translateX(-100%)' : 'none'}`;
};
