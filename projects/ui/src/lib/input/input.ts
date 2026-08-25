import { Directive, computed, input } from '@angular/core';

/** Available control sizes. `md` is the 44px touch target. */
export const CONTROL_SIZES = ['sm', 'md'] as const;
export type ControlSize = (typeof CONTROL_SIZES)[number];

export const CONTROL_BASE_CLASSES =
  'w-full rounded-md border border-(--border) bg-transparent px-3 text-sm text-(--foreground) transition-colors placeholder:text-(--muted-foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) disabled:cursor-not-allowed disabled:opacity-50';

export const CONTROL_SIZE_CLASSES: Record<ControlSize, string> = {
  sm: 'h-9',
  md: 'h-11',
};

/**
 * Styled native text input. A directive (not a wrapper component) so the host
 * stays a plain <input>: every forms flavor (ngModel, reactive, signal forms)
 * and every native attribute keep working without any plumbing.
 *
 * @example
 * <input uiInput type="email" placeholder="you@example.com" />
 */
@Directive({
  selector: 'input[uiInput]',
  host: {
    '[class]': 'classes()',
  },
})
export class UiInput {
  readonly size = input<ControlSize>('md');

  protected readonly classes = computed(() => `${CONTROL_BASE_CLASSES} ${CONTROL_SIZE_CLASSES[this.size()]}`);
}

/**
 * Styled native textarea. Lives beside the input because it shares every one of its
 * classes; it takes no size, since a textarea grows from a floor instead of sitting
 * at a fixed height.
 *
 * @example
 * <textarea uiTextarea maxlength="280"></textarea>
 */
@Directive({
  selector: 'textarea[uiTextarea]',
  host: {
    class: `${CONTROL_BASE_CLASSES} min-h-24 py-2`,
  },
})
export class UiTextarea {}
