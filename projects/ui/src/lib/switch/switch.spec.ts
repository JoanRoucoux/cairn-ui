import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiSwitch } from './switch';

describe('UiSwitch', () => {
  it('renders as a native checkbox exposed as a switch', async () => {
    await render('<input type="checkbox" uiSwitch aria-label="Hide amounts" />', { imports: [UiSwitch] });

    expect(screen.getByRole('switch', { name: 'Hide amounts' })).toBeInTheDocument();
  });

  it('toggles on click', async () => {
    await render('<input type="checkbox" uiSwitch aria-label="Hide amounts" />', { imports: [UiSwitch] });
    const toggle = screen.getByRole('switch', { name: 'Hide amounts' }) as HTMLInputElement;

    await userEvent.click(toggle);

    expect(toggle.checked).toBe(true);
  });

  it('toggles on Space', async () => {
    await render('<input type="checkbox" uiSwitch aria-label="Hide amounts" />', { imports: [UiSwitch] });
    const toggle = screen.getByRole('switch', { name: 'Hide amounts' }) as HTMLInputElement;
    toggle.focus();

    await userEvent.keyboard(' ');

    expect(toggle.checked).toBe(true);
  });

  it('works with plain checked and (change)', async () => {
    const changed = vi.fn();
    await render(
      '<input type="checkbox" uiSwitch aria-label="Hide amounts" [checked]="checked" (change)="changed()" />',
      { imports: [UiSwitch], componentProperties: { checked: true, changed } },
    );

    const toggle = screen.getByRole('switch', { name: 'Hide amounts' }) as HTMLInputElement;
    expect(toggle.checked).toBe(true);

    await userEvent.click(toggle);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('removes the native appearance and enlarges its hit area like ui-segmented', async () => {
    await render('<input type="checkbox" uiSwitch aria-label="Hide amounts" />', { imports: [UiSwitch] });

    expect(screen.getByRole('switch', { name: 'Hide amounts' })).toHaveClass(
      'appearance-none',
      "before:content-['']",
      'before:h-(--row-min)',
    );
  });

  it('dims to opacity 0.4 when disabled', async () => {
    await render('<input type="checkbox" uiSwitch aria-label="Hide amounts" disabled />', { imports: [UiSwitch] });

    expect(screen.getByRole('switch', { name: 'Hide amounts' })).toHaveClass('disabled:opacity-40');
  });
});
