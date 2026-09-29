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

  it('sizes every option consistently', async () => {
    await renderSegmented();

    expect(screen.getByRole('radio', { name: '1D' })).toHaveClass('min-h-9', 'text-label');
  });

  it('gives each option a minimum inline padding, so labels do not collapse into each other', async () => {
    await renderSegmented();

    expect(screen.getByRole('radio', { name: '1D' })).toHaveClass('px-3');
  });

  it('reaches the touch target through its hit area, not its visible height', async () => {
    await renderSegmented();

    expect(screen.getByRole('radio', { name: '1D' })).toHaveClass(
      'after:absolute',
      'after:inset-x-0',
      'after:top-1/2',
      'after:h-(--row-min)',
      'after:-translate-y-1/2',
      "after:content-['']",
    );
  });

  it('slides the thumb under the selected option', async () => {
    const { fixture } = await render(
      '<ui-segmented label="Range" [options]="options" [(value)]="value" />',

      {
        imports: [UiSegmented],
        componentProperties: {
          options: [
            { value: '1d', label: '1D' },
            { value: '7d', label: '7D' },
            { value: '1m', label: '1M' },
          ],
          value: '7d',
        },
      },
    );

    const thumb = fixture.nativeElement.querySelector('[data-thumb]') as HTMLElement;
    expect(thumb.style.transform).toBe('translateX(100%)');
    expect(thumb.style.width).toBe('calc(33.3333%)');
  });

  it('renders no thumb when the value matches no option', async () => {
    const { fixture } = await renderSegmented('unknown');

    expect(fixture.nativeElement.querySelector('[data-thumb]')).toBeNull();
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
