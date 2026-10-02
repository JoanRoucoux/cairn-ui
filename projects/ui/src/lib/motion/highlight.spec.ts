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
          <td>b</td>
        </tr>
        <tr>
          <td data-testid="group" ui-group-cell [uiHighlight]="token()"><div data-testid="band"></div></td>
        </tr>
        <tr>
          <td data-testid="bare" ui-group-cell [uiHighlight]="token()"></td>
        </tr>
      </tbody>
    </table>
  `,
})
class HostComponent {
  readonly token = signal<unknown>(null);
}

const stubMatchMedia = (matches: boolean): void => {
  globalThis.matchMedia = vi.fn().mockReturnValue({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as typeof matchMedia;
};

describe('UiHighlight', () => {
  let animate: ReturnType<typeof vi.fn>;
  let cancel: ReturnType<typeof vi.fn>;
  let scrollIntoView: ReturnType<typeof vi.fn>;
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

  const animatedElements = (): Element[] => animate.mock.contexts as Element[];

  const offScreen = (element: Element): void => {
    element.getBoundingClientRect = () => ({ top: 2000, bottom: 2040 }) as DOMRect;
  };

  beforeEach(() => {
    originalMatchMedia = globalThis.matchMedia;
    stubMatchMedia(false);
    cancel = vi.fn();
    animate = vi.fn(() => ({ cancel }));
    scrollIntoView = vi.fn();
    Element.prototype.animate = animate as unknown as typeof Element.prototype.animate;
    Element.prototype.scrollIntoView = scrollIntoView as unknown as typeof Element.prototype.scrollIntoView;
    Element.prototype.getAnimations = () => [];
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

  it('does nothing while the token is null or undefined', () => {
    const { host, flush } = setup();
    host.token.set(undefined);
    flush();
    frame();

    expect(animate).not.toHaveBeenCalled();
  });

  it('holds --soft for 200 ms then fades over the highlight duration with the ease-out curve', () => {
    const { host, plain, flush } = setup();
    plain.style.setProperty('--duration-highlight', '1200ms');
    plain.style.setProperty('--ease-out', 'cubic-bezier(0.23, 1, 0.32, 1)');

    host.token.set(1);
    flush();
    frame();

    const index = animatedElements().indexOf(plain);
    expect(animate.mock.calls[index]?.[0]).toEqual([
      { backgroundColor: 'var(--soft)', offset: 0 },
      { backgroundColor: 'var(--soft)', offset: 200 / 1400, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
      { offset: 1 },
    ]);
    expect(animate.mock.calls[index]?.[1]).toEqual({ duration: 1400 });
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('reads a duration written in seconds and falls back to ease-out when the curve is missing', () => {
    const { host, plain, flush } = setup();
    plain.style.setProperty('--duration-highlight', '0.6s');

    host.token.set(1);
    flush();
    frame();

    const index = animatedElements().indexOf(plain);
    expect(animate.mock.calls[index]?.[1]).toEqual({ duration: 800 });
    expect(animate.mock.calls[index]?.[0][1].easing).toBe('ease-out');
  });

  it('falls back to 1200 ms when the duration token is missing', () => {
    const { host, plain, flush } = setup();

    host.token.set(1);
    flush();
    frame();

    expect(animate.mock.calls[animatedElements().indexOf(plain)]?.[1]).toEqual({ duration: 1400 });
  });

  it('paints the cells of a tr, the band of a group cell and the host otherwise', () => {
    const { host, root, plain, flush } = setup();
    host.token.set(1);
    flush();
    frame();

    const painted = animatedElements();
    const tr = root.querySelector('[data-testid=tr]');
    expect(painted).toContain(plain);
    expect(painted).toContain(tr?.children[0]);
    expect(painted).toContain(tr?.children[1]);
    expect(painted).not.toContain(tr);
    expect(painted).toContain(root.querySelector('[data-testid=band]'));
    expect(painted).not.toContain(root.querySelector('[data-testid=group]'));
    expect(painted).toContain(root.querySelector('[data-testid=bare]'));
  });

  it('plays on arrival when the token is already set', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.token.set('now');
    fixture.detectChanges();
    frame();

    expect(animate).toHaveBeenCalled();
  });

  it('cancels the running highlight when a new token arrives and when destroyed', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.token.set(1);
    fixture.detectChanges();
    frame();
    const first = animate.mock.calls.length;
    expect(cancel).not.toHaveBeenCalled();

    fixture.componentInstance.token.set(2);
    fixture.detectChanges();
    expect(cancel).toHaveBeenCalledTimes(first);

    frame();
    cancel.mockClear();
    fixture.destroy();
    expect(cancel).toHaveBeenCalledTimes(first);
  });

  it('treats an element inside the scroll margin as off screen', () => {
    const { host, plain, flush } = setup();
    plain.style.scrollMarginTop = '80px';
    plain.getBoundingClientRect = () => ({ top: 40, bottom: 80 }) as DOMRect;

    host.token.set(1);
    flush();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  });

  it('treats an element under the bottom scroll margin, such as a tab bar, as off screen', () => {
    const { host, plain, flush } = setup();
    plain.style.scrollMarginBottom = '120px';
    plain.getBoundingClientRect = () => ({ top: window.innerHeight - 100, bottom: window.innerHeight - 60 }) as DOMRect;

    host.token.set(1);
    flush();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  });

  it('scrolls smoothly then highlights on scrollend', () => {
    const { host, plain, flush } = setup();
    offScreen(plain);

    host.token.set(1);
    flush();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    frame();
    expect(animatedElements()).not.toContain(plain);

    document.dispatchEvent(new Event('scrollend', { bubbles: true }));
    frame();
    expect(animatedElements()).toContain(plain);

    document.dispatchEvent(new Event('scrollend', { bubbles: true }));
    vi.advanceTimersByTime(1000);
    expect(animatedElements().filter((element) => element === plain)).toHaveLength(1);
  });

  it('highlights on the scrollend of the scroller that contains the element', () => {
    const { host, root, plain, flush } = setup();
    offScreen(plain);
    document.body.appendChild(root);

    host.token.set(1);
    flush();
    root.dispatchEvent(new Event('scrollend', { bubbles: true }));
    frame();

    expect(animatedElements()).toContain(plain);
    root.remove();
  });

  it('ignores the scroll of an unrelated element', () => {
    const { host, plain, flush } = setup();
    offScreen(plain);
    const other = document.createElement('div');
    document.body.appendChild(other);

    host.token.set(1);
    flush();
    other.dispatchEvent(new Event('scrollend', { bubbles: true }));
    other.dispatchEvent(new Event('scroll', { bubbles: true }));
    vi.advanceTimersByTime(199);

    expect(animatedElements()).not.toContain(plain);
    other.remove();
  });

  it('waits for the scroll to settle when scrollend never fires', () => {
    const { host, plain, flush } = setup();
    offScreen(plain);

    host.token.set(1);
    flush();
    vi.advanceTimersByTime(150);
    document.dispatchEvent(new Event('scroll', { bubbles: true }));
    vi.advanceTimersByTime(150);
    expect(animatedElements()).not.toContain(plain);

    vi.advanceTimersByTime(50);
    frame();
    expect(animatedElements()).toContain(plain);
  });

  it('counts the settle delay from the first scroll event, not from the scroll request', () => {
    const { host, plain, flush } = setup();
    offScreen(plain);

    host.token.set(1);
    flush();
    vi.advanceTimersByTime(250);
    document.dispatchEvent(new Event('scroll', { bubbles: true }));
    vi.advanceTimersByTime(199);
    expect(animatedElements()).not.toContain(plain);

    vi.advanceTimersByTime(1);
    frame();
    expect(animatedElements()).toContain(plain);
  });

  it('still highlights after 300 ms when the page does not scroll at all', () => {
    const { host, plain, flush } = setup();
    offScreen(plain);

    host.token.set(1);
    flush();
    vi.advanceTimersByTime(299);
    expect(animatedElements()).not.toContain(plain);

    vi.advanceTimersByTime(1);
    frame();
    expect(animatedElements()).toContain(plain);
  });

  it('drops a pending highlight when a new token arrives, then cancels the running one', () => {
    const { host, plain, flush } = setup();
    offScreen(plain);

    host.token.set(1);
    flush();
    host.token.set(2);
    flush();
    vi.advanceTimersByTime(300);
    frame();
    expect(animatedElements().filter((element) => element === plain)).toHaveLength(1);

    host.token.set(3);
    flush();
    expect(cancel).toHaveBeenCalled();
  });

  it('scrolls instantly and highlights at once under reduced motion', () => {
    stubMatchMedia(true);
    const { host, plain, flush } = setup();
    offScreen(plain);

    host.token.set(1);
    flush();
    frame();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'center' });
    expect(animatedElements()).toContain(plain);
  });
});
