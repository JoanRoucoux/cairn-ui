import { type RenderResult, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { type ChoiceChipOption, UiChoiceChips } from './choice-chips';

const options: ChoiceChipOption[] = [
  { value: 'pea', label: 'PEA' },
  { value: 'cto', label: 'CTO' },
  { value: 'av', label: 'Assurance-vie' },
];

const renderChips = (value = 'pea', extra = ''): Promise<RenderResult<unknown>> =>
  render(`<ui-choice-chips [options]="options" label="Envelope" [(value)]="value" ${extra} />`, {
    imports: [UiChoiceChips],
    componentProperties: { options, value },
  });

describe('UiChoiceChips', () => {
  it('exposes the group under its visible label', async () => {
    await renderChips();

    expect(screen.getByRole('radiogroup', { name: 'Envelope' })).toBeInTheDocument();
    expect(screen.getByText('Envelope')).toBeVisible();
  });

  it('sets the visible label in label size and weight with the natural line height', async () => {
    await renderChips();

    expect(screen.getByText('Envelope')).toHaveClass('text-label', 'font-medium', 'leading-[normal]');
  });

  it('names the group with ariaLabel when no visible label is given', async () => {
    await render('<ui-choice-chips [options]="options" ariaLabel="Account type" [(value)]="value" />', {
      imports: [UiChoiceChips],
      componentProperties: { options, value: 'pea' },
    });

    expect(screen.getByRole('radiogroup', { name: 'Account type' })).toBeInTheDocument();
  });

  it('names the group with ariaLabelledby', async () => {
    await render(
      '<span id="outside">From outside</span><ui-choice-chips [options]="options" ariaLabelledby="outside" [(value)]="value" />',
      { imports: [UiChoiceChips], componentProperties: { options, value: 'pea' } },
    );

    expect(screen.getByRole('radiogroup', { name: 'From outside' })).toBeInTheDocument();
  });

  it('renders one radio per option and marks the selected one', async () => {
    await renderChips('cto');

    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'CTO' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'PEA' })).not.toBeChecked();
  });

  it('paints the selected chip with the primary tokens and the others as an outline', async () => {
    await renderChips('cto');

    expect(screen.getByRole('radio', { name: 'CTO' })).toHaveClass('bg-(--primary)', 'text-(--primary-foreground)');
    expect(screen.getByRole('radio', { name: 'PEA' })).toHaveClass(
      'bg-(--background)',
      'text-(--foreground)',
      'shadow-[inset_0_0_0_1px_var(--border)]',
    );
  });

  it('paints unselected chips on the card surface when asked', async () => {
    await renderChips('cto', 'surface="card"');

    expect(screen.getByRole('radio', { name: 'PEA' })).toHaveClass('bg-(--card)');
  });

  it('sizes chips 40px on touch and 32px with a fine pointer, label weight 500, pill radius', async () => {
    await renderChips();

    expect(screen.getByRole('radio', { name: 'PEA' })).toHaveClass(
      'h-10',
      'px-3.5',
      'pointer-fine:h-8',
      'pointer-fine:px-3',
      'text-label',
      'font-medium',
      'rounded-pill',
    );
  });

  it('wraps the chips', async () => {
    await renderChips();

    expect(screen.getByRole('radio', { name: 'PEA' }).parentElement).toHaveClass('flex-wrap', 'gap-1.5');
  });

  it('selects a chip on click', async () => {
    const user = userEvent.setup();
    await renderChips();

    await user.click(screen.getByRole('radio', { name: 'Assurance-vie' }));

    expect(await screen.findByRole('radio', { name: 'Assurance-vie' })).toBeChecked();
  });

  it('keeps only the selected chip in the tab sequence', async () => {
    await renderChips('cto');

    expect(screen.getByRole('radio', { name: 'CTO' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'PEA' })).toHaveAttribute('tabindex', '-1');
  });

  it('falls back to the first chip as the tab stop when value matches no option', async () => {
    await renderChips('unknown');

    expect(screen.getByRole('radio', { name: 'PEA' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'CTO' })).toHaveAttribute('tabindex', '-1');
  });

  it.each([['{ArrowRight}'], ['{ArrowDown}']])('%s moves to the next chip, wrapping at the end', async (key) => {
    const user = userEvent.setup();
    await renderChips('av');

    screen.getByRole('radio', { name: 'Assurance-vie' }).focus();
    await user.keyboard(key);

    expect(screen.getByRole('radio', { name: 'PEA' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'PEA' })).toHaveFocus();
  });

  it.each([['{ArrowLeft}'], ['{ArrowUp}']])('%s moves to the previous chip, wrapping at the start', async (key) => {
    const user = userEvent.setup();
    await renderChips('pea');

    screen.getByRole('radio', { name: 'PEA' }).focus();
    await user.keyboard(key);

    expect(screen.getByRole('radio', { name: 'Assurance-vie' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Assurance-vie' })).toHaveFocus();
  });

  it('moves to the first chip on Home and the last on End', async () => {
    const user = userEvent.setup();
    await renderChips('cto');

    screen.getByRole('radio', { name: 'CTO' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'Assurance-vie' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Assurance-vie' })).toHaveFocus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('radio', { name: 'PEA' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'PEA' })).toHaveFocus();
  });

  it.each([['{Enter}'], [' ']])('selects the focused chip on %j', async (key) => {
    const user = userEvent.setup();
    await renderChips('pea');
    const target = screen.getByRole('radio', { name: 'CTO' });

    target.focus();
    await user.keyboard(key);

    expect(target).toBeChecked();
  });

  it('ignores other keys', async () => {
    const user = userEvent.setup();
    await renderChips('pea');

    screen.getByRole('radio', { name: 'PEA' }).focus();
    await user.keyboard('a');

    expect(screen.getByRole('radio', { name: 'PEA' })).toBeChecked();
  });

  it('disables every chip and dims them', async () => {
    const user = userEvent.setup();
    await renderChips('pea', '[disabled]="true"');

    const chip = screen.getByRole('radio', { name: 'CTO' });
    expect(chip).toBeDisabled();
    expect(chip).toHaveClass('disabled:opacity-50');

    await user.click(chip);
    expect(screen.getByRole('radio', { name: 'PEA' })).toBeChecked();
  });

  it('marks itself touched once focus leaves the group', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(
      '<ui-choice-chips [options]="options" ariaLabel="Env" [(value)]="value" [(touched)]="touched" /><button>after</button>',
      { imports: [UiChoiceChips], componentProperties: { options, value: 'pea', touched: false } },
    );

    await user.click(screen.getByRole('radio', { name: 'CTO' }));
    expect(fixture.componentInstance).toHaveProperty('touched', false);

    await user.click(screen.getByRole('button', { name: 'after' }));
    expect(fixture.componentInstance).toHaveProperty('touched', true);
  });

  it('does not mark touched while focus moves between chips', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(
      '<ui-choice-chips [options]="options" ariaLabel="Env" [(value)]="value" [(touched)]="touched" />',
      { imports: [UiChoiceChips], componentProperties: { options, value: 'pea', touched: false } },
    );

    screen.getByRole('radio', { name: 'PEA' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(fixture.componentInstance).toHaveProperty('touched', false);
  });
});
