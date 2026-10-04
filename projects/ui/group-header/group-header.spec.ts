import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiGroupHeader } from './group-header';

@Component({
  imports: [UiGroupHeader],
  template: `
    <ui-group-header
      collapsible
      controls="northwind"
      meta="PEA · 2 lignes"
      name="Northwind PEA"
      [toggleDisabled]="locked()"
      [(expanded)]="open"
    >
      48 215,60 €
    </ui-group-header>
  `,
})
class Host {
  readonly open = signal(true);
  readonly locked = signal(false);
}

describe('UiGroupHeader', () => {
  describe('collapsible', () => {
    it('is a button inside the heading, named by name, meta and total', async () => {
      await render(Host);
      const button = screen.getByRole('button');

      expect(button.parentElement?.tagName).toBe('H2');
      expect(button).toHaveAccessibleName(/Northwind PEA\s*PEA · 2 lignes\s*48 215,60 €/);
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(button).toHaveAttribute('aria-controls', 'northwind');
    });

    it('lays out as the frame: bottom aligned, 44px, 12px 4px 0, press scale, focus ring', async () => {
      await render(Host);

      expect(screen.getByRole('button')).toHaveClass(
        'items-end',
        'justify-between',
        'min-h-11',
        'px-1',
        'pt-3',
        'active:scale-(--press-scale)',
        'focus-visible:outline-offset-2',
        'focus-visible:outline-(--ring)',
      );
    });

    it('sets the name and the total in title 600 and the meta as a muted label', async () => {
      await render(Host);

      expect(screen.getByText('Northwind PEA')).toHaveClass('text-title', 'font-semibold');
      expect(screen.getByText('PEA · 2 lignes')).toHaveClass('text-label', 'text-(--muted-foreground)');
      expect(screen.getByText('48 215,60 €')).toHaveClass('text-title', 'font-semibold', 'tabular-nums');
    });

    it('draws a 20px chevron that turns on fold', async () => {
      const { fixture } = await render(Host);
      const chevron = screen.getByRole('button').querySelector('svg');

      expect(chevron).toHaveAttribute('width', '20');
      expect(chevron).toHaveClass('transition-transform', 'duration-(--duration-fast)');
      expect(chevron).not.toHaveClass('-rotate-90');

      await userEvent.click(screen.getByRole('button'));

      expect(fixture.componentInstance.open()).toBe(false);
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
      expect(chevron).toHaveClass('-rotate-90');

      await userEvent.click(screen.getByRole('button'));

      expect(fixture.componentInstance.open()).toBe(true);
    });

    it('ignores a click while disabled but stays focusable and announced', async () => {
      const { fixture } = await render(Host);
      fixture.componentInstance.locked.set(true);
      TestBed.tick();

      await userEvent.click(screen.getByRole('button'));

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    });

    it('omits the meta, aria-controls and aria-disabled when not given', async () => {
      await render('<ui-group-header name="A" collapsible>1</ui-group-header>', { imports: [UiGroupHeader] });
      const button = screen.getByRole('button');

      expect(button).not.toHaveAttribute('aria-controls');
      expect(button).not.toHaveAttribute('aria-disabled');
      expect(button).toHaveTextContent(/^\s*A\s*1\s*$/);
    });
  });

  describe('static', () => {
    it('is a plain header: heading, meta, total, no button', async () => {
      await render('<ui-group-header name="A" meta="M">1</ui-group-header>', { imports: [UiGroupHeader] });

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'A' })).toHaveClass('text-title', 'font-semibold');
      expect(screen.getByText('M')).toBeInTheDocument();
      expect(screen.getByText('1')).toHaveClass('text-title', 'tabular-nums');
      expect(screen.getByRole('heading').parentElement?.parentElement).toHaveClass(
        'items-end',
        'min-h-11',
        'px-1',
        'pt-3',
      );
    });

    it('leaves out the meta when there is none', async () => {
      await render('<ui-group-header name="A">1</ui-group-header>', { imports: [UiGroupHeader] });

      expect(screen.getByRole('heading')).toHaveTextContent('A');
      expect(screen.getByRole('heading').parentElement?.children).toHaveLength(1);
    });
  });
});
