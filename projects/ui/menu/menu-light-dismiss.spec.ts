import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiMenu, UiMenuItem, UiMenuTrigger } from './menu';

describe('UiMenu focus', () => {
  const template = `
    <button type="button" [uiMenuTrigger]="menu">More</button>
    <ui-menu #menu label="Holding actions">
      <button uiMenuItem (click)="edited()">Edit</button>
      <button uiMenuItem destructive>Delete the holding</button>
    </ui-menu>`;

  describe('light dismiss', () => {
    const dismiss = (menu: HTMLElement): void => {
      menu.dispatchEvent(Object.assign(new Event('toggle'), { newState: 'closed' }));
    };

    it('leaves focus on the field a click outside landed on', async () => {
      const { container } = await render(`<input aria-label="Notes" />${template}`, {
        imports: [UiMenu, UiMenuTrigger, UiMenuItem],
        componentProperties: { edited: vi.fn() },
      });
      await userEvent.click(screen.getByRole('button', { name: 'More' }));
      screen.getByLabelText('Notes').focus();

      dismiss(container.querySelector('ui-menu') as HTMLElement);

      expect(screen.getByLabelText('Notes')).toHaveFocus();
      expect(screen.getByRole('button', { name: 'More' })).not.toHaveFocus();
    });

    it('returns focus to the trigger when it was inside the menu', async () => {
      const { container } = await render(template, {
        imports: [UiMenu, UiMenuTrigger, UiMenuItem],
        componentProperties: { edited: vi.fn() },
      });
      await userEvent.click(screen.getByRole('button', { name: 'More' }));

      dismiss(container.querySelector('ui-menu') as HTMLElement);

      expect(screen.getByRole('button', { name: 'More' })).toHaveFocus();
    });

    it('returns focus to the trigger when focus fell to the page', async () => {
      const { container } = await render(template, {
        imports: [UiMenu, UiMenuTrigger, UiMenuItem],
        componentProperties: { edited: vi.fn() },
      });
      await userEvent.click(screen.getByRole('button', { name: 'More' }));
      (document.activeElement as HTMLElement).blur();

      dismiss(container.querySelector('ui-menu') as HTMLElement);

      expect(screen.getByRole('button', { name: 'More' })).toHaveFocus();
    });
  });
});
