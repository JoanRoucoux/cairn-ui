import { Component, computed, input } from '@angular/core';

/** Available skeleton shapes. `SkeletonShape` is derived from this tuple. */
export const SKELETON_SHAPES = ['text', 'figure', 'row', 'chart', 'ring'] as const;
export type SkeletonShape = (typeof SKELETON_SHAPES)[number];

const LAST_LINE_WIDTH = '62%';

const PULSE_ANIMATION = 'cairn-pulse var(--pulse-duration) var(--ease-out) infinite alternate';

const BAR_CLASSES = 'block rounded-control bg-(--muted)';

/**
 * Decorative, pulsing placeholder for content that is still loading, at the shape of the content
 * it stands in for.
 *
 * @example
 * <ui-skeleton shape="figure" />
 * <ui-skeleton [lines]="3" />
 */
@Component({
  selector: 'ui-skeleton',
  template: `
    @switch (shape()) {
      @case ('figure') {
        <span class="${BAR_CLASSES} h-10 w-60" [style.animation]="animation"></span>
      }
      @case ('row') {
        <span class="flex h-14 items-center justify-between gap-4">
          <span class="flex min-w-0 flex-1 flex-col gap-1.5">
            <span class="${BAR_CLASSES} h-4 w-3/5" [style.animation]="animation"></span>
            <span class="${BAR_CLASSES} h-3 w-20" [style.animation]="animation"></span>
          </span>
          <span class="${BAR_CLASSES} h-4 w-[90px] flex-none" [style.animation]="animation"></span>
        </span>
      }
      @case ('chart') {
        <span class="rounded-control h-35 w-full bg-(--muted)" [style.animation]="animation"></span>
      }
      @case ('ring') {
        <span class="rounded-pill size-30 shadow-[inset_0_0_0_22px_var(--muted)]" [style.animation]="animation"></span>
      }
      @default {
        @for (line of bars(); track $index) {
          <span
            class="${BAR_CLASSES}"
            [style.animation]="animation"
            [style.height.px]="height()"
            [style.width]="line"
          ></span>
        }
      }
    }
  `,
  host: {
    'aria-hidden': 'true',
    class: 'flex flex-col gap-2',
  },
  styles: `
    @keyframes cairn-pulse {
      from {
        opacity: 1;
      }
      to {
        opacity: 0.45;
      }
    }
  `,
})
export class UiSkeleton {
  readonly shape = input<SkeletonShape>('text');
  readonly lines = input(1);
  readonly height = input(12);

  protected readonly animation = PULSE_ANIMATION;

  protected readonly bars = computed(() => {
    const count = Math.max(1, this.lines());

    return Array.from({ length: count }, (_, index) => (index === count - 1 && count > 1 ? LAST_LINE_WIDTH : '100%'));
  });
}
