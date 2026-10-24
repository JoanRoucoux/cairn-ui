import { fireEvent, render, screen } from '@testing-library/angular';

import { type ChartPoint, UiLineChart } from './line-chart';

const points: ChartPoint[] = [
  { t: Date.UTC(2026, 7, 25), v: 142120.75 },
  { t: Date.UTC(2026, 8, 10), v: 143000 },
  { t: Date.UTC(2026, 8, 25), v: 144539.35 },
];

describe('UiLineChart assistive amounts', () => {
  const masked = (): string => '•••• €';

  it('speaks masked values in the status region, the tooltip and the table', async () => {
    const { fixture } = await render(
      `<ui-line-chart label="Net worth" [points]="points" [valueFormat]="masked" [deltaFormat]="masked" />`,
      { imports: [UiLineChart], componentProperties: { points, masked } },
    );

    fireEvent.keyDown(screen.getByRole('img', { name: 'Net worth' }), { key: 'End' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(screen.getByRole('status')).toHaveTextContent('Hidden amount, Hidden amount,');
    expect(screen.getByRole('status')).not.toHaveTextContent('••••');
    expect(screen.getByTestId('chart-tooltip').querySelectorAll('span[aria-hidden="true"]')).toHaveLength(2);
    expect(screen.getAllByText('Hidden amount')).toHaveLength(5);
  });
});
