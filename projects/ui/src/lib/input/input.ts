import { Directive, computed, forwardRef, input } from '@angular/core';

import { UI_CONTROL, type UiControl, type UiControlError } from '../control/control';

/** Available control sizes. `md` is the 44px touch target. */
export const CONTROL_SIZES = ['sm', 'md'] as const;
export type ControlSize = (typeof CONTROL_SIZES)[number];

export const CONTROL_BASE_CLASSES =
  'w-full rounded-md border border-(--border) bg-transparent px-3 text-sm text-(--foreground) transition-colors placeholder:text-(--muted-foreground) enabled:hover:outline-2 enabled:hover:outline-offset-2 enabled:hover:outline-(--ring) enabled:group-hover:outline-2 enabled:group-hover:outline-offset-2 enabled:group-hover:outline-(--ring) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) disabled:cursor-not-allowed disabled:opacity-50';

export const CONTROL_SIZE_CLASSES: Record<ControlSize, string> = {
  sm: 'h-9',
  md: 'h-11',
};

/**
 * Styled native text input. A directive (not a wrapper component) so the host
 * stays a plain <input>: every forms flavor (ngModel, reactive, signal forms)
 * and every native attribute keep working without any plumbing.
 *
 * Declares the `errors` and `touched` inputs Angular's `[formField]` fills, so a `ui-field` around
 * it can show the message without any binding here.
 *
 * @example
 * <input uiInput type="email" placeholder="you@example.com" />
 */
@Directive({
  selector: 'input[uiInput]',
  host: {
    '[class]': 'classes()',
  },
  providers: [{ provide: UI_CONTROL, useExisting: forwardRef(() => UiInput) }],
})
export class UiInput implements UiControl {
  readonly size = input<ControlSize>('md');
  readonly errors = input<readonly UiControlError[]>([]);
  readonly touched = input(false);

  protected readonly classes = computed(() => `${CONTROL_BASE_CLASSES} ${CONTROL_SIZE_CLASSES[this.size()]}`);
}

/**
 * Styled native textarea. Lives beside the input because it shares every one of its
 * classes; it takes no size, since a textarea grows from a floor instead of sitting
 * at a fixed height.
 *
 * Declares the `errors` and `touched` inputs Angular's `[formField]` fills, so a `ui-field` around
 * it can show the message without any binding here.
 *
 * @example
 * <textarea uiTextarea maxlength="280"></textarea>
 */
@Directive({
  selector: 'textarea[uiTextarea]',
  host: {
    class: `${CONTROL_BASE_CLASSES} min-h-24 py-2`,
  },
  providers: [{ provide: UI_CONTROL, useExisting: forwardRef(() => UiTextarea) }],
})
export class UiTextarea implements UiControl {
  readonly errors = input<readonly UiControlError[]>([]);
  readonly touched = input(false);
}
