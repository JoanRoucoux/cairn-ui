import { TestBed } from '@angular/core/testing';

import { fireEvent, render, screen } from '@testing-library/angular';

import { type ChartPoint, UiLineChart } from './line-chart';

const points: ChartPoint[] = [
  { t: Date.UTC(2026, 7, 25), v: 142120.75 },
  { t: Date.UTC(2026, 8, 10), v: 143000 },
  { t: Date.UTC(2026, 8, 25), v: 144539.35 },
];

const mediaQuery = (matches: boolean): Partial<MediaQueryList> => ({
  matches,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

describe('UiLineChart range transition', () => {
  let frames: FrameRequestCallback[];
  let originalRaf: typeof requestAnimationFrame;
  let originalCaf: typeof cancelAnimationFrame;
  let originalMatchMedia: typeof matchMedia | undefined;
  let cancelled: number[];

  const flushFrame = (time: number): void => {
    const due = [...frames];
    frames = [];
    due.forEach((frame) => frame(time));
  };

  beforeEach(() => {
    frames = [];
    cancelled = [];
    originalRaf = globalThis.requestAnimationFrame;
    originalCaf = globalThis.cancelAnimationFrame;
    originalMatchMedia = globalThis.matchMedia;

    let id = 0;
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      frames.push(callback);
      return ++id;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = ((handle: number) => {
      cancelled.push(handle);
    }) as typeof cancelAnimationFrame;
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCaf;
    if (originalMatchMedia) {
      globalThis.matchMedia = originalMatchMedia;
    } else {
      Reflect.deleteProperty(globalThis, 'matchMedia');
    }
  });

  it('never animates the first render', async () => {
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points },
    });

    TestBed.resetTestingModule();
    const target = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points },
    });
    const targetLine = target.fixture.nativeElement.querySelector('[data-chart-line]');

    expect(fixture.nativeElement.querySelector('[data-chart-line]')).toHaveAttribute('d', targetLine.getAttribute('d'));
  });

  it('interpolates the shape between two ranges and settles on the exact target path', async () => {
    globalThis.matchMedia = vi.fn().mockReturnValue(mediaQuery(false)) as unknown as typeof matchMedia;
    const short: ChartPoint[] = [
      { t: 0, v: 100 },
      { t: 1, v: 200 },
    ];
    const long: ChartPoint[] = [
      { t: 0, v: 100 },
      { t: 1, v: 150 },
      { t: 2, v: 400 },
    ];
    const dateNowSpy = vi.spyOn(performance, 'now').mockReturnValue(1000);
    const { fixture, rerender } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: short },
    });

    await rerender({ componentProperties: { points: long } });

    expect(frames.length).toBeGreaterThan(0);

    flushFrame(1000);
    flushFrame(1260);
    fixture.detectChanges();
    dateNowSpy.mockRestore();

    TestBed.resetTestingModule();
    const target = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: long },
    });
    const targetLine = target.fixture.nativeElement.querySelector('[data-chart-line]');

    expect(fixture.nativeElement.querySelector('[data-chart-line]')).toHaveAttribute('d', targetLine.getAttribute('d'));
  });

  it('skips the animation under prefers-reduced-motion', async () => {
    globalThis.matchMedia = vi.fn().mockReturnValue(mediaQuery(true)) as unknown as typeof matchMedia;
    const short: ChartPoint[] = [
      { t: 0, v: 100 },
      { t: 1, v: 200 },
    ];
    const long: ChartPoint[] = [
      { t: 0, v: 100 },
      { t: 1, v: 150 },
      { t: 2, v: 400 },
    ];
    const { fixture, rerender } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: short },
    });

    await rerender({ componentProperties: { points: long } });
    fixture.detectChanges();

    TestBed.resetTestingModule();
    const target = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: long },
    });
    const targetLine = target.fixture.nativeElement.querySelector('[data-chart-line]');

    expect(fixture.nativeElement.querySelector('[data-chart-line]')).toHaveAttribute('d', targetLine.getAttribute('d'));
  });

  it('does not animate when matchMedia is unavailable', async () => {
    Reflect.deleteProperty(globalThis, 'matchMedia');
    const short: ChartPoint[] = [
      { t: 0, v: 100 },
      { t: 1, v: 200 },
    ];
    const long: ChartPoint[] = [
      { t: 0, v: 100 },
      { t: 1, v: 150 },
      { t: 2, v: 400 },
    ];
    const { fixture, rerender } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: short },
    });

    await rerender({ componentProperties: { points: long } });
    fixture.detectChanges();

    expect(frames.length).toBeGreaterThan(0);
  });

  it('skips the animation when the previous or the next series is empty', async () => {
    globalThis.matchMedia = vi.fn().mockReturnValue(mediaQuery(false)) as unknown as typeof matchMedia;
    const { fixture, rerender } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: [] as ChartPoint[] },
    });

    await rerender({ componentProperties: { points } });
    fixture.detectChanges();

    TestBed.resetTestingModule();
    const target = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points },
    });
    const targetLine = target.fixture.nativeElement.querySelector('[data-chart-line]');

    expect(fixture.nativeElement.querySelector('[data-chart-line]')).toHaveAttribute('d', targetLine.getAttribute('d'));
  });

  it('cancels a running frame when the range changes again mid-animation, and on destroy', async () => {
    globalThis.matchMedia = vi.fn().mockReturnValue(mediaQuery(false)) as unknown as typeof matchMedia;
    const first: ChartPoint[] = [
      { t: 0, v: 100 },
      { t: 1, v: 200 },
    ];
    const second: ChartPoint[] = [
      { t: 0, v: 100 },
      { t: 1, v: 150 },
      { t: 2, v: 400 },
    ];
    const third: ChartPoint[] = [
      { t: 0, v: 300 },
      { t: 1, v: 10 },
    ];
    const { fixture, rerender } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: first },
    });

    await rerender({ componentProperties: { points: second } });
    expect(frames.length).toBeGreaterThan(0);

    await rerender({ componentProperties: { points: third } });

    expect(cancelled.length).toBeGreaterThan(0);

    fixture.destroy();

    expect(cancelled.length).toBeGreaterThan(1);
  });

  it('does not move, fade or drop the tooltip for a new points array that carries the same values', async () => {
    globalThis.matchMedia = vi.fn().mockReturnValue(mediaQuery(false)) as unknown as typeof matchMedia;
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    const { fixture, rerender } = await render(`<ui-line-chart label="x" startLabel="Départ" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points },
    });
    const before = fixture.nativeElement.querySelector('[data-chart-line]').getAttribute('d');
    fireEvent.pointerMove(fixture.nativeElement.querySelector('svg'), { clientX: 600, clientY: 0 });
    fixture.detectChanges();

    await rerender({ componentProperties: { points: points.map((point) => ({ ...point })) } });
    flushFrame(1100);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-chart-line]')).toHaveAttribute('d', before);
    expect(fixture.nativeElement.querySelector('[data-chart-start-label]')).not.toHaveClass('opacity-0');
    expect(fixture.nativeElement.querySelector('[data-chart-start-line]')).not.toHaveClass('opacity-0');
    expect(screen.getByTestId('chart-tooltip')).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it('shows the new series at once, without a fade, when the --duration-base token is 0ms', async () => {
    globalThis.matchMedia = vi.fn().mockReturnValue(mediaQuery(false)) as unknown as typeof matchMedia;
    const template = `<ui-line-chart label="x" startLabel="Départ" style="--duration-base: 0ms" [points]="points" />`;
    const next = points.map((point) => ({ ...point, v: point.v * 2 }));
    const target = await render(template, { imports: [UiLineChart], componentProperties: { points: next } });
    const targetLine = target.fixture.nativeElement.querySelector('[data-chart-line]').getAttribute('d');

    TestBed.resetTestingModule();
    const { fixture, rerender } = await render(template, { imports: [UiLineChart], componentProperties: { points } });
    await rerender({ componentProperties: { points: next } });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-chart-line]')).toHaveAttribute('d', targetLine);
    expect(fixture.nativeElement.querySelector('[data-chart-start-label]')).not.toHaveClass('opacity-0');
  });

  it('never animates a transition into or out of an empty series, even after a real transition already happened', async () => {
    globalThis.matchMedia = vi.fn().mockReturnValue(mediaQuery(false)) as unknown as typeof matchMedia;
    const a: ChartPoint[] = [
      { t: 0, v: 10 },
      { t: 1, v: 20 },
    ];
    const b: ChartPoint[] = [
      { t: 0, v: 30 },
      { t: 1, v: 40 },
    ];
    const c: ChartPoint[] = [
      { t: 0, v: 50 },
      { t: 1, v: 60 },
    ];
    const { fixture, rerender } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: a },
    });

    await rerender({ componentProperties: { points: b } });
    await rerender({ componentProperties: { points: [] as ChartPoint[] } });
    await rerender({ componentProperties: { points: c } });
    fixture.detectChanges();

    TestBed.resetTestingModule();
    const target = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: c },
    });
    const targetLine = target.fixture.nativeElement.querySelector('[data-chart-line]');

    expect(fixture.nativeElement.querySelector('[data-chart-line]')).toHaveAttribute('d', targetLine.getAttribute('d'));
  });

  it('never animates out of a single-point series', async () => {
    globalThis.matchMedia = vi.fn().mockReturnValue(mediaQuery(false)) as unknown as typeof matchMedia;
    const single: ChartPoint[] = [{ t: 0, v: 10 }];
    const { fixture, rerender } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: single },
    });

    await rerender({ componentProperties: { points } });
    fixture.detectChanges();

    TestBed.resetTestingModule();
    const target = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points },
    });
    const targetLine = target.fixture.nativeElement.querySelector('[data-chart-line]');

    expect(fixture.nativeElement.querySelector('[data-chart-line]')).toHaveAttribute('d', targetLine.getAttribute('d'));
  });

  it('skips the inner animation step for a transition landing on a single-point series', async () => {
    globalThis.matchMedia = vi.fn().mockReturnValue(mediaQuery(false)) as unknown as typeof matchMedia;
    const first: ChartPoint[] = [
      { t: 0, v: 10 },
      { t: 1, v: 20 },
    ];
    const single: ChartPoint[] = [{ t: 0, v: 10 }];
    const { fixture, rerender } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: first },
    });

    await rerender({ componentProperties: { points: single } });
    fixture.detectChanges();

    TestBed.resetTestingModule();
    const target = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points: single },
    });
    const targetLine = target.fixture.nativeElement.querySelector('[data-chart-line]');

    expect(fixture.nativeElement.querySelector('[data-chart-line]')).toHaveAttribute('d', targetLine.getAttribute('d'));
  });
});
