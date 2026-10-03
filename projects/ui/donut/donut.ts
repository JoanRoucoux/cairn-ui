import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';

import { RADIUS, RING_WIDTH, positionSlices } from './internal/donut-geometry';
import { type DonutSlice, type Ramp, type RankedSlice, rankSlices, shareSlices } from './internal/donut-slices';

export type { DonutSlice };

const identityValue = (value: number): string => `${value}`;
const identityShare = (share: number): string => `${Math.round(share * 100)}%`;

const ROW_CLASSES =
  'flex w-full items-center gap-3 min-h-14 px-2 py-1 [font-variant-numeric:var(--numeric)] rounded-control text-left transition-[scale,background-color] [transition-duration:var(--duration-press),var(--duration-fast)] ease-out hover:bg-(--glow) active:bg-(--soft) active:scale-(--press-scale) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)';

const SLICE_CLASSES =
  'cursor-pointer origin-center [transform-box:view-box] transition-[scale,opacity] duration-(--duration-fast) ease-out';

const RAMP_DOT_CLASSES: Record<Ramp, string> = {
  1: 'bg-(--ramp-1)',
  2: 'bg-(--ramp-2)',
  3: 'bg-(--ramp-3)',
  4: 'bg-(--ramp-4)',
  5: 'bg-(--ramp-5)',
  6: 'bg-(--ramp-6)',
};

/**
 * A ring chart with a legend: slices rank from largest to smallest on a grey ramp, and hovering,
 * focusing or activating a legend row highlights its slice and centres it in the ring.
 *
 * @example
 * <ui-donut [slices]="byAssetClass()" label="Par classe d'actif" othersLabel="Autres" [valueFormat]="formatEur" [shareFormat]="formatShare" (sliceSelect)="goToHoldings($event)" />
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
            [attr.stroke-width]="ringWidth"
            [class]="sliceClasses(slice)"
            [style.stroke]="strokeColor(slice)"
            (click)="select(slice)"
            (pointerenter)="highlight(slice.id)"
            (pointerleave)="clearHighlight(slice.id)"
          />
        }
      </svg>

      @if (active(); as slice) {
        <div
          class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-12 text-center"
          data-testid="donut-centre"
        >
          <span class="text-label max-w-full truncate font-medium whitespace-nowrap text-(--muted-foreground)">{{
            slice.label
          }}</span>
          <span class="text-heading font-semibold tracking-(--tracking-display)">{{ shareFormat()(slice.share) }}</span>
          <span class="text-caption tracking-normal text-(--muted-foreground) [font-variant-numeric:var(--numeric)]">{{
            valueFormat()(slice.value)
          }}</span>
        </div>
      }
    </div>

    <div class="flex w-full min-w-0 flex-1 flex-col sm:w-auto" data-testid="donut-legend">
      @for (slice of ranked(); track slice.id) {
        @if (hrefFor(slice.id); as href) {
          <a
            [attr.href]="href"
            [class]="rowClasses(slice)"
            (blur)="clearHighlight(slice.id)"
            (click)="follow($event, slice)"
            (focus)="highlight(slice.id)"
            (pointerenter)="highlight(slice.id)"
            (pointerleave)="clearHighlight(slice.id)"
          >
            <ng-container *ngTemplateOutlet="rowContent; context: { $implicit: slice }" />
          </a>
        } @else {
          <button
            type="button"
            [class]="rowClasses(slice)"
            (blur)="clearHighlight(slice.id)"
            (click)="select(slice)"
            (focus)="highlight(slice.id)"
            (pointerenter)="highlight(slice.id)"
            (pointerleave)="clearHighlight(slice.id)"
          >
            <ng-container *ngTemplateOutlet="rowContent; context: { $implicit: slice }" />
          </button>
        }
      }
    </div>

    <ng-template #rowContent let-slice>
      <span [class]="dotClasses(slice)"></span>
      <span class="flex min-w-0 flex-1 flex-col">
        <span class="text-body truncate font-medium">{{ slice.label }}</span>
        <span class="text-caption truncate tracking-(--tracking-caption) text-(--subtle-foreground)">{{
          subLabel(slice)
        }}</span>
      </span>
      <span class="flex flex-none flex-col items-end whitespace-nowrap">
        <span class="text-body font-medium">{{ shareFormat()(slice.share) }}</span>
        <span class="text-caption tracking-normal text-(--muted-foreground)">{{ valueFormat()(slice.value) }}</span>
      </span>
    </ng-template>
  `,
  imports: [NgTemplateOutlet],
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

  protected readonly activeId = signal<string | null>(null);

  protected readonly ranked = computed(() => rankSlices(this.slices(), this.othersLabel()));
  protected readonly positioned = computed(() => positionSlices(this.ranked()));

  protected readonly active = computed<RankedSlice | null>(() => {
    const ranked = this.ranked();
    const id = this.activeId();

    return ranked.find((slice) => slice.id === id) ?? ranked[0] ?? null;
  });

  protected readonly ariaLabel = computed(() => {
    const detail = shareSlices(this.slices())
      .map((slice) => `${slice.label} ${this.shareFormat()(slice.share)}`)
      .join(', ');

    return detail ? `${this.label()} : ${detail}` : this.label();
  });

  protected readonly radius = RADIUS;
  protected readonly ringWidth = RING_WIDTH;

  protected strokeColor(slice: RankedSlice): string {
    return `var(--ramp-${slice.ramp})`;
  }

  protected sliceClasses(slice: RankedSlice): string {
    const id = this.activeId();
    if (id === null) {
      return SLICE_CLASSES;
    }

    return `${SLICE_CLASSES} ${id === slice.id ? 'scale-104 motion-reduce:scale-100' : 'opacity-50'}`;
  }

  protected dotClasses(slice: RankedSlice): string {
    return `size-3 flex-none rounded-pill shadow-[inset_0_0_0_1px_var(--border)] ${RAMP_DOT_CLASSES[slice.ramp]}`;
  }

  protected rowClasses(slice: RankedSlice): string {
    return `${ROW_CLASSES}${this.isActive(slice) ? ' bg-(--soft)' : ''}`;
  }

  protected subLabel(slice: RankedSlice): string {
    return slice.members.length > 0 ? slice.members.join(', ') : (slice.sublabel ?? '');
  }

  protected isActive(slice: RankedSlice): boolean {
    return this.active()?.id === slice.id;
  }

  protected highlight(id: string): void {
    this.activeId.set(id);
  }

  protected clearHighlight(id: string): void {
    if (this.activeId() === id) {
      this.activeId.set(null);
    }
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
    this.activeId.set(slice.id);
    this.sliceSelect.emit(slice.id);
  }
}
