import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { UiHighlight } from './highlight';

@Component({
  imports: [UiHighlight],
  template: `
    <div data-testid="plain" [uiHighlight]="token()"></div>
    <table>
      <tbody>
        <tr data-testid="tr" [uiHighlight]="token()">
          <td>a</td>
        </tr>
      </tbody>
    </table>
  `,
})
class HostComponent {
  readonly token = signal<unknown>(null);
}

type Entering = {
  animation: Animation;
  end: () => void;
  abort: () => void;
};

const entering = (iterations = 1): Entering => {
  let end = (): void => undefined;
  let abort = (): void => undefined;
  const finished = new Promise<void>((resolve, reject) => {
    end = resolve;
    abort = () => reject(new Error('cancelled'));
  });
  finished.catch(() => undefined);
  return {
    animation: { effect: { getTiming: () => ({ iterations }) }, finished } as unknown as Animation,
    end,
    abort,
  };
};

describe('UiHighlight with an enter animation', () => {
  let animate: ReturnType<typeof vi.fn>;
  let running: Map<Element, Animation[]>;
  let originalMatchMedia: typeof matchMedia | undefined;

  const setup = (): { host: HostComponent; root: HTMLElement; plain: HTMLElement; flush: () => void } => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    return {
      host: fixture.componentInstance,
      root,
      plain: root.querySelector<HTMLElement>('[data-testid=plain]') as HTMLElement,
      flush: () => fixture.detectChanges(),
    };
  };

  const frame = (): void => {
    vi.advanceTimersToNextFrame();
  };

  const paintsOf = (element: Element): number =>
    (animate.mock.contexts as Element[]).filter((painted) => painted === element).length;

  beforeEach(() => {
    originalMatchMedia = globalThis.matchMedia;
    globalThis.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof matchMedia;
    animate = vi.fn(() => ({ cancel: vi.fn() }));
    running = new Map();
    Element.prototype.animate = animate as unknown as typeof Element.prototype.animate;
    Element.prototype.getAnimations = function (this: Element) {
      return running.get(this) ?? [];
    };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalMatchMedia) {
      globalThis.matchMedia = originalMatchMedia;
    } else {
      Reflect.deleteProperty(globalThis, 'matchMedia');
    }
  });

  it('starts on the next frame, once the enter classes of a new element are in place', () => {
    const { host, plain, flush } = setup();

    host.token.set(1);
    flush();
    expect(paintsOf(plain)).toBe(0);

    frame();
    expect(paintsOf(plain)).toBe(1);
  });

  it('waits for the enter animation of the element to finish, so both play', async () => {
    const { host, plain, flush } = setup();
    const fade = entering();
    running.set(plain, [fade.animation]);

    host.token.set(1);
    flush();
    frame();
    await Promise.resolve();
    expect(paintsOf(plain)).toBe(0);

    fade.end();
    await vi.waitFor(() => expect(paintsOf(plain)).toBe(1));
  });

  it('waits for the enter animation of a painted cell too', async () => {
    const { host, root, flush } = setup();
    const cell = root.querySelector('[data-testid=tr]')?.children[0] as Element;
    const fade = entering();
    running.set(cell, [fade.animation]);

    host.token.set(1);
    flush();
    frame();
    await Promise.resolve();
    expect(paintsOf(cell)).toBe(0);

    fade.end();
    await vi.waitFor(() => expect(paintsOf(cell)).toBe(1));
  });

  it('still highlights when the enter animation is cancelled', async () => {
    const { host, plain, flush } = setup();
    const fade = entering();
    running.set(plain, [fade.animation]);

    host.token.set(1);
    flush();
    frame();
    fade.abort();

    await vi.waitFor(() => expect(paintsOf(plain)).toBe(1));
  });

  it('does not wait for an endless animation such as a pulse', () => {
    const { host, plain, flush } = setup();
    running.set(plain, [entering(Infinity).animation]);

    host.token.set(1);
    flush();
    frame();

    expect(paintsOf(plain)).toBe(1);
  });

  it('drops a highlight still waiting for the enter animation when a new token arrives', async () => {
    const { host, plain, flush } = setup();
    const fade = entering();
    running.set(plain, [fade.animation]);
    host.token.set(1);
    flush();
    frame();

    running.delete(plain);
    host.token.set(2);
    flush();
    frame();
    fade.end();
    await Promise.resolve();
    await Promise.resolve();

    expect(paintsOf(plain)).toBe(1);
  });

  it('drops a highlight still waiting for its frame when a new token arrives', () => {
    const { host, plain, flush } = setup();
    host.token.set(1);
    flush();
    host.token.set(2);
    flush();
    frame();

    expect(paintsOf(plain)).toBe(1);
  });
});
