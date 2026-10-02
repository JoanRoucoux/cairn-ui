import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

import { readDuration, readEasing } from './internal/tokens';
import { injectReducedMotion } from './reduced-motion';

/**
 * Slides the remaining children of a list into place when one is removed or inserted (FLIP): it
 * measures every child before and after the change, then animates the shift in `translateY` over
 * `--duration-base` `--ease-out`. Pair it with `animate.leave="ui-leave-fade"` on the item so it fades
 * out first. Nothing moves under `prefers-reduced-motion`: the list closes up at once.
 *
 * @example
 * <ul uiFlipList>
 *   @for (key of keys(); track key.id) {
 *     <li uiListRow animate.leave="ui-leave-fade">...</li>
 *   }
 * </ul>
 */
@Directive({
  selector: '[uiFlipList]',
})
export class UiFlipList {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly reduced = injectReducedMotion();
  private tops = new Map<HTMLElement, number>();

  constructor() {
    const mutations = new MutationObserver(() => this.onChange());
    const resizes = new ResizeObserver(() => this.measure());

    afterNextRender(() => {
      this.measure();
      mutations.observe(this.host, { childList: true });
      resizes.observe(this.host);
    });

    inject(DestroyRef).onDestroy(() => {
      mutations.disconnect();
      resizes.disconnect();
    });
  }

  private children(): HTMLElement[] {
    return Array.from(this.host.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
  }

  private measure(): void {
    this.tops = new Map(this.children().map((child) => [child, child.offsetTop]));
  }

  private onChange(): void {
    const before = this.tops;
    this.measure();

    if (this.reduced()) {
      return;
    }

    const duration = readDuration(this.host, '--duration-base', 260);
    const easing = readEasing(this.host, '--ease-out', 'ease-out');

    for (const [child, top] of this.tops) {
      const previous = before.get(child);
      if (previous === undefined || previous === top) {
        continue;
      }
      child.animate([{ transform: `translateY(${previous - top}px)` }, { transform: 'translateY(0)' }], {
        duration,
        easing,
      });
    }
  }
}
