import { render, screen } from '@testing-library/angular';

import { UiDrawer } from './drawer';
import { DRAWER_STYLES } from './internal/drawer-styles';

const rule = (selector: string, from = 0): string => {
  const start = DRAWER_STYLES.indexOf(`${selector} {`, from);

  return start === -1 ? '' : DRAWER_STYLES.slice(start, DRAWER_STYLES.indexOf('}', start));
};

describe('UiDrawer', () => {
  it('stays closed until its owner opens it', async () => {
    await render(`<ui-drawer heading="Northwind Monde"><p>Corps</p></ui-drawer>`, { imports: [UiDrawer] });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens as a modal named by its heading and described by its description', async () => {
    await render(
      `<ui-drawer heading="Northwind Monde" description="ETF · Compte-titres Contoso" closeLabel="Fermer le détail" open>
         <p>Corps</p>
       </ui-drawer>`,
      { imports: [UiDrawer] },
    );

    const drawer = screen.getByRole('dialog', { name: 'Northwind Monde' });

    expect(drawer).toHaveAttribute('open');
    expect(drawer).toHaveAccessibleDescription('ETF · Compte-titres Contoso');
    expect(screen.getByRole('heading', { level: 2, name: 'Northwind Monde' })).toHaveClass(
      'text-title',
      'font-semibold',
    );
    expect(screen.getByText('ETF · Compte-titres Contoso')).toHaveClass('text-label', 'text-(--muted-foreground)');
    expect(screen.getByText('Corps')).toBeInTheDocument();
    expect(drawer).not.toHaveAttribute('aria-label');
    expect(drawer).not.toHaveAttribute('aria-busy');
  });

  it('draws the 36px cross beside the title only when closeLabel is set', async () => {
    const { rerender } = await render(
      `<ui-drawer heading="Northwind Monde" [closeLabel]="closeLabel" open><p>Corps</p></ui-drawer>`,
      { imports: [UiDrawer], componentProperties: { closeLabel: 'Fermer le détail' } },
    );
    const cross = screen.getByRole('button', { name: 'Fermer le détail' });

    expect(cross).toHaveClass('size-9', '-mt-1', '-mr-2', 'rounded-control', 'active:scale-(--press-scale)');
    expect(cross).toBeEnabled();

    await rerender({ componentProperties: { closeLabel: undefined } });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders no header without a heading, and takes its name from label', async () => {
    await render(
      `<ui-drawer label="Détail de la ligne" closeLabel="Fermer le détail" open>
         <h2>Northwind Monde</h2>
       </ui-drawer>`,
      { imports: [UiDrawer] },
    );

    const drawer = screen.getByRole('dialog', { name: 'Détail de la ligne' });

    expect(drawer).not.toHaveAttribute('aria-labelledby');
    expect(drawer).not.toHaveAttribute('aria-describedby');
    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('refuses to render without a heading or a label, which would leave it without a name', async () => {
    await expect(render(`<ui-drawer open><p>Corps</p></ui-drawer>`, { imports: [UiDrawer] })).rejects.toThrow(
      'ui-drawer needs a heading or a label',
    );
  });

  it('gives each drawer its own heading id', async () => {
    await render(`<ui-drawer heading="Northwind Monde" open /><ui-drawer heading="Woodgrove Énergie" open />`, {
      imports: [UiDrawer],
    });

    const [first, second] = screen.getAllByRole('dialog');

    expect(first?.getAttribute('aria-labelledby')).not.toBe(second?.getAttribute('aria-labelledby'));
  });

  it('sits on the right edge, full height, 440px wide by default, and scrolls on its own', async () => {
    await render(`<ui-drawer heading="Northwind Monde" open><p>Corps</p></ui-drawer>`, { imports: [UiDrawer] });

    const drawer = screen.getByRole('dialog');

    expect(drawer.style.getPropertyValue('--drawer-width')).toBe('440px');
    expect(drawer).toHaveClass(
      'fixed',
      'inset-y-0',
      'right-0',
      'left-auto',
      'm-0',
      'h-dvh',
      'max-h-none',
      'w-(--drawer-width)',
      'max-w-full',
      'overflow-y-auto',
      'overscroll-contain',
      'p-6',
      'gap-6',
      'bg-(--card)',
      'shadow-[-1px_0_0_var(--border),-24px_0_48px_rgb(0_0_0/0.12)]',
      'backdrop:bg-black/[0.36]',
    );
  });

  it('takes any CSS length as width', async () => {
    await render(`<ui-drawer heading="Northwind Monde" width="30rem" open />`, { imports: [UiDrawer] });

    expect(screen.getByRole('dialog').style.getPropertyValue('--drawer-width')).toBe('30rem');
  });

  it('marks itself busy and disables the cross', async () => {
    await render(`<ui-drawer heading="Northwind Monde" closeLabel="Fermer le détail" open busy />`, {
      imports: [UiDrawer],
    });

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Fermer le détail' })).toBeDisabled();
  });

  describe('motion', () => {
    it('slides in 24px from the right with opacity, in --duration-base on --ease-out', () => {
      expect(rule('dialog')).toContain('opacity var(--duration-base) var(--ease-out)');
      expect(rule('dialog')).toContain('transform var(--duration-base) var(--ease-out)');
      expect(rule('dialog')).toContain('overlay var(--duration-base) allow-discrete');
      expect(rule('dialog')).toContain('display var(--duration-base) allow-discrete');
      expect(rule('  dialog[open]')).toContain('transform: translateX(24px)');
      expect(rule('  dialog[open]')).toContain('opacity: 0');
    });

    it('leaves the reverse way in --duration-exit', () => {
      expect(rule('dialog:not([open])')).toContain('transform: translateX(24px)');
      expect(rule('dialog:not([open])')).toContain('opacity: 0');
      expect(rule('dialog:not([open])')).toContain('transition-duration: var(--duration-exit)');
    });

    it('fades the veil in and out with the panel', () => {
      expect(rule('dialog::backdrop')).toContain('opacity var(--duration-base) var(--ease-out)');
      expect(rule('dialog:not([open])::backdrop')).toContain('transition-duration: var(--duration-exit)');
      expect(rule('  dialog[open]::backdrop')).toContain('opacity: 0');
    });

    it('only fades under reduced motion', () => {
      const reduced = DRAWER_STYLES.indexOf('prefers-reduced-motion: reduce');

      expect(reduced).toBeGreaterThan(-1);
      expect(rule('  dialog:not([open])', reduced)).toContain('transform: none');
      expect(rule('    dialog[open]', reduced)).toContain('transform: none');
    });

    it('animates nothing but transform and opacity', () => {
      const animated = [...DRAWER_STYLES.matchAll(/^\s+(\w[\w-]*) var\(--duration-base\)/gm)].map((match) => match[1]);

      expect(new Set(animated)).toEqual(new Set(['opacity', 'transform', 'overlay', 'display']));
    });
  });
});
