import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { type ControlSize, UiInput, UiTextarea } from './input';

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

  it.each<[ControlSize, string]>([
    ['sm', 'h-9'],
    ['md', 'h-11'],
  ])('applies the %s size classes', async (size, expectedClass) => {
    await render('<input uiInput aria-label="Email" [size]="size" />', {
      imports: [UiInput],
      componentProperties: { size },
    });

    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveClass(expectedClass);
  });

  it('reaches the 44px touch target by default', async () => {
    await render('<input uiInput aria-label="Email" />', { imports: [UiInput] });

    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveClass('h-11');
  });

  it('keeps the classes the template put on the element', async () => {
    await render('<input uiInput aria-label="Search" class="w-52" />', { imports: [UiInput] });

    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveClass('w-52', 'h-11');
  });
});

describe('UiTextarea', () => {
  it('styles the native textarea and accepts typing', async () => {
    const user = userEvent.setup();
    await render('<textarea uiTextarea aria-label="Notes"></textarea>', { imports: [UiTextarea] });

    const textarea = screen.getByRole('textbox', { name: 'Notes' });
    expect(textarea).toHaveClass('border-(--border)', 'min-h-24');

    await user.type(textarea, 'A tracker on the S&P 500.');
    expect(textarea).toHaveValue('A tracker on the S&P 500.');
  });

  it('grows from a floor rather than sitting at a fixed height', async () => {
    await render('<textarea uiTextarea aria-label="Notes"></textarea>', { imports: [UiTextarea] });

    expect(screen.getByRole('textbox', { name: 'Notes' })).not.toHaveClass('h-11');
  });
});
