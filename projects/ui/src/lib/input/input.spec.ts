import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiInput } from './input';

describe('UiInput', () => {
  it('styles the native input and accepts typing', async () => {
    const user = userEvent.setup();
    await render('<input uiInput aria-label="Email" />', { imports: [UiInput] });

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveClass('border-(--border)');

    await user.type(input, 'jane@example.com');
    expect(input).toHaveValue('jane@example.com');
  });

  it('keeps the native disabled behavior', async () => {
    await render('<input uiInput aria-label="Email" disabled />', { imports: [UiInput] });

    expect(screen.getByRole('textbox', { name: 'Email' })).toBeDisabled();
  });
});
