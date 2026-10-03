import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { injectReducedMotion } from '@joanroucoux/cairn-ui/motion';

import { axisTicks, tickLabels } from './internal/chart-axis';
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
import { observeSize } from './internal/observe-size';
import { placeStartLabel } from './internal/start-label';
import { ShapeMotion, durationFrom } from './internal/transition';
import { wideViewport } from './internal/viewport';

export type { AxisTicks, ChartPoint };
export type { TooltipSize } from './internal/chart-layout';

type PlotRef = ElementRef<SVGSVGElement>;
type LineRef = ElementRef<SVGPathElement>;
type EndRef = ElementRef<SVGCircleElement>;

/**
 * Value over time: a monotone curve with a dashed line at the starting value and a tooltip.
 *
 * Axis labels are never repeated: a tick whose `axisFormat` text equals the previous drawn label is
 * not rendered, so only the last edge label can drop.
 *
 * A new series animates from the drawn curve. With `rangeKey` bound, only a series that comes with
 * a new key does: a new series under the same key (a reload) is drawn at once. The key may change
 * before its series arrives.
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
        @if (shown(); as shape) {
          <path
            #lineRef
            class="stroke-(--foreground)"
            data-chart-line
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
            [attr.d]="shape.line"
            [attr.stroke-width]="sparkline() ? 1.5 : 2"
          />

          @if (!sparkline()) {
            <line
              class="stroke-(--border) transition-opacity ease-(--ease-out)"
              data-chart-start-line
              stroke-dasharray="3 4"
              stroke-width="1"
              x1="0"
              [attr.x2]="effectiveWidth()"
              [attr.y1]="shape.start.y"
              [attr.y2]="shape.start.y"
              [class]="startFade()"
            />

            @if (startLabelInfo(); as info) {
              <text
                class="text-caption fill-(--subtle-foreground) tabular-nums transition-opacity ease-(--ease-out)"
                data-chart-start-label
                [attr.text-anchor]="info.placement.anchor"
                [attr.x]="info.placement.x"
                [attr.y]="info.placement.y"
                [class]="startFade()"
              >
                {{ info.label }}
              </text>
            }

            <circle
              #endRef
              class="fill-(--foreground) stroke-(--card) [paint-order:stroke]"
              data-chart-end
              r="4"
              stroke-width="6"
              [attr.cx]="shape.end.x"
              [attr.cy]="shape.end.y"
            />

            @for (tick of ticks(); track tick.t; let index = $index; let first = $first; let last = $last) {
              @if (tickTexts()[index]; as label) {
                <text
                  class="text-caption fill-(--subtle-foreground) tabular-nums"
                  data-chart-axis-tick
                  [attr.text-anchor]="first ? 'start' : last ? 'end' : 'middle'"
                  [attr.x]="tick.x"
                  [attr.y]="effectiveHeight() - 4"
                  [class]="label.classes"
                >
                  {{ label.text }}
                </text>
              }
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
  readonly rangeKey = input<string | null>(null);

  #destroyRef = inject(DestroyRef);
  #host = inject<ElementRef<HTMLElement>>(ElementRef);
  #wide = wideViewport();
  #reducedMotion = injectReducedMotion();
  #motion = new ShapeMotion({
    hold: (geometry) => {
      this.held.set(geometry);
      this.activeIndex.update((index) => (geometry ? null : index));
    },
    draw: (line, end) => {
      this.lineRef()?.nativeElement.setAttribute('d', line);
      this.endRef()?.nativeElement.setAttribute('cx', String(end.x));
      this.endRef()?.nativeElement.setAttribute('cy', String(end.y));
    },
  });

  protected readonly svgRef = viewChild.required<PlotRef>('svgRef');
  protected readonly lineRef = viewChild<LineRef>('lineRef');
  protected readonly endRef = viewChild<EndRef>('endRef');
  protected readonly activeIndex = signal<number | null>(null);
  protected readonly held = signal<ChartGeometry | null>(null);
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

  protected readonly shown = computed(() => this.held() ?? this.geometry());

  protected readonly startFade = computed(() =>
    this.held() ? 'opacity-0 duration-(--duration-exit)' : 'duration-(--duration-fast)',
  );

  protected readonly ticks = computed(() => axisTicks(this.geometry()!.points));

  protected readonly tickTexts = computed(() => tickLabels(this.ticks(), this.axisFormat(), this.axisTicks()));

  protected readonly active = computed<PlottedPoint | null>(() => {
    const geometry = this.geometry();
    const index = this.activeIndex();

    return geometry && index !== null && !this.held() ? (geometry.points[index] as PlottedPoint) : null;
  });

  protected readonly startLabelInfo = computed(() => {
    const text = this.startLabel();
    const geometry = this.shown();

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

  #renderRef = afterNextRender(() => {
    this.#destroyRef.onDestroy(() => this.#renderRef.destroy());
    observeSize(this.svgRef().nativeElement, this.#destroyRef, (size) => this.measuredSize.set(size));
  });

  constructor() {
    effect(() => {
      const points = this.points();
      const geometry = this.geometry();
      const reduced = this.#reducedMotion();

      untracked(() =>
        this.#motion.follow(points, geometry, {
          reduced,
          rangeKey: this.rangeKey(),
          duration: () => durationFrom(getComputedStyle(this.#host.nativeElement).getPropertyValue('--duration-base')),
        }),
      );
    });

    this.#destroyRef.onDestroy(() => this.#motion.stop());
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
