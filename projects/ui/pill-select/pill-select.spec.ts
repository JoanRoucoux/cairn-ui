import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiPillSelect } from './pill-select';

const OPTIONS = `
  <option value="">Tous les comptes</option>
  <option value="pea">Northwind PEA</option>
  <option value="cto">Contoso CTO</option>
`;

describe('UiPillSelect', () => {
  it('keeps the native select, its name and its choices', async () => {
    const user = userEvent.setup();
    await render(`<select uiPillSelect aria-label="Compte">${OPTIONS}</select>`, { imports: [UiPillSelect] });

    const select = screen.getByRole('combobox', { name: 'Compte' });
    await user.selectOptions(select, 'pea');

    expect(select).toHaveValue('pea');
  });

  it('draws an outlined pill on the card surface with the foreground chevron at rest', async () => {
    await render(`<select uiPillSelect aria-label="Compte">${OPTIONS}</select>`, { imports: [UiPillSelect] });
    const select = screen.getByRole('combobox', { name: 'Compte' });

    expect(select).toHaveClass(
      'bg-(--card)',
      'text-(--foreground)',
      'bg-(image:--chevron-pill)',
      'shadow-[inset_0_0_0_1px_var(--border)]',
      'rounded-pill',
    );
    expect(select).not.toHaveClass('bg-(--primary)');
  });

  it('turns solid primary with the primary-foreground chevron when active', async () => {
    await render(`<select uiPillSelect aria-label="Compte" [active]="true">${OPTIONS}</select>`, {
      imports: [UiPillSelect],
    });
    const select = screen.getByRole('combobox', { name: 'Compte' });

    expect(select).toHaveClass('bg-(--primary)', 'text-(--primary-foreground)', 'bg-(image:--chevron-pill-active)');
    expect(select).not.toHaveClass('bg-(--card)');
  });

  it('is 34 px in a 44 px target on touch and 32 px with a fine pointer', async () => {
    await render(`<select uiPillSelect aria-label="Compte">${OPTIONS}</select>`, { imports: [UiPillSelect] });
    const select = screen.getByRole('combobox', { name: 'Compte' });

    expect(select).toHaveClass(
      'h-11',
      'border-[5px]',
      '-mx-[5px]',
      'pr-[30px]',
      'pl-3',
      'pointer-fine:h-8',
      'pointer-fine:mx-0',
      'pointer-fine:border-0',
    );
  });

  it('draws its focus ring as an outline 2 px outside the pill at every size', async () => {
    await render(`<select uiPillSelect aria-label="Compte">${OPTIONS}</select>`, { imports: [UiPillSelect] });
    const select = screen.getByRole('combobox', { name: 'Compte' });

    expect(select).toHaveClass(
      'focus-visible:outline-2',
      'focus-visible:-outline-offset-5',
      'focus-visible:outline-(--ring)',
      'pointer-fine:focus-visible:outline-offset-0',
    );
  });
});
