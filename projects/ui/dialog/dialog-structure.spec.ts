import { type RenderResult, render, screen } from '@testing-library/angular';

import { UiDialog } from './dialog';

describe('UiDialog structure', () => {
  const renderWith = (attributes: string): Promise<RenderResult<unknown>> =>
    render(`<ui-dialog heading="Titre" ${attributes} [open]="true"></ui-dialog>`, { imports: [UiDialog] });

  it('draws the three zones of the default variant', async () => {
    const { container } = await renderWith('closeLabel="Fermer"');

    expect(container.querySelector('[data-dialog-header]')).toHaveClass('items-start', 'pb-3', 'lg:py-4', 'lg:pl-6');
    expect(container.querySelector('[data-dialog-body] > div')).toHaveClass('py-4', 'lg:py-5');
    expect(container.querySelector('[data-dialog-footer]')).toHaveClass(
      'pt-3',
      'lg:py-4',
      'pb-[calc(8px+env(safe-area-inset-bottom))]',
    );
    expect(container.querySelector('[data-dialog-handle]')).toHaveClass('pt-[7.5px]');
  });

  it('draws a hairline under the header and above the footer when there is a cross', async () => {
    const { container } = await renderWith('closeLabel="Fermer"');

    expect(container.querySelector('[data-dialog-header]')).toHaveClass('shadow-[inset_0_-1px_0_var(--hairline)]');
    expect(container.querySelector('[data-dialog-footer]')).toHaveClass('shadow-[inset_0_1px_0_var(--hairline)]');
  });

  it('draws no hairline without a cross', async () => {
    const { container } = await renderWith('');

    expect(container.querySelector('[data-dialog-header]')).not.toHaveClass('shadow-[inset_0_-1px_0_var(--hairline)]');
    expect(container.querySelector('[data-dialog-footer]')).not.toHaveClass('shadow-[inset_0_1px_0_var(--hairline)]');
  });

  it('gives the cross a 36px target on a desktop and 44px on a sheet', async () => {
    await renderWith('closeLabel="Fermer"');
    const cross = screen.getByRole('button', { name: 'Fermer' });

    expect(cross).toHaveClass('size-11', 'lg:size-9');
    expect(cross.querySelector('svg')).toHaveClass('size-[22px]');
  });

  it('is centred and capped 96px short of the viewport height on a desktop', async () => {
    const { container } = await renderWith('');

    expect(container.querySelector('dialog')).toHaveClass('m-auto', 'lg:max-h-[calc(100dvh-96px)]');
    expect(container.querySelector('dialog')).not.toHaveClass('lg:mt-24');
  });

  it('fits its content on a sheet by default', async () => {
    const { container } = await renderWith('');

    expect(container.querySelector('dialog')).not.toHaveClass('max-lg:h-[calc(100dvh-58px)]');
  });

  it('fills the screen below 58px on a full sheet', async () => {
    const { container } = await renderWith('sheet="full"');

    expect(container.querySelector('dialog')).toHaveClass('max-lg:h-[calc(100dvh-58px)]');
  });

  it('turns the confirm variant into an alertdialog with one 24px padding and no hairlines', async () => {
    const { container } = await renderWith('variant="confirm" closeLabel="Fermer"');

    expect(screen.getByRole('alertdialog', { name: 'Titre' })).toBeInTheDocument();
    expect(container.querySelector('[data-dialog-header]')).toHaveClass('pt-3', 'lg:pt-6', 'lg:pl-6');
    expect(container.querySelector('[data-dialog-header]')).not.toHaveClass('shadow-[inset_0_-1px_0_var(--hairline)]');
    expect(container.querySelector('[data-dialog-footer]')).toHaveClass('pt-5', 'lg:pt-6', 'lg:pb-6', 'empty:pt-0');
    expect(container.querySelector('[data-dialog-footer]')).not.toHaveClass('shadow-[inset_0_1px_0_var(--hairline)]');
    expect(container.querySelector('[data-dialog-handle]')).toHaveClass('pt-[11.5px]');
  });

  it.each([
    ['description="Ferrari"', true],
    ['', false],
  ])(
    'offsets the title of a sheet by 4px only when a subtitle follows (<ui-dialog %s>)',
    async (attributes, offset) => {
      await renderWith(attributes);

      const title = screen.getByRole('heading', { name: 'Titre' }).parentElement;
      if (offset) {
        expect(title).toHaveClass('max-lg:pt-1');
      } else {
        expect(title).not.toHaveClass('max-lg:pt-1');
      }
    },
  );

  it.each([
    ['variant="confirm"', false],
    ['', true],
  ])('hides an empty footer only in the default variant (<ui-dialog %s>)', async (attributes, hidden) => {
    const { container } = await renderWith(attributes);

    const footer = container.querySelector('[data-dialog-footer]');
    if (hidden) {
      expect(footer).toHaveClass('empty:hidden');
    } else {
      expect(footer).not.toHaveClass('empty:hidden');
    }
  });

  it('is a plain dialog in the default variant', async () => {
    const { container } = await renderWith('');

    expect(container.querySelector('dialog')).toHaveAttribute('role', 'dialog');
  });

  it.each([
    ['', '560px'],
    ['variant="confirm"', '440px'],
    ['width="md"', '28rem'],
    ['variant="confirm" width="480px"', '480px'],
  ])('resolves the width of <ui-dialog %s> to %s', async (attributes, expected) => {
    const { container } = await renderWith(attributes);

    expect(container.querySelector('dialog')?.style.getPropertyValue('--dialog-width')).toBe(expected);
  });

  it('leaves no role on the host element, which would be a nameless alertdialog', async () => {
    const { container } = await render(`<ui-dialog heading="Supprimer" variant="confirm" [open]="true"></ui-dialog>`, {
      imports: [UiDialog],
    });

    expect(container.querySelector('ui-dialog')).not.toHaveAttribute('role');
  });
});
