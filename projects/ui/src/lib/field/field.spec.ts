import { type RenderResult, render, screen } from '@testing-library/angular';

import { UiInput } from '../input/input';
import { UiSelect } from '../select/select';
import { UiField } from './field';

const renderField = (attributes = '', control = '<input uiInput />'): Promise<RenderResult<unknown>> =>
  render(`<ui-field label="Quantite" ${attributes}>${control}</ui-field>`, {
    imports: [UiField, UiInput],
  });

describe('UiField', () => {
  it('names the projected control with its label', async () => {
    await renderField();

    expect(screen.getByLabelText('Quantite')).toBeInTheDocument();
  });

  it('keeps an id the caller already chose', async () => {
    await renderField('', '<input uiInput id="quantity" />');

    expect(screen.getByLabelText('Quantite')).toHaveAttribute('id', 'quantity');
  });

  it('describes the control with its hint', async () => {
    const { container } = await renderField('hint="Laisser vide si inconnu"');

    const control = screen.getByLabelText('Quantite');
    const hintId = control.getAttribute('aria-describedby');

    expect(hintId).toBeTruthy();
    expect(container.querySelector(`#${hintId}`)).toHaveTextContent('Laisser vide si inconnu');
  });

  it('describes the control with its error and marks it invalid', async () => {
    const { container } = await renderField('error="Quantite obligatoire"');

    const control = screen.getByLabelText('Quantite');
    const errorId = control.getAttribute('aria-describedby');

    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelector(`#${errorId}`)).toHaveTextContent('Quantite obligatoire');
  });

  it('announces the error without waiting for focus', async () => {
    await renderField('error="Quantite obligatoire"');

    expect(screen.getByRole('alert')).toHaveTextContent('Quantite obligatoire');
  });

  it('describes the control with both the hint and the error', async () => {
    await renderField('hint="Laisser vide si inconnu" error="Quantite obligatoire"');

    expect(screen.getByLabelText('Quantite').getAttribute('aria-describedby')?.split(' ')).toHaveLength(2);
  });

  it('leaves a valid control undescribed', async () => {
    await renderField();

    const control = screen.getByLabelText('Quantite');

    expect(control).not.toHaveAttribute('aria-describedby');
    expect(control).not.toHaveAttribute('aria-invalid');
  });

  it('works the same around a select', async () => {
    await render('<ui-field label="Enveloppe"><select uiSelect><option value="pea">PEA</option></select></ui-field>', {
      imports: [UiField, UiSelect],
    });

    expect(screen.getByLabelText('Enveloppe')).toBeInTheDocument();
  });

  it('does nothing when no native control is projected', async () => {
    const { container } = await render('<ui-field label="Quantite"></ui-field>', { imports: [UiField] });

    expect(container.querySelector('label')).not.toHaveAttribute('for');
  });
});
