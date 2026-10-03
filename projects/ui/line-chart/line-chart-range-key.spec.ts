import { TestBed } from '@angular/core/testing';

import { render } from '@testing-library/angular';

import { type ChartPoint, UiLineChart } from './line-chart';

const template = `<ui-line-chart label="x" startLabel="Départ" [points]="points" [rangeKey]="rangeKey" />`;

const month: ChartPoint[] = [
  { t: 0, v: 100 },
  { t: 1, v: 200 },
];

const afterBuy: ChartPoint[] = [
  { t: 0, v: 100 },
  { t: 1, v: 150 },
  { t: 2, v: 400 },
];

const day: ChartPoint[] = [
  { t: 0, v: 300 },
  { t: 1, v: 10 },
  { t: 2, v: 90 },
];

const mediaQuery = (matches: boolean): Partial<MediaQueryList> => ({
  matches,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
});

describe('UiLineChart rangeKey', () => {
  let frames: FrameRequestCallback[];
  let originalRaf: typeof requestAnimationFrame;
  let originalCaf: typeof cancelAnimationFrame;
  let originalMatchMedia: typeof matchMedia | undefined;

  const flushFrame = (time: number): void => {
    const due = [...frames];
    frames = [];
    due.forEach((frame) => frame(time));
  };

  const targetPath = async (points: ChartPoint[]): Promise<string> => {
    TestBed.resetTestingModule();
    const target = await render(template, { imports: [UiLineChart], componentProperties: { points, rangeKey: null } });

    return target.fixture.nativeElement.querySelector('[data-chart-line]').getAttribute('d');
  };

  beforeEach(() => {
    frames = [];
    originalRaf = globalThis.requestAnimationFrame;
    originalCaf = globalThis.cancelAnimationFrame;
    originalMatchMedia = globalThis.matchMedia;

    let id = 0;
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      frames.push(callback);
      return ++id;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = (() => undefined) as typeof cancelAnimationFrame;
    globalThis.matchMedia = vi.fn().mockReturnValue(mediaQuery(false)) as unknown as typeof matchMedia;
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCaf;
    if (originalMatchMedia) {
      globalThis.matchMedia = originalMatchMedia;
    } else {
      Reflect.deleteProperty(globalThis, 'matchMedia');
    }
    vi.restoreAllMocks();
  });

  it('redraws a new series of the same range at once, with no fade of Départ or of the dashed line', async () => {
    const { fixture, rerender } = await render(template, {
      imports: [UiLineChart],
      componentProperties: { points: month, rangeKey: '1M' },
    });

    await rerender({ componentProperties: { points: afterBuy, rangeKey: '1M' } });
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const drawn = element.querySelector('[data-chart-line]')!.getAttribute('d');
    expect(element.querySelector('[data-chart-start-label]')).not.toHaveClass('opacity-0');
    expect(element.querySelector('[data-chart-start-line]')).not.toHaveClass('opacity-0');
    expect(drawn).toBe(await targetPath(afterBuy));
  });

  it('interpolates and fades Départ when the range changes with the series', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    const { fixture, rerender } = await render(template, {
      imports: [UiLineChart],
      componentProperties: { points: month, rangeKey: '1M' },
    });

    await rerender({ componentProperties: { points: day, rangeKey: '1J' } });
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[data-chart-start-label]')).toHaveClass('opacity-0');
    expect(element.querySelector('[data-chart-start-line]')).toHaveClass('opacity-0');

    flushFrame(1000);
    flushFrame(1260);
    fixture.detectChanges();

    const drawn = element.querySelector('[data-chart-line]')!.getAttribute('d');
    expect(element.querySelector('[data-chart-start-label]')).not.toHaveClass('opacity-0');
    expect(drawn).toBe(await targetPath(day));
  });

  it('still interpolates when the series of the new range arrives after the key', async () => {
    const { fixture, rerender } = await render(template, {
      imports: [UiLineChart],
      componentProperties: { points: month, rangeKey: '1M' },
    });

    await rerender({ componentProperties: { points: month, rangeKey: '1J' } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-chart-start-label]')).not.toHaveClass('opacity-0');

    await rerender({ componentProperties: { points: day, rangeKey: '1J' } });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-chart-start-label]')).toHaveClass('opacity-0');
  });

  it('stops a range interpolation and redraws at once when the same range reloads mid-way', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    const { fixture, rerender } = await render(template, {
      imports: [UiLineChart],
      componentProperties: { points: month, rangeKey: '1M' },
    });

    await rerender({ componentProperties: { points: day, rangeKey: '1J' } });
    flushFrame(1100);
    await rerender({ componentProperties: { points: afterBuy, rangeKey: '1J' } });
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const drawn = element.querySelector('[data-chart-line]')!.getAttribute('d');
    expect(element.querySelector('[data-chart-start-label]')).not.toHaveClass('opacity-0');
    expect(drawn).toBe(await targetPath(afterBuy));
  });

  it('interpolates every new series when no rangeKey is bound', async () => {
    const { fixture, rerender } = await render(template, {
      imports: [UiLineChart],
      componentProperties: { points: month, rangeKey: null },
    });

    await rerender({ componentProperties: { points: afterBuy, rangeKey: null } });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-chart-start-label]')).toHaveClass('opacity-0');
  });
});
