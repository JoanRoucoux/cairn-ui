import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { UiFlipList } from './flip-list';

@Component({
  imports: [UiFlipList],
  template: `
    <ul uiFlipList>
      @for (item of items(); track item) {
        <li>{{ item }}</li>
      }
    </ul>
  `,
})
class HostComponent {
  readonly items = signal(['a', 'b', 'c']);
}

const ROW = 50;

const layout = (list: HTMLElement): void => {
  Array.from(list.children).forEach((child, index) => {
    Object.defineProperty(child, 'offsetTop', { value: index * ROW, configurable: true });
  });
};

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

describe('UiFlipList', () => {
  let animate: ReturnType<typeof vi.fn>;
  let resize: (() => void) | undefined;
  let observe: ReturnType<typeof vi.fn>;
  let unobserve: ReturnType<typeof vi.fn>;
  let disconnectResize: ReturnType<typeof vi.fn>;
  let originalMatchMedia: typeof matchMedia | undefined;

  const stubMatchMedia = (matches: boolean): void => {
    globalThis.matchMedia = vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof matchMedia;
  };

  const setup = async (): Promise<{
    host: HostComponent;
    list: HTMLElement;
    change: (items: string[]) => Promise<void>;
  }> => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const list = (fixture.nativeElement as HTMLElement).querySelector('ul') as HTMLElement;
    layout(list);
    resize?.();
    return {
      host: fixture.componentInstance,
      list,
      change: async (items) => {
        fixture.componentInstance.items.set(items);
        fixture.detectChanges();
        layout(list);
        await tick();
      },
    };
  };

  beforeEach(() => {
    originalMatchMedia = globalThis.matchMedia;
    stubMatchMedia(false);
    animate = vi.fn(() => ({ cancel: vi.fn() }));
    Element.prototype.animate = animate as unknown as typeof Element.prototype.animate;
    observe = vi.fn();
    unobserve = vi.fn();
    disconnectResize = vi.fn();
    globalThis.ResizeObserver = class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe = observe;
      unobserve = unobserve;
      disconnect = disconnectResize;
    } as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    resize = undefined;
    if (originalMatchMedia) {
      globalThis.matchMedia = originalMatchMedia;
    } else {
      Reflect.deleteProperty(globalThis, 'matchMedia');
    }
  });

  it('moves the children after a removed one up from where they were', async () => {
    const { list, change } = await setup();
    const c = list.children[2];

    await change(['a', 'c']);

    expect(animate).toHaveBeenCalledTimes(1);
    expect(animate.mock.contexts[0]).toBe(c);
    expect(animate.mock.calls[0]?.[0]).toEqual([{ transform: `translateY(${ROW}px)` }, { transform: 'translateY(0)' }]);
    expect(animate.mock.calls[0]?.[1]).toEqual({ duration: 260, easing: 'ease-out' });
  });

  it('moves the children after a re-inserted one down from where they were', async () => {
    const { list, change } = await setup();
    await change(['a', 'c']);
    animate.mockClear();
    const c = list.children[1];

    await change(['a', 'b', 'c']);

    expect(animate).toHaveBeenCalledTimes(1);
    expect(animate.mock.contexts[0]).toBe(c);
    expect(animate.mock.calls[0]?.[0]).toEqual([
      { transform: `translateY(${-ROW}px)` },
      { transform: 'translateY(0)' },
    ]);
  });

  it('animates nothing under reduced motion', async () => {
    stubMatchMedia(true);
    const { change } = await setup();

    await change(['a', 'c']);

    expect(animate).not.toHaveBeenCalled();
  });

  it('disconnects both observers when destroyed', async () => {
    const disconnectMutations = vi.spyOn(MutationObserver.prototype, 'disconnect');
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.destroy();

    expect(disconnectMutations).toHaveBeenCalledTimes(1);
    expect(disconnectResize).toHaveBeenCalledTimes(1);
    disconnectMutations.mockRestore();
  });

  it('watches the size of every child and stops watching a removed one', async () => {
    const { list, change } = await setup();
    const [a, b, c] = Array.from(list.children);

    expect(observe).toHaveBeenCalledWith(a);
    expect(observe).toHaveBeenCalledWith(b);
    expect(observe).toHaveBeenCalledWith(c);

    await change(['a', 'c']);

    expect(unobserve).toHaveBeenCalledWith(b);
    expect(unobserve).toHaveBeenCalledTimes(1);
  });

  it('uses the new positions when a sibling resized while the list kept its size', async () => {
    const { list, change } = await setup();
    Object.defineProperty(list.children[2], 'offsetTop', { value: ROW + 30, configurable: true });
    resize?.();

    await change(['a', 'c']);

    expect(animate.mock.calls[0]?.[0]).toEqual([{ transform: `translateY(${30}px)` }, { transform: 'translateY(0)' }]);
  });

  it('restarts an interrupted move from where the child is displayed', async () => {
    const { list, change } = await setup();
    const cancels: ReturnType<typeof vi.fn>[] = [];
    animate.mockImplementation(() => {
      const cancel = vi.fn();
      cancels.push(cancel);
      return { cancel };
    });

    await change(['a', 'c']);
    const c = list.children[1] as HTMLElement;
    expect(animate.mock.calls[0]?.[0][0]).toEqual({ transform: `translateY(${ROW}px)` });
    animate.mockClear();

    let cancelled = false;
    cancels[0]?.mockImplementation(() => {
      cancelled = true;
    });
    c.getBoundingClientRect = () => ({ top: cancelled ? 0 : 20 }) as DOMRect;

    await change(['c']);

    expect(cancels[0]).toHaveBeenCalledTimes(1);
    expect(animate.mock.calls[0]?.[0][0]).toEqual({ transform: `translateY(${ROW + 20}px)` });
  });
});
