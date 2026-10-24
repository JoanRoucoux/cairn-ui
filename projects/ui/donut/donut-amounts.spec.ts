import { render, screen, within } from '@testing-library/angular';

import { type DonutSlice, UiDonut } from './donut';

const threeSlices: DonutSlice[] = [
  { id: 'a', label: 'ETF', value: 60, sublabel: '6 holdings' },
  { id: 'b', label: 'Funds', value: 30, sublabel: '8 holdings' },
  { id: 'c', label: 'Stocks', value: 10, sublabel: '4 holdings' },
];

describe('UiDonut assistive amounts', () => {
  it('speaks a masked value in the centre and the legend', async () => {
    await render(`<ui-donut [slices]="slices" label="By asset class" othersLabel="Other" [valueFormat]="masked" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices, masked: () => '•••• €' },
    });

    expect(screen.getAllByText('Hidden amount')).toHaveLength(4);
    for (const glyphs of screen.getAllByText('•••• €')) {
      expect(glyphs).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('speaks a masked share in the aria-label', async () => {
    await render(`<ui-donut [slices]="slices" label="By asset class" othersLabel="Other" [shareFormat]="masked" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices, masked: () => '•••• €' },
    });

    expect(screen.getByRole('img')).toHaveAccessibleName(
      'By asset class: ETF Hidden amount, Funds Hidden amount, Stocks Hidden amount',
    );
  });

  it('lets a long legend label wrap', async () => {
    await render(`<ui-donut [slices]="slices" label="By account" othersLabel="Other" />`, {
      imports: [UiDonut],
      componentProperties: { slices: [{ id: 'a', label: 'Woodgrove Retirement Savings Plan', value: 1 }] },
    });

    const label = within(screen.getByTestId('donut-legend')).getByText('Woodgrove Retirement Savings Plan');
    expect(label).toHaveClass('break-words', 'text-pretty', 'min-w-0');
    expect(label).not.toHaveClass('truncate');
  });
});
