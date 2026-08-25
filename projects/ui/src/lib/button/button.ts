import { Component, computed, input } from '@angular/core';

/** Available button variants. `ButtonVariant` is derived from this tuple. */
export const BUTTON_VARIANTS = ['primary', 'secondary', 'destructive', 'ghost'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

/** Available button sizes. `ButtonSize` is derived from this tuple. */
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) disabled:pointer-events-none disabled:opacity-50';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-(--primary) text-(--primary-foreground) hover:bg-(--primary)/90',
  secondary: 'bg-(--secondary) text-(--secondary-foreground) hover:bg-(--secondary)/80',
  destructive: 'bg-(--destructive) text-(--destructive-foreground) hover:bg-(--destructive)/90',
  ghost: 'hover:bg-(--accent) hover:text-(--accent-foreground)',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-6 text-base',
};

/**
 * Styled native button. Applied as an attribute so the host keeps every native
 * button behavior (type, disabled, form submission, accessibility) for free.
 *
 * @example
 * <button ui-button variant="destructive" size="sm">Delete</button>
 */
@Component({
  selector: 'button[ui-button]',
  template: '<ng-content />',
  host: {
    '[class]': 'classes()',
  },
})
export class UiButton {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');

  protected readonly classes = computed(
    () => `${BASE_CLASSES} ${VARIANT_CLASSES[this.variant()]} ${SIZE_CLASSES[this.size()]}`,
  );
}
