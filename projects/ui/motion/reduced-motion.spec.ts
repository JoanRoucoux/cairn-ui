import { TestBed } from '@angular/core/testing';

import { injectReducedMotion } from './reduced-motion';

type Listener = (event: { matches: boolean }) => void;

const stubMatchMedia = (
  matches: boolean,
): { query: object; listeners: Set<Listener>; change: (next: boolean) => void } => {
  const listeners = new Set<Listener>();
  const query = {
    matches,
    addEventListener: vi.fn((_type: string, listener: Listener) => listeners.add(listener)),
    removeEventListener: vi.fn((_type: string, listener: Listener) => listeners.delete(listener)),
  };

  globalThis.matchMedia = vi.fn().mockReturnValue(query) as unknown as typeof matchMedia;

  return {
    query,
    listeners,
    change: (next: boolean) => listeners.forEach((listener) => listener({ matches: next })),
  };
};

describe('injectReducedMotion', () => {
  let original: typeof matchMedia | undefined;

  beforeEach(() => {
    original = globalThis.matchMedia;
  });

  afterEach(() => {
    if (original) {
      globalThis.matchMedia = original;
    } else {
      Reflect.deleteProperty(globalThis, 'matchMedia');
    }
  });

  it('reads the reduced-motion media query', () => {
    stubMatchMedia(true);

    const signal = TestBed.runInInjectionContext(() => injectReducedMotion());

    expect(globalThis.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(signal()).toBe(true);
  });

  it('flips when the preference changes', () => {
    const media = stubMatchMedia(false);
    const signal = TestBed.runInInjectionContext(() => injectReducedMotion());

    expect(signal()).toBe(false);

    media.change(true);
    expect(signal()).toBe(true);

    media.change(false);
    expect(signal()).toBe(false);
  });

  it('stops listening when its context is destroyed', () => {
    const media = stubMatchMedia(false);

    TestBed.runInInjectionContext(() => injectReducedMotion());
    expect(media.listeners.size).toBe(1);

    TestBed.resetTestingModule();
    expect(media.listeners.size).toBe(0);
  });

  it('is false when matchMedia is unavailable', () => {
    Reflect.deleteProperty(globalThis, 'matchMedia');

    const signal = TestBed.runInInjectionContext(() => injectReducedMotion());

    expect(signal()).toBe(false);
  });
});
