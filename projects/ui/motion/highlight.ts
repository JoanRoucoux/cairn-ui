import { DestroyRef, Directive, ElementRef, effect, inject, input, untracked } from '@angular/core';

import { readDuration, readEasing } from './internal/tokens';
import { injectReducedMotion } from './reduced-motion';

const HOLD_MS = 200;
const SCROLL_SETTLE_MS = 200;
const SCROLL_START_MS = 300;

function paintedElements(host: HTMLElement): HTMLElement[] {
  if (host.tagName === 'TR') {
    return Array.from(host.children).filter((cell): cell is HTMLElement => cell instanceof HTMLElement);
  }
  if (host.hasAttribute('ui-group-cell') && host.firstElementChild instanceof HTMLElement) {
    return [host.firstElementChild];
  }
  return [host];
}

/**
 * Draws the eye to an element that just changed: scrolls it into view when off screen, flashes the
 * `--soft` fill, then fades back. Each new non-null token plays once, so pass a fresh value per
 * event (an object or a counter), not a boolean. A non-null token present at first render plays on
 * arrival. Can sit on the same element as `animate.enter`: it waits for that fade to finish.
 *
 * Give the element `scroll-margin-top` and `scroll-margin-bottom` equal to what is pinned above and
 * below it (header, tab bar, action bar), or a row under them counts as on screen. For an arrival
 * on a page opened at the element, scroll to it first (`scrollIntoView` in `afterNextRender`) and
 * set the token afterwards, otherwise it scrolls smoothly from where the page is.
 *
 * @example
 * <a ui-row [uiHighlight]="changed() === holding.id ? token() : null" routerLink="/holdings/1">...</a>
 */
@Directive({
  selector: '[uiHighlight]',
})
export class UiHighlight {
  readonly uiHighlight = input<unknown>(null);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly reduced = injectReducedMotion();
  private cancel: (() => void) | null = null;

  constructor() {
    effect(() => {
      const token = this.uiHighlight();
      if (token === null || token === undefined) {
        return;
      }
      untracked(() => this.play());
    });

    inject(DestroyRef).onDestroy(() => this.cancel?.());
  }

  private play(): void {
    this.cancel?.();

    if (this.isVisible()) {
      this.cancel = this.flash();
      return;
    }

    const reduced = this.reduced();
    this.host.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });

    if (reduced) {
      this.cancel = this.flash();
      return;
    }

    let stopFlash: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout>;
    const moves = (event: Event): boolean =>
      event.target === document || (event.target instanceof Node && event.target.contains(this.host));
    const start = (): void => {
      stopListening();
      stopFlash = this.flash();
    };
    const onScrollEnd = (event: Event): void => {
      if (moves(event)) {
        start();
      }
    };
    const onScroll = (event: Event): void => {
      if (moves(event)) {
        clearTimeout(timer);
        timer = setTimeout(start, SCROLL_SETTLE_MS);
      }
    };
    const stopListening = (): void => {
      clearTimeout(timer);
      window.removeEventListener('scrollend', onScrollEnd, true);
      window.removeEventListener('scroll', onScroll, true);
    };
    timer = setTimeout(start, SCROLL_START_MS);
    window.addEventListener('scrollend', onScrollEnd, true);
    window.addEventListener('scroll', onScroll, true);

    this.cancel = () => {
      stopListening();
      stopFlash?.();
    };
  }

  private isVisible(): boolean {
    const rect = this.host.getBoundingClientRect();
    const style = getComputedStyle(this.host);
    const top = parseFloat(style.scrollMarginTop) || 0;
    const bottom = parseFloat(style.scrollMarginBottom) || 0;
    return rect.top >= top && rect.bottom <= window.innerHeight - bottom;
  }

  private flash(): () => void {
    const painted = paintedElements(this.host);
    let animations: Animation[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;

    const paint = (): void => {
      const fade = readDuration(this.host, '--duration-highlight', 1200);
      const easing = readEasing(this.host, '--ease-out', 'ease-out');
      const total = HOLD_MS + fade;
      animations = painted.map((element) =>
        element.animate(
          [
            { backgroundColor: 'var(--soft)', offset: 0 },
            { backgroundColor: 'var(--soft)', offset: HOLD_MS / total, easing },
            { offset: 1 },
          ],
          { duration: total },
        ),
      );
    };

    const frame = requestAnimationFrame(() => {
      const remaining = Array.from(new Set([this.host, ...painted]))
        .flatMap((element) => element.getAnimations())
        .map((animation) => {
          const timing = (animation.effect as AnimationEffect).getComputedTiming();
          return Number(timing.endTime) - Number(timing.localTime ?? 0);
        })
        .filter((left) => Number.isFinite(left));
      if (remaining.length === 0) {
        paint();
        return;
      }
      timer = setTimeout(paint, Math.min(Math.max(...remaining), readDuration(this.host, '--duration-base', 260)));
    });

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      animations.forEach((animation) => animation.cancel());
    };
  }
}
