import { By } from '@angular/platform-browser';

import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UI_CONTROL } from '../control/control';
import { type ControlSize, type ControlSurface, UiInput, UiTextarea } from './input';

describe('UiInput', () => {
  it('styles the native input and accepts typing', async () => {
    const user = userEvent.setup();
    await render('<input uiInput aria-label="Email" />', { imports: [UiInput] });

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveClass('shadow-[inset_0_0_0_1px_var(--border)]', 'text-body');

    await user.type(input, 'jane@example.com');
    expect(input).toHaveValue('jane@example.com');
  });

  it('draws a 2px focus ring from the ring token', async () => {
    await render('<input uiInput aria-label="Email" />', { imports: [UiInput] });

    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveClass(
      'focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]',
    );
  });

  it('draws a 2px negative ring when marked invalid', async () => {
    await render('<input uiInput aria-label="Email" aria-invalid="true" />', { imports: [UiInput] });

    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveClass(
      'aria-invalid:shadow-[inset_0_0_0_2px_var(--negative)]',
    );
  });

  it('keeps the native disabled behavior', async () => {
    await render('<input uiInput aria-label="Email" disabled />', { imports: [UiInput] });

    expect(screen.getByRole('textbox', { name: 'Email' })).toBeDisabled();
  });

  it.each<[ControlSize, string]>([
    ['sm', 'h-9'],
    ['md', 'min-h-(--row-min)'],
    ['lg', 'min-h-12'],
    ['lg', 'lg:min-h-(--row-min)'],
    ['xl', 'h-12'],
    ['xl', 'lg:h-11'],
  ])('applies the %s size classes', async (size, expectedClass) => {
    await render('<input uiInput aria-label="Email" [size]="size" />', {
      imports: [UiInput],
      componentProperties: { size },
    });

    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveClass(expectedClass);
  });

  it.each<[ControlSurface, string]>([
    ['background', 'bg-(--background)'],
    ['card', 'bg-(--card)'],
  ])('paints the %s surface', async (surface, expectedClass) => {
    await render('<input uiInput aria-label="Email" [surface]="surface" />', {
      imports: [UiInput],
      componentProperties: { surface },
    });

    const input = screen.getByRole('textbox', { name: 'Email' });

    expect(input).toHaveClass(expectedClass);
    expect(input.className.split(' ').filter((name) => name.startsWith('bg-'))).toHaveLength(1);
  });

  it('paints the background surface by default', async () => {
    await render('<input uiInput aria-label="Email" />', { imports: [UiInput] });

    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveClass('bg-(--background)');
  });

  it('reaches the touch target by default', async () => {
    await render('<input uiInput aria-label="Email" />', { imports: [UiInput] });

    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveClass('min-h-(--row-min)');
  });

  it('keeps the classes the template put on the element', async () => {
    await render('<input uiInput aria-label="Search" class="w-52" />', { imports: [UiInput] });

    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveClass('w-52', 'min-h-(--row-min)');
  });

  it('hides the native search clear button, as the design draws none', async () => {
    await render('<input uiInput type="search" aria-label="Search" />', { imports: [UiInput] });

    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveClass(
      '[&::-webkit-search-cancel-button]:appearance-none',
    );
  });

  it('resolves UI_CONTROL to itself', async () => {
    const { fixture } = await render('<input uiInput aria-label="Email" />', { imports: [UiInput] });

    const host = fixture.debugElement.query(By.directive(UiInput));

    expect(host.injector.get(UI_CONTROL)).toBe(host.injector.get(UiInput));
  });

  it('starts untouched and errorless', async () => {
    const { fixture } = await render('<input uiInput aria-label="Email" />', { imports: [UiInput] });

    const control = fixture.debugElement.query(By.directive(UiInput)).injector.get(UI_CONTROL);

    expect(control.errors()).toEqual([]);
    expect(control.touched()).toBe(false);
  });
});

describe('UiTextarea', () => {
  it('styles the native textarea and accepts typing', async () => {
    const user = userEvent.setup();
    await render('<textarea uiTextarea aria-label="Notes"></textarea>', { imports: [UiTextarea] });

    const textarea = screen.getByRole('textbox', { name: 'Notes' });
    expect(textarea).toHaveClass('shadow-[inset_0_0_0_1px_var(--border)]', 'min-h-24');

    await user.type(textarea, 'A tracker on the S&P 500.');
    expect(textarea).toHaveValue('A tracker on the S&P 500.');
  });

  it('grows from a floor rather than sitting at a fixed height', async () => {
    await render('<textarea uiTextarea aria-label="Notes"></textarea>', { imports: [UiTextarea] });

    expect(screen.getByRole('textbox', { name: 'Notes' })).not.toHaveClass('min-h-(--row-min)');
  });

  it('resolves UI_CONTROL to itself', async () => {
    const { fixture } = await render('<textarea uiTextarea aria-label="Notes"></textarea>', {
      imports: [UiTextarea],
    });

    const host = fixture.debugElement.query(By.directive(UiTextarea));

    expect(host.injector.get(UI_CONTROL)).toBe(host.injector.get(UiTextarea));
  });

  it('starts untouched and errorless', async () => {
    const { fixture } = await render('<textarea uiTextarea aria-label="Notes"></textarea>', {
      imports: [UiTextarea],
    });

    const control = fixture.debugElement.query(By.directive(UiTextarea)).injector.get(UI_CONTROL);

    expect(control.errors()).toEqual([]);
    expect(control.touched()).toBe(false);
  });
});
