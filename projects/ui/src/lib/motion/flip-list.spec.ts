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
    animate = vi.fn();
    Element.prototype.animate = animate as unknown as typeof Element.prototype.animate;
    globalThis.ResizeObserver = class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe(): void {
        return;
      }
      disconnect(): void {
        return;
      }
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

  it('stops observing when destroyed', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(() => fixture.destroy()).not.toThrow();
  });
});
