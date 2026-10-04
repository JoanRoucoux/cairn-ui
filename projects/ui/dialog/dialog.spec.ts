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

  it('never draws the browser outline on its own element', async () => {
    const { container } = await renderDialog();

    expect(container.querySelector('dialog')).toHaveClass('outline-none');
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

  it('only lays itself out while open, so a closed one leaves the tab order', async () => {
    const { container } = await renderDialog(false);

    expect(container.querySelector('dialog')).toHaveClass('open:flex');
    expect(container.querySelector('dialog')).not.toHaveClass('flex');
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
    expect(handle).toHaveClass('h-5', 'lg:hidden');
  });

  it('pads the sheet by 16px and the dialog by 24px', async () => {
    const { container } = await renderDialog();

    for (const part of ['[data-dialog-body]', '[data-dialog-footer]']) {
      expect(container.querySelector(part)).toHaveClass('px-4', 'lg:px-6');
    }
    expect(container.querySelector('[data-dialog-header]')).toHaveClass('pl-4', 'lg:pl-6');
  });

  it('right-aligns the actions on a desktop and stacks them full width on a sheet', async () => {
    const { container } = await renderDialog();

    expect(container.querySelector('[data-dialog-footer]')).toHaveClass(
      'justify-end',
      'max-lg:flex-col-reverse',
      'max-lg:[&>[ui-button]]:h-[50px]',
      'max-lg:[&>[ui-button]]:w-full',
    );
  });

  const press = (target: Element, type: string, x: number, y: number): void => {
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }));
  };

  it('closes and reports on a click that started on the backdrop', async () => {
    const { fixture, container, onDismissed } = await renderDialog();
    const dialog = container.querySelector('dialog') as HTMLDialogElement;

    press(dialog, 'pointerdown', -20, -20);
    press(dialog, 'click', -20, -20);
    await fixture.whenStable();

    expect(dialog).not.toHaveAttribute('open');
    expect(onDismissed).toHaveBeenCalledOnce();
  });

  it('stays open when a drag from the panel is released on the backdrop', async () => {
    const { container, onDismissed } = await renderDialog();
    const dialog = container.querySelector('dialog') as HTMLDialogElement;

    press(screen.getByText('Corps'), 'pointerdown', 0, 0);
    press(dialog, 'click', -20, -20);

    expect(dialog).toHaveAttribute('open');
    expect(onDismissed).not.toHaveBeenCalled();
  });

  it('stays open on a click inside the panel', async () => {
    const user = userEvent.setup();
    const { container, onDismissed } = await renderDialog();

    await user.click(screen.getByText('Corps'));
    press(container.querySelector('dialog') as Element, 'click', 0, 0);

    expect(container.querySelector('dialog')).toHaveAttribute('open');
    expect(onDismissed).not.toHaveBeenCalled();
  });

  it('lets a long subtitle wrap', async () => {
    const { container } = await render(
      `<ui-dialog heading="Supprimer" description="Une phrase entière qui explique ce qui sera supprimé." [open]="true"></ui-dialog>`,
      { imports: [UiDialog] },
    );

    expect(
      container.querySelector('#' + container.querySelector('dialog')?.getAttribute('aria-describedby')),
    ).not.toHaveClass('truncate');
  });

  it('truncates the subtitle when asked to', async () => {
    const { container } = await render(
      `<ui-dialog heading="Acheter" description="Ferrari · PEA" truncateDescription [open]="true"></ui-dialog>`,
      { imports: [UiDialog] },
    );

    expect(container.querySelector('[data-dialog-header] p')).toHaveClass('truncate');
  });

  it('scrolls its body independently of the heading and the footer', async () => {
    const { container } = await renderDialog();

    expect(container.querySelector('[data-dialog-body]')).toHaveClass('overflow-y-auto');
  });

  it('does not make the body a tab stop that would steal the initial focus', async () => {
    const { container } = await renderDialog();

    expect(container.querySelector('[data-dialog-body]')).not.toHaveAttribute('tabindex');
  });

  it('sets the width from the md token', async () => {
    const { container } = await render(`<ui-dialog heading="Enter a price" width="md" [open]="true"></ui-dialog>`, {
      imports: [UiDialog],
    });

    expect(container.querySelector('dialog')).toHaveStyle({ '--dialog-width': '28rem' });
  });

  it('sets the width from the lg token', async () => {
    const { container } = await render(`<ui-dialog heading="Delete" width="lg" [open]="true"></ui-dialog>`, {
      imports: [UiDialog],
    });

    expect(container.querySelector('dialog')).toHaveStyle({ '--dialog-width': '560px' });
  });

  it('takes any CSS length as the width', async () => {
    const { container } = await render(`<ui-dialog heading="Buy" width="530px" [open]="true"></ui-dialog>`, {
      imports: [UiDialog],
    });

    expect(container.querySelector('dialog')).toHaveStyle({ '--dialog-width': '530px' });
    expect(container.querySelector('dialog')).toHaveClass('lg:max-w-(--dialog-width)');
  });

  it('shows no cross unless a label is given', async () => {
    await renderDialog();

    expect(screen.queryByRole('button', { name: /close|fermer/i })).not.toBeInTheDocument();
  });

  it('shows the subtitle under the title', async () => {
    const { container } = await render(
      `<ui-dialog heading="Acheter" description="Ferrari · PEA" [open]="true"></ui-dialog>`,
      { imports: [UiDialog] },
    );

    const header = container.querySelector('[data-dialog-header]');
    expect(header).toHaveTextContent('Ferrari · PEA');
    expect(header?.querySelector('h2')).toHaveTextContent('Acheter');
  });

  it('labels the cross with the text the consumer passes', async () => {
    await render(`<ui-dialog heading="Acheter" closeLabel="Fermer" [open]="true"></ui-dialog>`, {
      imports: [UiDialog],
    });

    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument();
  });

  it('closes and reports when the cross is used', async () => {
    const user = userEvent.setup();
    const onDismissed = vi.fn();
    const { container } = await render(
      `<ui-dialog heading="Acheter" closeLabel="Fermer" [open]="true" (dismissed)="onDismissed()"></ui-dialog>`,
      { imports: [UiDialog], componentProperties: { onDismissed } },
    );

    await user.click(screen.getByRole('button', { name: 'Fermer' }));

    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
    expect(onDismissed).toHaveBeenCalledOnce();
  });

  it('accepts open as a bare attribute', async () => {
    const { container } = await render(`<ui-dialog heading="Enter a price" open></ui-dialog>`, {
      imports: [UiDialog],
    });

    expect(container.querySelector('dialog')).toHaveAttribute('open');
  });

  it('describes a confirm dialog by its body when it has no description', async () => {
    const { container } = await render(
      `<ui-dialog heading="Delete" variant="confirm" [open]="true"><p>This cannot be undone.</p></ui-dialog>`,
      { imports: [UiDialog] },
    );
    const dialog = container.querySelector('dialog') as HTMLElement;
    const describedBy = dialog.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(container.querySelector(`#${describedBy}`)).toContainElement(screen.getByText('This cannot be undone.'));
  });

  it('prefers the description over the body for a confirm dialog', async () => {
    const { container } = await render(
      `<ui-dialog heading="Delete" description="Ferrari" variant="confirm" [open]="true"><p>Body</p></ui-dialog>`,
      { imports: [UiDialog] },
    );
    const describedBy = container.querySelector('dialog')?.getAttribute('aria-describedby');

    expect(container.querySelector(`#${describedBy}`)).toHaveTextContent('Ferrari');
  });

  it('leaves a trade dialog without description undescribed', async () => {
    const { container } = await render(`<ui-dialog heading="Buy" [open]="true"><p>Body</p></ui-dialog>`, {
      imports: [UiDialog],
    });

    expect(container.querySelector('dialog')).not.toHaveAttribute('aria-describedby');
  });
});
