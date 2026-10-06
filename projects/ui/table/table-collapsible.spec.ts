import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { UiFlipItem, UiFlipList } from '@joanroucoux/cairn-ui/motion';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiGroup, UiGroupCell, UiTable, UiTd, UiTr } from './table';

@Component({
  imports: [UiTable, UiTr, UiTd, UiGroup, UiGroupCell],
  template: `
    <table uiTable>
      <tbody id="northwind" uiGroup [collapsed]="!open()">
        <tr group uiTr>
          <td
            collapsible
            colspan="2"
            controls="northwind"
            meta="PEA · 2 lignes"
            name="Northwind PEA"
            ui-group-cell
            [toggleDisabled]="locked()"
            [(expanded)]="open"
          >
            48 215,60 €
          </td>
        </tr>
        <tr uiTr>
          <td uiTd>Ferrari</td>
        </tr>
        <tr uiTr>
          <td uiTd>Accor</td>
        </tr>
      </tbody>
    </table>
  `,
})
class CollapsibleHost {
  readonly open = signal(true);
  readonly locked = signal(false);
}

const setup = async (): Promise<{ host: CollapsibleHost; button: HTMLElement; rows: HTMLElement[] }> => {
  const { fixture } = await render(CollapsibleHost);
  const root = fixture.nativeElement as HTMLElement;
  return {
    host: fixture.componentInstance,
    button: screen.getByRole('button', { name: /Northwind PEA/ }),
    rows: Array.from(root.querySelectorAll('tr')),
  };
};

