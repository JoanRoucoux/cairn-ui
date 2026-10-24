import { NgTemplateOutlet } from '@angular/common';
import { Component, booleanAttribute, computed, input, model, numberAttribute } from '@angular/core';

import { UiAmountText } from '@joanroucoux/cairn-ui/amount';

const toHeadingLevel = (value: unknown): number => Math.min(6, Math.max(2, Math.round(numberAttribute(value, 2))));

/**
 * Header of a card on a phone: the name, its meta underneath, the projected total on the right.
 *
 * With `collapsible` the header is a button inside the heading, with a chevron that turns when the
 * group is folded and a press scale. `expanded` is a model: the page keeps the fold memory and hides
 * the card body itself. `toggleDisabled` keeps the button focusable and announced, but a click
 * changes nothing (a filter holds the group open). `controls` is the id of the body it folds.
 *
 * @example
 * <ui-group-header name="Northwind PEA" meta="PEA · 3 holdings" collapsible [(expanded)]="open">
 *   <ui-amount [value]="total" />
 * </ui-group-header>
 */
@Component({
  selector: 'ui-group-header',
  imports: [NgTemplateOutlet, UiAmountText],
  host: { class: 'block' },
  template: `
    <ng-template #total><ng-content /></ng-template>
    @if (collapsible()) {
      <h2 class="m-0 font-normal" [attr.aria-level]="ariaLevel()">
        <button
          class="rounded-control flex min-h-11 w-full items-end justify-between gap-3 px-1 pt-3 text-left transition-transform [transition-duration:var(--duration-press)] ease-out not-aria-disabled:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) not-aria-disabled:active:scale-(--press-scale)"
          type="button"
          [attr.aria-controls]="controls() || null"
          [attr.aria-disabled]="toggleDisabled() ? 'true' : null"
          [attr.aria-expanded]="expanded()"
          (click)="toggle()"
        >
          <span class="flex min-w-0 items-center gap-2">
            <svg
              aria-hidden="true"
              class="flex-none stroke-(--muted-foreground) transition-transform duration-(--duration-fast) ease-out"
              fill="none"
              height="20"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.75"
              viewBox="0 0 24 24"
              width="20"
              [class.-rotate-90]="!expanded()"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
            <span class="flex min-w-0 flex-col">
              <span class="text-title font-semibold">{{ name() }}</span>
              @if (meta(); as metaText) {
                <span class="text-label text-(--muted-foreground)"><ui-amount-text [text]="metaText" /></span>
              }
            </span>
          </span>
          <span class="text-title font-semibold whitespace-nowrap tabular-nums">
            <ng-container [ngTemplateOutlet]="total" />
          </span>
        </button>
      </h2>
    } @else {
      <div class="flex min-h-11 w-full items-end justify-between gap-3 px-1 pt-3">
        <div class="flex min-w-0 flex-col">
          <h2 class="text-title m-0 font-semibold" [attr.aria-level]="ariaLevel()">{{ name() }}</h2>
          @if (meta(); as metaText) {
            <span class="text-label text-(--muted-foreground)"><ui-amount-text [text]="metaText" /></span>
          }
        </div>
        <span class="text-title font-semibold whitespace-nowrap tabular-nums">
          <ng-container [ngTemplateOutlet]="total" />
        </span>
      </div>
    }
  `,
})
export class UiGroupHeader {
  readonly name = input.required<string>();
  readonly meta = input<string>();
  readonly collapsible = input(false, { transform: booleanAttribute });
  readonly expanded = model(true);
  readonly toggleDisabled = input(false, { transform: booleanAttribute });
  readonly controls = input<string>();
  /** Heading level, 2 to 6. The element stays an `h2` and `aria-level` carries any other level. */
  readonly headingLevel = input<number, unknown>(2, { transform: toHeadingLevel });

  protected readonly ariaLevel = computed(() => (this.headingLevel() === 2 ? null : this.headingLevel()));

  protected toggle(): void {
    if (!this.toggleDisabled()) {
      this.expanded.update((expanded) => !expanded);
    }
  }
}
