import { type RenderResult, render, screen } from '@testing-library/angular';

import { UiInput } from '../input/input';
import { UiSelect } from '../select/select';
import { UiField, UiFieldLeading } from './field';

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

  it('shows its label by default', async () => {
    const { container } = await renderField();

    expect(container.querySelector('label')).not.toHaveClass('sr-only');
    expect(container.querySelector('label')).toHaveClass('leading-[17px]');
  });

  it('hides the label from sight but keeps it as the name of the control', async () => {
    const { container } = await renderField('labelHidden');

    expect(container.querySelector('label')).toHaveClass('sr-only');
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
  });

  it('is one hover group, so the gap between the label and the control is not a dead zone', async () => {
    const { container } = await renderField();

    expect(container.querySelector('ui-field > div')).toHaveClass('group');
  });

  it('renders the unit inside the field, after the value', async () => {
    await render(`<ui-field label="Quantity" unit="parts"><input uiInput inputmode="decimal" /></ui-field>`, {
      imports: [UiField, UiInput],
    });

    expect(screen.getByText('parts')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Quantity' })).toHaveClass('text-body');
  });

  it('draws a 2px negative ring when the field is in error', async () => {
    await render(`<ui-field label="Quantity" error="You hold 500 parts."><input uiInput /></ui-field>`, {
      imports: [UiField, UiInput],
    });

    expect(screen.getByRole('textbox', { name: 'Quantity' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('You hold 500 parts.')).toHaveClass('text-(--negative)');
  });

  describe('leading slot', () => {
    const renderSearch = (): Promise<RenderResult<unknown>> =>
      render(
        `<ui-field label="Search" labelHidden>
          <svg uiFieldLeading data-testid="icon" width="18" height="18"></svg>
          <input uiInput type="search" placeholder="Rechercher une ligne" />
        </ui-field>`,
        { imports: [UiField, UiFieldLeading, UiInput] },
      );

    it('renders the leading content in the control row, before the input', async () => {
      await renderSearch();

      const icon = screen.getByTestId('icon');
      const control = screen.getByRole('searchbox', { name: 'Search' });

      expect(icon.parentElement).toBe(control.parentElement);
      expect(icon.compareDocumentPosition(control) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('pins the leading content 12px from the left, muted, and out of the pointer path', async () => {
      await renderSearch();

      expect(screen.getByTestId('icon')).toHaveClass(
        'absolute',
        'left-3',
        'text-(--muted-foreground)',
        'pointer-events-none',
      );
    });

    it('hides the leading content from assistive technologies', async () => {
      await renderSearch();

      expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
    });

    it('insets the text by 12px padding + 18px icon + 8px gap', async () => {
      await renderSearch();

      expect(screen.getByRole('searchbox').parentElement?.className).toContain('[&>input]:pl-[38px]');
    });

    it('leaves the text inset alone without a leading slot', async () => {
      await renderField();

      expect(screen.getByRole('textbox').parentElement?.className).not.toContain('pl-[38px]');
    });

    it('keeps the unit slot working beside the leading content', async () => {
      await render(`<ui-field label="Amount" unit="EUR"><svg uiFieldLeading></svg><input uiInput /></ui-field>`, {
        imports: [UiField, UiFieldLeading, UiInput],
      });

      expect(screen.getByText('EUR')).toHaveClass('right-3');
    });
  });
});
