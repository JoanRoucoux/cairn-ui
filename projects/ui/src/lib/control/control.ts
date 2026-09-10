import { InjectionToken, type Signal } from '@angular/core';

/**
 * The part of a validation error this library reads. Angular's own `ValidationError` satisfies it,
 * which is how a Signal Forms error reaches a field without this package depending on
 * `@angular/forms`.
 */
export type UiControlError = { readonly message?: string };

/** What a styled control offers the field wrapped around it. */
export type UiControl = {
  readonly errors: Signal<readonly UiControlError[]>;
  readonly touched: Signal<boolean>;
};

/**
 * Resolves to the styled control projected into a field.
 *
 * Angular's `[formField]` directive fills any input named `errors` or `touched` on the directives
 * sitting on its host element, so a control declaring them receives its own validation state with
 * nothing written at the call site. This token is how the field finds whichever control was
 * projected into it.
 */
export const UI_CONTROL = new InjectionToken<UiControl>('UI_CONTROL');
