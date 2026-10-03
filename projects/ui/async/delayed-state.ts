import { DestroyRef, type Signal, effect, inject, signal, untracked } from '@angular/core';

import type { AsyncState } from './async';

export const SKELETON_DELAY_MS = 150;
export const SKELETON_MIN_MS = 400;

/**
 * Turns the live state of a call into the state to draw: `loading` only appears once the call has
 * lasted 150 ms and, once shown, stays at least 400 ms, so a fast call never flashes a skeleton and a
 * slow one never blinks. Until then the previous state stays on screen (a reload keeps its content);
 * `null` means nothing to draw yet, for a first load still under 150 ms. Call it in an injection context.
 *
 * @example
 * protected readonly shown = delayedState(this.state);
 */
export function delayedState(source: Signal<AsyncState>): Signal<AsyncState | null> {
  const displayed = signal<AsyncState | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let shownAt = 0;

  const clear = (): void => {
    clearTimeout(timer);
    timer = undefined;
  };

  inject(DestroyRef).onDestroy(clear);

  effect(() => {
    const state = source();

    untracked(() => {
      if (state === 'loading') {
        if (displayed() === 'loading') {
          clear();
        } else {
          timer = setTimeout(() => {
            timer = undefined;
            shownAt = Date.now();
            displayed.set('loading');
          }, SKELETON_DELAY_MS);
        }

        return;
      }

      clear();

      const remaining = shownAt + SKELETON_MIN_MS - Date.now();

      if (displayed() === 'loading' && remaining > 0) {
        timer = setTimeout(() => {
          timer = undefined;
          displayed.set(untracked(source));
        }, remaining);
      } else {
        displayed.set(state);
      }
    });
  });

  return displayed.asReadonly();
}
