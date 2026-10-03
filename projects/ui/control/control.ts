import { InjectionToken, type Signal } from '@angular/core';

/**
 * The part of a validation error this library reads. Angular's own `ValidationError` satisfies it.
 */
export type UiControlError = { readonly message?: string };

/** What a styled control offers the field wrapped around it. */
export type UiControl = {
  readonly errors: Signal<readonly UiControlError[]>;
  readonly touched: Signal<boolean>;
};

/**
 * Resolves to the styled control projected into a field. A control provides it and declares the
 * `errors` and `touched` inputs that Angular's `[formField]` fills.
 */
export const UI_CONTROL = new InjectionToken<UiControl>('UI_CONTROL');
