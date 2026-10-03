import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

import { FlipItems } from './internal/flip-items';
import { readDuration, readEasing } from './internal/tokens';
import { injectReducedMotion } from './reduced-motion';

function translateY(element: Element): number {
  const matrix = /^matrix\((.+)\)$/.exec(getComputedStyle(element).transform);
  return matrix ? parseFloat((matrix[1] as string).split(',')[5] as string) : 0;
}

/**
 * Slides the items of a list into place when one is removed or inserted (FLIP): it measures every item
 * before and after the change, from the top of the list itself, then animates the shift in `translateY`
 * over `--duration-base` `--ease-out`. Pair it with `animate.leave="ui-leave-fade"` on the item so it fades
 * out first. Nothing moves under `prefers-reduced-motion`: the list closes up at once.
 *
 * By default the items are the direct children of the list. Mark them with `uiFlipItem` instead when they
 * sit deeper, for instance a page of several groups: put `uiFlipList` on the element around every group and
 * `uiFlipItem` on each group heading and row, so a removal also slides the groups below. An item may sit
 * inside another item (a row inside a card): it then moves by its own share and its card carries the rest.
 * Only an item added or removed starts a slide; a change inside an item does not. Positions leave out the
 * translate of any animation running inside the list (a slide in progress, an enter fade-up).
 *
 * @example
 * <ul uiFlipList>
 *   @for (key of keys(); track key.id) {
 *     <li uiListRow animate.leave="ui-leave-fade">...</li>
 *   }
 * </ul>
 *
 * <table uiTable uiFlipList>
 *   @for (group of groups(); track group.id) {
 *     <tbody>
 *       <tr uiTr group uiFlipItem>...</tr>
 *       @for (row of group.rows; track row.id) {
 *         <tr uiTr uiFlipItem animate.leave="ui-leave-fade">...</tr>
 *       }
 *     </tbody>
 *   }
 * </table>
 */
@Directive({
  selector: '[uiFlipList]',
  providers: [FlipItems],
})
export class UiFlipList {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly reduced = injectReducedMotion();
  private readonly mutations = new MutationObserver(() => this.onChange());
  private readonly resizes = new ResizeObserver(() => {
    this.tops = this.measure();
  });
  private readonly running = new Map<HTMLElement, Animation>();
  private readonly watched = new Set<HTMLElement>();
  private readonly items = inject(FlipItems, { self: true });
  private tops = new Map<HTMLElement, number>();
  private shifts = new Map<Element, number>();

  constructor() {
    afterNextRender(() => {
      this.tops = this.measure();
      this.mutations.observe(this.host, { childList: true, subtree: true });
      this.resizes.observe(this.host);
    });

    inject(DestroyRef).onDestroy(() => {
      this.mutations.disconnect();
      this.resizes.disconnect();
    });
  }

  private tracked(): HTMLElement[] {
    if (!this.items.marked) {
      return Array.from(this.host.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
    }
    return this.items.inside(this.host);
  }

  private measure(): Map<HTMLElement, number> {
    const elements = this.tracked();
    const origin = this.host.getBoundingClientRect().top - this.host.scrollTop;
    const tops = new Map(elements.map((element) => [element, element.getBoundingClientRect().top - origin]));

    this.shifts = new Map();
    for (const animation of this.host.getAnimations({ subtree: true })) {
      const target = (animation.effect as KeyframeEffect).target as Element;
      if (target !== this.host) {
        this.shifts.set(target, translateY(target));
      }
    }
    for (const [moving, shift] of this.shifts) {
      for (const [element, top] of tops) {
        if (moving.contains(element)) {
          tops.set(element, top - shift);
        }
      }
    }

    for (const element of elements) {
      if (!this.watched.has(element)) {
        this.watched.add(element);
        this.resizes.observe(element);
      }
    }
    for (const element of this.watched) {
      if (!tops.has(element)) {
        this.watched.delete(element);
        this.running.delete(element);
        this.resizes.unobserve(element);
      }
    }
    return tops;
  }

  private onChange(): void {
    const before = this.tops;
    const after = this.measure();
    this.tops = after;

    const changed = after.size !== before.size || Array.from(after.keys()).some((element) => !before.has(element));
    if (this.reduced() || !changed) {
      return;
    }

    const duration = readDuration(this.host, '--duration-base', 260);
    const easing = readEasing(this.host, '--ease-out', 'ease-out');
    const moved = (element: HTMLElement): number => (before.get(element) ?? 0) - (after.get(element) ?? 0);

    for (const [element] of after) {
      if (!before.has(element)) {
        continue;
      }
      const own = moved(element) - moved(this.parentItem(element, before, after));
      if (Math.abs(own) < 0.5) {
        continue;
      }
      const from = own + (this.shifts.get(element) ?? 0);
      this.running.get(element)?.cancel();
      const animation = element.animate([{ transform: `translateY(${from}px)` }, { transform: 'translateY(0)' }], {
        duration,
        easing,
      });
      animation.onfinish = () => {
        if (this.running.get(element) === animation) {
          this.running.delete(element);
        }
      };
      this.running.set(element, animation);
    }
  }

  private parentItem(
    element: HTMLElement,
    before: Map<HTMLElement, number>,
    after: Map<HTMLElement, number>,
  ): HTMLElement {
    let node = element.parentElement as HTMLElement;
    while (node !== this.host && !(before.has(node) && after.has(node))) {
      node = node.parentElement as HTMLElement;
    }
    return node;
  }
}

/**
 * Marks an element as an item of the nearest `uiFlipList`, at any depth: a group heading, a row inside a
 * group, a card. Once one item is marked, the list follows its marked items only.
 *
 * @example
 * <tr uiTr uiFlipItem animate.leave="ui-leave-fade">...</tr>
 */
@Directive({
  selector: '[uiFlipItem]',
})
export class UiFlipItem {
  constructor() {
    const items = inject(FlipItems, { optional: true });
    if (items) {
      const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
      items.add(element);
      inject(DestroyRef).onDestroy(() => items.remove(element));
    }
  }
}
