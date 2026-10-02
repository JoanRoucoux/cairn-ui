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

const running = (endTime: number, localTime: number | null = 0): Animation =>
  ({ effect: { getComputedTiming: () => ({ endTime, localTime }) } }) as unknown as Animation;

describe('UiHighlight with an enter animation', () => {
  const originalAnimate = Element.prototype.animate;
  const originalGetAnimations = Element.prototype.getAnimations;
  let animate: ReturnType<typeof vi.fn>;
  let playing: Map<Element, Animation[]>;
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
    playing = new Map();
    Element.prototype.animate = animate as unknown as typeof Element.prototype.animate;
    Element.prototype.getAnimations = function (this: Element) {
      return playing.get(this) ?? [];
    };
    vi.useFakeTimers();
  });

  afterEach(() => {
    Element.prototype.animate = originalAnimate;
    Element.prototype.getAnimations = originalGetAnimations;
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

  it('waits for what is left of the enter animation of the element, so both play', () => {
    const { host, plain, flush } = setup();
    playing.set(plain, [running(180, 30)]);

    host.token.set(1);
    flush();
    frame();
    vi.advanceTimersByTime(149);
    expect(paintsOf(plain)).toBe(0);

    vi.advanceTimersByTime(1);
    expect(paintsOf(plain)).toBe(1);
  });

  it('counts an enter animation that has not started yet in full', () => {
    const { host, plain, flush } = setup();
    playing.set(plain, [running(180, null)]);

    host.token.set(1);
    flush();
    frame();
    vi.advanceTimersByTime(179);
    expect(paintsOf(plain)).toBe(0);

    vi.advanceTimersByTime(1);
    expect(paintsOf(plain)).toBe(1);
  });

  it('waits for the longest animation of the element and of a painted cell', () => {
    const { host, root, flush } = setup();
    const tr = root.querySelector('[data-testid=tr]') as Element;
    const cell = tr.children[0] as Element;
    playing.set(tr, [running(100)]);
    playing.set(cell, [running(200)]);

    host.token.set(1);
    flush();
    frame();
    vi.advanceTimersByTime(199);
    expect(paintsOf(cell)).toBe(0);

    vi.advanceTimersByTime(1);
    expect(paintsOf(cell)).toBe(1);
  });

  it('waits no longer than --duration-base, so a paused or long animation cannot hold it back', () => {
    const { host, plain, flush } = setup();
    plain.style.setProperty('--duration-base', '150ms');
    playing.set(plain, [running(5000)]);

    host.token.set(1);
    flush();
    frame();
    vi.advanceTimersByTime(149);
    expect(paintsOf(plain)).toBe(0);

    vi.advanceTimersByTime(1);
    expect(paintsOf(plain)).toBe(1);
  });

  it('caps the wait at 260 ms when --duration-base is missing', () => {
    const { host, plain, flush } = setup();
    playing.set(plain, [running(5000)]);

    host.token.set(1);
    flush();
    frame();
    vi.advanceTimersByTime(259);
    expect(paintsOf(plain)).toBe(0);

    vi.advanceTimersByTime(1);
    expect(paintsOf(plain)).toBe(1);
  });

  it('does not wait for an endless animation such as a pulse', () => {
    const { host, plain, flush } = setup();
    playing.set(plain, [running(Infinity)]);

    host.token.set(1);
    flush();
    frame();

    expect(paintsOf(plain)).toBe(1);
  });

  it('drops a highlight still waiting for the enter animation when a new token arrives', () => {
    const { host, plain, flush } = setup();
    playing.set(plain, [running(180)]);
    host.token.set(1);
    flush();
    frame();

    playing.delete(plain);
    host.token.set(2);
    flush();
    frame();
    vi.advanceTimersByTime(500);

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
