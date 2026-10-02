import { DestroyRef, Directive, ElementRef, effect, inject, input, untracked } from '@angular/core';

import { readDuration, readEasing } from './internal/tokens';
import { injectReducedMotion } from './reduced-motion';

const HOLD_MS = 200;
const SCROLL_SETTLE_MS = 200;

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
 * Draws the eye to an element that just changed: scrolls it into view when it is off screen, holds the
 * `--soft` fill for 200 ms, then fades back to the element's own background over `--duration-highlight`.
 * Each new non-null token plays once, so pass a fresh value per event (an object or a counter), not a
 * boolean. A non-null token already present at first render plays on arrival. On a `tr` it paints the
 * cells, on a `td[ui-group-cell]` the band, anywhere else the host. Under `prefers-reduced-motion` the
 * scroll is instant and the fade lasts 600 ms.
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
    timer = setTimeout(start, SCROLL_SETTLE_MS);
    window.addEventListener('scrollend', onScrollEnd, true);
    window.addEventListener('scroll', onScroll, true);

    this.cancel = () => {
      stopListening();
      stopFlash?.();
    };
  }

  private isVisible(): boolean {
    const rect = this.host.getBoundingClientRect();
    const margin = parseFloat(getComputedStyle(this.host).scrollMarginTop) || 0;
    return rect.top >= margin && rect.bottom <= window.innerHeight;
  }

  private flash(): () => void {
    const fade = readDuration(this.host, '--duration-highlight', 1200);
    const easing = readEasing(this.host, '--ease-out', 'ease-out');
    const total = HOLD_MS + fade;

    const animations = paintedElements(this.host).map((element) =>
      element.animate(
        [
          { backgroundColor: 'var(--soft)', offset: 0 },
          { backgroundColor: 'var(--soft)', offset: HOLD_MS / total, easing },
          { offset: 1 },
        ],
        { duration: total },
      ),
    );

    return () => animations.forEach((animation) => animation.cancel());
  }
}
