import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';

import { UI_AMOUNT_LABELS, UiAmountText, speakAmount } from '@joanroucoux/cairn-ui/amount';

import { ACTIVE_RING_WIDTH, RADIUS, RING_WIDTH, positionSlices } from './internal/donut-geometry';
import { type DonutSlice, type Ramp, type RankedSlice, rankSlices, shareSlices } from './internal/donut-slices';

export type { DonutSlice };

const identityValue = (value: number): string => `${value}`;
const identityShare = (share: number): string => `${Math.round(share * 100)}%`;

const ROW_CLASSES =
  'flex w-full items-center gap-3 min-h-14 px-2 py-1 [font-variant-numeric:var(--numeric)] rounded-control text-left transition-[scale,background-color] [transition-duration:var(--duration-press),var(--duration-fast)] ease-out hover:bg-(--glow) active:bg-(--soft) active:scale-(--press-scale) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)';

const SLICE_CLASSES =
  'cursor-pointer transition-[stroke-width] duration-(--duration-press) ease-out motion-reduce:transition-none';

const RAMP_DOT_CLASSES: Record<Ramp, string> = {
  1: 'bg-(--ramp-1)',
  2: 'bg-(--ramp-2)',
  3: 'bg-(--ramp-3)',
  4: 'bg-(--ramp-4)',
  5: 'bg-(--ramp-5)',
  6: 'bg-(--ramp-6)',
};

/**
 * A ring chart with a legend: slices rank from largest to smallest and the largest is selected first;
 * hovering, focusing or activating a legend row, or hovering or tapping its arc, selects it, and the
 * selection stays when the pointer or the focus leaves. Only a legend row emits `sliceSelect`.
 *
 * @example
 * <ui-donut [slices]="byAssetClass()" label="By asset class" othersLabel="Other" [valueFormat]="formatEur" [shareFormat]="formatShare" (sliceSelect)="goToHoldings($event)" />
 */
@Component({
  selector: 'ui-donut',
  template: `
    <div class="relative size-[232px] flex-none sm:size-60">
      <svg class="block h-full w-full -rotate-90" role="img" viewBox="0 0 200 200" [attr.aria-label]="ariaLabel()">
        <circle
          class="stroke-(--muted)"
          cx="100"
          cy="100"
          fill="none"
          [attr.r]="radius"
          [attr.stroke-width]="ringWidth"
        />
        @for (slice of positioned(); track slice.id) {
          <circle
            cx="100"
            cy="100"
            data-slice
            fill="none"
            [attr.r]="radius"
            [attr.stroke-dasharray]="slice.dash"
            [attr.stroke-dashoffset]="slice.offset"
            [class]="sliceClasses"
            [style.stroke]="strokeColor(slice)"
            [style.stroke-width.px]="sliceWidth(slice)"
            (click)="choose(slice.id)"
            (pointerenter)="choose(slice.id)"
          />
        }
      </svg>

      @if (selected(); as slice) {
        <div
          class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-12 text-center"
          data-testid="donut-centre"
        >
          <span class="text-label max-w-full truncate font-medium whitespace-nowrap text-(--muted-foreground)">{{
            slice.label
          }}</span>
          <span class="text-heading font-semibold tracking-(--tracking-display)">{{ shareFormat()(slice.share) }}</span>
          <span class="text-caption tracking-normal text-(--muted-foreground) [font-variant-numeric:var(--numeric)]"
            ><ui-amount-text [text]="valueFormat()(slice.value)"
          /></span>
        </div>
      }
    </div>

    <div class="flex w-full min-w-0 flex-1 flex-col sm:w-auto" data-testid="donut-legend">
      @for (slice of ranked(); track slice.id) {
        @if (hrefFor(slice.id); as href) {
          <a
            [attr.href]="href"
            [class]="rowClasses(slice)"
            (click)="follow($event, slice)"
            (focus)="choose(slice.id)"
            (pointerenter)="choose(slice.id)"
          >
            <ng-container *ngTemplateOutlet="rowContent; context: { $implicit: slice }" />
          </a>
        } @else {
          <button
            type="button"
            [class]="rowClasses(slice)"
            (click)="select(slice)"
            (focus)="choose(slice.id)"
            (pointerenter)="choose(slice.id)"
          >
            <ng-container *ngTemplateOutlet="rowContent; context: { $implicit: slice }" />
          </button>
        }
      }
    </div>

    <ng-template #rowContent let-slice>
      <span [class]="dotClasses(slice)"></span>
      <span class="flex min-w-0 flex-1 flex-col">
        <span class="text-body min-w-0 font-medium text-pretty break-words">{{ slice.label }}</span>
        <span
          class="text-caption min-w-0 tracking-(--tracking-caption) text-pretty break-words text-(--subtle-foreground)"
          >{{ subLabel(slice) }}</span
        >
      </span>
      <span class="flex flex-none flex-col items-end whitespace-nowrap">
        <span class="text-body font-medium">{{ shareFormat()(slice.share) }}</span>
        <span class="text-caption tracking-normal text-(--muted-foreground)"
          ><ui-amount-text [text]="valueFormat()(slice.value)"
        /></span>
      </span>
    </ng-template>
  `,
  imports: [NgTemplateOutlet, UiAmountText],
  host: {
    class: 'flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-8',
  },
})
export class UiDonut {
  readonly slices = input.required<DonutSlice[]>();
  readonly label = input.required<string>();
  readonly othersLabel = input.required<string>();
  readonly valueFormat = input<(value: number) => string>(identityValue);
  readonly shareFormat = input<(share: number) => string>(identityShare);

