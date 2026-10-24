import { render, screen } from '@testing-library/angular';

import { UiAsync } from './async';

describe('UiAsync focus', () => {
  const template = `
    <ui-async [state]="state" errorTitle="Failed" errorMessage="Nope" retryLabel="Retry">
      <span asyncLoading>skeleton</span>
      <span>content</span>
    </ui-async>`;

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const change = async (
    fixture: { componentInstance: { state: string }; detectChanges: () => void },
    state: string,
    elapsed = 0,
  ): Promise<void> => {
    fixture.componentInstance.state = state;
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(elapsed);
    fixture.detectChanges();
  };

  it('moves focus to the host once the error block is gone', async () => {
    const { fixture } = await render(template, { imports: [UiAsync], componentProperties: { state: 'error' } });
    const host = fixture.nativeElement.querySelector('ui-async') as HTMLElement;
    const retry = screen.getByRole('button', { name: 'Retry' });

    retry.focus();
    retry.click();
    await change(fixture, 'loading', 150);

    expect(host).toHaveAttribute('tabindex', '-1');
    expect(host).toHaveFocus();
  });

  it('leaves focus alone when the retry button did not have it', async () => {
    const { fixture } = await render(template, { imports: [UiAsync], componentProperties: { state: 'error' } });
    const host = fixture.nativeElement.querySelector('ui-async') as HTMLElement;

    screen.getByRole('button', { name: 'Retry' }).click();
    await change(fixture, 'loading', 150);

    expect(host).not.toHaveAttribute('tabindex');
    expect(host).not.toHaveFocus();
  });

  it('does not steal focus the user moved elsewhere', async () => {
    const { fixture } = await render(`<input aria-label="Other" />${template}`, {
      imports: [UiAsync],
      componentProperties: { state: 'error' },
    });
    const retry = screen.getByRole('button', { name: 'Retry' });

    retry.focus();
    retry.click();
    screen.getByLabelText('Other').focus();
    await change(fixture, 'loading', 150);

    expect(screen.getByLabelText('Other')).toHaveFocus();
  });

  it('forgets the press when the retry fails within the skeleton delay', async () => {
    const { fixture } = await render(template, { imports: [UiAsync], componentProperties: { state: 'error' } });
    const host = fixture.nativeElement.querySelector('ui-async') as HTMLElement;
    const retry = screen.getByRole('button', { name: 'Retry' });

    retry.focus();
    retry.click();
    await change(fixture, 'loading', 100);
    await change(fixture, 'error');
    await change(fixture, 'ready', 200);

    expect(host).not.toHaveFocus();
    expect(host).not.toHaveAttribute('tabindex');
  });

  it('removes the tabindex again once the host loses focus', async () => {
    const { fixture } = await render(`<input aria-label="Other" />${template}`, {
      imports: [UiAsync],
      componentProperties: { state: 'error' },
    });
    const host = fixture.nativeElement.querySelector('ui-async') as HTMLElement;
    const retry = screen.getByRole('button', { name: 'Retry' });

    retry.focus();
    retry.click();
    await change(fixture, 'loading', 150);
    expect(host).toHaveAttribute('tabindex', '-1');

    screen.getByLabelText('Other').focus();

    expect(host).not.toHaveAttribute('tabindex');
  });
});
