import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { UiHighlight } from './highlight';

@Component({
  imports: [UiHighlight],
  template: `<div data-testid="plain" [uiHighlight]="token()" (highlighted)="starts.set(starts() + 1)"></div>`,
})
class HostComponent {
  readonly token = signal<unknown>(null);
  readonly starts = signal(0);
}

const running = (endTime: number): Animation =>
  ({ effect: { getComputedTiming: () => ({ endTime, localTime: 0 }) } }) as unknown as Animation;

describe('UiHighlight highlighted output', () => {
  const originalAnimate = Element.prototype.animate;
  const originalGetAnimations = Element.prototype.getAnimations;
  const originalScrollIntoView = Element.prototype.scrollIntoView;
  let animate: ReturnType<typeof vi.fn>;
  let playing: Animation[];
  let originalMatchMedia: typeof matchMedia | undefined;

  const setup = (): { host: HostComponent; plain: HTMLElement; flush: () => void } => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    return {
      host: fixture.componentInstance,
      plain: root.querySelector<HTMLElement>('[data-testid=plain]') as HTMLElement,
      flush: () => fixture.detectChanges(),
    };
  };

  const frame = (): void => {
    vi.advanceTimersToNextFrame();
  };

  beforeEach(() => {
    originalMatchMedia = globalThis.matchMedia;
    globalThis.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof matchMedia;
    animate = vi.fn(() => ({ cancel: vi.fn() }));
    playing = [];
    Element.prototype.animate = animate as unknown as typeof Element.prototype.animate;
    Element.prototype.getAnimations = () => playing;
    Element.prototype.scrollIntoView = vi.fn() as unknown as typeof Element.prototype.scrollIntoView;
    vi.useFakeTimers();
  });

  afterEach(() => {
    Element.prototype.animate = originalAnimate;
    Element.prototype.getAnimations = originalGetAnimations;
    Element.prototype.scrollIntoView = originalScrollIntoView;
    vi.useRealTimers();
    if (originalMatchMedia) {
      globalThis.matchMedia = originalMatchMedia;
    } else {
      Reflect.deleteProperty(globalThis, 'matchMedia');
    }
  });

  it('emits once when the flash starts, not when the token arrives', () => {
    const { host, flush } = setup();

    host.token.set(1);
    flush();
    expect(host.starts()).toBe(0);

    frame();
    expect(animate).toHaveBeenCalled();
    expect(host.starts()).toBe(1);
  });

  it('emits after the scroll that brings an off-screen element into view', () => {
    const { host, plain, flush } = setup();
    plain.getBoundingClientRect = () => ({ top: 2000, bottom: 2040 }) as DOMRect;

    host.token.set(1);
    flush();
    frame();
    expect(host.starts()).toBe(0);

    document.dispatchEvent(new Event('scrollend', { bubbles: true }));
    frame();
    expect(host.starts()).toBe(1);
  });

  it('waits for an enter animation, as the flash does', () => {
    const { host, flush } = setup();
    playing = [running(150)];

    host.token.set(1);
    flush();
    frame();
    expect(host.starts()).toBe(0);

    vi.advanceTimersByTime(150);
    expect(host.starts()).toBe(1);
  });

  it('never emits for a highlight dropped before it started, nor for a null token', () => {
    const { host, flush } = setup();

    host.token.set(1);
    flush();
    host.token.set(2);
    flush();
    frame();
    expect(host.starts()).toBe(1);

    host.token.set(null);
    flush();
    frame();
    expect(host.starts()).toBe(1);
  });
});
