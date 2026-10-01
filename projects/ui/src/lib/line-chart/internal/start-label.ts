import type { PlottedPoint } from './chart-scale';

export type StartLabelBox = { width: number; height: number };
export type StartLabelSize = { width: number; height: number };
export type StartLabelPlacement = { x: number; y: number; anchor: 'start' | 'end' };

const LINE_GAP = 6;
const COLLISION_MARGIN = 6;
const EDGE_TOLERANCE = 3;

type Slot = { anchor: 'start' | 'end'; x: number; y: number; top: number; bottom: number };

const candidateSlots = (startY: number, box: StartLabelBox, label: StartLabelSize): Slot[] => {
  const aboveTop = startY - LINE_GAP - label.height;
  const aboveBottom = startY - LINE_GAP;
  const belowTop = startY + LINE_GAP;
  const belowBottom = startY + LINE_GAP + label.height;

  const slots: Slot[] = [
    { anchor: 'end', x: box.width, y: aboveBottom, top: aboveTop, bottom: aboveBottom },
    { anchor: 'end', x: box.width, y: belowBottom, top: belowTop, bottom: belowBottom },
    { anchor: 'start', x: 0, y: aboveBottom, top: aboveTop, bottom: aboveBottom },
    { anchor: 'start', x: 0, y: belowBottom, top: belowTop, bottom: belowBottom },
    { anchor: 'end', x: box.width, y: label.height, top: 0, bottom: label.height },
    { anchor: 'start', x: 0, y: label.height, top: 0, bottom: label.height },
    { anchor: 'end', x: box.width, y: box.height, top: box.height - label.height, bottom: box.height },
    { anchor: 'start', x: 0, y: box.height, top: box.height - label.height, bottom: box.height },
  ];

  return slots.filter((slot) => slot.top >= -EDGE_TOLERANCE && slot.bottom <= box.height + EDGE_TOLERANCE);
};

const hitsFor = (slot: Slot, label: StartLabelSize, points: readonly PlottedPoint[]): number => {
  const left = slot.anchor === 'end' ? slot.x - label.width : slot.x;
  const right = slot.anchor === 'end' ? slot.x : slot.x + label.width;
  const top = slot.top - COLLISION_MARGIN;
  const bottom = slot.bottom + COLLISION_MARGIN;

  return points.filter((point) => point.x >= left && point.x <= right && point.y >= top && point.y <= bottom).length;
};

export const placeStartLabel = (
  points: readonly PlottedPoint[],
  startY: number,
  box: StartLabelBox,
  label: StartLabelSize,
): StartLabelPlacement => {
  let best: { slot: Slot; hits: number } | null = null;

  for (const slot of candidateSlots(startY, box, label)) {
    const hits = hitsFor(slot, label, points);

    if (!best || hits < best.hits) {
      best = { slot, hits };
    }
    if (hits === 0) {
      break;
    }
  }

  if (!best) {
    return { anchor: 'end', x: box.width, y: label.height };
  }

  const { anchor, x, y } = best.slot;

  return { anchor, x, y };
};
