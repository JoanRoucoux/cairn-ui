import { InjectionToken, type Signal, signal } from '@angular/core';

/** Spoken replacements for the glyphs that stand for a masked and a missing amount. */
export type AmountLabels = { masked: string; missing: string };

/** Assistive labels for masked and missing amounts. The app provides translated labels; the default is English. */
export const UI_AMOUNT_LABELS = new InjectionToken<Signal<AmountLabels>>('UI_AMOUNT_LABELS', {
  providedIn: 'root',
  factory: () => signal({ masked: 'Hidden amount', missing: 'Not available' }),
});
