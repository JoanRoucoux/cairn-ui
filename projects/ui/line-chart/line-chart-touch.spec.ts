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
    await render(`<ui-line-chart label="x" deltaSuffix="since the start" [points]="points" [deltaFormat]="masked" />`, {
      imports: [UiLineChart],
      componentProperties: { points, masked: () => '•••• €' },
    });

    screen.getByRole('img').focus();
    await userEvent.keyboard('{End}');

    expect(screen.getByTestId('chart-tooltip').querySelector('[data-chart-delta]')).toHaveTextContent(
      '•••• € since the start',
    );
  });

  describe('live region', () => {
    const live = (container: HTMLElement): HTMLElement => container.querySelector('[data-chart-live]')!;

    it('keeps a permanent status element, empty until a point is active', async () => {
      const { container } = await render('<ui-line-chart label="x" [points]="points" />', {
        imports: [UiLineChart],
        componentProperties: { points },
      });

      expect(screen.getByRole('status')).toBe(live(container));
      expect(live(container).textContent).toBe('');
    });

    it('fills it with the tooltip text and hides the visual tooltip', async () => {
      const { fixture, container } = await render(
        '<ui-line-chart label="x" [points]="points" [valueFormat]="fmt" [deltaFormat]="fmt" [timeFormat]="time" />',
        { imports: [UiLineChart], componentProperties: { points, fmt, time } },
      );
      const svg: SVGSVGElement = fixture.nativeElement.querySelector('svg');

      fireEvent.pointerDown(svg, { clientX: 99999 });
      fixture.detectChanges();

      expect(live(container)).toHaveTextContent('144539.35 EUR, 2418.60 EUR, 2026-09-25');
      expect(screen.getByTestId('chart-tooltip')).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByTestId('chart-tooltip')).not.toHaveAttribute('role');

      fireEvent.pointerCancel(svg);
      fixture.detectChanges();

      expect(live(container).textContent).toBe('');
    });

    it('follows tooltipFormat and leaves out the change when tooltipDelta is false', async () => {
      const { fixture, container } = await render(
        '<ui-line-chart label="x" [tooltipDelta]="false" [points]="points" [tooltipFormat]="tip" [timeFormat]="time" />',
        { imports: [UiLineChart], componentProperties: { points, time, tip: (p: ChartPoint) => `price ${p.v}` } },
      );
      const svg: SVGSVGElement = fixture.nativeElement.querySelector('svg');

      fireEvent.pointerDown(svg, { clientX: 0 });
      fixture.detectChanges();

      expect(live(container)).toHaveTextContent(/^price 142120.75, 2026-08-25$/);
    });
  });
});
