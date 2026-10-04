import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiMenu, UiMenuItem, UiMenuTrigger } from './menu';

describe('UiMenuItem as a radio choice', () => {
  const imports = [UiMenu, UiMenuTrigger, UiMenuItem];
  const radios = `
    <button type="button" [uiMenuTrigger]="menu">Account</button>
    <ui-menu #menu label="Account">
      <button uiMenuItem [checked]="false">All accounts</button>
      <button uiMenuItem [checked]="true">Northwind PEA</button>
      <button uiMenuItem [checked]="false">Contoso CTO</button>
    </ui-menu>`;

  it('exposes a checked item as a menuitemradio with aria-checked', async () => {
    await render(radios, { imports });

    expect(screen.getAllByRole('menuitemradio', { hidden: true })).toHaveLength(3);
    expect(screen.getByRole('menuitemradio', { name: 'Northwind PEA', hidden: true })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('menuitemradio', { name: 'Contoso CTO', hidden: true })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('draws the check mark on the current item only, after its label', async () => {
    await render(radios, { imports });

    expect(screen.getByRole('menuitemradio', { name: 'Northwind PEA', hidden: true })).toHaveClass(
      'after:ms-auto',
      'after:rotate-45',
      'after:border-current',
    );
    expect(screen.getByRole('menuitemradio', { name: 'Contoso CTO', hidden: true })).not.toHaveClass('after:rotate-45');
  });

  it('focuses the checked item on open and keeps a plain item a menuitem', async () => {
    await render(radios, { imports });

    await userEvent.click(screen.getByRole('button', { name: 'Account' }));

    expect(screen.getByRole('menuitemradio', { name: 'Northwind PEA' })).toHaveFocus();
  });

  it('leaves aria-checked off an item without checked', async () => {
    await render(`<ui-menu label="Actions"><button uiMenuItem>Edit</button></ui-menu>`, { imports });

    expect(screen.getByRole('menuitem', { name: 'Edit', hidden: true })).not.toHaveAttribute('aria-checked');
  });
});
