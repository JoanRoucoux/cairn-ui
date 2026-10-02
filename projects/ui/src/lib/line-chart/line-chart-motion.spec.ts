import { type RenderResult, fireEvent, render, screen } from '@testing-library/angular';

import { plotHeightFor, plotPaddingFor } from './internal/chart-layout';
import { type ChartGeometry, buildGeometry } from './internal/chart-scale';
import { type ChartPoint, UiLineChart } from './line-chart';

const rising: ChartPoint[] = [
  { t: 0, v: 100 },
  { t: 1, v: 150 },
  { t: 2, v: 400 },
];
const wavy: ChartPoint[] = [
  { t: 0, v: 300 },
  { t: 1, v: 120 },
  { t: 2, v: 260 },
  { t: 3, v: 180 },
];
const falling: ChartPoint[] = [
  { t: 0, v: 500 },
  { t: 1, v: 20 },
];

const targetOf = (points: ChartPoint[], width = 640, height = 240): ChartGeometry => {
  const plotHeight = plotHeightFor(height, false, 12, false);
  const padding = plotPaddingFor(plotHeight, false);

  return buildGeometry(points, width, plotHeight, { x: 0, top: padding, bottom: padding })!;
};

const vertices = (d: string): number[][] => d.split(' ').map((vertex) => vertex.slice(1).split(',').map(Number));

const template = `<ui-line-chart label="x" startLabel="Départ" [points]="points" [style]="style" />`;

