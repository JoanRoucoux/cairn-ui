import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { type ChartPoint, UiLineChart } from './line-chart';

const points: ChartPoint[] = [
  { t: Date.UTC(2026, 7, 25), v: 142120.75 },
  { t: Date.UTC(2026, 8, 10), v: 143000 },
  { t: Date.UTC(2026, 8, 25), v: 144539.35 },
];
const fmt = (v: number): string => `${v.toFixed(2)} EUR`;
const time = (t: number): string => new Date(t).toISOString().slice(0, 10);

describe('UiLineChart touch and delta suffix', () => {
  it('shows the tooltip on a pointer down, follows the move, and hides it on cancel and leave', async () => {
    const { fixture } = await render(
      `<ui-line-chart label="x" [points]="points" [valueFormat]="fmt" [timeFormat]="time" />`,
      { imports: [UiLineChart], componentProperties: { points, fmt, time } },
    );
    const svg: SVGSVGElement = fixture.nativeElement.querySelector('svg');

    fireEvent.pointerDown(svg, { clientX: 0 });
    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('142120.75 EUR');

    fireEvent.pointerMove(svg, { clientX: 99999 });
    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('144539.35 EUR');

    fireEvent.pointerCancel(svg);
    expect(screen.queryByTestId('chart-tooltip')).toBeNull();

    fireEvent.pointerDown(svg, { clientX: 0 });
    fireEvent.pointerLeave(svg);
    expect(screen.queryByTestId('chart-tooltip')).toBeNull();
  });

  it('appends the delta suffix after the amount, masked or not', async () => {
    await render(`<ui-line-chart label="x" deltaSuffix="depuis le début" [points]="points" [deltaFormat]="masked" />`, {
      imports: [UiLineChart],
      componentProperties: { points, masked: () => '•••• €' },
    });

    screen.getByRole('img').focus();
    await userEvent.keyboard('{End}');

    expect(screen.getByTestId('chart-tooltip').querySelector('[data-chart-delta]')).toHaveTextContent(
      '•••• € depuis le début',
    );
  });
});
