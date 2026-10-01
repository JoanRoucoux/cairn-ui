import { Component, Directive, booleanAttribute, computed, input } from '@angular/core';

/** Available fact row sizes. `FactSize` is derived from this tuple. */
export const FACT_SIZES = ['md', 'sm', 'auto'] as const;
export type FactSize = (typeof FACT_SIZES)[number];

/** Colour of the line under a fact value. `stale` flags an out-of-date figure. */
export const FACT_SUB_TONES = ['subtle', 'stale'] as const;
export type FactSubTone = (typeof FACT_SUB_TONES)[number];

const SIZE_CLASSES: Record<FactSize, { row: string; value: string }> = {
  md: { row: 'py-3 [&:not(:first-child)]:shadow-[inset_0_1px_0_var(--hairline)]', value: 'text-body' },
  sm: { row: 'py-2.5', value: 'text-label' },
  auto: {
    row: 'py-3 lg:py-2.5 max-lg:[&:not(:first-child)]:shadow-[inset_0_1px_0_var(--hairline)]',
    value: 'text-body lg:text-label',
  },
};

const SUB_TONE_CLASSES: Record<FactSubTone, string> = {
  subtle: 'text-(--subtle-foreground)',
  stale: 'text-(--stale)',
};

/**
 * The list that holds `div[ui-fact]` rows, as a native description list.
 *
 * @example
 * <dl uiFacts>
 *   <div ui-fact label="Quantity">500</div>
 *   <div ui-fact label="Price" sub="24/09 · Yahoo">28,64 €</div>
 * </dl>
 */
@Directive({
  selector: 'dl[uiFacts]',
  host: { '[class]': 'classes()' },
})
export class UiFacts {
  readonly ruled = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    this.ruled() ? 'm-0 flex flex-col shadow-[inset_0_1px_0_var(--hairline)]' : 'm-0 flex flex-col',
  );
}

/**
 * One fact of a `dl[uiFacts]`: a label on the left, its value on the right, an optional sub-line
 * under the value, and a hairline above every row but the first at the `md` size (the `sm` desktop list is separated by space only). The projected content is the value.
 *
 * @example
 * <div ui-fact label="Price" sub="24/09 · Yahoo" subTone="stale">28,64 €</div>
 */
@Component({
  selector: 'div[ui-fact]',
  template: `
    <dt class="text-label text-(--muted-foreground)">{{ label() }}</dt>
    <dd class="m-0 flex flex-col items-end text-right">
      <span [class]="valueClasses()"><ng-content /></span>
      @if (sub()) {
        <span [class]="subClasses()">{{ sub() }}</span>
      }
    </dd>
  `,
  host: { '[class]': 'classes()' },
})
export class UiFact {
  readonly label = input.required<string>();
  readonly sub = input<string>();
  readonly subTone = input<FactSubTone>('subtle');
  readonly size = input<FactSize>('md');

  protected readonly classes = computed(
    () => `flex items-baseline justify-between gap-4 ${SIZE_CLASSES[this.size()].row}`,
  );
  protected readonly valueClasses = computed(() => `${SIZE_CLASSES[this.size()].value} tabular-nums`);
  protected readonly subClasses = computed(() => `text-caption ${SUB_TONE_CLASSES[this.subTone()]}`);
}
