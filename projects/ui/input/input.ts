import { Directive, computed, forwardRef, input } from '@angular/core';

import { UI_CONTROL, type UiControl, type UiControlError } from '@joanroucoux/cairn-ui/control';

/** Available control sizes. `md` is the 44/40px touch target; `lg` and `xl` are the 48px sheet and sign-in fields. */
export const CONTROL_SIZES = ['sm', 'md', 'lg', 'xl'] as const;
export type ControlSize = (typeof CONTROL_SIZES)[number];

export const CONTROL_BASE_CLASSES =
  'w-full rounded-control px-3 text-body text-(--foreground) shadow-[inset_0_0_0_1px_var(--border)] placeholder:text-(--muted-foreground) focus-visible:shadow-[inset_0_0_0_2px_var(--ring)] aria-invalid:shadow-[inset_0_0_0_2px_var(--negative)] disabled:cursor-not-allowed disabled:opacity-50';

export const CONTROL_SURFACES = ['background', 'card'] as const;
export type ControlSurface = (typeof CONTROL_SURFACES)[number];

export const CONTROL_SURFACE_CLASSES: Record<ControlSurface, string> = {
  background: 'bg-(--background)',
  card: 'bg-(--card)',
};

export const CONTROL_SIZE_CLASSES: Record<ControlSize, string> = {
  sm: 'h-9',
  md: 'min-h-(--row-min)',
  lg: 'min-h-12 lg:min-h-(--row-min)',
  xl: 'h-12 lg:h-11',
};

const SEARCH_CLASSES = '[&::-webkit-search-cancel-button]:appearance-none';

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
  readonly surface = input<ControlSurface>('background');
  readonly errors = input<readonly UiControlError[]>([]);
  readonly touched = input(false);

  protected readonly classes = computed(
    () =>
      `${CONTROL_BASE_CLASSES} ${SEARCH_CLASSES} ${CONTROL_SURFACE_CLASSES[this.surface()]} ${CONTROL_SIZE_CLASSES[this.size()]}`,
  );
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
    class: `${CONTROL_BASE_CLASSES} bg-(--background) min-h-24 py-2`,
  },
  providers: [{ provide: UI_CONTROL, useExisting: forwardRef(() => UiTextarea) }],
})
export class UiTextarea implements UiControl {
  readonly errors = input<readonly UiControlError[]>([]);
  readonly touched = input(false);
}
