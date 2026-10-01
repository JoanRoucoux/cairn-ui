import { DestroyRef, type Signal, inject, signal } from '@angular/core';

const WIDE_QUERY = '(min-width: 64rem)';

export const wideViewport = (): Signal<boolean> => {
  const query = typeof matchMedia === 'function' ? matchMedia(WIDE_QUERY) : null;
  const wide = signal(query?.matches ?? false);
  const onChange = (event: { matches: boolean }): void => wide.set(event.matches);

  if (query) {
    query.onchange = onChange;
    inject(DestroyRef).onDestroy(() => (query.onchange = null));
  }

  return wide;
};
