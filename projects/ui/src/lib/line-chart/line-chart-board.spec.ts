import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { type ChartPoint, UiLineChart } from './line-chart';

const points: ChartPoint[] = [
  { t: Date.UTC(2026, 7, 25), v: 161389.51 },
  { t: Date.UTC(2026, 8, 10), v: 163000 },
  { t: Date.UTC(2026, 8, 25), v: 164294.28 },
];
const fmt = (v: number): string => `${v.toFixed(2)} EUR`;

describe('UiLineChart against the board', () => {
  describe('board geometry', () => {
    const renderChart = (): ReturnType<typeof render> =>
      render(`<ui-line-chart label="x" startLabel="Depart" [points]="points" [valueFormat]="fmt" />`, {
        imports: [UiLineChart],
        componentProperties: { points, fmt },
      });

    it('dashes the start line 3 on, 4 off', async () => {
      const { fixture } = await renderChart();

      expect(fixture.nativeElement.querySelector('[data-chart-start-line]')).toHaveAttribute('stroke-dasharray', '3 4');
    });

    it('keeps the curve inside a plot that leaves a 29px band for the axis, with a fifteenth of the plot as padding top and bottom', async () => {
      const { fixture } = await renderChart();
      const plot = 240 - 29;
      const padding = (plot * 16) / 240;

      expect(Number(fixture.nativeElement.querySelector('[data-chart-end]').getAttribute('cy'))).toBeCloseTo(
        padding,
        1,
      );
      expect(Number(fixture.nativeElement.querySelector('[data-chart-start-line]').getAttribute('y1'))).toBeCloseTo(
        plot - padding,
        1,
      );
    });

    it('lets the curve run edge to edge, so the end dot sits on the right border of the plot', async () => {
      const { fixture } = await renderChart();

      expect(fixture.nativeElement.querySelector('[data-chart-end]')).toHaveAttribute('cx', '640');
    });

    it('draws the end dot 8px wide inside a 3px ring of the surface colour', async () => {
      const { fixture } = await renderChart();
      const dot = fixture.nativeElement.querySelector('[data-chart-end]');

      expect(dot).toHaveAttribute('r', '4');
      expect(dot).toHaveAttribute('stroke-width', '6');
      expect(dot).toHaveClass('[paint-order:stroke]');
    });

    it('draws the active dot 10px wide and stops the crosshair at the plot, above the axis', async () => {
      const { fixture } = await renderChart();

      screen.getByRole('img').focus();
      await userEvent.keyboard('{End}');

      expect(fixture.nativeElement.querySelector('[data-chart-active]')).toHaveAttribute('r', '5');
      expect(fixture.nativeElement.querySelector('[data-chart-crosshair]')).toHaveAttribute('y2', String(240 - 29));
    });

    it('pins the compact tooltip 12px above the plot, 14px right of the point, flipped past 55%', async () => {
      await renderChart();

      screen.getByRole('img').focus();
      await userEvent.keyboard('{Home}');
      const tooltip = screen.getByTestId('chart-tooltip');

      expect(tooltip).toHaveClass('bg-(--elevated)', 'px-2.5', 'py-2', '-top-3');
      expect(tooltip.style.left).toContain('+ 14px');
      expect(tooltip.style.transform).toBe('none');

      await userEvent.keyboard('{End}');

      expect(tooltip.style.left).toContain('- 14px');
      expect(tooltip.style.transform).toBe('translateX(-100%)');
    });

    it('sets the compact tooltip value in label size, its change and date in caption size', async () => {
      await renderChart();

      screen.getByRole('img').focus();
      await userEvent.keyboard('{Home}');
      const tooltip = screen.getByTestId('chart-tooltip');

      expect(tooltip.querySelector('p')).toHaveClass('text-label', 'font-medium');
      expect(tooltip.querySelector('[data-chart-delta]')).toHaveClass('text-caption');
      expect(tooltip.querySelector('[data-chart-date]')).toHaveClass('text-caption');
    });

    it('offers the large tooltip, at the top of the plot with body and label sizes', async () => {
      await render(`<ui-line-chart label="x" tooltip="large" [points]="points" [valueFormat]="fmt" />`, {
        imports: [UiLineChart],
        componentProperties: { points, fmt },
      });

      screen.getByRole('img').focus();
      await userEvent.keyboard('{Home}');
      const tooltip = screen.getByTestId('chart-tooltip');

      expect(tooltip).toHaveClass('px-3', 'py-2', 'top-0');
      expect(tooltip.querySelector('p')).toHaveClass('text-body', 'font-medium');
      expect(tooltip.querySelector('[data-chart-delta]')).toHaveClass('text-label');
    });

    it('drops the change line when tooltipDelta is false', async () => {
      await render(`<ui-line-chart label="x" [tooltipDelta]="false" [points]="points" [valueFormat]="fmt" />`, {
        imports: [UiLineChart],
        componentProperties: { points, fmt },
      });

      screen.getByRole('img').focus();
      await userEvent.keyboard('{Home}');

      expect(screen.getByTestId('chart-tooltip').querySelector('[data-chart-delta]')).toBeNull();
      expect(screen.getByTestId('chart-tooltip')).toHaveTextContent('161389.51 EUR');
    });

    it('widens the band under the plot with axisGap, so the desktop Dashboard axis lands 16px under the plot', async () => {
      const { fixture } = await render(
        `<ui-line-chart label="x" [axisGap]="16" [points]="points" [valueFormat]="fmt" />`,
        { imports: [UiLineChart], componentProperties: { points, fmt } },
      );
      const plot = 240 - 33;

      screen.getByRole('img').focus();
      await userEvent.keyboard('{End}');

      expect(Number(fixture.nativeElement.querySelector('[data-chart-end]').getAttribute('cy'))).toBeCloseTo(
        (plot * 16) / 240,
        1,
      );
      expect(fixture.nativeElement.querySelector('[data-chart-crosshair]')).toHaveAttribute('y2', String(plot));
    });

    it('sets the axis and start label in tabular figures', async () => {
      const { fixture } = await renderChart();

      expect(fixture.nativeElement.querySelector('[data-chart-start-label]')).toHaveClass('tabular-nums');
      expect(fixture.nativeElement.querySelector('[data-chart-axis-tick]')).toHaveClass('tabular-nums');
    });
  });

  describe('sparkline', () => {
    const renderSpark = (): ReturnType<typeof render> =>
      render(`<ui-line-chart label="Trend" sparkline startLabel="Depart" [points]="points" />`, {
        imports: [UiLineChart],
        componentProperties: { points },
      });

    it('draws only a 1.5px curve, without start line, label, dot or axis', async () => {
      const { fixture } = await renderSpark();
      const svg = fixture.nativeElement.querySelector('svg');

      expect(svg.querySelector('[data-chart-line]')).toHaveAttribute('stroke-width', '1.5');
      for (const part of ['start-line', 'start-label', 'end', 'axis-tick']) {
        expect(svg.querySelector(`[data-chart-${part}]`)).toBeNull();
      }
    });

    it('stays out of the tab order and ignores the pointer', async () => {
      const { fixture } = await renderSpark();
      const svg = fixture.nativeElement.querySelector('svg') as Element;

      expect(svg).not.toHaveAttribute('tabindex');
      fireEvent.pointerMove(svg, { clientX: 0, clientY: 0 });
      expect(screen.queryByTestId('chart-tooltip')).not.toBeInTheDocument();
    });

    it('keeps its accessible name and data table', async () => {
      await renderSpark();

      expect(screen.getByRole('img', { name: 'Trend' })).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});
