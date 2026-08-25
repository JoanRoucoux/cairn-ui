import { Component, computed, input } from '@angular/core';

const LAST_LINE_WIDTH = '62%';

/**
 * Decorative placeholder for content that is still loading. Deliberately hidden from
 * assistive technology: the calling screen keeps its own role="status" sentence.
 *
 * @example
 * <ui-skeleton [lines]="3" />
 * <ui-skeleton [height]="196" />
 */
@Component({
  selector: 'ui-skeleton',
  template: `
    @for (line of bars(); track $index) {
      <span
        class="block rounded bg-(--soft) motion-safe:animate-pulse"
        [style.height.px]="height()"
        [style.width]="line"
      ></span>
    }
  `,
  host: {
    'aria-hidden': 'true',
    class: 'flex flex-col gap-2',
  },
})
export class UiSkeleton {
  readonly lines = input(1);
  readonly height = input(12);

  protected readonly bars = computed(() => {
    const count = Math.max(1, this.lines());

    return Array.from({ length: count }, (_, index) => (index === count - 1 && count > 1 ? LAST_LINE_WIDTH : '100%'));
  });
}
