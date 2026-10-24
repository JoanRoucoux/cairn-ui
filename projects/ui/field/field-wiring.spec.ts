import { Component, forwardRef, signal } from '@angular/core';
import { By } from '@angular/platform-browser';

import { UI_CONTROL, type UiControlError } from '@joanroucoux/cairn-ui/control';
import { UiInput } from '@joanroucoux/cairn-ui/input';
import { type RenderResult, render, screen } from '@testing-library/angular';

import { UiField } from './field';

const renderField = (attributes = '', control = '<input uiInput />'): Promise<RenderResult<unknown>> =>
  render(`<ui-field label="Quantity" ${attributes}>${control}</ui-field>`, {
    imports: [UiField, UiInput],
  });

@Component({
  selector: 'ui-test-group',
  template: '<div aria-label="Wrapper" role="radiogroup" [attr.aria-invalid]="invalid() || null"></div>',
  providers: [{ provide: UI_CONTROL, useExisting: forwardRef(() => TestGroup) }],
})
class TestGroup {
  readonly invalid = signal(false);
  readonly touched = signal(false);
  readonly errors = signal<readonly UiControlError[]>([]);
}

describe('UiField wiring', () => {
  it('keeps a description id the caller set and adds its own', async () => {
    await renderField('hint="Leave empty if unknown"', '<input uiInput aria-describedby="note" />');

    const ids = screen.getByLabelText('Quantity').getAttribute('aria-describedby')?.split(' ');

    expect(ids).toHaveLength(2);
    expect(ids?.[0]).toBe('note');
  });

  it('keeps the caller id and drops only its own when the hint goes away', async () => {
    const hint = signal<string | undefined>('Leave empty if unknown');
    const { fixture } = await render(
      '<ui-field label="Quantity" [hint]="hint()"><input uiInput aria-describedby="note" /></ui-field>',
      { imports: [UiField, UiInput], componentProperties: { hint } },
    );

    hint.set(undefined);
    await fixture.whenStable();

    expect(screen.getByLabelText('Quantity')).toHaveAttribute('aria-describedby', 'note');
  });

  it('describes the control with its unit', async () => {
    const { container } = await render('<ui-field label="Quantity" unit="shares"><input uiInput /></ui-field>', {
      imports: [UiField, UiInput],
    });

    const unitId = screen.getByLabelText('Quantity').getAttribute('aria-describedby');

    expect(container.querySelector(`#${unitId}`)).toHaveTextContent('shares');
  });

  it('pads the input to clear the unit', async () => {
    await render('<ui-field label="Quantity" unit="shares"><input uiInput /></ui-field>', {
      imports: [UiField, UiInput],
    });

    expect(screen.getByLabelText('Quantity').parentElement?.className).toContain('[&>input]:pr-16');
  });

  it('adds no unit padding without a unit', async () => {
    await renderField();

    expect(screen.getByLabelText('Quantity').parentElement?.className).not.toContain('pr-16');
  });

  describe('control that binds its own aria-invalid', () => {
    const renderGroup = async (
      attributes = '',
    ): Promise<{ group: TestGroup; fixture: RenderResult<unknown>['fixture'] }> => {
      const { fixture } = await render(
        `<ui-field label="Wrapper" labelHidden ${attributes}><ui-test-group /></ui-field>`,
        { imports: [UiField, TestGroup] },
      );

      return { group: fixture.debugElement.query(By.directive(TestGroup)).componentInstance, fixture };
    };

    it('keeps the field error mark when the control stops being invalid', async () => {
      const { group, fixture } = await renderGroup('error="Pick a wrapper"');
      group.invalid.set(true);
      await fixture.whenStable();

      group.invalid.set(false);
      await fixture.whenStable();

      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
    });

    it('keeps the control mark when the field message goes away', async () => {
      const { group, fixture } = await renderGroup();
      group.invalid.set(true);
      group.errors.set([{ message: 'Pick a wrapper' }]);
      group.touched.set(true);
      await fixture.whenStable();
      expect(document.querySelector('p')).not.toBeNull();

      group.touched.set(false);
      await fixture.whenStable();

      expect(document.querySelector('p')).toBeNull();
      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
    });

    it('clears the mark once nothing is invalid', async () => {
      const { group, fixture } = await renderGroup();
      group.invalid.set(true);
      await fixture.whenStable();
      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');

      group.invalid.set(false);
      await fixture.whenStable();

      expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('radiogroup control', () => {
    const renderChips = (attributes = ''): Promise<RenderResult<unknown>> =>
      render(
        `<ui-field label="Wrapper" labelHidden ${attributes}><div role="radiogroup" aria-label="Wrapper"></div></ui-field>`,
        { imports: [UiField] },
      );

    it('describes the radiogroup with the error and marks it invalid', async () => {
      const { container } = await renderChips('error="Pick a wrapper"');

      const group = screen.getByRole('radiogroup');
      const errorId = group.getAttribute('aria-describedby');

      expect(group).toHaveAttribute('aria-invalid', 'true');
      expect(container.querySelector(`#${errorId}`)).toHaveTextContent('Pick a wrapper');
    });

    it('does not wire for and id on a control that names itself', async () => {
      const { container } = await renderChips('hint="Choose one"');

      expect(container.querySelector('label')).not.toHaveAttribute('for');
      expect(screen.getByRole('radiogroup')).not.toHaveAttribute('id');
    });

    it('leaves a valid radiogroup undescribed', async () => {
      await renderChips();

      expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-describedby');
      expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-invalid');
    });
  });
});
