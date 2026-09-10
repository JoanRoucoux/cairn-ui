import { By } from '@angular/platform-browser';

import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UI_CONTROL } from '../control/control';
import { type ControlSize } from '../input/input';
import { UiSelect } from './select';

const OPTIONS = `
  <option value="">Choose</option>
  <option value="pea">PEA</option>
  <option value="cto">CTO</option>
`;

describe('UiSelect', () => {
  it('styles the native select and accepts a choice', async () => {
    const user = userEvent.setup();
    await render(`<select uiSelect aria-label="Envelope">${OPTIONS}</select>`, { imports: [UiSelect] });

    const select = screen.getByRole('combobox', { name: 'Envelope' });
    expect(select).toHaveClass('border-(--border)');
    // The select carries no fill of its own: it has to read as the same control as the input beside it.
    expect(select).not.toHaveClass('bg-(--elevated)');

    await user.selectOptions(select, 'pea');
    expect(select).toHaveValue('pea');
  });

  it('keeps the native disabled behavior', async () => {
    await render(`<select uiSelect aria-label="Envelope" disabled>${OPTIONS}</select>`, { imports: [UiSelect] });

    expect(screen.getByRole('combobox', { name: 'Envelope' })).toBeDisabled();
  });

  it.each<[ControlSize, string]>([
    ['sm', 'h-9'],
    ['md', 'h-11'],
  ])('applies the %s size classes', async (size, expectedClass) => {
    await render(`<select uiSelect aria-label="Envelope" [size]="size">${OPTIONS}</select>`, {
      imports: [UiSelect],
      componentProperties: { size },
    });

    expect(screen.getByRole('combobox', { name: 'Envelope' })).toHaveClass(expectedClass);
  });

  it('leaves the native chevron and the native picker alone', async () => {
    await render(`<select uiSelect aria-label="Envelope">${OPTIONS}</select>`, { imports: [UiSelect] });

    expect(screen.getByRole('combobox', { name: 'Envelope' })).not.toHaveClass('appearance-none');
  });

  it('resolves UI_CONTROL to itself', async () => {
    const { fixture } = await render(`<select uiSelect aria-label="Envelope">${OPTIONS}</select>`, {
      imports: [UiSelect],
    });

    const host = fixture.debugElement.query(By.directive(UiSelect));

    expect(host.injector.get(UI_CONTROL)).toBe(host.injector.get(UiSelect));
  });

  it('starts untouched and errorless', async () => {
    const { fixture } = await render(`<select uiSelect aria-label="Envelope">${OPTIONS}</select>`, {
      imports: [UiSelect],
    });

    const control = fixture.debugElement.query(By.directive(UiSelect)).injector.get(UI_CONTROL);

    expect(control.errors()).toEqual([]);
    expect(control.touched()).toBe(false);
  });
});
