import { type RenderResult, render, screen } from '@testing-library/angular';

import { UiInput } from '../input/input';
import { UiSelect } from '../select/select';
import { UiField } from './field';

const renderField = (attributes = '', control = '<input uiInput />'): Promise<RenderResult<unknown>> =>
  render(`<ui-field label="Quantity" ${attributes}>${control}</ui-field>`, {
    imports: [UiField, UiInput],
  });

describe('UiField', () => {
  it('names the projected control with its label', async () => {
    await renderField();

    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
  });

  it('keeps an id the caller already chose', async () => {
    await renderField('', '<input uiInput id="quantity" />');

    expect(screen.getByLabelText('Quantity')).toHaveAttribute('id', 'quantity');
  });

  it('describes the control with its hint', async () => {
    const { container } = await renderField('hint="Leave empty if unknown"');

    const control = screen.getByLabelText('Quantity');
    const hintId = control.getAttribute('aria-describedby');

    expect(hintId).toBeTruthy();
    expect(container.querySelector(`#${hintId}`)).toHaveTextContent('Leave empty if unknown');
  });

  it('describes the control with its error and marks it invalid', async () => {
    const { container } = await renderField('error="Quantity is required"');

    const control = screen.getByLabelText('Quantity');
    const errorId = control.getAttribute('aria-describedby');

    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelector(`#${errorId}`)).toHaveTextContent('Quantity is required');
  });

  it('announces the error without waiting for focus', async () => {
    await renderField('error="Quantity is required"');

    expect(screen.getByRole('alert')).toHaveTextContent('Quantity is required');
  });

  it('describes the control with both the hint and the error', async () => {
    await renderField('hint="Leave empty if unknown" error="Quantity is required"');

    expect(screen.getByLabelText('Quantity').getAttribute('aria-describedby')?.split(' ')).toHaveLength(2);
  });

  it('leaves a valid control undescribed', async () => {
    await renderField();

    const control = screen.getByLabelText('Quantity');

    expect(control).not.toHaveAttribute('aria-describedby');
    expect(control).not.toHaveAttribute('aria-invalid');
  });

  it('works the same around a select', async () => {
    await render('<ui-field label="Envelope"><select uiSelect><option value="pea">PEA</option></select></ui-field>', {
      imports: [UiField, UiSelect],
    });

    expect(screen.getByLabelText('Envelope')).toBeInTheDocument();
  });

  it('does nothing when no native control is projected', async () => {
    const { container } = await render('<ui-field label="Quantity"></ui-field>', { imports: [UiField] });

    expect(container.querySelector('label')).not.toHaveAttribute('for');
  });

  it('shows nothing while an invalid control is still untouched', async () => {
    await render(`<ui-field label="Quantity"><input uiInput [errors]="errors" /></ui-field>`, {
      imports: [UiField, UiInput],
      componentProperties: { errors: [{ message: 'Quantity is required' }] },
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).not.toHaveAttribute('aria-invalid');
  });

  it('shows the control error once the control is touched', async () => {
    await render(`<ui-field label="Quantity"><input uiInput [errors]="errors" [touched]="true" /></ui-field>`, {
      imports: [UiField, UiInput],
      componentProperties: { errors: [{ message: 'Quantity is required' }] },
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Quantity is required');
    expect(screen.getByLabelText('Quantity')).toHaveAttribute('aria-invalid', 'true');
  });

  it('skips an error that carries no message', async () => {
    await render(`<ui-field label="Quantity"><input uiInput [errors]="errors" [touched]="true" /></ui-field>`, {
      imports: [UiField, UiInput],
      componentProperties: { errors: [{}, { message: 'Quantity is required' }] },
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Quantity is required');
  });

  it('lets the caller override the control with an explicit error', async () => {
    await render(
      `<ui-field label="Quantity" error="Enter a quantity"><input uiInput [errors]="errors" [touched]="true" /></ui-field>`,
      {
        imports: [UiField, UiInput],
        componentProperties: { errors: [{ message: 'Quantity is required' }] },
      },
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a quantity');
  });

  it('shows nothing when a touched control has no error at all', async () => {
    await render(`<ui-field label="Quantity"><input uiInput [touched]="true" /></ui-field>`, {
      imports: [UiField, UiInput],
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('is one hover group, so the gap between the label and the control is not a dead zone', async () => {
    const { container } = await renderField();

    expect(container.querySelector('ui-field > div')).toHaveClass('group');
  });
});
