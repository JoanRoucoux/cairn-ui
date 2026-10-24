import { signal } from '@angular/core';

import { UiInput } from '@joanroucoux/cairn-ui/input';
import { type RenderResult, render, screen } from '@testing-library/angular';

import { UiField } from './field';

const renderField = (attributes: string): Promise<RenderResult<unknown>> =>
  render(`<ui-field label="Quantity" ${attributes}><input uiInput /></ui-field>`, { imports: [UiField, UiInput] });

describe('UiField', () => {
  describe('announcement', () => {
    const live = (): Element => document.querySelector('[aria-live="polite"]')!;

    const renderControl = async (): Promise<{
      touched: ReturnType<typeof signal<boolean>>;
      errors: ReturnType<typeof signal<{ message?: string }[]>>;
      error: ReturnType<typeof signal<string | undefined>>;
      settle: () => Promise<void>;
    }> => {
      const touched = signal(false);
      const errors = signal<{ message?: string }[]>([]);
      const error = signal<string | undefined>(undefined);
      const { fixture } = await render(
        '<ui-field label="Quantity" [error]="error()"><input uiInput [errors]="errors()" [touched]="touched()" /></ui-field>',
        { imports: [UiField, UiInput], componentProperties: { touched, errors, error } },
      );

      return { touched, errors, error, settle: () => fixture.whenStable().then(() => undefined) };
    };

    it('keeps a persistent polite region, hidden from sight, and no alert role on the message', async () => {
      const { errors, touched, settle } = await renderControl();

      expect(live()).toHaveClass('sr-only');
      expect(live().textContent).toBe('');

      errors.set([{ message: 'Quantity is required' }]);
      touched.set(true);
      await settle();

      expect(screen.getByText('Quantity is required', { selector: 'p' })).not.toHaveAttribute('role');
    });

    it('announces the control message when the control turns touched', async () => {
      const { errors, touched, settle } = await renderControl();
      errors.set([{ message: 'Quantity is required' }]);
      await settle();

      expect(live().textContent).toBe('');

      touched.set(true);
      await settle();

      expect(live()).toHaveTextContent('Quantity is required');
    });

    it('announces nothing when the control turns touched without a message', async () => {
      const { touched, settle } = await renderControl();

      touched.set(true);
      await settle();

      expect(live().textContent).toBe('');
    });

    it('does not announce a control error that changes while the control stays touched', async () => {
      const { errors, touched, settle } = await renderControl();
      errors.set([{ message: 'Quantity is required' }]);
      touched.set(true);
      await settle();

      errors.set([{ message: 'Quantity must be a number' }]);
      await settle();

      expect(live().textContent).toBe('');
      expect(screen.getByText('Quantity must be a number', { selector: 'p' })).toBeInTheDocument();
      expect(screen.getByLabelText('Quantity')).toHaveAttribute('aria-describedby');
    });

    it('announces nothing while typing toggles the message on a touched control', async () => {
      const { errors, touched, settle } = await renderControl();
      errors.set([{ message: 'Quantity is required' }]);
      touched.set(true);
      await settle();
      expect(live()).toHaveTextContent('Quantity is required');

      errors.set([]);
      await settle();
      expect(live().textContent).toBe('');

      errors.set([{ message: 'Quantity is required' }]);
      await settle();
      expect(live().textContent).toBe('');
      expect(screen.getByText('Quantity is required', { selector: 'p' })).toBeInTheDocument();
    });

    it('announces an explicit error when it changes to a non-empty value', async () => {
      const { error, settle } = await renderControl();

      error.set('Enter a quantity');
      await settle();
      expect(live()).toHaveTextContent('Enter a quantity');

      error.set('Enter a number');
      await settle();
      expect(live()).toHaveTextContent('Enter a number');
    });

    it('announces an explicit error present when the field appears', async () => {
      await renderField('error="Enter a quantity"');

      expect(live()).toHaveTextContent('Enter a quantity');
    });

    it('clears the region when the explicit error goes away', async () => {
      const { error, settle } = await renderControl();
      error.set('Enter a quantity');
      await settle();

      error.set(undefined);
      await settle();

      expect(live().textContent).toBe('');
    });

    it('does not repeat an explicit error when the control then turns touched', async () => {
      const { error, touched, settle } = await renderControl();
      error.set('Enter a quantity');
      await settle();
      const before = live().textContent;

      touched.set(true);
      await settle();

      expect(live().textContent).toBe(before);
    });
  });
});
