import { UiMenu, UiMenuItem } from '@joanroucoux/cairn-ui/menu';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { type Mock } from 'vitest';

import { UiSelectPill } from './select-pill';

const template = (active: boolean): string => `
  <ui-select-pill [active]="${active}" clearLabel="Retirer le filtre de compte" contextLabel="Compte" (cleared)="cleared()">
    {{ label }}
    <ui-menu label="Compte" sheet>
      <button uiMenuItem [checked]="!${active}">Tous les comptes</button>
      <button uiMenuItem [checked]="${active}">Northwind PEA</button>
    </ui-menu>
  </ui-select-pill>`;

const setup = (active = false): { cleared: Mock; ready: ReturnType<typeof render> } => {
  const cleared = vi.fn();
  return {
    cleared,
    ready: render(template(active), {
      imports: [UiSelectPill, UiMenu, UiMenuItem],
      componentProperties: { cleared, label: active ? 'Northwind PEA' : 'Tous les comptes' },
    }),
  };
};

describe('UiSelectPill', () => {
  it('names the trigger with its label and opens the projected menu with its radio items', async () => {
    await setup().ready;

    const trigger = screen.getByRole('button', { name: 'Tous les comptes' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: 'Compte' })).toBeInTheDocument();
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(2);
    expect(screen.getByRole('menuitemradio', { name: 'Tous les comptes' })).toHaveFocus();
  });

  it('draws an outlined pill on the card surface with a chevron and no cross at rest', async () => {
    await setup().ready;
    const pill = screen.getByRole('button', { name: 'Tous les comptes' }).querySelector('[data-pill]');

    expect(pill).toHaveClass(
      'bg-(--card)',
      'text-(--foreground)',
      'shadow-[inset_0_0_0_1px_var(--border)]',
      'rounded-pill',
    );
    expect(pill).not.toHaveClass('bg-(--primary)');
    expect(document.querySelector('[data-chevron]')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retirer le filtre de compte' })).not.toBeInTheDocument();
  });

  it('turns solid primary and swaps the chevron for a separate cross when active', async () => {
    await setup(true).ready;
    const pill = screen.getByRole('button', { name: 'Compte Northwind PEA' }).querySelector('[data-pill]');

    expect(pill).toHaveClass('bg-(--primary)', 'text-(--primary-foreground)');
    expect(pill).not.toHaveClass('bg-(--card)');
    expect(document.querySelector('[data-chevron]')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retirer le filtre de compte' })).not.toContainElement(
      pill as HTMLElement,
    );
  });

  it('emits cleared from the cross without opening the menu', async () => {
    const { cleared, ready } = setup(true);
    await ready;

    await userEvent.click(screen.getByRole('button', { name: 'Retirer le filtre de compte' }));

    expect(cleared).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Compte Northwind PEA' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('draws a 14 px cross', async () => {
    await setup(true).ready;

    const icon = screen.getByRole('button', { name: 'Retirer le filtre de compte' }).querySelector('svg');
    expect(icon).toHaveAttribute('width', '14');
    expect(icon).toHaveAttribute('height', '14');
  });

  it('is 34 px in a 44 px target on touch and 32 px with a fine pointer', async () => {
    await setup().ready;
    const trigger = screen.getByRole('button', { name: 'Tous les comptes' });

    expect(trigger).toHaveClass('h-11', 'pointer-fine:h-8');
    expect(trigger.querySelector('[data-pill]')).toHaveClass('h-[34px]', 'pr-[30px]', 'pl-3', 'pointer-fine:h-8');
  });

  it('draws its focus ring as an outline 2 px outside the pill at every size', async () => {
    await setup().ready;

    expect(screen.getByRole('button', { name: 'Tous les comptes' })).toHaveClass(
      'focus-visible:outline-2',
      'focus-visible:-outline-offset-5',
      'focus-visible:outline-(--ring)',
      'pointer-fine:focus-visible:outline-offset-0',
    );
  });

  it('keeps a visible border of its own in forced colors', async () => {
    await setup().ready;

    expect(screen.getByRole('button', { name: 'Tous les comptes' }).querySelector('[data-pill]')).toHaveClass(
      'forced-colors:border',
    );
  });

  it('gives the cross a 44 px hit area on touch and 36 px with a fine pointer around its 14 px icon', async () => {
    await setup(true).ready;

    expect(screen.getByRole('button', { name: 'Retirer le filtre de compte' })).toHaveClass(
      'after:absolute',
      'after:-inset-[5px]',
      'pointer-fine:after:-inset-0.5',
    );
  });

  it('puts focus back on the trigger when the cross clears the filter', async () => {
    await setup(true).ready;

    await userEvent.click(screen.getByRole('button', { name: 'Retirer le filtre de compte' }));

    expect(screen.getByRole('button', { name: 'Compte Northwind PEA' })).toHaveFocus();
  });

  it('keeps the context out of the name at rest', async () => {
    await setup().ready;

    expect(screen.getByRole('button', { name: 'Tous les comptes' })).toBeInTheDocument();
  });
});
