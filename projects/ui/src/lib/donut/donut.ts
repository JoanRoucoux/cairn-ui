import { Component, computed, input, output, signal } from '@angular/core';

import { positionSlices } from './internal/donut-geometry';
import { type DonutSlice, type Ramp, type RankedSlice, rankSlices, shareSlices } from './internal/donut-slices';

export type { DonutSlice };

const identityValue = (value: number): string => `${value}`;
const identityShare = (share: number): string => `${Math.round(share * 100)}%`;

const ACTIVE_SCALE = 1.08;

const ROW_CLASSES =
  'flex w-full items-center gap-3 min-h-12 px-2 rounded-control text-left transition-colors duration-(--duration-fast) ease-out hover:bg-(--glow) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)';

const RAMP_FILL_CLASSES: Record<Ramp, string> = {
  1: 'fill-(--ramp-1)',
  2: 'fill-(--ramp-2)',
  3: 'fill-(--ramp-3)',
  4: 'fill-(--ramp-4)',
  5: 'fill-(--ramp-5)',
  6: 'fill-(--ramp-6)',
};

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
      <svg class="block h-full w-full" role="img" viewBox="0 0 200 200" [attr.aria-label]="ariaLabel()">
        @for (slice of positioned(); track slice.id) {
          <g class="transition-transform duration-(--duration-fast) ease-out" [style.transform]="arcTransform(slice)">
            <path
              stroke-width="1"
              [attr.d]="slice.path"
              [class]="pathClasses(slice)"
              (click)="select(slice)"
              (pointerenter)="highlight(slice.id)"
              (pointerleave)="clearHighlight(slice.id)"
            />
          </g>
        }
      </svg>

      @if (active(); as slice) {
        <div
          class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center"
          data-testid="donut-centre"
        >
          <span class="text-caption max-w-full truncate text-(--muted-foreground)">{{ slice.label }}</span>
          <span class="text-title font-semibold">{{ shareFormat()(slice.share) }}</span>
          <span class="text-caption">{{ valueFormat()(slice.value) }}</span>
        </div>
      }
    </div>

    <div class="flex min-w-0 flex-1 flex-col">
      @for (slice of ranked(); track slice.id) {
        <button
          type="button"
          [class]="rowClasses(slice)"
          (blur)="clearHighlight(slice.id)"
          (click)="select(slice)"
          (focus)="highlight(slice.id)"
          (pointerenter)="highlight(slice.id)"
          (pointerleave)="clearHighlight(slice.id)"
        >
          <span [class]="dotClasses(slice)"></span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="text-body truncate font-medium">{{ slice.label }}</span>
            <span class="text-caption truncate text-(--muted-foreground)">{{ subLabel(slice) }}</span>
          </span>
          <span class="flex flex-none flex-col items-end whitespace-nowrap">
            <span class="text-body font-medium">{{ shareFormat()(slice.share) }}</span>
            <span class="text-caption text-(--muted-foreground)">{{ valueFormat()(slice.value) }}</span>
          </span>
        </button>
      }
    </div>
  `,
  host: {
    class: 'flex flex-col items-center gap-6 sm:flex-row sm:items-center',
  },
})
export class UiDonut {
  readonly slices = input.required<DonutSlice[]>();
  readonly label = input.required<string>();
  readonly othersLabel = input.required<string>();
  readonly valueFormat = input<(value: number) => string>(identityValue);
  readonly shareFormat = input<(share: number) => string>(identityShare);

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

  protected pathClasses(slice: RankedSlice): string {
    return `cursor-pointer stroke-(--card) ${RAMP_FILL_CLASSES[slice.ramp]}`;
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

  protected arcTransform(slice: RankedSlice): string {
    const scale = this.isActive(slice) ? ACTIVE_SCALE : 1;

    return `translate(100px, 100px) scale(${scale})`;
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

  protected select(slice: RankedSlice): void {
    this.activeId.set(slice.id);
    this.sliceSelect.emit(slice.id);
  }
}
