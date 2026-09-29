import { type RenderResult, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiDialog } from './dialog';

const renderDialog = (open = true): Promise<RenderResult<unknown> & { onDismissed: ReturnType<typeof vi.fn> }> => {
  const onDismissed = vi.fn();

  return render(
    `<ui-dialog heading="Enter a price" [open]="open" (dismissed)="onDismissed()">
       <p>Corps</p>
       <button dialogActions type="button">Cancel</button>
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
    expect(heading).toHaveTextContent('Enter a price');
  });

  it('projects the body and the actions in separate slots', async () => {
    await renderDialog();

    expect(screen.getByText('Corps')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('describes the dialog when a description is given', async () => {
    const { container } = await render(
      `<ui-dialog heading="Delete" description="This cannot be undone." [open]="true"></ui-dialog>`,
      { imports: [UiDialog] },
    );

    const dialog = container.querySelector('dialog');
    const describedBy = dialog?.getAttribute('aria-describedby');

    expect(container.querySelector(`#${describedBy}`)).toHaveTextContent('This cannot be undone.');
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

  it('centres itself, which Tailwind preflight would otherwise prevent', async () => {
    const { container } = await renderDialog();

    expect(container.querySelector('dialog')).toHaveClass('m-auto');
  });

  it('carries the sheet classes for small screens', async () => {
    const { container } = await renderDialog();

    expect(container.querySelector('dialog')).toHaveClass('max-lg:mb-0', 'max-lg:max-w-none', 'max-lg:rounded-b-none');
  });

  it('shows a drag handle only under lg', async () => {
    const { container } = await renderDialog();

    const handle = container.querySelector('[data-dialog-handle]');
    expect(handle).toHaveAttribute('aria-hidden', 'true');
    expect(handle).toHaveClass('lg:hidden');
  });

  it('keeps the footer above the home indicator on small screens', async () => {
    const { container } = await renderDialog();

    expect(container.querySelector('[data-dialog-footer]')).toHaveClass(
      'max-lg:pb-[calc(1rem+env(safe-area-inset-bottom))]',
    );
  });

  it('scrolls its body independently of the heading and the footer', async () => {
    const { container } = await renderDialog();

    expect(container.querySelector('[data-dialog-body]')).toHaveClass('overflow-y-auto');
  });

  it('keeps the scrollable body reachable by keyboard', async () => {
    const { container } = await renderDialog();

    expect(container.querySelector('[data-dialog-body]')).toHaveAttribute('tabindex', '0');
  });

  it('keeps the md width as it was', async () => {
    const { container } = await render(`<ui-dialog heading="Enter a price" width="md" [open]="true"></ui-dialog>`, {
      imports: [UiDialog],
    });

    expect(container.querySelector('dialog')).toHaveClass('max-w-md');
  });

  it('maps the lg width to 560px', async () => {
    const { container } = await render(
      `<ui-dialog heading="Delete this account" width="lg" [open]="true"></ui-dialog>`,
      { imports: [UiDialog] },
    );

    expect(container.querySelector('dialog')).toHaveClass('max-w-[560px]');
  });

  it('accepts open as a bare attribute', async () => {
    const { container } = await render(`<ui-dialog heading="Enter a price" open></ui-dialog>`, {
      imports: [UiDialog],
    });

    expect(container.querySelector('dialog')).toHaveAttribute('open');
  });
});
