import { By } from '@angular/platform-browser';

import { UI_CONTROL } from '@joanroucoux/cairn-ui/control';
import { type ControlSize } from '@joanroucoux/cairn-ui/input';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

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
    expect(select).toHaveClass('shadow-[inset_0_0_0_1px_var(--border)]');
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
    ['md', 'min-h-(--row-min)'],
  ])('applies the %s size classes', async (size, expectedClass) => {
    await render(`<select uiSelect aria-label="Envelope" [size]="size">${OPTIONS}</select>`, {
      imports: [UiSelect],
      componentProperties: { size },
    });

    expect(screen.getByRole('combobox', { name: 'Envelope' })).toHaveClass(expectedClass);
  });

  it('replaces the browser arrow with the chevron-down token, 18px at the right', async () => {
    await render(`<select uiSelect aria-label="Envelope">${OPTIONS}</select>`, { imports: [UiSelect] });

    const select = screen.getByRole('combobox', { name: 'Envelope' });

    expect(select).toHaveClass('appearance-none');
    expect(select).toHaveClass('bg-(image:--chevron-down)');
    expect(select).toHaveClass('bg-no-repeat');
    expect(select).toHaveClass('bg-[position:right_0.75rem_center]');
    expect(select).toHaveClass('bg-[size:1.125rem]');
    expect(select).toHaveClass('pr-10');
  });

  it('hides the picker icon so the chevron is never drawn twice', async () => {
    await render(`<select uiSelect aria-label="Envelope">${OPTIONS}</select>`, { imports: [UiSelect] });

    expect(screen.getByRole('combobox', { name: 'Envelope' })).toHaveClass('[&::picker-icon]:hidden');
  });

  it('shares the ui-input box: border, focus ring and disabled opacity', async () => {
    await render(`<select uiSelect aria-label="Envelope">${OPTIONS}</select>`, { imports: [UiSelect] });

    const select = screen.getByRole('combobox', { name: 'Envelope' });

    expect(select).toHaveClass('focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]');
    expect(select).toHaveClass('disabled:opacity-50');
  });

  it('styles its own drop-down list where the browser has a customizable one', async () => {
    await render(`<select uiSelect aria-label="Envelope">${OPTIONS}</select>`, { imports: [UiSelect] });

    const select = screen.getByRole('combobox', { name: 'Envelope' });

    expect(select).toHaveClass('pointer-fine:supports-[appearance:base-select]:[appearance:base-select]');
    expect(select).toHaveClass('[&::picker(select)]:bg-(--card)');
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
