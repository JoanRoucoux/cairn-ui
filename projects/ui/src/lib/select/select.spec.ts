import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

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
});
