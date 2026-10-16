import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { UiDialog } from '@joanroucoux/cairn-ui/dialog';
import { render, screen } from '@testing-library/angular';

import { UiToaster } from './toast';
import { UiToasts } from './toasts';

const setup = async (): Promise<{ toasts: UiToasts; host: HTMLElement }> => {
  const { fixture } = await render('<ui-toaster />', { imports: [UiToaster] });
  const toasts = TestBed.inject(UiToasts);

  return { toasts, host: fixture.nativeElement.querySelector('ui-toaster') as HTMLElement };
};

const flush = async (): Promise<void> => {
  TestBed.tick();
  await vi.advanceTimersByTimeAsync(0);
};

@Component({
  imports: [UiToaster],
  template: '<ui-toaster />',
})
class QueuedBeforeRender {
  constructor() {
    inject(UiToasts).show('Already there');
  }
}

describe('UiToaster top layer', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: false }));
  afterEach(() => vi.useRealTimers());

  it('is a manual popover shown once rendered', async () => {
    const { host } = await setup();

    expect(host).toHaveAttribute('popover', 'manual');
    expect(host.style.display).toBe('block');
  });

  it('shows a message queued before the first render without hiding a popover that is not open yet', async () => {
    const hidden = vi.spyOn(HTMLElement.prototype, 'hidePopover');

    const { fixture } = await render(QueuedBeforeRender);
    await flush();
    const host = fixture.nativeElement.querySelector('ui-toaster') as HTMLElement;

    expect(hidden).not.toHaveBeenCalled();
    expect(host.style.display).toBe('block');
    expect(host).toHaveTextContent('Already there');
  });

  const renderWithDialog = async (): Promise<{
    fixture: Awaited<ReturnType<typeof render>>['fixture'];
    toaster: HTMLElement;
    shown: ReturnType<typeof vi.spyOn>;
  }> => {
    const { fixture } = await render(
      `<ui-toaster />
       <ui-dialog heading="Enter a price" [open]="open"><button dialogActions type="button">Cancel</button></ui-dialog>`,
      { imports: [UiToaster, UiDialog], componentProperties: { open: false } },
    );
    const toaster = fixture.nativeElement.querySelector('ui-toaster') as HTMLElement;

    return { fixture, toaster, shown: vi.spyOn(toaster, 'showPopover') };
  };

  it('is shown again when a message arrives while a modal dialog is open', async () => {
    const { fixture, toaster, shown } = await renderWithDialog();

    fixture.componentInstance.open = true;
    fixture.detectChanges();
    await flush();
    expect(fixture.nativeElement.querySelector('dialog')).toHaveAttribute('open');
    shown.mockClear();

    TestBed.inject(UiToasts).show('Purchase recorded');
    await flush();

    expect(shown).toHaveBeenCalled();
    expect(toaster.style.display).toBe('block');
  });

  it('is not shown again when a modal dialog opens while a message is visible', async () => {
    const { fixture, shown } = await renderWithDialog();
    TestBed.inject(UiToasts).show('Purchase recorded');
    await flush();
    shown.mockClear();

    fixture.componentInstance.open = true;
    fixture.detectChanges();
    await flush();

    expect(fixture.nativeElement.querySelector('dialog')).toHaveAttribute('open');
    expect(shown).not.toHaveBeenCalled();
  });

  it('is not shown again by a hover or focus change after a modal dialog opened over it', async () => {
    const { fixture, shown } = await renderWithDialog();
    TestBed.inject(UiToasts).show('Purchase recorded');
    await flush();
    const message = screen.getByText('Purchase recorded').parentElement!;
    message.dispatchEvent(new MouseEvent('mouseenter'));
    await flush();

    fixture.componentInstance.open = true;
    fixture.detectChanges();
    await flush();
    shown.mockClear();

    message.dispatchEvent(new MouseEvent('mouseleave'));
    await flush();
    message.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await flush();
    message.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await flush();

    expect(shown).not.toHaveBeenCalled();
  });
});
