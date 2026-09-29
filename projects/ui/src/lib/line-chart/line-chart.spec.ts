import { TestBed } from '@angular/core/testing';

import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { type ChartPoint, UiLineChart } from './line-chart';

const points: ChartPoint[] = [
  { t: Date.UTC(2026, 7, 25), v: 161389.51 },
  { t: Date.UTC(2026, 8, 10), v: 163000 },
  { t: Date.UTC(2026, 8, 25), v: 164294.28 },
];
const fmt = (v: number): string => `${v.toFixed(2)} EUR`;
const delta = (d: number): string => `${d > 0 ? '+' : ''}${d.toFixed(2)} EUR`;
const time = (t: number): string => new Date(t).toISOString().slice(0, 10);

describe('UiLineChart', () => {
  it('draws the curve, the dashed start line and the end dot, with no area and no gridline', async () => {
    const { fixture } = await render(
      `<ui-line-chart label="Net worth over one month" startLabel="Depart" [points]="points" [valueFormat]="fmt" [deltaFormat]="delta" />`,
      { imports: [UiLineChart], componentProperties: { points, fmt, delta } },
    );
    const svg = fixture.nativeElement.querySelector('svg');

    expect(screen.getByRole('img', { name: 'Net worth over one month' })).toBeInTheDocument();
    expect(svg.querySelector('[data-chart-line]')).toHaveAttribute('stroke-width', '2');
    expect(svg.querySelector('[data-chart-start-line]')).toHaveAttribute('stroke-dasharray');
    expect(svg.querySelector('[data-chart-end]')).toBeInTheDocument();
    expect(svg.querySelectorAll('path').length).toBe(1);
    expect(svg.querySelector('[data-chart-gridline]')).toBeNull();
  });

  it('labels the starting value with the app formatter', async () => {
    await render(`<ui-line-chart label="x" startLabel="Depart" [points]="points" [valueFormat]="fmt" />`, {
      imports: [UiLineChart],
      componentProperties: { points, fmt },
    });

    expect(screen.getByText('Depart 161389.51 EUR')).toBeInTheDocument();
  });

  it('shows the value, the change since the start and the date for the key-selected point', async () => {
    await render(
      `<ui-line-chart label="x" [points]="points" [valueFormat]="fmt" [deltaFormat]="delta" [timeFormat]="time" />`,
      { imports: [UiLineChart], componentProperties: { points, fmt, delta, time } },
    );

    screen.getByRole('img').focus();
    await userEvent.keyboard('{End}');

    const tooltip = screen.getByTestId('chart-tooltip');
    expect(tooltip).toHaveTextContent('164294.28 EUR');
    expect(tooltip).toHaveTextContent('+2904.77 EUR');
    expect(tooltip).toHaveTextContent('2026-09-25');
  });

  it('lets vertical scrolling through and captures horizontal drags', async () => {
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points },
    });

    expect(fixture.nativeElement.querySelector('svg')).toHaveClass('touch-pan-y');
  });

  it('keeps a screen-reader table of every point', async () => {
    await render(
      `<ui-line-chart label="x" timeColumnLabel="Date" valueColumnLabel="Value" [points]="points" [valueFormat]="fmt" />`,
      { imports: [UiLineChart], componentProperties: { points, fmt } },
    );

    expect(screen.getAllByRole('row')).toHaveLength(points.length + 1);
  });

  it('renders nothing to draw for an empty series, still names the chart and offers no table', async () => {
    const { fixture } = await render(`<ui-line-chart label="Empty" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: [] as ChartPoint[] },
    });

    expect(fixture.nativeElement.querySelector('[data-chart-line]')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Empty' })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('ignores a key press and a pointer move on an empty series', async () => {
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: [] as ChartPoint[] },
    });
    const svg = fixture.nativeElement.querySelector('svg') as Element;

    fireEvent.keyDown(svg, { key: 'ArrowRight' });
    fireEvent.pointerMove(svg, { clientX: 0, clientY: 0 });

    expect(screen.queryByTestId('chart-tooltip')).not.toBeInTheDocument();
  });

  it('shows a crosshair and a tooltip on pointer move over the plot area', async () => {
    const { fixture } = await render(
      `<ui-line-chart label="x" [points]="points" [valueFormat]="fmt" [timeFormat]="time" />`,
      { imports: [UiLineChart], componentProperties: { points, fmt, time } },
    );
    const svg = fixture.nativeElement.querySelector('svg') as Element;

    fireEvent.pointerMove(svg, { clientX: 0, clientY: 0 });

    expect(fixture.nativeElement.querySelector('[data-chart-crosshair]')).toBeInTheDocument();
    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('161389.51 EUR');
  });

  it('hides the tooltip on pointer leave', async () => {
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points },
    });
    const svg = fixture.nativeElement.querySelector('svg') as Element;

    fireEvent.pointerMove(svg, { clientX: 0, clientY: 0 });
    fireEvent.pointerLeave(svg);

    expect(screen.queryByTestId('chart-tooltip')).not.toBeInTheDocument();
  });

  it('moves the active point with the arrow keys once the chart has focus', async () => {
    const user = userEvent.setup();
    await render(`<ui-line-chart label="x" [points]="points" [valueFormat]="fmt" />`, {
      imports: [UiLineChart],
      componentProperties: { points, fmt },
    });

    const chart = screen.getByRole('img', { name: 'x' });
    chart.focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('161389.51 EUR');

    await user.keyboard('{ArrowRight}');

    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('163000.00 EUR');

    await user.keyboard('{End}');

    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('164294.28 EUR');

    await user.keyboard('{Home}');

    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('161389.51 EUR');

    await user.keyboard('{Escape}');

    expect(screen.queryByTestId('chart-tooltip')).not.toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');

    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('164294.28 EUR');

    await user.keyboard('{ArrowLeft}');

    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('163000.00 EUR');

    await user.keyboard('{Tab}');

    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('163000.00 EUR');
  });

  it('formats the value and the time as-is when no formatter is given', async () => {
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points },
    });
    const svg = fixture.nativeElement.querySelector('svg') as Element;

    fireEvent.pointerMove(svg, { clientX: 0, clientY: 0 });

    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('161389.51');
  });

  it('scales the pointer position by the plot area actual rendered width', async () => {
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" [valueFormat]="fmt" />`, {
      imports: [UiLineChart],
      componentProperties: { points, fmt },
    });
    const svg = fixture.nativeElement.querySelector('svg') as SVGSVGElement;
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 640 } as DOMRect);

    fireEvent.pointerMove(svg, { clientX: 640, clientY: 0 });

    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('164294.28 EUR');
  });

  it('colors a flat change neutral', async () => {
    const flat: ChartPoint[] = [
      { t: 0, v: 100 },
      { t: 1, v: 100 },
    ];
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" [deltaFormat]="delta" />`, {
      imports: [UiLineChart],
      componentProperties: { points: flat, delta },
    });
    const svg = fixture.nativeElement.querySelector('svg') as Element;

    fireEvent.pointerMove(svg, { clientX: 0, clientY: 0 });

    expect(screen.getByTestId('chart-tooltip').querySelector('[data-chart-delta]')).toHaveClass(
      'text-(--muted-foreground)',
    );
  });

  it('colors a positive change positive and a negative one negative', async () => {
    const falling: ChartPoint[] = [
      { t: 0, v: 200 },
      { t: 1, v: 100 },
    ];
    const user = userEvent.setup();
    await render(`<ui-line-chart label="x" [points]="points" [deltaFormat]="delta" />`, {
      imports: [UiLineChart],
      componentProperties: { points, delta },
    });

    screen.getByRole('img').focus();
    await user.keyboard('{End}');

    expect(screen.getByTestId('chart-tooltip').querySelector('[data-chart-delta]')).toHaveClass('text-(--positive)');

    TestBed.resetTestingModule();
    await render(`<ui-line-chart label="x" [points]="points" [deltaFormat]="delta" />`, {
      imports: [UiLineChart],
      componentProperties: { points: falling, delta },
    });

    screen.getByRole('img').focus();
    await user.keyboard('{End}');

    expect(screen.getByTestId('chart-tooltip').querySelector('[data-chart-delta]')).toHaveClass('text-(--negative)');
  });

  it('anchors the edge axis labels at the start and the end, so they are never clipped', async () => {
    const longSeries: ChartPoint[] = Array.from({ length: 18 }, (_, index) => ({ t: index, v: 100 + index }));
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: longSeries },
    });

    const ticks = fixture.nativeElement.querySelectorAll('[data-chart-axis-tick]');

    expect(ticks).toHaveLength(5);
    expect(ticks[0]).toHaveAttribute('text-anchor', 'start');
    expect(ticks[1]).toHaveAttribute('text-anchor', 'middle');
    expect(ticks[ticks.length - 1]).toHaveAttribute('text-anchor', 'end');
  });

  it('keeps only the first, middle and last axis label visible below the sm breakpoint', async () => {
    const longSeries: ChartPoint[] = Array.from({ length: 18 }, (_, index) => ({ t: index, v: 100 + index }));
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: longSeries },
    });

    const ticks = fixture.nativeElement.querySelectorAll('[data-chart-axis-tick]');
    const hiddenOnMobile = [...ticks].map((tick: Element) => tick.classList.contains('max-sm:hidden'));

    expect(hiddenOnMobile).toEqual([false, true, false, true, false]);
  });

  it('keeps every axis label visible when there are 3 or fewer', async () => {
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points },
    });

    const ticks = fixture.nativeElement.querySelectorAll('[data-chart-axis-tick]');

    expect([...ticks].every((tick: Element) => !tick.classList.contains('max-sm:hidden'))).toBe(true);
  });

  it('draws a flat series and a single point without NaN in the path', async () => {
    const flat: ChartPoint[] = [
      { t: 0, v: 5 },
      { t: 1, v: 5 },
    ];
    const { fixture: flatFixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: flat },
    });
    TestBed.resetTestingModule();
    const { fixture: singleFixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: [{ t: 0, v: 5 }] as ChartPoint[] },
    });

    expect(flatFixture.nativeElement.querySelector('[data-chart-line]')).toHaveAttribute(
      'd',
      expect.not.stringContaining('NaN'),
    );
    expect(singleFixture.nativeElement.querySelector('[data-chart-line]')).toHaveAttribute(
      'd',
      expect.not.stringContaining('NaN'),
    );
  });

  it('never lets the start label cross the curve, moving it away from a crowded right end', async () => {
    const crowded: ChartPoint[] = Array.from({ length: 60 }, (_, index) => ({ t: index, v: index < 55 ? 100 : 500 }));
    const { fixture } = await render(
      `<ui-line-chart label="x" startLabel="Depart" [points]="points" [valueFormat]="fmt" />`,
      { imports: [UiLineChart], componentProperties: { points: crowded, fmt } },
    );

    const label = fixture.nativeElement.querySelector('[data-chart-start-label]');

    expect(label).toBeInTheDocument();
    expect(label).not.toBeNull();
  });

  it('hides the start label but keeps the reference line when startLabel is empty', async () => {
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points },
    });

    expect(fixture.nativeElement.querySelector('[data-chart-start-label]')).not.toBeInTheDocument();
    expect(fixture.nativeElement.querySelector('[data-chart-start-line]')).toBeInTheDocument();
  });

  describe('with a ResizeObserver available', () => {
    let observe: ReturnType<typeof vi.fn>;
    let disconnect: ReturnType<typeof vi.fn>;
    let triggerResize: (size: { width: number; height: number }) => void;
    let triggerEmptyResize: () => void;
    let originalResizeObserver: typeof ResizeObserver | undefined;

    beforeEach(() => {
      observe = vi.fn();
      disconnect = vi.fn();
      originalResizeObserver = globalThis.ResizeObserver;

      class FakeResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          triggerResize = (size) =>
            callback([{ contentRect: size } as ResizeObserverEntry], this as unknown as ResizeObserver);
          triggerEmptyResize = () => callback([], this as unknown as ResizeObserver);
        }

        observe = observe;
        disconnect = disconnect;
        unobserve = vi.fn();
      }

      globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
    });

    afterEach(() => {
      globalThis.ResizeObserver = originalResizeObserver as typeof ResizeObserver;
    });

    it('draws at the container measured pixel size instead of the default viewBox', async () => {
      const { fixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
        imports: [UiLineChart],
        componentProperties: { points },
      });
      fixture.detectChanges();

      expect(observe).toHaveBeenCalled();

      triggerResize({ width: 320, height: 192 });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('svg')).toHaveAttribute('viewBox', '0 0 320 192');
    });

    it('ignores a resize callback with no entry', async () => {
      const { fixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
        imports: [UiLineChart],
        componentProperties: { points },
      });
      fixture.detectChanges();

      triggerEmptyResize();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('svg')).toHaveAttribute('viewBox', '0 0 640 240');
    });

    it('disconnects the observer when the chart is destroyed', async () => {
      const { fixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
        imports: [UiLineChart],
        componentProperties: { points },
      });
      fixture.detectChanges();

      fixture.destroy();

      expect(disconnect).toHaveBeenCalled();
    });
  });
});
