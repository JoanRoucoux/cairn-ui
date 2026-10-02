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
class ListHost {
  readonly items = signal(['a', 'b', 'c']);
}

const ROW = 50;

const shownShift = (element: HTMLElement): number => {
  const match = /^matrix\((.+)\)$/.exec(element.style.transform);
  return match ? parseFloat((match[1] as string).split(',')[5] as string) : 0;
};

const shift = (y: number): string => `matrix(1, 0, 0, 1, 0, ${y})`;

let origin = 0;

const layout = (host: HTMLElement): void => {
  const place = (element: HTMLElement, top: number): number => {
    const children = Array.from(element.children) as HTMLElement[];
    const bottom = children.length === 0 ? top + ROW : children.reduce((cursor, child) => place(child, cursor), top);
    element.getBoundingClientRect = () => {
      let offset = 0;
      for (let node: HTMLElement | null = element; node && node !== host; node = node.parentElement) {
        offset += shownShift(node);
      }
      return { top: origin + top + offset } as DOMRect;
    };
    return bottom;
  };
  (Array.from(host.children) as HTMLElement[]).reduce((cursor, child) => place(child, cursor), 0);
  host.getBoundingClientRect = () => ({ top: origin }) as DOMRect;
};

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

type FakeAnimation = {
  cancel: ReturnType<typeof vi.fn>;
  onfinish: (() => void) | null;
};

