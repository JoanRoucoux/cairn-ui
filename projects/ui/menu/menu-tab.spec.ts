import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiMenu, UiMenuItem, UiMenuTrigger } from './menu';

describe('UiMenu Tab and Escape', () => {
  const template = `
    <button type="button" [uiMenuTrigger]="menu">More</button>
    <ui-menu #menu label="Holding actions">
      <button uiMenuItem>Edit</button>
      <button uiMenuItem destructive>Delete the holding</button>
    </ui-menu>`;

  const pressInMenu = async (init: KeyboardEventInit): Promise<{ event: KeyboardEvent; trigger: HTMLElement }> => {
    const { fixture } = await render(template, { imports: [UiMenu, UiMenuTrigger, UiMenuItem] });
    const trigger = screen.getByRole('button', { name: 'More' });
    await userEvent.click(trigger);
    const event = new KeyboardEvent('keydown', { ...init, bubbles: true, cancelable: true });

    screen.getByRole('menu', { hidden: true }).dispatchEvent(event);

    await fixture.whenStable();

    return { event, trigger };
  };

  it.each([false, true])(
    'closes on Tab (shift: %s) with the trigger focused and keeps the default action',
    async (shiftKey) => {
      const { event, trigger } = await pressInMenu({ key: 'Tab', shiftKey });

      expect(event.defaultPrevented).toBe(false);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    },
  );

  it('closes on Escape with the trigger focused and cancels the default action', async () => {
    const { event, trigger } = await pressInMenu({ key: 'Escape' });

    expect(event.defaultPrevented).toBe(true);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });
});
