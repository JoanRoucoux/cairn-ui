import { type RenderResult, render } from '@testing-library/angular';

import { UiDialog } from './dialog';

const renderDialog = (): Promise<RenderResult<unknown>> =>
  render(
    `<ui-dialog heading="Enter a price" [open]="true">
       <p>Corps</p>
       <button dialogActions type="button">Cancel</button>
     </ui-dialog>`,
    { imports: [UiDialog] },
  );

describe('UiDialog scrolling body', () => {
  const observers: { callback: () => void; observed: Element[]; disconnect: ReturnType<typeof vi.fn> }[] = [];

  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        readonly observed: Element[] = [];
        readonly disconnect = vi.fn();

        constructor(readonly callback: () => void) {
          observers.push(this);
        }

        observe(element: Element): void {
          this.observed.push(element);
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const measure = (body: Element, scrollHeight: number, clientHeight: number): void => {
    Object.defineProperty(body, 'scrollHeight', { configurable: true, value: scrollHeight });
    Object.defineProperty(body, 'clientHeight', { configurable: true, value: clientHeight });
    observers[0]!.callback();
  };

  it('observes the body and its content', async () => {
    const { container } = await renderDialog();
    const body = container.querySelector('[data-dialog-body]');

    expect(observers[0]!.observed).toEqual([body, body?.firstElementChild]);
  });

  it('makes the body focusable and named only while it overflows', async () => {
    const { container, fixture } = await renderDialog();
    const body = container.querySelector('[data-dialog-body]') as HTMLElement;
    const heading = container.querySelector('h2');

    measure(body, 600, 300);
    fixture.detectChanges();

    expect(body).toHaveAttribute('tabindex', '0');
    expect(body).toHaveAttribute('role', 'region');
    expect(body).toHaveAttribute('aria-labelledby', heading?.id);

    measure(body, 300, 300);
    fixture.detectChanges();

    expect(body).not.toHaveAttribute('tabindex');
    expect(body).not.toHaveAttribute('role');
    expect(body).not.toHaveAttribute('aria-labelledby');
  });

  it('stops observing when destroyed', async () => {
    const { fixture } = await renderDialog();

    fixture.destroy();

    expect(observers[0]!.disconnect).toHaveBeenCalled();
  });
});