describe('UiFlipList', () => {
  let animate: ReturnType<typeof vi.fn>;
  let animations: FakeAnimation[];
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

  const setup = async <T extends ListHost>(
    type: new () => T,
  ): Promise<{ host: T; list: HTMLElement; change: (update: (host: T) => void) => Promise<void> }> => {
    const fixture = TestBed.createComponent(type);
    fixture.detectChanges();
    await fixture.whenStable();
    const list = (fixture.nativeElement as HTMLElement).querySelector('[uiFlipList]') as HTMLElement;
    layout(list);
    resize?.();
    return {
      host: fixture.componentInstance,
      list,
      change: async (update) => {
        update(fixture.componentInstance);
        fixture.detectChanges();
        layout(list);
        await tick();
      },
    };
  };

  const setItems =
    (items: string[]) =>
    (host: ListHost): void =>
      host.items.set(items);

  const animated = (): Element[] => animate.mock.contexts as Element[];
  const fromOf = (element: Element): unknown => animate.mock.calls[animated().indexOf(element)]?.[0][0];
  beforeEach(() => {
    origin = 0;
    originalMatchMedia = globalThis.matchMedia;
    stubMatchMedia(false);
    animations = [];
    animate = vi.fn(() => {
      const animation: FakeAnimation = { cancel: vi.fn(), onfinish: null };
      animations.push(animation);
      return animation;
    });
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

  describe('on direct children', () => {
    it('moves the children after a removed one up from where they were', async () => {
      const { list, change } = await setup(ListHost);
      const c = list.children[2];

      await change(setItems(['a', 'c']));

      expect(animate).toHaveBeenCalledTimes(1);
      expect(animate.mock.contexts[0]).toBe(c);
      expect(animate.mock.calls[0]?.[0]).toEqual([
        { transform: `translateY(${ROW}px)` },
        { transform: 'translateY(0)' },
      ]);
      expect(animate.mock.calls[0]?.[1]).toEqual({ duration: 260, easing: 'ease-out' });
    });

    it('moves the children after a re-inserted one down from where they were', async () => {
      const { list, change } = await setup(ListHost);
      await change(setItems(['a', 'c']));
      animate.mockClear();
      const c = list.children[1];

      await change(setItems(['a', 'b', 'c']));

      expect(animate).toHaveBeenCalledTimes(1);
      expect(animate.mock.contexts[0]).toBe(c);
      expect(animate.mock.calls[0]?.[0]).toEqual([
        { transform: `translateY(${-ROW}px)` },
        { transform: 'translateY(0)' },
      ]);
    });

    it('measures from the list itself, so a list that moved on the page slides by the gap only', async () => {
      const { list, change } = await setup(ListHost);
      const c = list.children[2] as HTMLElement;
      origin = 920;

      await change(setItems(['a', 'c']));

      expect(fromOf(c)).toEqual({ transform: `translateY(${ROW}px)` });
    });

    it('animates nothing under reduced motion', async () => {
      stubMatchMedia(true);
      const { change } = await setup(ListHost);

      await change(setItems(['a', 'c']));

      expect(animate).not.toHaveBeenCalled();
    });

    it('disconnects both observers when destroyed', async () => {
      const disconnectMutations = vi.spyOn(MutationObserver.prototype, 'disconnect');
      const fixture = TestBed.createComponent(ListHost);
      fixture.detectChanges();
      await fixture.whenStable();

      fixture.destroy();

      expect(disconnectMutations).toHaveBeenCalledTimes(1);
      expect(disconnectResize).toHaveBeenCalledTimes(1);
      disconnectMutations.mockRestore();
    });

    it('watches the size of every child and stops watching a removed one', async () => {
      const { list, change } = await setup(ListHost);
      const [a, b, c] = Array.from(list.children);

      expect(observe).toHaveBeenCalledWith(a);
      expect(observe).toHaveBeenCalledWith(b);
      expect(observe).toHaveBeenCalledWith(c);

      await change(setItems(['a', 'c']));

      expect(unobserve).toHaveBeenCalledWith(b);
      expect(unobserve).toHaveBeenCalledTimes(1);
    });

    it('uses the new positions when a sibling resized while the list kept its size', async () => {
      const { list, change } = await setup(ListHost);
      const c = list.children[2] as HTMLElement;
      c.getBoundingClientRect = () => ({ top: ROW + 30 }) as DOMRect;
      resize?.();

      await change(setItems(['a', 'c']));

      expect(fromOf(c)).toEqual({ transform: `translateY(${30}px)` });
    });

    it('slides nothing when the content of a child changes without adding or removing one', async () => {
      const { list } = await setup(ListHost);
      const c = list.children[2] as HTMLElement;
      c.getBoundingClientRect = () => ({ top: 3 * ROW }) as DOMRect;

      list.children[0]?.appendChild(document.createElement('span'));
      await tick();

      expect(animate).not.toHaveBeenCalled();
    });

    it('restarts an interrupted move from where the child is displayed', async () => {
      const { list, change } = await setup(ListHost);

      await change(setItems(['a', 'c']));
      const c = list.children[1] as HTMLElement;
      expect(fromOf(c)).toEqual({ transform: `translateY(${ROW}px)` });
      animate.mockClear();
      c.style.transform = shift(20);

      await change(setItems(['c']));

      expect(animations[0]?.cancel).toHaveBeenCalledTimes(1);
      expect(fromOf(c)).toEqual({ transform: `translateY(${ROW + 20}px)` });
    });

    it('measures a moving child where it lands, not where it is displayed', async () => {
      const { list, change } = await setup(ListHost);
      await change(setItems(['a', 'c']));
      const c = list.children[1] as HTMLElement;
      c.style.transform = shift(20);
      resize?.();
      animate.mockClear();
      c.style.transform = '';

      await change(setItems(['c']));

      expect(fromOf(c)).toEqual({ transform: `translateY(${ROW}px)` });
    });

    it('forgets a move once it has finished', async () => {
      const { list, change } = await setup(ListHost);
      await change(setItems(['a', 'c']));
      const c = list.children[1] as HTMLElement;
      animations[0]?.onfinish?.();
      animate.mockClear();

      await change(setItems(['c']));

      expect(animations[0]?.cancel).not.toHaveBeenCalled();
      expect(fromOf(c)).toEqual({ transform: `translateY(${ROW}px)` });
    });

    it('keeps tracking the newer move when an older one reports its end late', async () => {
      const { list, change } = await setup(ListHost);
      await change(setItems(['a', 'c']));
      await change(setItems(['c']));
      const c = list.children[0] as HTMLElement;
      animations[0]?.onfinish?.();
      c.style.transform = shift(10);
      animate.mockClear();

      await change(setItems(['b', 'c']));

      expect(animations[1]?.cancel).toHaveBeenCalledTimes(1);
      expect(fromOf(c)).toEqual({ transform: `translateY(${-ROW + 10}px)` });
    });
  });
});
