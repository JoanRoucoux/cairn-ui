import { fireEvent, render, screen } from '@testing-library/angular';

import { type ChartPoint, UiLineChart } from './line-chart';

const points: ChartPoint[] = [
  { t: Date.UTC(2026, 7, 25), v: 142120.75 },
  { t: Date.UTC(2026, 8, 10), v: 143000 },
  { t: Date.UTC(2026, 8, 25), v: 144539.35 },
];
const fmt = (v: number): string => `${v.toFixed(2)} EUR`;
const time = (t: number): string => new Date(t).toISOString().slice(0, 10);
const tip = (point: ChartPoint): string => `${fmt(point.v)} · cours ${time(point.t)}`;

describe('UiLineChart formats and screen-reader table', () => {
  it('clips the screen-reader table inside an sr-only wrapper so it cannot widen the page', async () => {
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" />`, {
      imports: [UiLineChart],
      componentProperties: { points },
    });
    const table = fixture.nativeElement.querySelector('table') as HTMLElement;

    expect(table.parentElement).toHaveClass('sr-only');
    expect(table).not.toHaveClass('sr-only');
    expect(screen.getByRole('table', { name: 'x' })).toBeInTheDocument();
  });

  it('falls back to valueFormat in the tooltip', async () => {
    const { fixture } = await render(`<ui-line-chart label="x" [points]="points" [valueFormat]="fmt" />`, {
      imports: [UiLineChart],
      componentProperties: { points, fmt },
    });

    fireEvent.pointerMove(fixture.nativeElement.querySelector('svg'), { clientX: 0, clientY: 0 });

    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('142120.75 EUR');
    expect(screen.getByTestId('chart-tooltip')).not.toHaveTextContent('cours');
  });

  it('formats the tooltip value from the point while valueFormat keeps the start label and the table', async () => {
    const { fixture } = await render(
      `<ui-line-chart label="x" startLabel="Depart" [points]="points" [valueFormat]="fmt" [tooltipFormat]="tip" />`,
      { imports: [UiLineChart], componentProperties: { points, fmt, tip } },
    );

    fireEvent.pointerMove(fixture.nativeElement.querySelector('svg'), { clientX: 0, clientY: 0 });

    expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('142120.75 EUR · cours 2026-08-25');
    expect(screen.getByText('Depart 142120.75 EUR')).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: '142120.75 EUR' })).toHaveLength(1);
  });
});
