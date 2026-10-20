import { fireEvent, render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { type DonutSlice, UiDonut } from './donut';

const threeSlices: DonutSlice[] = [
  { id: 'a', label: 'ETF', value: 60, sublabel: '6 holdings' },
  { id: 'b', label: 'Funds', value: 30, sublabel: '8 holdings' },
  { id: 'c', label: 'Stocks', value: 10, sublabel: '4 holdings' },
];

const sevenSlices: DonutSlice[] = [
  { id: 'a', label: 'Northwind PEA', value: 48215.6 },
  { id: 'b', label: 'Woodgrove Savings Plan', value: 31840.15 },
  { id: 'c', label: 'Contoso Trading', value: 22377.9 },
  { id: 'd', label: 'Livret A', value: 16120.45 },
  { id: 'e', label: 'Tailspin Wallet', value: 11264.3 },
  { id: 'f', label: 'Fabrikam Life', value: 8530.75 },
  { id: 'g', label: 'Woodgrove Retirement', value: 6190.2 },
];

const pct = (share: number): string => `${(share * 100).toFixed(1)}%`;
const eur = (value: number): string => `${value.toFixed(2)} EUR`;

describe('UiDonut', () => {
  it('renders one arc per ranked slice, stroked from the gray ramp by rank', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="By asset class" othersLabel="Other" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const paths = fixture.nativeElement.querySelectorAll('svg circle[data-slice]');

    expect(paths).toHaveLength(3);
    expect((paths[0] as SVGElement).style.stroke).toBe('var(--ramp-1)');
    expect((paths[1] as SVGElement).style.stroke).toBe('var(--ramp-2)');
    expect((paths[2] as SVGElement).style.stroke).toBe('var(--ramp-3)');
  });

  it('shows the largest slice at the center by default', async () => {
    const { fixture } = await render(
      `<ui-donut [slices]="slices" label="By asset class" othersLabel="Other" [valueFormat]="eur" [shareFormat]="pct" />`,
      { imports: [UiDonut], componentProperties: { slices: threeSlices, eur, pct } },
    );
    const center = within(fixture.nativeElement.querySelector('[data-testid="donut-centre"]'));

    expect(center.getByText('ETF')).toBeInTheDocument();
    expect(center.getByText('60.0%')).toBeInTheDocument();
    expect(center.getByText('60.00 EUR')).toBeInTheDocument();
  });

  it('thickens the largest arc by default, then the arc of the row hovered, focused or touched, and keeps it after leaving', async () => {
    const { fixture } = await render(
      `<ui-donut [slices]="slices" label="By asset class" othersLabel="Other" [valueFormat]="eur" [shareFormat]="pct" />`,
      { imports: [UiDonut], componentProperties: { slices: threeSlices, eur, pct } },
    );
    const etf = screen.getByRole('button', { name: /^ETF/ });
    const funds = screen.getByRole('button', { name: /Funds/ });
    const stocks = screen.getByRole('button', { name: /Stocks/ });
    const center = within(fixture.nativeElement.querySelector('[data-testid="donut-centre"]'));
    const arcs = fixture.nativeElement.querySelectorAll('svg circle[data-slice]') as NodeListOf<SVGCircleElement>;
    const widths = (): string[] => Array.from(arcs, (arc) => arc.style.strokeWidth);

    expect(widths()).toEqual(['38px', '30px', '30px']);

    await userEvent.hover(funds);

    expect(center.getByText('Funds')).toBeInTheDocument();
    expect(widths()).toEqual(['30px', '38px', '30px']);

    await userEvent.unhover(funds);

    expect(center.getByText('Funds')).toBeInTheDocument();
    expect(funds).toHaveClass('bg-(--soft)');
    expect(widths()).toEqual(['30px', '38px', '30px']);

    fireEvent.focus(etf);
    fireEvent.blur(etf);

    expect(center.getByText('ETF')).toBeInTheDocument();
    expect(widths()).toEqual(['38px', '30px', '30px']);

    fireEvent.pointerEnter(stocks, { pointerType: 'touch' });

    expect(center.getByText('Stocks')).toBeInTheDocument();
    expect(widths()).toEqual(['30px', '30px', '38px']);
  });

  it('animates only the stroke width at the press duration, never dims an arc, and drops the transition on reduced motion', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="x" othersLabel="Other" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const arcs = fixture.nativeElement.querySelectorAll('svg circle[data-slice]');

    await userEvent.hover(screen.getByRole('button', { name: /Funds/ }));

    for (const arc of arcs) {
      expect(arc).toHaveClass(
        'transition-[stroke-width]',
        'duration-(--duration-press)',
        'ease-out',
        'motion-reduce:transition-none',
      );
      expect(arc).not.toHaveClass('opacity-50');
      expect(arc.getAttribute('class')).not.toContain('scale');
    }
  });

  it('presses a legend row with an eased scale and fades its hover fill at the fast duration', async () => {
    await render(
      `<ui-donut [slices]="slices" label="By asset class" othersLabel="Other" [valueFormat]="eur" [shareFormat]="pct" />`,
      {
        imports: [UiDonut],
        componentProperties: { slices: threeSlices, eur, pct },
      },
    );

    expect(screen.getByRole('button', { name: /Funds/ })).toHaveClass(
      'transition-[scale,background-color]',
      '[transition-duration:var(--duration-press),var(--duration-fast)]',
      'ease-out',
      'active:scale-(--press-scale)',
    );
  });

  it('draws a muted track and every slice on the same r=78 circle', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="x" othersLabel="Other" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const circles = Array.from(fixture.nativeElement.querySelectorAll('svg circle')) as SVGCircleElement[];

    expect(circles).toHaveLength(4);
    expect(circles.every((circle) => circle.getAttribute('r') === '78')).toBe(true);
    expect(circles[0]).toHaveClass('stroke-(--muted)');
  });

  it('sets the center name at 14px 500 muted, the share at 28px 600 and the amount as a muted caption', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="x" othersLabel="Other" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const center = within(fixture.nativeElement.querySelector('[data-testid="donut-centre"]'));

    expect(center.getByText('ETF')).toHaveClass('text-label', 'font-medium', 'text-(--muted-foreground)');
    expect(center.getByText('60%')).toHaveClass('text-heading', 'font-semibold');
    expect(center.getByText('60')).toHaveClass('text-caption', 'text-(--muted-foreground)');
  });

  it('hovering an arc highlights its legend row and leaving it keeps the highlight', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="By asset class" othersLabel="Other" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const arc = fixture.nativeElement.querySelectorAll('svg circle[data-slice]')[1] as SVGCircleElement;
    const row = screen.getByRole('button', { name: /Funds/ });

    fireEvent.pointerEnter(arc);

    expect(row).toHaveClass('bg-(--soft)');
    expect(arc.style.strokeWidth).toBe('38px');

    fireEvent.pointerLeave(arc);

    expect(row).toHaveClass('bg-(--soft)');
    expect(arc.style.strokeWidth).toBe('38px');
  });

  it('emits sliceSelect with the slice id when a legend row is clicked', async () => {
    const onSelect = vi.fn();
    await render(
      `<ui-donut [slices]="slices" label="By asset class" othersLabel="Other" (sliceSelect)="onSelect($event)" />`,
      { imports: [UiDonut], componentProperties: { slices: threeSlices, onSelect } },
    );

    await userEvent.click(screen.getByRole('button', { name: /Stocks/ }));

    expect(onSelect).toHaveBeenCalledWith('c');
  });

  it('emits sliceSelect when a legend row is activated with Enter', async () => {
    const onSelect = vi.fn();
    await render(
      `<ui-donut [slices]="slices" label="By asset class" othersLabel="Other" (sliceSelect)="onSelect($event)" />`,
      { imports: [UiDonut], componentProperties: { slices: threeSlices, onSelect } },
    );

    screen.getByRole('button', { name: /ETF/ }).focus();
    await userEvent.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it("keeps the SVG's aria-label detailed with every original slice, not only the grouped ones", async () => {
    const { fixture } = await render(
      `<ui-donut [slices]="slices" label="By account" othersLabel="Other" [shareFormat]="pct" />`,
      { imports: [UiDonut], componentProperties: { slices: sevenSlices, pct } },
    );
    const svg = fixture.nativeElement.querySelector('svg');
    const label = svg.getAttribute('aria-label') as string;

    for (const slice of sevenSlices) {
      expect(label).toContain(slice.label);
    }
    expect(label).not.toContain('Other');
  });

  it('groups the smallest accounts into an Other legend row on seven slices', async () => {
    await render(`<ui-donut [slices]="slices" label="By account" othersLabel="Other" [shareFormat]="pct" />`, {
      imports: [UiDonut],
      componentProperties: { slices: sevenSlices, pct },
    });

    expect(screen.getAllByRole('button')).toHaveLength(6);
    expect(screen.getByRole('button', { name: /Other/ })).toHaveTextContent('Fabrikam Life, Woodgrove Retirement');
  });

  it('gives every legend row the name, sub-label, share and value, and drops a zero-value slice', async () => {
    const withZero: DonutSlice[] = [...threeSlices, { id: 'z', label: 'Zero', value: 0 }];
    await render(
      `<ui-donut [slices]="slices" label="By asset class" othersLabel="Other" [valueFormat]="eur" [shareFormat]="pct" />`,
      { imports: [UiDonut], componentProperties: { slices: withZero, eur, pct } },
    );

    expect(screen.getAllByRole('button')).toHaveLength(3);
    const row = screen.getByRole('button', { name: /ETF/ });
    expect(row).toHaveTextContent('ETF');
    expect(row).toHaveTextContent('6 holdings');
    expect(row).toHaveTextContent('60.0%');
    expect(row).toHaveTextContent('60.00 EUR');
    expect(screen.queryByText('Zero')).not.toBeInTheDocument();
  });

  it('formats the value and the share as-is when no formatter is given', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="x" othersLabel="Other" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });
    const center = within(fixture.nativeElement.querySelector('[data-testid="donut-centre"]'));

    expect(center.getByText('60%')).toBeInTheDocument();
    expect(center.getByText('60')).toBeInTheDocument();
  });

  it('renders nothing to draw and no center for an empty series, still naming the ring', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="Empty" othersLabel="Other" />`, {
      imports: [UiDonut],
      componentProperties: { slices: [] as DonutSlice[] },
    });

    expect(fixture.nativeElement.querySelectorAll('svg circle[data-slice]')).toHaveLength(0);
    expect(screen.getByRole('img', { name: 'Empty' })).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
  it('stretches the legend to the full width on a narrow screen so rows run edge to edge', async () => {
    const { fixture } = await render(`<ui-donut [slices]="slices" label="x" othersLabel="Other" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices },
    });

    expect(fixture.nativeElement.querySelector('[data-testid="donut-legend"]')).toHaveClass('w-full', 'sm:w-auto');
  });
});

