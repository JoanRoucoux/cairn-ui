import { render } from '@testing-library/angular';

import { type ChartPoint, UiLineChart } from './line-chart';

describe('UiLineChart axis labels', () => {
  const series = (months: number[]): ChartPoint[] =>
    months.map((month, index) => ({ t: Date.UTC(2026, month), v: index }));
  const year = (t: number): string => String(new Date(t).getUTCFullYear());
  const month = (t: number): string => new Date(t).toISOString().slice(5, 7);

  const drawn = (container: HTMLElement): (string | undefined)[] =>
    [...container.querySelectorAll('[data-chart-axis-tick]')].map((tick) => tick.textContent?.trim());

  it('draws a label once when every tick formats the same', async () => {
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" [axisFormat]="year" />`, {
      imports: [UiLineChart],
      componentProperties: { points: series([0, 1, 2, 3, 4, 5, 6, 7]), year },
    });

    expect(drawn(fixture.nativeElement)).toEqual(['2026']);
  });

  it('skips a label equal to the previous drawn one and keeps the others in place', async () => {
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" [axisFormat]="month" />`, {
      imports: [UiLineChart],
      componentProperties: { points: series([0, 0, 1, 1, 2]), month },
    });
    const ticks = fixture.nativeElement.querySelectorAll('[data-chart-axis-tick]');

    expect(drawn(fixture.nativeElement)).toEqual(['01', '02', '03']);
    expect(ticks[0]).toHaveAttribute('text-anchor', 'start');
    expect(ticks[1]).toHaveAttribute('text-anchor', 'middle');
    expect(ticks[2]).toHaveAttribute('text-anchor', 'end');
  });

  it('compares only the first, middle and last ticks with axisTicks="3"', async () => {
    const { fixture } = await render(
      `<ui-line-chart label="x" axisTicks="3" [points]="points" [axisFormat]="month" />`,
      {
        imports: [UiLineChart],
        componentProperties: { points: series([0, 1, 1, 2, 2, 2, 2]), month },
      },
    );

    expect(drawn(fixture.nativeElement)).toEqual(['01', '03']);
  });

  it('decides per layout: a core label survives below sm when only a hidden neighbour repeats it', async () => {
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" [axisFormat]="month" />`, {
      imports: [UiLineChart],
      componentProperties: { points: series([0, 1, 1, 2, 2]), month },
    });
    const ticks: Element[] = [...fixture.nativeElement.querySelectorAll('[data-chart-axis-tick]')];
    const without = (className: string): (string | undefined)[] =>
      ticks.filter((tick) => !tick.classList.contains(className)).map((tick) => tick.textContent?.trim());

    expect(without('max-sm:hidden')).toEqual(['01', '02', '03']);
    expect(without('sm:hidden')).toEqual(['01', '02', '03']);
    expect(ticks).toHaveLength(5);
  });
});
