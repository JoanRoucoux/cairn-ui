import { type RenderResult, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { type SegmentedOption, UiSegmented } from './segmented';

const options: SegmentedOption[] = [
  { value: '1d', label: '1D' },
  { value: '1m', label: '1M' },
  { value: 'max', label: 'Max' },
];

const renderSegmented = (value = '1d'): Promise<RenderResult<unknown>> =>
  render('<ui-segmented [options]="options" [label]="label" [(value)]="value" />', {
    imports: [UiSegmented],
    componentProperties: { options, label: 'Time range', value },
  });

describe('UiSegmented', () => {
  it('exposes the group under its label', async () => {
    await renderSegmented();

    expect(screen.getByRole('radiogroup', { name: 'Time range' })).toBeInTheDocument();
  });

  it('renders one radio per option', async () => {
    await renderSegmented();

    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('marks the selected option as checked', async () => {
    await renderSegmented('1m');

    expect(screen.getByRole('radio', { name: '1M' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '1D' })).not.toBeChecked();
  });

  it('selects an option on click', async () => {
    const user = userEvent.setup();
    await renderSegmented();

    await user.click(screen.getByRole('radio', { name: 'Max' }));

    expect(await screen.findByRole('radio', { name: 'Max' })).toBeChecked();
  });

  it('keeps every option at a 44px touch target', async () => {
    await renderSegmented();

    expect(screen.getByRole('radio', { name: '1D' })).toHaveClass('min-h-11');
  });

  it('keeps only the selected option in the tab sequence', async () => {
    await renderSegmented('1m');

    expect(screen.getByRole('radio', { name: '1M' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: '1D' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('radio', { name: 'Max' })).toHaveAttribute('tabindex', '-1');
  });

  it('falls back to the first option as the tab stop when value matches no option', async () => {
    await renderSegmented('unknown');

    expect(screen.getByRole('radio', { name: '1D' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: '1M' })).toHaveAttribute('tabindex', '-1');
  });

  it('moves focus and selection to the next option with ArrowRight, wrapping at the end', async () => {
    const user = userEvent.setup();
    await renderSegmented('max');

    screen.getByRole('radio', { name: 'Max' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('radio', { name: '1D' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '1D' })).toHaveFocus();
  });

  it('moves focus and selection to the previous option with ArrowLeft, wrapping at the start', async () => {
    const user = userEvent.setup();
    await renderSegmented('1d');

    screen.getByRole('radio', { name: '1D' }).focus();
    await user.keyboard('{ArrowLeft}');

    expect(screen.getByRole('radio', { name: 'Max' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Max' })).toHaveFocus();
  });

  it('ignores keys other than the arrow keys', async () => {
    const user = userEvent.setup();
    await renderSegmented('1d');

    screen.getByRole('radio', { name: '1D' }).focus();
    await user.keyboard('a');

    expect(screen.getByRole('radio', { name: '1D' })).toBeChecked();
  });
});