describe('UiDonut legend press state', () => {
  it('turns a pressed row to the soft surface, as a button and as a link', async () => {
    await render(`<ui-donut [slices]="slices" label="x" othersLabel="Other" [legendHref]="href" />`, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices, href: (id: string) => (id === 'c' ? null : `/${id}`) },
    });

    expect(screen.getByRole('button', { name: /Stocks/ })).toHaveClass('hover:bg-(--glow)', 'active:bg-(--soft)');
    expect(screen.getByRole('link', { name: /ETF/ })).toHaveClass('hover:bg-(--glow)', 'active:bg-(--soft)');
  });
});

describe('UiDonut legend links', () => {
  const href = (id: string): string => `/holdings?class=${id}`;
  const linkTemplate = `<ui-donut [slices]="slices" label="By asset class" othersLabel="Other" [legendHref]="href" (sliceSelect)="onSelect($event)" />`;

  it('renders each legend row as a link to its href instead of a button', async () => {
    await render(linkTemplate, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices, href, onSelect: vi.fn() },
    });

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByRole('link', { name: /Funds/ })).toHaveAttribute('href', '/holdings?class=b');
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('keeps a button for a row whose href is null', async () => {
    await render(linkTemplate, {
      imports: [UiDonut],
      componentProperties: {
        slices: threeSlices,
        href: (id: string) => (id === 'c' ? null : href(id)),
        onSelect: vi.fn(),
      },
    });

    expect(screen.getByRole('button', { name: /Stocks/ })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('hands a plain click to sliceSelect and cancels the page load, so the caller can route', async () => {
    const onSelect = vi.fn();
    await render(linkTemplate, { imports: [UiDonut], componentProperties: { slices: threeSlices, href, onSelect } });
    const link = screen.getByRole('link', { name: /Stocks/ });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });

    link.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
    expect(onSelect).toHaveBeenCalledWith('c');
  });

  it.each([{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }])(
    'leaves a modified click %o to the browser',
    async (init) => {
      const onSelect = vi.fn();
      await render(linkTemplate, { imports: [UiDonut], componentProperties: { slices: threeSlices, href, onSelect } });
      const click = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });
      let prevented = true;
      const swallow = (event: Event): void => {
        prevented = event.defaultPrevented;
        event.preventDefault();
      };
      document.addEventListener('click', swallow, { once: true });

      screen.getByRole('link', { name: /Stocks/ }).dispatchEvent(click);

      expect(prevented).toBe(false);
      expect(onSelect).not.toHaveBeenCalled();
    },
  );

  it('still highlights the slice on hover and focus, and keeps it on blur', async () => {
    const { fixture } = await render(linkTemplate, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices, href, onSelect: vi.fn() },
    });
    const link = screen.getByRole('link', { name: /Funds/ });
    const center = within(fixture.nativeElement.querySelector('[data-testid="donut-centre"]'));

    await userEvent.hover(link);
    expect(link).toHaveClass('bg-(--soft)');
    expect(center.getByText('Funds')).toBeInTheDocument();

    await userEvent.unhover(link);
    fireEvent.focus(link);
    expect(link).toHaveClass('bg-(--soft)');

    fireEvent.blur(link);
    expect(link).toHaveClass('bg-(--soft)');
  });

  it('shares the row geometry and the focus ring with the button rows', async () => {
    await render(linkTemplate, {
      imports: [UiDonut],
      componentProperties: { slices: threeSlices, href, onSelect: vi.fn() },
    });

    expect(screen.getByRole('link', { name: /ETF/ })).toHaveClass(
      'min-h-14',
      'focus-visible:outline-2',
      'focus-visible:-outline-offset-2',
      'focus-visible:outline-(--ring)',
    );
  });

  it('activates a link with Enter', async () => {
    const onSelect = vi.fn();
    await render(linkTemplate, { imports: [UiDonut], componentProperties: { slices: threeSlices, href, onSelect } });

    screen.getByRole('link', { name: /ETF/ }).focus();
    await userEvent.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith('a');
  });
});
