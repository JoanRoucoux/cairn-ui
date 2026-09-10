import { type Type } from '@angular/core';
import { By } from '@angular/platform-browser';

import { render } from '@testing-library/angular';

import { UiInput, UiTextarea } from '../input/input';
import { UiSelect } from '../select/select';
import { UI_CONTROL, type UiControl } from './control';

const CONTROLS: [string, Type<UiControl>][] = [
  ['<input uiInput aria-label="Field" />', UiInput],
  ['<textarea uiTextarea aria-label="Field"></textarea>', UiTextarea],
  ['<select uiSelect aria-label="Field"></select>', UiSelect],
];

describe('UI_CONTROL', () => {
  it.each(CONTROLS)('resolves to the control itself on %s', async (template, directive) => {
    const { fixture } = await render(template, { imports: [directive] });

    const host = fixture.debugElement.query(By.directive(directive));

    expect(host.injector.get(UI_CONTROL)).toBe(host.injector.get(directive));
  });

  it.each(CONTROLS)('starts untouched and errorless on %s', async (template, directive) => {
    const { fixture } = await render(template, { imports: [directive] });

    const control = fixture.debugElement.query(By.directive(directive)).injector.get(UI_CONTROL);

    expect(control.errors()).toEqual([]);
    expect(control.touched()).toBe(false);
  });
});
