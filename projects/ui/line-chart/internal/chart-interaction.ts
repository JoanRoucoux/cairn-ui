import type { PlottedPoint } from './chart-scale';

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const nearestPointIndex = (points: readonly PlottedPoint[], x: number): number => {
  let nearest = 0;
  let nearestDistance = Infinity;

  points.forEach((point, index) => {
    const distance = Math.abs(point.x - x);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = index;
    }
  });

  return nearest;
};

export type KeyNavigation = { index: number | null; preventDefault: boolean };

export const navigateIndex = (key: string, current: number | null, last: number): KeyNavigation | null => {
  switch (key) {
    case 'ArrowRight':
      return { index: clamp((current ?? -1) + 1, 0, last), preventDefault: true };
    case 'ArrowLeft':
      return { index: clamp((current ?? last + 1) - 1, 0, last), preventDefault: true };
    case 'Home':
      return { index: 0, preventDefault: true };
    case 'End':
      return { index: last, preventDefault: true };
    case 'Escape':
      return { index: null, preventDefault: false };
    default:
      return null;
  }
};
