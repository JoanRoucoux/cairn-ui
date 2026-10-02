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
  private readonly mutations = new MutationObserver(() => this.onChange());
  private readonly resizes = new ResizeObserver(() => this.measure());
  private readonly running = new Map<HTMLElement, Animation>();
  private readonly watched = new Set<HTMLElement>();
  private tops = new Map<HTMLElement, number>();

  constructor() {
    afterNextRender(() => {
      this.measure();
      this.mutations.observe(this.host, { childList: true });
      this.resizes.observe(this.host);
    });

    inject(DestroyRef).onDestroy(() => {
      this.mutations.disconnect();
      this.resizes.disconnect();
    });
  }

  private measure(): void {
    const children = Array.from(this.host.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
    this.tops = new Map(children.map((child) => [child, child.offsetTop]));

    for (const child of children) {
      if (!this.watched.has(child)) {
        this.watched.add(child);
        this.resizes.observe(child);
      }
    }
    for (const child of this.watched) {
      if (!this.tops.has(child)) {
        this.watched.delete(child);
        this.running.delete(child);
        this.resizes.unobserve(child);
      }
    }
  }

  private interruptedOffset(child: HTMLElement): number {
    const running = this.running.get(child);
    if (!running) {
      return 0;
    }
    const shown = child.getBoundingClientRect().top;
    running.cancel();
    this.running.delete(child);
    return shown - child.getBoundingClientRect().top;
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
      const from = previous - top + this.interruptedOffset(child);
      this.running.set(
        child,
        child.animate([{ transform: `translateY(${from}px)` }, { transform: 'translateY(0)' }], { duration, easing }),
      );
    }
  }
}
