import { DestroyRef, type Signal, inject, signal } from '@angular/core';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * A signal that follows the user's `prefers-reduced-motion` preference live.
 * Call it in an injection context; the listener is removed with that context.
 *
 * @example
 * protected readonly reduced = injectReducedMotion();
 */
export function injectReducedMotion(): Signal<boolean> {
  if (typeof matchMedia === 'undefined') {
    return signal(false).asReadonly();
  }

  const query = matchMedia(QUERY);
  const reduced = signal(query.matches);
  const listener = (event: { matches: boolean }): void => reduced.set(event.matches);

  query.addEventListener('change', listener);
  inject(DestroyRef).onDestroy(() => query.removeEventListener('change', listener));

  return reduced.asReadonly();
}
