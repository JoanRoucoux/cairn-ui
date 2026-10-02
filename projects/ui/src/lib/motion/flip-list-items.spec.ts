import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { UiFlipItem, UiFlipList } from './flip-list';
import { ROW, animationsFromTransforms, layout, shift, tick } from './internal/flip-list.spec-helper';

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

@Component({
  selector: 'section[ui-group-rows]',
  imports: [UiFlipItem],
  template: `
    @for (row of rows(); track row) {
      <p uiFlipItem [attr.data-id]="row">{{ row }}</p>
    }
  `,
})
class GroupRows {
  readonly rows = signal(['a', 'b', 'c']);
}

@Component({
  imports: [UiFlipList, GroupRows],
  template: `<div uiFlipList><section ui-group-rows></section></div>`,
})
class ChildComponentHost {}

const without =
  (...removed: string[]) =>
  (host: GroupsHost | CardsHost): void =>
    host.groups.set(GROUPS.map((group) => ({ ...group, rows: group.rows.filter((row) => !removed.includes(row)) })));

describe('UiFlipList with uiFlipItem', () => {
  const originalGetAnimations = Element.prototype.getAnimations;
  const originalAnimate = Element.prototype.animate;
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
    Element.prototype.getAnimations = animationsFromTransforms;
    observe = vi.fn();
    unobserve = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resize = callback;
        }
        observe = observe;
        unobserve = unobserve;
        disconnect = vi.fn();
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Element.prototype.animate = originalAnimate;
    Element.prototype.getAnimations = originalGetAnimations;
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

  it('slides the rows below and the later groups down when a row comes back', async () => {
    const { list, change } = await setup(GroupsHost);
    await change(without('d'));
    animate.mockClear();

    await change(without());

    expect(animated()).toHaveLength(3);
    for (const id of ['e', 'g3', 'f']) {
      expect(fromOf(byId(list, id))).toEqual({ transform: `translateY(${-ROW}px)` });
    }
  });

  it('animates nothing under reduced motion', async () => {
    globalThis.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof matchMedia;
    const { change } = await setup(GroupsHost);

    await change(without('d'));

    expect(animate).not.toHaveBeenCalled();
  });

  it('slides nothing when an element that is not an item appears inside a group', async () => {
    const { list } = await setup(GroupsHost);

    byId(list, 'c').parentElement?.appendChild(document.createElement('p'));
    layout(list);
    await tick();

    expect(animate).not.toHaveBeenCalled();
  });

  it('measures out the translate of another animation on a group that is not an item', async () => {
    const { list, change } = await setup(GroupsHost);
    const group = byId(list, 'g1').parentElement as HTMLElement;
    group.style.transform = shift(4);
    resize?.();
    group.style.transform = '';

    await change(without('d'));

    expect(animated()).toHaveLength(3);
    expect(animated()).not.toContain(byId(list, 'a'));
  });

  it('measures through an animation that does not translate, such as a highlight', async () => {
    const { list, change } = await setup(GroupsHost);
    byId(list, 'f').style.transform = 'none';
    resize?.();

    await change(without('d'));

    expect(fromOf(byId(list, 'f'))).toEqual({ transform: `translateY(${ROW}px)` });
  });

  it('ignores a translate of the list itself, which moves it and its items alike', async () => {
    const { list, change } = await setup(GroupsHost);
    list.style.transform = shift(30);
    resize?.();
    list.style.transform = shift(10);

    await change(without('d'));

    expect(animated()).toHaveLength(3);
    expect(fromOf(byId(list, 'f'))).toEqual({ transform: `translateY(${ROW}px)` });
  });

  it('follows again an item that was out of the list for a while', async () => {
    const { list } = await setup(GroupsHost);
    const f = byId(list, 'f');
    const group = f.parentElement as HTMLElement;

    f.remove();
    await tick();
    group.appendChild(f);
    layout(list);
    await tick();

    expect(observe.mock.calls.filter(([element]) => element === f)).toHaveLength(2);
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

  it('follows the items a child component declares in its own template', async () => {
    const fixture = TestBed.createComponent(ChildComponentHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const list = root.querySelector('[uiFlipList]') as HTMLElement;
    layout(list);
    resize?.();
    const c = byId(list, 'c');

    fixture.debugElement
      .query((node) => node.name === 'section')
      .injector.get(GroupRows)
      .rows.set(['a', 'c']);
    fixture.detectChanges();
    layout(list);
    await tick();

    expect(observe).not.toHaveBeenCalledWith(list.children[0]);
    expect(animated()).toEqual([c]);
    expect(fromOf(c)).toEqual({ transform: `translateY(${ROW}px)` });
  });

  it('does nothing for an item outside any list', () => {
    const fixture = TestBed.createComponent(OrphanHost);

    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
