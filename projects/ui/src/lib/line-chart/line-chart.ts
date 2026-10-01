import {
  Component,
  DestroyRef,
  type ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { axisTicks, isCoreTick } from './internal/chart-axis';
import { navigateIndex, nearestPointIndex } from './internal/chart-interaction';
import {
  type AxisTicks,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  START_LABEL_HEIGHT,
  deltaTone,
  identityDelta,
  identityTime,
  identityValue,
  parseAxisTicks,
  plotHeightFor,
  plotPaddingFor,
  startLabelBaseline,
  tooltipClassesFor,
  tooltipPlacement,
} from './internal/chart-layout';
import { type ChartGeometry, type ChartPoint, type PlottedPoint, buildGeometry } from './internal/chart-scale';
import { placeStartLabel } from './internal/start-label';
import { TRANSITION_DURATION, easeOutQuint, interpolateLine, prefersReducedMotion } from './internal/transition';
import { wideViewport } from './internal/viewport';

export type { AxisTicks, ChartPoint };
export type { TooltipSize } from './internal/chart-layout';

type PlotRef = ElementRef<SVGSVGElement>;

/**
 * Value over time: a monotone curve with a dashed line at the starting value and a tooltip.
 *
 * @example
 * <ui-line-chart [points]="points" label="Net worth over one month" startLabel="Since" [valueFormat]="formatEur" />
 */
@Component({
  selector: 'ui-line-chart',
  template: `
    <div class="relative h-full">
      <svg
        #svgRef
        class="block h-full w-full touch-pan-y overflow-visible"
        role="img"
        [attr.aria-label]="label()"
        [attr.height]="effectiveHeight()"
        [attr.tabindex]="sparkline() ? null : 0"
        [attr.viewBox]="'0 0 ' + effectiveWidth() + ' ' + effectiveHeight()"
        [attr.width]="effectiveWidth()"
        (keydown)="onKeydown($event)"
        (pointerleave)="onPointerLeave()"
        (pointermove)="onPointerMove($event)"
      >
        @if (geometry(); as geometry) {
          <path
            class="stroke-(--foreground)"
            data-chart-line
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
            [attr.d]="displayLine()"
            [attr.stroke-width]="sparkline() ? 1.5 : 2"
          />

          @if (!sparkline()) {
            <line
              class="stroke-(--border)"
              data-chart-start-line
              stroke-dasharray="3 4"
              stroke-width="1"
              x1="0"
              [attr.x2]="effectiveWidth()"
              [attr.y1]="geometry.start.y"
              [attr.y2]="geometry.start.y"
            />

            @if (startLabelInfo(); as info) {
              <text
                class="text-caption fill-(--subtle-foreground) tabular-nums"
                data-chart-start-label
                [attr.text-anchor]="info.placement.anchor"
                [attr.x]="info.placement.x"
                [attr.y]="info.placement.y"
              >
                {{ info.label }}
              </text>
            }

            <circle
              class="fill-(--foreground) stroke-(--card) [paint-order:stroke]"
              data-chart-end
              r="4"
              stroke-width="6"
              [attr.cx]="geometry.end.x"
              [attr.cy]="geometry.end.y"
            />

            @for (
              tick of ticks();
              track tick.t;
              let index = $index;
              let count = $count;
              let first = $first;
              let last = $last
            ) {
              <text
                class="text-caption fill-(--subtle-foreground) tabular-nums"
                data-chart-axis-tick
                [attr.text-anchor]="first ? 'start' : last ? 'end' : 'middle'"
                [attr.x]="tick.x"
                [attr.y]="effectiveHeight() - 4"
                [class.hidden]="axisTicks() === 3 && !isCoreTick(index, count)"
                [class.max-sm:hidden]="axisTicks() === 'auto' && !isCoreTick(index, count)"
              >
                {{ axisFormat()(tick.t) }}
              </text>
            }

            @if (active(); as point) {
              <line
                class="stroke-(--border)"
                data-chart-crosshair
                stroke-width="1"
                y1="0"
                [attr.x1]="point.x"
                [attr.x2]="point.x"
                [attr.y2]="plotHeight()"
              />
              <circle
                class="fill-(--foreground) stroke-(--card) [paint-order:stroke]"
                data-chart-active
                r="5"
                stroke-width="6"
                [attr.cx]="point.x"
                [attr.cy]="point.y"
              />
            }
          }
        }
      </svg>

      @if (active(); as point) {
        <div
          class="rounded-container pointer-events-none absolute bg-(--elevated) py-2 whitespace-nowrap [font-variant-numeric:var(--numeric)] shadow-[0_4px_16px_rgb(0_0_0/0.12),inset_0_0_0_1px_var(--border)]"
          data-testid="chart-tooltip"
          role="status"
          [class]="tooltipClasses().box"
          [style]="tooltipStyle(point)"
        >
          <p class="font-medium text-(--foreground)" [class]="tooltipClasses().value">
            {{ tooltipFormat()?.(point) ?? valueFormat()(point.v) }}
          </p>
          @if (tooltipDelta()) {
            <p data-chart-delta [class]="deltaClasses(point)">{{ deltaFormat()(deltaFor(point)) }}</p>
          }
          <p class="text-caption text-(--subtle-foreground)" data-chart-date>{{ timeFormat()(point.t) }}</p>
        </div>
      }
      @if (points().length > 0) {
        <div class="sr-only">
          <table>
            <caption [textContent]="label()"></caption>
            <thead>
              <tr>
                <th scope="col">{{ timeColumnLabel() }}</th>
                <th scope="col">{{ valueColumnLabel() }}</th>
              </tr>
            </thead>
            <tbody>
              @for (point of points(); track point.t) {
                <tr>
                  <td>{{ timeFormat()(point.t) }}</td>
                  <td>{{ valueFormat()(point.v) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  host: {
    class: 'block h-full',
  },
})
export class UiLineChart {
  readonly points = input.required<ChartPoint[]>();
  readonly label = input.required<string>();
  readonly valueFormat = input<(value: number) => string>(identityValue);
  readonly tooltipFormat = input<(point: ChartPoint) => string>();
  readonly deltaFormat = input<(delta: number) => string>(identityDelta);
  readonly timeFormat = input<(time: number) => string>(identityTime);
  readonly axisFormat = input<(time: number) => string>(identityTime);
  readonly startLabel = input('');
  readonly timeColumnLabel = input('Time');
  readonly valueColumnLabel = input('Value');
  readonly sparkline = input(false, { transform: booleanAttribute });
  readonly tooltip = input<'compact' | 'large' | 'auto'>('compact');
  readonly tooltipDelta = input(true, { transform: booleanAttribute });
  readonly axisGap = input<number | 'auto'>(12);
  readonly axisTicks = input<AxisTicks, AxisTicks | string>('auto', { transform: parseAxisTicks });

  #destroyRef = inject(DestroyRef);
  #wide = wideViewport();
  #frame: number | null = null;
  #hasRenderedOnce = false;
  #previousGeometry: ChartGeometry | null = null;

  protected readonly isCoreTick = isCoreTick;
  protected readonly svgRef = viewChild.required<PlotRef>('svgRef');
  protected readonly activeIndex = signal<number | null>(null);
  protected readonly animatedLine = signal<string | null>(null);
  protected readonly measuredSize = signal<{ width: number; height: number } | null>(null);

  protected readonly effectiveWidth = computed(() => this.measuredSize()?.width ?? DEFAULT_WIDTH);
  protected readonly effectiveHeight = computed(() => this.measuredSize()?.height ?? DEFAULT_HEIGHT);

  protected readonly plotHeight = computed(() =>
    plotHeightFor(this.effectiveHeight(), this.sparkline(), this.axisGap(), this.#wide()),
  );

  protected readonly tooltipStyle = (point: PlottedPoint): string => tooltipPlacement(point.x / this.effectiveWidth());

  protected readonly tooltipClasses = computed(() => tooltipClassesFor(this.tooltip(), this.#wide()));

  protected readonly geometry = computed(() => {
    const plotHeight = this.plotHeight();
    const padding = plotPaddingFor(plotHeight, this.sparkline());

    return buildGeometry(this.points(), this.effectiveWidth(), plotHeight, { x: 0, top: padding, bottom: padding });
  });

  protected readonly displayLine = computed(() => this.animatedLine() ?? this.geometry()!.line);

  protected readonly ticks = computed(() => axisTicks(this.geometry()!.points));

  protected readonly active = computed<PlottedPoint | null>(() => {
    const geometry = this.geometry();
    const index = this.activeIndex();

    return geometry && index !== null ? (geometry.points[index] as PlottedPoint) : null;
  });

  protected readonly startLabelInfo = computed(() => {
    const text = this.startLabel();
    const geometry = this.geometry();

    if (!text || !geometry) {
      return null;
    }

    const label = `${text} ${this.valueFormat()(geometry.points[0]!.v)}`;
    const size = { width: label.length * 0.56 * 12 + 8, height: START_LABEL_HEIGHT };
    const placement = placeStartLabel(
      geometry.points,
      geometry.start.y,
      { width: this.effectiveWidth(), height: this.plotHeight() },
      size,
    );

    return { label, placement: { ...placement, y: startLabelBaseline(placement.y) } };
  });

  #renderRef = afterNextRender(() => this.#observeSize());

  constructor() {
    effect(() => {
      const geometry = this.geometry();
      const previous = this.#previousGeometry;

      if (previous === geometry) {
        return;
      }

      this.#previousGeometry = geometry;
      this.#cancelAnimation();

      if (!this.#hasRenderedOnce) {
        this.#hasRenderedOnce = true;
        return;
      }

      if (!previous || !geometry) {
        this.animatedLine.set(null);
        return;
      }

      if (prefersReducedMotion()) {
        this.animatedLine.set(null);
        return;
      }

      this.#animate(previous, geometry);
    });

    this.#destroyRef.onDestroy(() => this.#cancelAnimation());
  }

  #observeSize(): void {
    this.#destroyRef.onDestroy(() => this.#renderRef.destroy());

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const element = this.svgRef().nativeElement;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const { width, height } = entry.contentRect;

        this.measuredSize.set({ width, height });
      }
    });

    observer.observe(element);
    this.#destroyRef.onDestroy(() => observer.disconnect());
  }

  #cancelAnimation(): void {
    cancelAnimationFrame(this.#frame ?? 0);
    this.#frame = null;
  }

  #animate(from: ChartGeometry, to: ChartGeometry): void {
    if (from.points.length < 2 || to.points.length < 2) {
      this.animatedLine.set(null);
      return;
    }

    const startTime = performance.now();

    const step = (now: number): void => {
      const t = Math.min(1, (now - startTime) / TRANSITION_DURATION);

      this.animatedLine.set(t < 1 ? interpolateLine(from, to, easeOutQuint(t)) : null);
      this.#frame = t < 1 ? requestAnimationFrame(step) : null;
    };

    this.#frame = requestAnimationFrame(step);
  }

  protected deltaFor(point: PlottedPoint): number {
    return point.v - this.points()[0]!.v;
  }

  protected deltaClasses(point: PlottedPoint): string {
    return `${this.tooltipClasses().delta} ${deltaTone(this.deltaFor(point))}`;
  }

  protected onPointerMove(event: PointerEvent): void {
    const geometry = this.geometry();

    if (this.sparkline() || !geometry || geometry.points.length === 0) {
      return;
    }

    const rect = this.svgRef().nativeElement.getBoundingClientRect();
    const ratio = rect.width === 0 ? 1 : this.effectiveWidth() / rect.width;
    const x = (event.clientX - rect.left) * ratio;

    this.activeIndex.set(nearestPointIndex(geometry.points, x));
  }

  protected onPointerLeave(): void {
    this.activeIndex.set(null);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const geometry = this.geometry();

    if (this.sparkline() || !geometry || geometry.points.length === 0) {
      return;
    }

    const navigation = navigateIndex(event.key, this.activeIndex(), geometry.points.length - 1);

    if (!navigation) {
      return;
    }

    if (navigation.preventDefault) {
      event.preventDefault();
    }

    this.activeIndex.set(navigation.index);
  }
}