  readonly legendHref = input<((id: string) => string | null) | undefined>();

  readonly sliceSelect = output<DonutSlice['id']>();

  readonly #labels = inject(UI_AMOUNT_LABELS);

  protected readonly selectedId = signal<string | null>(null);

  protected readonly ranked = computed(() => rankSlices(this.slices(), this.othersLabel()));
  protected readonly positioned = computed(() => positionSlices(this.ranked()));

  protected readonly selected = computed<RankedSlice | null>(() => {
    const ranked = this.ranked();
    const id = this.selectedId();

    return ranked.find((slice) => slice.id === id) ?? ranked[0] ?? null;
  });

  protected readonly ariaLabel = computed(() => {
    const detail = shareSlices(this.slices())
      .map((slice) => `${slice.label} ${speakAmount(this.shareFormat()(slice.share), this.#labels())}`)
      .join(', ');

    return detail ? `${this.label()}: ${detail}` : this.label();
  });

  protected readonly radius = RADIUS;
  protected readonly ringWidth = RING_WIDTH;

  protected strokeColor(slice: RankedSlice): string {
    return `var(--ramp-${slice.ramp})`;
  }

  protected readonly sliceClasses = SLICE_CLASSES;

  protected sliceWidth(slice: RankedSlice): number {
    return this.isSelected(slice) ? ACTIVE_RING_WIDTH : RING_WIDTH;
  }

  protected dotClasses(slice: RankedSlice): string {
    return `size-3 flex-none rounded-pill forced-colors:forced-color-adjust-none shadow-[inset_0_0_0_1px_var(--border)] ${RAMP_DOT_CLASSES[slice.ramp]}`;
  }

  protected rowClasses(slice: RankedSlice): string {
    return `${ROW_CLASSES}${this.isSelected(slice) ? ` bg-(--soft) shadow-[inset_0_0_0_1px_var(--control-border)] forced-colors:forced-color-adjust-none forced-colors:bg-[color:Highlight]! forced-colors:text-[color:HighlightText]! forced-colors:[&_*]:text-[color:HighlightText] forced-colors:focus-visible:outline-[color:HighlightText]` : ''}`;
  }

  protected subLabel(slice: RankedSlice): string {
    return slice.members.length > 0 ? slice.members.join(', ') : (slice.sublabel ?? '');
  }

  protected isSelected(slice: RankedSlice): boolean {
    return this.selected()?.id === slice.id;
  }

  protected choose(id: string): void {
    this.selectedId.set(id);
  }

  protected hrefFor(id: string): string | null {
    return this.legendHref()?.(id) ?? null;
  }

  protected follow(event: MouseEvent, slice: RankedSlice): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    this.select(slice);
  }

  protected select(slice: RankedSlice): void {
    this.selectedId.set(slice.id);
    this.sliceSelect.emit(slice.id);
  }
}
