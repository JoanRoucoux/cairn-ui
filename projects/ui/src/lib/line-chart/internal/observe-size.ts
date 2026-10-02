import type { DestroyRef } from '@angular/core';

export type Size = { width: number; height: number };

export const observeSize = (element: Element, destroyRef: DestroyRef, measured: (size: Size) => void): void => {
  if (typeof ResizeObserver === 'undefined') {
    return;
  }

  const { clientWidth: width, clientHeight: height } = element;

  if (width > 0 && height > 0) {
    measured({ width, height });
  }

  const observer = new ResizeObserver(([entry]) => {
    if (entry) {
      measured({ width: entry.contentRect.width, height: entry.contentRect.height });
    }
  });

  observer.observe(element);
  destroyRef.onDestroy(() => observer.disconnect());
};
