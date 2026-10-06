import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiMenu, UiMenuItem, UiMenuTrigger } from './menu';

describe('UiMenu layout', () => {
  const imports = [UiMenu, UiMenuTrigger, UiMenuItem];
  const template = `
    <button type="button" [uiMenuTrigger]="menu">More</button>
    <ui-menu #menu label="Line actions" [sheet]="sheet">
      <button uiMenuItem>Renommer</button>
      <button uiMenuItem destructive>Supprimer la ligne</button>
    </ui-menu>`;

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('keeps each item on one line, left aligned', async () => {
    await render(template, { imports, componentProperties: { sheet: false } });

    expect(screen.getByRole('menuitem', { name: 'Renommer', hidden: true })).toHaveClass(
      'whitespace-nowrap',
      'text-left',
    );
  });

  it('keeps each sheet item on one line, left aligned', async () => {
    await render(template, { imports, componentProperties: { sheet: true } });

    expect(screen.getByRole('menuitem', { name: 'Renommer', hidden: true })).toHaveClass(
      'whitespace-nowrap',
      'text-left',
    );
  });

  it('places itself from its layout width, not from its scaled entry box, and frees its right and bottom edges', async () => {
    const { container } = await render(template, { imports, componentProperties: { sheet: false } });
    const trigger = screen.getByRole('button', { name: 'More' });
    const menu = container.querySelector('ui-menu') as HTMLElement;
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({ top: 40, bottom: 84, right: 386 } as DOMRect);
    vi.spyOn(menu, 'getBoundingClientRect').mockReturnValue({ height: 133, width: 199.5 } as DOMRect);
    vi.spyOn(menu, 'offsetHeight', 'get').mockReturnValue(140);
    vi.spyOn(menu, 'offsetWidth', 'get').mockReturnValue(210);
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(390);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(844);

    await userEvent.click(trigger);

    expect(menu.style.left).toBe('172px');
    expect(menu.style.right).toBe('auto');
    expect(menu.style.bottom).toBe('auto');
  });

  it('clears the edges it set as a popover when it opens as a sheet', async () => {
    let wide = true;
    vi.stubGlobal('matchMedia', () => ({ matches: wide }));
    const { container } = await render(template, { imports, componentProperties: { sheet: true } });
    const trigger = screen.getByRole('button', { name: 'More' });
    const menu = container.querySelector('ui-menu') as HTMLElement;

    await userEvent.click(trigger);
    expect(menu.style.right).toBe('auto');
    await userEvent.click(trigger);

    wide = false;
    await userEvent.click(trigger);

    expect(menu.style.left).toBe('');
    expect(menu.style.right).toBe('');
    expect(menu.style.bottom).toBe('');
  });
});
