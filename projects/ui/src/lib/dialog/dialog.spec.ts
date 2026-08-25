import { type RenderResult, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiDialog } from './dialog';

const renderDialog = (open = true): Promise<RenderResult<unknown> & { onDismissed: ReturnType<typeof vi.fn> }> => {
  const onDismissed = vi.fn();

  return render(
    `<ui-dialog heading="Saisir un cours" [open]="open" (dismissed)="onDismissed()">
       <p>Corps</p>
       <button dialogActions type="button">Annuler</button>
     </ui-dialog>`,
    { imports: [UiDialog], componentProperties: { open, onDismissed } },
  ).then((result) => ({ ...result, onDismissed }));
};

describe('UiDialog', () => {
  it('opens as a modal when asked', async () => {
    const { container } = await renderDialog();

    expect(container.querySelector('dialog')).toHaveAttribute('open');
  });

  it('stays closed until asked', async () => {
    const { container } = await renderDialog(false);

    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('names the dialog with its heading', async () => {
    const { container } = await renderDialog();

    const dialog = container.querySelector('dialog');
    const heading = container.querySelector('h2');

    expect(dialog).toHaveAttribute('aria-labelledby', heading?.id);
    expect(heading).toHaveTextContent('Saisir un cours');
  });

  it('projects the body and the actions in separate slots', async () => {
    await renderDialog();

    expect(screen.getByText('Corps')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
  });

  it('describes the dialog when a description is given', async () => {
    const { container } = await render(
      `<ui-dialog heading="Supprimer" description="Cette action est definitive." [open]="true"></ui-dialog>`,
      { imports: [UiDialog] },
    );

    const dialog = container.querySelector('dialog');
    const describedBy = dialog?.getAttribute('aria-describedby');

    expect(container.querySelector(`#${describedBy}`)).toHaveTextContent('Cette action est definitive.');
  });

  it('reports a close the reader triggered', async () => {
    const { fixture, container, onDismissed } = await renderDialog();

    container.querySelector('dialog')?.close();
    await fixture.whenStable();

    expect(onDismissed).toHaveBeenCalledOnce();
  });

  it('stays silent when the owner is the one closing it', async () => {
    const { fixture, container, rerender, onDismissed } = await renderDialog();

    await rerender({ componentProperties: { open: false } });
    await fixture.whenStable();

    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
    expect(onDismissed).not.toHaveBeenCalled();
  });

  it('does not close on a click inside its own padding', async () => {
    const user = userEvent.setup();
    const { container } = await renderDialog();

    await user.click(container.querySelector('dialog') as HTMLElement);

    expect(container.querySelector('dialog')).toHaveAttribute('open');
  });
});
