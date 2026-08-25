import { Component, computed, input } from '@angular/core';

/** Available button variants. `ButtonVariant` is derived from this tuple. */
export const BUTTON_VARIANTS = ['primary', 'secondary', 'outline', 'destructive', 'ghost'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

/** Available button sizes. `md` is the 44px touch target Cairn asks for everywhere. */
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) disabled:pointer-events-none disabled:opacity-50';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-(--primary) bg-linear-135 from-(--primary) to-(--primary-to) text-(--primary-foreground) hover:opacity-90',
  secondary: 'bg-(--secondary) text-(--secondary-foreground) hover:bg-(--secondary)/80',
  outline: 'border border-(--border) bg-transparent hover:bg-(--soft)',
  destructive: 'bg-(--destructive) text-(--destructive-foreground) hover:bg-(--destructive)/90',
  ghost: 'hover:bg-(--accent) hover:text-(--accent-foreground)',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

/**
 * Styled native button. Applied as an attribute so the host keeps every native
 * button behavior (type, disabled, form submission, accessibility) for free.
 *
 * Also applies to an anchor, for the one case where the action really is a navigation:
 * a download the browser has to perform itself. The element stays a link, and so does
 * its role - never use this to make an ordinary link look like a form control.
 *
 * @example
 * <button ui-button variant="destructive" size="sm">Delete</button>
 * <a ui-button variant="outline" href="/api/holdings/export" download>Export</a>
 */
@Component({
  selector: 'button[ui-button], a[ui-button]',
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
