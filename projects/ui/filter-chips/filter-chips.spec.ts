import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { type FilterChipOption, UiFilterChips } from './filter-chips';

const classes: FilterChipOption[] = [
  { value: 'all', label: 'Toutes', count: 31 },
  { value: 'etf', label: 'ETF', count: 6 },
  { value: 'fund', label: 'Fonds', count: 8 },
];

const template = `<ui-filter-chips ariaLabel="Filtrer par classe d'actif" [options]="options" [(value)]="value" />`;

describe('UiFilterChips', () => {
  it('names a group of toggle buttons, one per option, with the count after the label', async () => {
    await render(template, { imports: [UiFilterChips], componentProperties: { options: classes, value: 'all' } });

    expect(screen.getByRole('group', { name: "Filtrer par classe d'actif" })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'ETF 6' })).toBeInTheDocument();
  });

  it('presses only the chip matching the value', async () => {
    await render(template, { imports: [UiFilterChips], componentProperties: { options: classes, value: 'etf' } });

    expect(screen.getByRole('button', { name: /^ETF/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^Toutes/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /^Fonds/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('draws the active chip in primary with its count, the others on the card surface', async () => {
    await render(template, { imports: [UiFilterChips], componentProperties: { options: classes, value: 'etf' } });
    const active = screen.getByRole('button', { name: /^ETF/ });
    const idle = screen.getByRole('button', { name: /^Fonds/ });

    expect(active.querySelector('[data-chip]')).toHaveClass('bg-(--primary)', 'text-(--primary-foreground)');
    expect(active.querySelector('[data-count]')).toHaveClass('text-(--primary-foreground)');
    expect(idle.querySelector('[data-chip]')).toHaveClass('bg-(--card)', 'text-(--foreground)');
    expect(idle.querySelector('[data-count]')).toHaveClass('text-(--subtle-foreground)');
  });

  it('sizes the pill 34px inside a 44px target on touch and 32px on a fine pointer', async () => {
    await render(template, { imports: [UiFilterChips], componentProperties: { options: classes, value: 'all' } });
    const button = screen.getByRole('button', { name: /^ETF/ });

    expect(button).toHaveClass('h-11', 'pointer-fine:h-8');
    expect(button.querySelector('[data-chip]')).toHaveClass(
      'h-[34px]',
      'px-3.5',
      'pointer-fine:h-8',
      'pointer-fine:px-3',
    );
  });

  it('scrolls on one line on touch and wraps on a fine pointer', async () => {
    await render(template, { imports: [UiFilterChips], componentProperties: { options: classes, value: 'all' } });
    const group = screen.getByRole('group').parentElement;

    expect(group).toHaveClass('overflow-x-auto', '[scrollbar-width:none]', 'pointer-fine:flex-wrap');
    expect(screen.getByRole('button', { name: /^ETF/ })).toHaveClass('flex-none');
  });

  it('updates the value when a chip is clicked, and one choice at a time', async () => {
    const { fixture } = await render(template, {
      imports: [UiFilterChips],
      componentProperties: { options: classes, value: 'all' },
    });

    await userEvent.click(screen.getByRole('button', { name: /^Fonds/ }));

    expect(fixture.componentInstance.value).toBe('fund');
    expect(screen.getByRole('button', { name: /^Fonds/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^Toutes/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('keeps every chip in the tab order and activates with Enter or Space', async () => {
    const { fixture } = await render(template, {
      imports: [UiFilterChips],
      componentProperties: { options: classes, value: 'all' },
    });

    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: /^ETF/ })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(fixture.componentInstance.value).toBe('etf');

    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(fixture.componentInstance.value).toBe('fund');
  });

  it('omits the count when absent, as before the data arrives', async () => {
    const labelsOnly: FilterChipOption[] = [
      { value: 'all', label: 'Toutes' },
      { value: 'etf', label: 'ETF', count: null },
    ];
    const { fixture } = await render(template, {
      imports: [UiFilterChips],
      componentProperties: { options: labelsOnly, value: 'all' },
    });

    expect(fixture.nativeElement.querySelectorAll('[data-count]')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'ETF' })).toBeInTheDocument();
  });

  it('shows a count of zero', async () => {
    await render(template, {
      imports: [UiFilterChips],
      componentProperties: { options: [{ value: 'a', label: 'Crypto', count: 0 }], value: 'a' },
    });

    expect(screen.getByRole('button', { name: 'Crypto 0' })).toBeInTheDocument();
  });

  it('rings the pill on hover with a fine pointer and scales the button on press', async () => {
    await render(template, { imports: [UiFilterChips], componentProperties: { options: classes, value: 'all' } });
    const button = screen.getByRole('button', { name: /^ETF/ });

    expect(button).toHaveClass('group/chip', 'active:scale-(--press-scale)');
    expect(button.querySelector('[data-chip]')).toHaveClass(
      'pointer-fine:group-hover/chip:shadow-[inset_0_0_0_1px_var(--muted-foreground)]',
    );
  });

  it('shows the focus ring inside the pill on touch and outside it on a fine pointer', async () => {
    await render(template, { imports: [UiFilterChips], componentProperties: { options: classes, value: 'all' } });

    expect(screen.getByRole('button', { name: /^ETF/ })).toHaveClass(
      'rounded-pill',
      'focus-visible:outline-2',
      'focus-visible:-outline-offset-2',
      'pointer-fine:focus-visible:outline-offset-2',
      'focus-visible:outline-(--ring)',
    );
  });
});

describe('UiFilterChips leading slot', () => {
  const withLeading = `
    <ui-filter-chips ariaLabel="Filtrer par classe d'actif" [options]="options" [(value)]="value">
      <select uiChipsLeading aria-label="Compte"><option>Tous les comptes</option></select>
    </ui-filter-chips>`;

  it('projects the leading element first, followed by an aria-hidden rule', async () => {
    const { container } = await render(withLeading, {
      imports: [UiFilterChips],
      componentProperties: { options: classes, value: 'all' },
    });
    const host = container.querySelector('ui-filter-chips')!;
    const rule = host.querySelector('[data-chips-rule]')!;

    expect(host.firstElementChild).toBe(screen.getByRole('combobox', { name: 'Compte' }));
    expect(rule.previousElementSibling).toBe(host.firstElementChild);
    expect(rule).toHaveAttribute('aria-hidden', 'true');
    expect(rule).toHaveClass('hidden', 'h-5', 'w-px', 'bg-(--border)', '[[uiChipsLeading]+&]:block');
  });

  it('keeps the leading element outside the chips group', async () => {
    await render(withLeading, { imports: [UiFilterChips], componentProperties: { options: classes, value: 'all' } });

    expect(screen.getByRole('group', { name: "Filtrer par classe d'actif" })).not.toContainElement(
      screen.getByRole('combobox', { name: 'Compte' }),
    );
  });
});
