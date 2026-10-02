import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { UiFlipItem, UiFlipList } from './flip-list';

type Group = {
  id: string;
  rows: string[];
};

const GROUPS: Group[] = [
  { id: 'g1', rows: ['a', 'b'] },
  { id: 'g2', rows: ['c', 'd', 'e'] },
  { id: 'g3', rows: ['f'] },
];

@Component({
  imports: [UiFlipList, UiFlipItem],
  template: `
    <div uiFlipList>
      @for (group of groups(); track group.id) {
        <div>
          <h3 uiFlipItem [attr.data-id]="group.id">{{ group.id }}</h3>
          @for (row of group.rows; track row) {
            <p uiFlipItem [attr.data-id]="row">{{ row }}</p>
          }
        </div>
      }
    </div>
  `,
})
class GroupsHost {
  readonly groups = signal(GROUPS);
}

@Component({
  imports: [UiFlipList, UiFlipItem],
  template: `
    <div uiFlipList>
      @for (group of groups(); track group.id) {
        <section uiFlipItem [attr.data-id]="group.id">
          <h3 uiFlipItem [attr.data-id]="group.id + '-head'">{{ group.id }}</h3>
          @for (row of group.rows; track row) {
            <p uiFlipItem [attr.data-id]="row">{{ row }}</p>
          }
        </section>
      }
    </div>
  `,
})
class CardsHost {
  readonly groups = signal(GROUPS);
}

@Component({
  imports: [UiFlipItem],
  template: `<p uiFlipItem>alone</p>`,
})
class OrphanHost {}

const ROW = 50;

const shownShift = (element: HTMLElement): number => {
  const match = /^matrix\((.+)\)$/.exec(element.style.transform);
  return match ? parseFloat((match[1] as string).split(',')[5] as string) : 0;
};

const shift = (y: number): string => `matrix(1, 0, 0, 1, 0, ${y})`;

const layout = (host: HTMLElement): void => {
  const place = (element: HTMLElement, top: number): number => {
    const children = Array.from(element.children) as HTMLElement[];
    const bottom = children.length === 0 ? top + ROW : children.reduce((cursor, child) => place(child, cursor), top);
    element.getBoundingClientRect = () => {
      let offset = 0;
      for (let node: HTMLElement | null = element; node && node !== host; node = node.parentElement) {
        offset += shownShift(node);
      }
      return { top: top + offset } as DOMRect;
    };
    return bottom;
  };
  (Array.from(host.children) as HTMLElement[]).reduce((cursor, child) => place(child, cursor), 0);
  host.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;
};

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

const without =
  (...removed: string[]) =>
  (host: GroupsHost | CardsHost): void =>
    host.groups.set(GROUPS.map((group) => ({ ...group, rows: group.rows.filter((row) => !removed.includes(row)) })));

describe('UiFlipList with uiFlipItem', () => {
  let animate: ReturnType<typeof vi.fn>;
  let resize: (() => void) | undefined;
  let observe: ReturnType<typeof vi.fn>;
  let unobserve: ReturnType<typeof vi.fn>;
  let originalMatchMedia: typeof matchMedia | undefined;

  const setup = async <T extends GroupsHost | CardsHost>(
    type: new () => T,
  ): Promise<{ list: HTMLElement; change: (update: (host: T) => void) => Promise<void> }> => {
    const fixture = TestBed.createComponent(type);
    fixture.detectChanges();
    await fixture.whenStable();
    const list = (fixture.nativeElement as HTMLElement).querySelector('[uiFlipList]') as HTMLElement;
    layout(list);
    resize?.();
    return {
      list,
      change: async (update) => {
        update(fixture.componentInstance);
        fixture.detectChanges();
        layout(list);
        await tick();
      },
    };
  };

  const animated = (): Element[] => animate.mock.contexts as Element[];
  const fromOf = (element: Element): unknown => animate.mock.calls[animated().indexOf(element)]?.[0][0];
  const byId = (list: HTMLElement, id: string): HTMLElement => list.querySelector(`[data-id="${id}"]`) as HTMLElement;

  beforeEach(() => {
    originalMatchMedia = globalThis.matchMedia;
    globalThis.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof matchMedia;
    animate = vi.fn(() => ({ cancel: vi.fn(), onfinish: null }));
    Element.prototype.animate = animate as unknown as typeof Element.prototype.animate;
    observe = vi.fn();
    unobserve = vi.fn();
    globalThis.ResizeObserver = class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe = observe;
      unobserve = unobserve;
      disconnect = vi.fn();
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

  it('slides the rows below a removed one and the later groups', async () => {
    const { list, change } = await setup(GroupsHost);
    const moved = ['e', 'g3', 'f'].map((id) => byId(list, id));
    const still = ['g1', 'a', 'b', 'g2', 'c'].map((id) => byId(list, id));

    await change(without('d'));

    expect(animated()).toHaveLength(3);
    for (const element of moved) {
      expect(fromOf(element)).toEqual({ transform: `translateY(${ROW}px)` });
    }
    for (const element of still) {
      expect(animated()).not.toContain(element);
    }
  });

  it('moves a nested item by its own share only, its group carrying the rest', async () => {
    const { list, change } = await setup(CardsHost);
    const card = byId(list, 'g3');

    await change(without('d'));

    expect(animated()).toHaveLength(2);
    expect(animated()).toContain(byId(list, 'e'));
    expect(fromOf(card)).toEqual({ transform: `translateY(${ROW}px)` });
  });

  it('measures a nested item under a moving group where it lands', async () => {
    const { list, change } = await setup(CardsHost);
    await change(without('d'));
    const card = byId(list, 'g3');
    card.style.transform = shift(30);
    resize?.();
    card.style.transform = shift(10);
    animate.mockClear();

    await change(without('c', 'd'));

    expect(animated()).not.toContain(byId(list, 'f'));
    expect(animated()).not.toContain(byId(list, 'g3-head'));
    expect(fromOf(card)).toEqual({ transform: `translateY(${ROW + 10}px)` });
  });

  it('stops tracking an item once it has left the list', async () => {
    const { list, change } = await setup(GroupsHost);
    const d = byId(list, 'd');

    await change(without('d'));

    expect(unobserve).toHaveBeenCalledWith(d);
  });

  it('ignores the direct children once items are marked', async () => {
    const { list } = await setup(GroupsHost);

    expect(observe).not.toHaveBeenCalledWith(list.children[0]);
  });

  it('does nothing for an item outside any list', () => {
    const fixture = TestBed.createComponent(OrphanHost);

    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
