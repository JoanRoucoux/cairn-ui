import { Component, computed, inject, input } from '@angular/core';

import { UI_AMOUNT_LABELS } from './amount-labels';
import { amountSegments } from './speak-amount';

/**
 * A formatted amount string, with the masked and missing glyphs replaced by spoken labels for assistive
 * technology: the glyphs are `aria-hidden` and a visually hidden label from `UI_AMOUNT_LABELS` is read instead.
 *
 * @example
 * <ui-amount-text [text]="formatEur(total)" />
 */
@Component({
  selector: 'ui-amount-text',
  template: `@for (segment of segments(); track $index) {
    @if (segment.kind === 'text') {
      <ng-container>{{ segment.text }}</ng-container>
    } @else {
      <span aria-hidden="true">{{ segment.text }}</span
      ><span class="sr-only">{{ labels()[segment.kind] }}</span>
    }
  }`,
})
export class UiAmountText {
  readonly text = input.required<string>();

  protected readonly labels = inject(UI_AMOUNT_LABELS);

  protected readonly segments = computed(() => amountSegments(this.text()));
}
