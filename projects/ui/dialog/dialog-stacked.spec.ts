import { type RenderResult, render } from '@testing-library/angular';

import { UiDialog } from './dialog';

const renderDialog = (open: boolean): Promise<RenderResult<unknown>> =>
  render(`<ui-dialog heading="Acheter" [open]="open"><p>Corps</p></ui-dialog>`, {
    imports: [UiDialog],
    componentProperties: { open },
  });

const dialogOf = (container: Element): HTMLDialogElement => container.querySelector('dialog') as HTMLDialogElement;

describe('UiDialog veil', () => {
  let beneath: HTMLDialogElement;

  beforeEach(() => {
    beneath = document.createElement('dialog');
    document.body.append(beneath);
  });

  afterEach(() => {
    beneath.remove();
  });

  it('draws the 0.36 veil when it opens alone', async () => {
    const { container } = await renderDialog(true);

    expect(dialogOf(container)).toHaveClass('backdrop:bg-black/[0.36]');
    expect(dialogOf(container)).not.toHaveClass('backdrop:bg-black/[0.24]');
  });

  it('draws the lighter 0.24 veil when it opens over another modal', async () => {
    beneath.showModal();
    const { container } = await renderDialog(true);

    expect(dialogOf(container)).toHaveClass('backdrop:bg-black/[0.24]');
    expect(dialogOf(container)).not.toHaveClass('backdrop:bg-black/[0.36]');
  });

  it('ignores a dialog that is open without being modal', async () => {
    beneath.setAttribute('open', '');
    const { container } = await renderDialog(true);

    expect(dialogOf(container)).toHaveClass('backdrop:bg-black/[0.36]');
  });

  it('keeps the veil it opened with when the modal beneath closes', async () => {
    beneath.showModal();
    const { fixture, container } = await renderDialog(true);

    beneath.close();
    await fixture.whenStable();

    expect(dialogOf(container)).toHaveClass('backdrop:bg-black/[0.24]');
  });

  it('picks its veil again at each opening', async () => {
    beneath.showModal();
    const { fixture, container, rerender } = await renderDialog(true);

    await rerender({ componentProperties: { open: false } });
    await fixture.whenStable();
    expect(dialogOf(container)).not.toHaveAttribute('open');

    beneath.close();
    await rerender({ componentProperties: { open: true } });
    await fixture.whenStable();

    expect(dialogOf(container)).toHaveAttribute('open');
    expect(dialogOf(container)).toHaveClass('backdrop:bg-black/[0.36]');
  });

  it('stays on the 0.36 veil until it is asked to open', async () => {
    beneath.showModal();
    const { container } = await renderDialog(false);

    expect(dialogOf(container)).toHaveClass('backdrop:bg-black/[0.36]');
  });
});
