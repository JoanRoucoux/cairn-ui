import { UiMenu, UiMenuItem } from '@joanroucoux/cairn-ui/menu';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { type Mock } from 'vitest';

import { UiSelectPill } from './select-pill';

const template = (active: boolean): string => `
  <ui-select-pill [active]="${active}" clearLabel="Remove the account filter" contextLabel="Account" (cleared)="cleared()">
    {{ label }}
    <ui-menu label="Account" sheet>
      <button uiMenuItem [checked]="!${active}">All accounts</button>
      <button uiMenuItem [checked]="${active}">Northwind PEA</button>
    </ui-menu>
  </ui-select-pill>`;

const setup = (active = false): { cleared: Mock; ready: ReturnType<typeof render> } => {
  const cleared = vi.fn();
  return {
    cleared,
    ready: render(template(active), {
      imports: [UiSelectPill, UiMenu, UiMenuItem],
      componentProperties: { cleared, label: active ? 'Northwind PEA' : 'All accounts' },
    }),
  };
};

describe('UiSelectPill', () => {
  it('names the trigger with its label and opens the projected menu with its radio items', async () => {
    await setup().ready;

    const trigger = screen.getByRole('button', { name: 'All accounts' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(2);
    expect(screen.getByRole('menuitemradio', { name: 'All accounts' })).toHaveFocus();
  });

  it('draws an outlined pill on the card surface with a chevron and no cross at rest', async () => {
    await setup().ready;
    const pill = screen.getByRole('button', { name: 'All accounts' }).querySelector('[data-pill]');

    expect(pill).toHaveClass(
      'bg-(--card)',
      'text-(--foreground)',
      'shadow-[inset_0_0_0_1px_var(--border)]',
      'rounded-pill',
    );
    expect(pill).not.toHaveClass('bg-(--primary)');
    expect(document.querySelector('[data-chevron]')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove the account filter' })).not.toBeInTheDocument();
  });

  it('turns solid primary and swaps the chevron for a separate cross when active', async () => {
    await setup(true).ready;
    const pill = screen.getByRole('button', { name: 'Account Northwind PEA' }).querySelector('[data-pill]');

    expect(pill).toHaveClass('bg-(--primary)', 'text-(--primary-foreground)');
    expect(pill).not.toHaveClass('bg-(--card)');
    expect(document.querySelector('[data-chevron]')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove the account filter' })).not.toContainElement(pill as HTMLElement);
  });

  it('emits cleared from the cross without opening the menu', async () => {
    const { cleared, ready } = setup(true);
    await ready;

    await userEvent.click(screen.getByRole('button', { name: 'Remove the account filter' }));

    expect(cleared).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Account Northwind PEA' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('draws a 14 px cross', async () => {
    await setup(true).ready;

    const icon = screen.getByRole('button', { name: 'Remove the account filter' }).querySelector('svg');
    expect(icon).toHaveAttribute('width', '14');
    expect(icon).toHaveAttribute('height', '14');
  });

  it('is 34 px in a 44 px target on touch and 32 px with a fine pointer', async () => {
    await setup().ready;
    const trigger = screen.getByRole('button', { name: 'All accounts' });

    expect(trigger).toHaveClass('h-11', 'pointer-fine:h-8');
    expect(trigger.querySelector('[data-pill]')).toHaveClass('h-[34px]', 'pr-[30px]', 'pl-3', 'pointer-fine:h-8');
  });

  it('draws its focus ring as an outline 2 px outside the pill at every size', async () => {
    await setup().ready;

    expect(screen.getByRole('button', { name: 'All accounts' })).toHaveClass(
      '-mx-[5px]',
      'border-x-[5px]',
      'border-transparent',
      'focus-visible:outline-2',
      'focus-visible:-outline-offset-5',
      'focus-visible:outline-(--ring)',
      'pointer-fine:mx-0',
      'pointer-fine:border-x-0',
      'pointer-fine:focus-visible:outline-offset-0',
    );
  });

  it('rings the cross in the pill text color, a 24 px circle around its icon at every size', async () => {
    await setup(true).ready;

    expect(screen.getByRole('button', { name: 'Remove the account filter' })).toHaveClass(
      'focus-visible:outline-2',
      'focus-visible:outline-(--primary-foreground)',
      'focus-visible:-outline-offset-7',
      'pointer-fine:focus-visible:-outline-offset-6',
    );
  });

  it('keeps a visible border of its own in forced colors', async () => {
    await setup().ready;

    expect(screen.getByRole('button', { name: 'All accounts' }).querySelector('[data-pill]')).toHaveClass(
      'forced-colors:border',
    );
  });

  it('gives the cross a 44 px hit area on touch and 36 px with a fine pointer around its 14 px icon', async () => {
    await setup(true).ready;

    expect(screen.getByRole('button', { name: 'Remove the account filter' })).toHaveClass(
      'after:absolute',
      'after:-inset-[5px]',
      'pointer-fine:after:-inset-0.5',
    );
  });

  it('puts focus back on the trigger when the cross clears the filter', async () => {
    await setup(true).ready;

    await userEvent.click(screen.getByRole('button', { name: 'Remove the account filter' }));

    expect(screen.getByRole('button', { name: 'Account Northwind PEA' })).toHaveFocus();
  });

  it('keeps the context out of the name at rest', async () => {
    await setup().ready;

    expect(screen.getByRole('button', { name: 'All accounts' })).toBeInTheDocument();
  });

  it('dims, locks the trigger and drops the cross when disabled', async () => {
    const cleared = vi.fn();
    const { container } = await render(
      `<ui-select-pill active disabled clearLabel="Remove the account filter" (cleared)="cleared()">
         Northwind PEA
         <ui-menu label="Account"><button uiMenuItem>Northwind PEA</button></ui-menu>
       </ui-select-pill>`,
      { imports: [UiSelectPill, UiMenu, UiMenuItem], componentProperties: { cleared } },
    );
    const trigger = screen.getByRole('button', { name: 'Northwind PEA' });

    expect(container.querySelector('ui-select-pill')).toHaveClass('opacity-40');
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    expect(trigger).toHaveClass('disabled:pointer-events-none');
    expect(screen.queryByRole('button', { name: 'Remove the account filter' })).not.toBeInTheDocument();
    expect(container.querySelector('[data-chevron]')).toHaveClass('text-(--primary-foreground)');

    await userEvent.click(trigger);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('is not dimmed and not aria-disabled by default', async () => {
    const { container } = await setup().ready;

    expect(container.querySelector('ui-select-pill')).not.toHaveClass('opacity-40');
    expect(screen.getByRole('button', { name: 'All accounts' })).not.toHaveAttribute('aria-disabled');
    expect(container.querySelector('[data-chevron]')).toHaveClass('text-(--foreground)');
  });
});