describe('UiLineChart motion', () => {
  let frames: Map<number, FrameRequestCallback>;
  let now: number;
  let reduced: boolean;
  let triggerResize: (size: { width: number; height: number }) => void;
  let originals: {
    raf: typeof requestAnimationFrame;
    caf: typeof cancelAnimationFrame;
    matchMedia: typeof matchMedia | undefined;
    resizeObserver: typeof ResizeObserver | undefined;
  };

  const flushFrame = (time: number): void => {
    const due = [...frames.values()];
    frames.clear();
    due.forEach((frame) => frame(time));
  };

  const mount = async (points: ChartPoint[], style = ''): Promise<RenderResult<unknown>> => {
    const result = await render(template, { imports: [UiLineChart], componentProperties: { points, style } });
    result.fixture.detectChanges();

    return result;
  };

  const line = (container: Element): string => container.querySelector('[data-chart-line]')!.getAttribute('d')!;

  beforeEach(() => {
    frames = new Map();
    now = 1000;
    reduced = false;
    originals = {
      raf: globalThis.requestAnimationFrame,
      caf: globalThis.cancelAnimationFrame,
      matchMedia: globalThis.matchMedia,
      resizeObserver: globalThis.ResizeObserver,
    };

    let id = 0;
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      frames.set(++id, callback);
      return id;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = ((handle: number) => {
      frames.delete(handle);
    }) as typeof cancelAnimationFrame;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    globalThis.matchMedia = ((query: string) => ({
      matches: query.includes('reduce') ? reduced : false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof matchMedia;

    class FakeResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        triggerResize = (size) => callback([{ contentRect: size } as ResizeObserverEntry], this as never);
      }

      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    }

    globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.requestAnimationFrame = originals.raf;
    globalThis.cancelAnimationFrame = originals.caf;
    globalThis.matchMedia = originals.matchMedia as typeof matchMedia;
    globalThis.ResizeObserver = originals.resizeObserver as typeof ResizeObserver;
  });

  describe('on mount and on resize', () => {
    it('draws at the container size from the first paint, before the observer reports it', async () => {
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ width: 320, height: 192 } as DOMRect);
      const { fixture } = await mount(rising);

      expect(fixture.nativeElement.querySelector('svg')).toHaveAttribute('viewBox', '0 0 320 192');
      expect(line(fixture.nativeElement)).toBe(targetOf(rising, 320, 192).line);
    });

    it('draws the first measured size at once, without morphing from the default size', async () => {
      const { fixture } = await mount(rising);

      triggerResize({ width: 320, height: 192 });
      fixture.detectChanges();
      now = 1100;
      flushFrame(1100);
      fixture.detectChanges();

      expect(line(fixture.nativeElement)).toBe(targetOf(rising, 320, 192).line);
    });

    it('follows a later resize at once too, since only a new series animates', async () => {
      const { fixture } = await mount(rising);

      triggerResize({ width: 320, height: 192 });
      fixture.detectChanges();
      triggerResize({ width: 500, height: 200 });
      fixture.detectChanges();
      flushFrame(1100);
      fixture.detectChanges();

      expect(line(fixture.nativeElement)).toBe(targetOf(rising, 500, 200).line);
    });
  });

  describe('on a range change', () => {
    it('keeps the previous shape on screen until the first frame', async () => {
      const { fixture, rerender } = await mount(rising);

      await rerender({ componentProperties: { points: wavy } });
      fixture.detectChanges();

      expect(line(fixture.nativeElement)).toBe(targetOf(rising).line);
    });

    it('writes each frame straight to the path, without a change detection pass', async () => {
      const { fixture, rerender } = await mount(rising);

      await rerender({ componentProperties: { points: wavy } });
      flushFrame(1130);

      const drawn = vertices(line(fixture.nativeElement));
      expect(drawn).toHaveLength(120);
      expect(drawn.flat().some(Number.isNaN)).toBe(false);
    });

    it('restarts a second change from the path on screen, not from the previous target', async () => {
      const { fixture, rerender } = await mount(rising);

      await rerender({ componentProperties: { points: wavy } });
      flushFrame(1100);
      const onScreen = vertices(line(fixture.nativeElement));

      now = 1100;
      await rerender({ componentProperties: { points: falling } });
      flushFrame(1100);
      const restart = vertices(line(fixture.nativeElement));

      expect(restart).toHaveLength(onScreen.length);
      restart.forEach(([x, y], index) => {
        expect(x).toBeCloseTo(onScreen[index]![0]!, 1);
        expect(y).toBeCloseTo(onScreen[index]![1]!, 1);
      });
    });

    it('lands exactly back on the first shape when a change is reverted mid-animation', async () => {
      const { fixture, rerender } = await mount(rising);

      await rerender({ componentProperties: { points: wavy } });
      flushFrame(1100);
      now = 1100;
      await rerender({ componentProperties: { points: [...rising] } });
      flushFrame(1200);
      flushFrame(1360);
      fixture.detectChanges();

      expect(line(fixture.nativeElement)).toBe(targetOf(rising).line);
      expect(fixture.nativeElement.querySelector('[data-chart-end]')).toHaveAttribute(
        'cx',
        String(targetOf(rising).end.x),
      );
      expect(fixture.nativeElement.querySelector('[data-chart-end]')).toHaveAttribute(
        'cy',
        String(targetOf(rising).end.y),
      );
    });

    it('lasts --duration-base and settles on the exact target path', async () => {
      const { fixture, rerender } = await mount(rising, '--duration-base: 400ms');

      await rerender({ componentProperties: { points: wavy, style: '--duration-base: 400ms' } });
      flushFrame(1300);

      expect(line(fixture.nativeElement)).not.toBe(targetOf(wavy).line);

      flushFrame(1400);
      fixture.detectChanges();

      expect(line(fixture.nativeElement)).toBe(targetOf(wavy).line);
    });

    it('lasts 260 ms when the --duration-base token is not set', async () => {
      const { fixture, rerender } = await mount(rising);

      await rerender({ componentProperties: { points: wavy } });
      flushFrame(1250);

      expect(line(fixture.nativeElement)).not.toBe(targetOf(wavy).line);

      flushFrame(1260);
      fixture.detectChanges();

      expect(line(fixture.nativeElement)).toBe(targetOf(wavy).line);
    });

    it('moves the end point along the interpolated path, then onto the new end', async () => {
      const { fixture, rerender } = await mount(rising);
      const end = (): number[] => {
        const circle = fixture.nativeElement.querySelector('[data-chart-end]') as SVGCircleElement;

        return [Number(circle.getAttribute('cx')), Number(circle.getAttribute('cy'))];
      };

      await rerender({ componentProperties: { points: wavy } });
      flushFrame(1050);

      const [x, y] = end();
      const last = vertices(line(fixture.nativeElement)).at(-1)!;
      expect(x).toBeCloseTo(last[0]!, 1);
      expect(y).toBeCloseTo(last[1]!, 1);

      flushFrame(1260);
      fixture.detectChanges();

      expect(end()).toEqual([targetOf(wavy).end.x, targetOf(wavy).end.y]);
    });

    it('fades the start label and the dashed line out at their old place, then back in at the new one', async () => {
      const { fixture, rerender } = await mount(rising);
      const label = (): Element => fixture.nativeElement.querySelector('[data-chart-start-label]');
      const dashed = (): Element => fixture.nativeElement.querySelector('[data-chart-start-line]');

      expect(label()).toHaveClass('transition-opacity', 'ease-(--ease-out)', 'duration-(--duration-fast)');
      expect(label()).not.toHaveClass('opacity-0');

      await rerender({ componentProperties: { points: wavy } });
      fixture.detectChanges();

      for (const element of [label(), dashed()]) {
        expect(element).toHaveClass('opacity-0', 'duration-(--duration-exit)');
      }
      expect(dashed()).toHaveAttribute('y1', String(targetOf(rising).start.y));
      expect(label()).toHaveTextContent('Départ 100');

      flushFrame(1260);
      fixture.detectChanges();

      for (const element of [label(), dashed()]) {
        expect(element).not.toHaveClass('opacity-0');
        expect(element).toHaveClass('transition-opacity', 'duration-(--duration-fast)');
      }
      expect(dashed()).toHaveAttribute('y1', String(targetOf(wavy).start.y));
      expect(label()).toHaveTextContent('Départ 300');
    });

    it('hides the crosshair while the shape moves, and shows it again once settled', async () => {
      const { fixture, rerender } = await mount(rising);
      const svg = fixture.nativeElement.querySelector('svg') as SVGSVGElement;

      fireEvent.pointerMove(svg, { clientX: 600, clientY: 0 });
      fixture.detectChanges();
      expect(screen.getByTestId('chart-tooltip')).toBeInTheDocument();

      await rerender({ componentProperties: { points: wavy } });
      fireEvent.pointerMove(svg, { clientX: 600, clientY: 0 });
      fixture.detectChanges();

      expect(screen.queryByTestId('chart-tooltip')).not.toBeInTheDocument();
      expect(fixture.nativeElement.querySelector('[data-chart-crosshair]')).toBeNull();

      flushFrame(1260);
      fixture.detectChanges();

      expect(screen.getByTestId('chart-tooltip')).toBeInTheDocument();
    });

    it('shows the new series at once under reduced motion, label and line in place', async () => {
      reduced = true;
      const { fixture, rerender } = await mount(rising);

      await rerender({ componentProperties: { points: wavy } });
      fixture.detectChanges();
      flushFrame(1100);
      fixture.detectChanges();

      expect(line(fixture.nativeElement)).toBe(targetOf(wavy).line);
      expect(fixture.nativeElement.querySelector('[data-chart-start-label]')).not.toHaveClass('opacity-0');
      expect(fixture.nativeElement.querySelector('[data-chart-start-line]')).toHaveAttribute(
        'y1',
        String(targetOf(wavy).start.y),
      );
    });

    it('stops the frames when the chart is destroyed mid-change', async () => {
      const { fixture, rerender } = await mount(rising);

      await rerender({ componentProperties: { points: wavy } });
      flushFrame(1100);
      const before = line(fixture.nativeElement);
      const path = fixture.nativeElement.querySelector('[data-chart-line]') as SVGPathElement;

      fixture.destroy();
      flushFrame(1200);

      expect(path.getAttribute('d')).toBe(before);
    });
  });
});