describe('collapsible group band', () => {
  it('puts the button inside the heading and names it with the band text', async () => {
    const { button } = await setup();

    expect(button.parentElement?.tagName).toBe('H2');
    expect(screen.getByRole('heading', { level: 2 })).toContainElement(button);
    expect(button).toHaveAccessibleName(/Northwind PEA\s*PEA · 2 lignes\s*48 215,60 €/);
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-group-heading');
  });

  it('is expanded by default, with its chevron upright', async () => {
    const { button } = await setup();

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-controls', 'northwind');
    expect(button.querySelector('svg')).not.toHaveClass('-rotate-90');
    expect(button.querySelector('svg')).toHaveAttribute('width', '18');
  });

  it('folds on click: the chevron turns and the rows are hidden but stay in the DOM', async () => {
    const { host, button, rows } = await setup();

    await userEvent.click(button);

    expect(host.open()).toBe(false);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button.querySelector('svg')).toHaveClass('-rotate-90', 'transition-transform', 'duration-(--duration-fast)');
    expect(rows[1]).toBeInTheDocument();
    expect(rows.map((row) => row.hidden)).toEqual([false, true, true]);
  });

  it('unfolds again on a second click', async () => {
    const { host, button, rows } = await setup();

    await userEvent.click(button);
    await userEvent.click(button);

    expect(host.open()).toBe(true);
    expect(rows.map((row) => row.hidden)).toEqual([false, false, false]);
  });

  it('folds from the keyboard', async () => {
    const { host, button } = await setup();

    button.focus();
    await userEvent.keyboard('{Enter}');

    expect(host.open()).toBe(false);
  });

  it('reflects a model change made from outside', async () => {
    const { host, button, rows } = await setup();

    host.open.set(false);
    TestBed.tick();

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(rows[1]?.hidden).toBe(true);
  });

  it('stays focusable and announced while disabled, and a click changes nothing', async () => {
    const { host, button, rows } = await setup();
    host.locked.set(true);
    TestBed.tick();

    await userEvent.click(button);

    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(host.open()).toBe(true);
    expect(rows.map((row) => row.hidden)).toEqual([false, false, false]);
  });

  it('has hover, focus ring and the muted band', async () => {
    const { button } = await setup();

    expect(button).toHaveClass(
      'bg-(--muted)',
      'not-aria-disabled:cursor-pointer',
      'not-aria-disabled:hover:bg-(--soft)',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-(--ring)',
      'min-h-11',
    );
  });

  it('fades its hover fill in --duration-fast on --ease-out, like the rows, without fading the focus ring', async () => {
    const { button } = await setup();

    expect(button).toHaveClass('transition-[background-color]', 'duration-(--duration-fast)', 'ease-out');
    expect(button).not.toHaveClass('transition-colors');
  });

  it('takes the 48px band at size lg, without aria-controls or aria-disabled unless asked', async () => {
    await render(
      `<table uiTable><tbody><tr uiTr group><td ui-group-cell collapsible size="lg" name="A">1</td></tr></tbody></table>`,
      { imports: [UiTable, UiTr, UiGroupCell] },
    );

    expect(screen.getByRole('button')).toHaveClass('min-h-12');
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-controls');
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
    expect(screen.getByRole('button')).toHaveTextContent(/^\s*A\s*1\s*$/);
  });

  it('keeps the static band as it was when not collapsible', async () => {
    await render(
      `<table uiTable><tbody><tr uiTr group><td ui-group-cell name="A" meta="M">1</td></tr></tbody></table>`,
      { imports: [UiTable, UiTr, UiGroupCell] },
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'A' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('hides nothing outside a collapsed group', async () => {
    await render(`<table uiTable><tbody><tr uiTr><td uiTd>Ferrari</td></tr></tbody></table>`, {
      imports: [UiTable, UiTr, UiTd],
    });

    expect(screen.getByRole('row')).not.toHaveAttribute('hidden');
  });
});

@Component({
  imports: [UiTable, UiTr, UiTd, UiGroup, UiGroupCell, UiFlipList, UiFlipItem],
  template: `
    <table uiFlipList uiTable>
      @for (group of groups(); track group.name) {
        <tbody uiGroup [collapsed]="group.name === folded()">
          <tr group uiFlipItem uiTr>
            <td collapsible colspan="2" ui-group-cell [name]="group.name">1</td>
          </tr>
          @for (row of group.rows; track row) {
            <tr uiFlipItem uiTr>
              <td uiTd>{{ row }}</td>
            </tr>
          }
        </tbody>
      }
    </table>
  `,
})
class FlipHost {
  readonly folded = signal('');
  readonly groups = signal([
    { name: 'Northwind PEA', rows: ['Ferrari', 'Accor'] },
    { name: 'Woodgrove Savings Plan', rows: ['Contoso'] },
  ]);
}

describe('collapsing a group under a uiFlipList', () => {
  const originalAnimate = Element.prototype.animate;
  const originalGetAnimations = Element.prototype.getAnimations;
  let animate: ReturnType<typeof vi.fn>;

  const place = (list: HTMLElement): void => {
    list.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;
    let top = 0;
    for (const row of Array.from(list.querySelectorAll('tr'))) {
      const at = top;
      row.getBoundingClientRect = () => ({ top: at }) as DOMRect;
      top += row.hidden ? 0 : 50;
    }
  };
  const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

  beforeEach(() => {
    animate = vi.fn(() => ({ cancel: vi.fn(), onfinish: null }));
    Element.prototype.animate = animate as unknown as typeof Element.prototype.animate;
    Element.prototype.getAnimations = () => [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );
    globalThis.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof matchMedia;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(globalThis, 'matchMedia');
    Element.prototype.animate = originalAnimate;
    Element.prototype.getAnimations = originalGetAnimations;
  });

  const mount = async (): Promise<{ host: FlipHost; list: HTMLElement; update: () => Promise<void> }> => {
    const fixture = TestBed.createComponent(FlipHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const list = (fixture.nativeElement as HTMLElement).querySelector('table') as HTMLElement;
    place(list);
    return {
      host: fixture.componentInstance,
      list,
      update: async () => {
        fixture.detectChanges();
        place(list);
        await settle();
      },
    };
  };

  it('slides nothing when a group folds: the rows stay in the DOM and the groups below jump at once', async () => {
    const { host, list, update } = await mount();
    const before = Array.from(list.querySelectorAll('tr'));

    host.folded.set('Northwind PEA');
    await update();

    expect(Array.from(list.querySelectorAll('tr'))).toEqual(before);
    expect(before.filter((row) => row.hidden)).toHaveLength(2);
    expect(animate).not.toHaveBeenCalled();

    host.folded.set('');
    await update();

    expect(animate).not.toHaveBeenCalled();
  });

  it('would slide the groups below if the rows were removed instead (control)', async () => {
    const { host, update } = await mount();

    host.groups.set([
      { name: 'Northwind PEA', rows: [] },
      { name: 'Woodgrove Savings Plan', rows: ['Contoso'] },
    ]);
    await update();

    expect(animate).toHaveBeenCalled();
  });
});
