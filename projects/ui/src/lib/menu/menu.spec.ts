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
});
