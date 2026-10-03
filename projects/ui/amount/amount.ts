import {
  Component,
  InjectionToken,
  LOCALE_ID,
  type Signal,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import { formatAmount } from './format-amount';

/** App-wide "amounts are hidden" state. Defaults to never masked; the app overrides it. */
export const UI_AMOUNT_MASKED = new InjectionToken<Signal<boolean>>('UI_AMOUNT_MASKED', {
  providedIn: 'root',
  factory: () => signal(false),
});

/** Available figure styles. */
export const AMOUNT_NUMERICS = ['tabular', 'proportional'] as const;
export type AmountNumeric = (typeof AMOUNT_NUMERICS)[number];

/** Available masking behaviors. */
export const AMOUNT_MASKINGS = ['dots', 'hide'] as const;
export type AmountMasking = (typeof AMOUNT_MASKINGS)[number];

/**
 * A number or an amount of money, formatted for the locale and masked when the app hides amounts.
 *
 * @example
 * <ui-amount [value]="total" currency="EUR" numeric="proportional" />
 * <ui-amount [value]="dayChange" currency="EUR" signed whenMasked="hide" />
 */
@Component({
  selector: 'ui-amount',
  template: '{{ text() }}',
  host: {
    '[class]': 'classes()',
    '[attr.hidden]': 'hidden() || null',
  },
})
export class UiAmount {
  readonly value = input<number | null | undefined>();
  readonly currency = input<string>();
  readonly locale = input<string>(inject(LOCALE_ID));
  readonly signed = input(false, { transform: booleanAttribute });
  readonly fractionDigits = input(2);
  readonly numeric = input<AmountNumeric>('tabular');
  readonly whenMasked = input<AmountMasking>('dots');

  readonly #masked = inject(UI_AMOUNT_MASKED);

  protected readonly hidden = computed(() => this.#masked() && this.whenMasked() === 'hide');

  protected readonly text = computed(() =>
    formatAmount(
      this.value(),
      {
        locale: this.locale(),
        currency: this.currency(),
        signed: this.signed(),
        fractionDigits: this.fractionDigits(),
      },
      this.#masked(),
    ),
  );

  protected readonly classes = computed(() => {
    const missing = this.value() === null || this.value() === undefined;

    return [
      'whitespace-nowrap',
      this.numeric() === 'tabular' ? 'tabular-nums' : '',
      missing ? 'text-(--subtle-foreground)' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });
}
