import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiMenu, UiMenuItem, UiMenuTrigger } from './menu';

describe('UiMenu', () => {
  const template = `
    <button type="button" [uiMenuTrigger]="menu">More</button>
    <ui-menu #menu label="Line actions">
      <button uiMenuItem (click)="edited()">Edit</button>
      <button uiMenuItem destructive>Delete the line</button>
    </ui-menu>`;

  it('wires the trigger for assistive technology', async () => {
    await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem], componentProperties: { edited: vi.fn() } });

    const trigger = screen.getByRole('button', { name: 'More' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens on click, focuses the first item, and marks the trigger expanded', async () => {
    await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem], componentProperties: { edited: vi.fn() } });

    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    expect(screen.getByRole('menu', { name: 'Line actions' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves with the arrow keys and wraps', async () => {
    await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem], componentProperties: { edited: vi.fn() } });
    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Delete the line' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  });

  it('closes after choosing an item and gives focus back to the trigger', async () => {
    const edited = vi.fn();
    await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem], componentProperties: { edited } });
    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(edited).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'More' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('paints a destructive item in the negative color', async () => {
    await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem], componentProperties: { edited: vi.fn() } });
    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    expect(screen.getByRole('menuitem', { name: 'Delete the line' })).toHaveClass(
      'text-(--negative)',
      'hover:bg-(--glow)',
    );
  });

  it('draws the focus ring inside the item on keyboard focus', async () => {
    await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem], componentProperties: { edited: vi.fn() } });
    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    expect(screen.getByRole('menuitem', { name: 'Delete the line' })).toHaveClass(
      'focus-visible:bg-(--glow)',
      'focus-visible:outline-2',
      'focus-visible:-outline-offset-2',
      'focus-visible:outline-(--ring)',
    );
  });

  it('sizes items 44 px on touch and 36 px with a mouse, and leaves the width to the consumer', async () => {
    await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem], componentProperties: { edited: vi.fn() } });
    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    expect(screen.getByRole('menuitem', { name: 'Delete the line' })).toHaveClass(
      'min-h-11',
      'px-3',
      'text-body',
      'pointer-fine:min-h-9',
      'pointer-fine:px-2.5',
      'pointer-fine:text-label',
    );
    expect(screen.getByRole('menu', { hidden: true })).not.toHaveClass('min-w-55');
  });

  it('wraps upward from the first item to the last', async () => {
    await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem], componentProperties: { edited: vi.fn() } });
    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Delete the line' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  });

  it('jumps to the first and the last item with Home and End', async () => {
    await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem], componentProperties: { edited: vi.fn() } });
    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    await userEvent.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Delete the line' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  });

  it('ignores a key that has no meaning for the menu', async () => {
    await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem], componentProperties: { edited: vi.fn() } });
    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    await userEvent.keyboard('a');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  });

  it('closes and returns focus on Escape', async () => {
    await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem], componentProperties: { edited: vi.fn() } });
    const trigger = screen.getByRole('button', { name: 'More' });
    await userEvent.click(trigger);

    await userEvent.keyboard('{Escape}');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes when the trigger is clicked again', async () => {
    await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem], componentProperties: { edited: vi.fn() } });
    const trigger = screen.getByRole('button', { name: 'More' });
    await userEvent.click(trigger);

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('still opens, focuses and closes without a native Popover API', async () => {
    const proto = HTMLElement.prototype as unknown as { showPopover?: () => void; hidePopover?: () => void };
    const { showPopover, hidePopover } = proto;
    proto.showPopover = undefined;
    proto.hidePopover = undefined;

    try {
      const { fixture } = await render(template, {
        imports: [UiMenu, UiMenuTrigger, UiMenuItem],
        componentProperties: { edited: vi.fn() },
      });
      const trigger = screen.getByRole('button', { name: 'More' });

      await userEvent.click(trigger);
      expect(screen.getByRole('menuitem', { name: 'Edit', hidden: true })).toHaveFocus();

      screen.getByRole('menuitem', { name: 'Edit', hidden: true }).click();
      await fixture.whenStable();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    } finally {
      proto.showPopover = showPopover;
      proto.hidePopover = hidePopover;
    }
  });

  it('closes and returns focus on Tab', async () => {
    await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem], componentProperties: { edited: vi.fn() } });
    const trigger = screen.getByRole('button', { name: 'More' });
    await userEvent.click(trigger);

    await userEvent.keyboard('{Tab}');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('flips above the trigger when there is no room below', async () => {
    const { container } = await render(template, {
      imports: [UiMenu, UiMenuTrigger, UiMenuItem],
      componentProperties: { edited: vi.fn() },
    });
    const trigger = screen.getByRole('button', { name: 'More' });
    const menu = container.querySelector('ui-menu') as HTMLElement;
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({ top: 580, bottom: 600, right: 300 } as DOMRect);
    vi.spyOn(menu, 'getBoundingClientRect').mockReturnValue({ height: 100, width: 200 } as DOMRect);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(600);

    await userEvent.click(trigger);

    expect(menu.style.transformOrigin).toBe('bottom right');
    expect(menu.style.top).toBe('476px');
  });

  describe('sheet', () => {
    const sheetTemplate = `
      <button type="button" [uiMenuTrigger]="menu">More</button>
      <ui-menu #menu label="Account actions" sheet heading="Livret A">
        <button uiMenuItem>Edit</button>
        <button uiMenuItem destructive>Delete</button>
      </ui-menu>`;
    const imports = [UiMenu, UiMenuTrigger, UiMenuItem];

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('is a popover everywhere by default and draws no heading', async () => {
      const { container } = await render(template, { imports, componentProperties: { edited: vi.fn() } });

      const menu = container.querySelector('ui-menu') as HTMLElement;
      expect(menu.className).not.toContain('max-lg:');
      expect(menu.textContent).not.toContain('Livret A');
    });

    it('becomes a bottom action sheet below 64rem', async () => {
      const { container } = await render(sheetTemplate, { imports });

      const menu = container.querySelector('ui-menu') as HTMLElement;
      expect(menu).toHaveClass(
        'max-lg:fixed',
        'max-lg:inset-x-4',
        'max-lg:top-auto',
        'max-lg:bottom-[calc(76px+env(safe-area-inset-bottom))]',
        'max-lg:p-1.5',
        'max-lg:bg-(--card)',
        'max-lg:backdrop:bg-[rgb(0_0_0/0.36)]',
        'max-lg:translate-y-4',
        'max-lg:open:translate-y-0',
      );
    });

    it('names the sheet with a heading that is not a menu item', async () => {
      await render(sheetTemplate, { imports });

      const heading = screen.getByText('Livret A', { exact: true });
      expect(heading).toHaveClass('lg:hidden', 'text-label', 'leading-[17px]', 'text-(--muted-foreground)');
      expect(heading).toHaveAttribute('aria-hidden', 'true');
    });

    it('draws 48 px body-text items below 64rem and the popover items from 64rem', async () => {
      await render(sheetTemplate, { imports });

      const item = screen.getByRole('menuitem', { name: 'Edit', hidden: true });
      expect(item).toHaveClass(
        'min-h-12',
        'lg:min-h-11',
        'lg:pointer-fine:min-h-9',
        'max-lg:active:bg-(--soft)',
        'rounded-[calc(var(--radius-container)-6px)]',
        'lg:rounded-[calc(var(--radius-container)-4px)]',
      );
      expect(item).not.toHaveClass('min-h-11');
    });

    it('leaves the items of a plain menu as they were', async () => {
      await render(template, { imports, componentProperties: { edited: vi.fn() } });

      expect(screen.getByRole('menuitem', { name: 'Edit', hidden: true })).toHaveClass('min-h-11');
    });

    it('does not position itself against the trigger while it is a sheet', async () => {
      vi.stubGlobal('matchMedia', () => ({ matches: false }));
      const { container } = await render(sheetTemplate, { imports });
      const menu = container.querySelector('ui-menu') as HTMLElement;

      await userEvent.click(screen.getByRole('button', { name: 'More' }));

      expect(menu.style.top).toBe('');
      expect(menu.style.left).toBe('');
    });

    it('still positions itself from 64rem', async () => {
      vi.stubGlobal('matchMedia', () => ({ matches: true }));
      const { container } = await render(sheetTemplate, { imports });
      const menu = container.querySelector('ui-menu') as HTMLElement;

      await userEvent.click(screen.getByRole('button', { name: 'More' }));

      expect(menu.style.position).toBe('fixed');
    });
  });

  describe('width', () => {
    const imports = [UiMenu, UiMenuTrigger, UiMenuItem];

    it('leaves the width to the content by default', async () => {
      const { container } = await render(template, { imports, componentProperties: { edited: vi.fn() } });

      const menu = container.querySelector('ui-menu') as HTMLElement;
      expect(menu.className).not.toContain('w-(--ui-menu-width)');
      expect(menu.style.getPropertyValue('--ui-menu-width')).toBe('');
    });

    it('ignores a width that is not a number', async () => {
      const { container } = await render(
        `<ui-menu label="Line actions" width="wide"><button uiMenuItem>Edit</button></ui-menu>`,
        { imports },
      );

      const menu = container.querySelector('ui-menu') as HTMLElement;
      expect(menu.className).not.toContain('w-(--ui-menu-width)');
      expect(menu.style.getPropertyValue('--ui-menu-width')).toBe('');
    });

    it('accepts a static width attribute', async () => {
      const { container } = await render(
        `<ui-menu label="Line actions" width="208"><button uiMenuItem>Edit</button></ui-menu>`,
        { imports },
      );

      expect((container.querySelector('ui-menu') as HTMLElement).style.getPropertyValue('--ui-menu-width')).toBe(
        '208px',
      );
    });

    it('sets a fixed width in pixels', async () => {
      const { container } = await render(
        `<ui-menu label="Line actions" [width]="210"><button uiMenuItem>Edit</button></ui-menu>`,
        { imports },
      );

      const menu = container.querySelector('ui-menu') as HTMLElement;
      expect(menu).toHaveClass('w-(--ui-menu-width)');
      expect(menu.style.getPropertyValue('--ui-menu-width')).toBe('210px');
    });

    it('keeps a sheet full width below 64rem and applies the width from 64rem', async () => {
      const { container } = await render(
        `<ui-menu label="Account actions" sheet [width]="210"><button uiMenuItem>Edit</button></ui-menu>`,
        { imports },
      );

      const menu = container.querySelector('ui-menu') as HTMLElement;
      expect(menu).toHaveClass('lg:w-(--ui-menu-width)', 'max-lg:w-auto');
      expect(menu).not.toHaveClass('w-(--ui-menu-width)');
    });
  });

  describe('item icons', () => {
    const imports = [UiMenu, UiMenuTrigger, UiMenuItem];

    it('sizes a leading svg 18 px on touch and 16 px with a mouse', async () => {
      await render(template, { imports, componentProperties: { edited: vi.fn() } });

      expect(screen.getByRole('menuitem', { name: 'Edit', hidden: true })).toHaveClass(
        '[&>svg]:size-[18px]',
        '[&>svg]:flex-none',
        'pointer-fine:[&>svg]:size-4',
      );
    });

    it('sizes the svg of a sheet 20 px below 64rem and as a popover from 64rem', async () => {
      await render(`<ui-menu label="Actions" sheet><button uiMenuItem>Edit</button></ui-menu>`, { imports });

      expect(screen.getByRole('menuitem', { name: 'Edit', hidden: true })).toHaveClass(
        '[&>svg]:size-5',
        'lg:[&>svg]:size-[18px]',
        'lg:pointer-fine:[&>svg]:size-4',
      );
    });
  });
});
