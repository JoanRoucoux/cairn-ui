import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiIconToggle } from './icon-toggle';

describe('UiIconToggle', () => {
  const toggle = (attributes = ''): string =>
    `<button uiIconToggle aria-label="Hide amounts" ${attributes}><svg aria-hidden="true"></svg></button>`;

  it('is a button named by its label', async () => {
    await render(toggle(), { imports: [UiIconToggle] });

    expect(screen.getByRole('button', { name: 'Hide amounts' })).toBeInTheDocument();
  });

  it('never submits a form by default', async () => {
    await render(toggle(), { imports: [UiIconToggle] });

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('keeps an explicit type', async () => {
    await render(toggle('type="submit"'), { imports: [UiIconToggle] });

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('is a round 44 px hit area, 40 px from 64rem, in the foreground color', async () => {
    await render(toggle(), { imports: [UiIconToggle] });

    expect(screen.getByRole('button')).toHaveClass(
      'rounded-pill',
      'size-11',
      'lg:size-10',
      'place-items-center',
      'text-(--foreground)',
    );
  });

  it('glows on hover under a fine pointer only', async () => {
    await render(toggle(), { imports: [UiIconToggle] });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('pointer-fine:hover:bg-(--glow)');
    expect(button.className).not.toMatch(/(^|\s)hover:bg-/);
  });

  it('scales on press and transitions nothing else', async () => {
    await render(toggle(), { imports: [UiIconToggle] });

    const button = screen.getByRole('button');
    expect(button).toHaveClass('transition-[scale]', 'duration-(--duration-press)', 'active:scale-(--press-scale)');
    expect(button.className).not.toContain('transition-[scale,');
    expect(button.className).not.toContain('transition-colors');
    expect(button.className).not.toContain('active:bg-');
  });

  it('rings the focus 2 px out', async () => {
    await render(toggle(), { imports: [UiIconToggle] });

    expect(screen.getByRole('button')).toHaveClass(
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-(--ring)',
    );
  });

  it('fills softly as an image layer when pressed, so hover cannot replace it', async () => {
    await render(toggle('aria-pressed="true"'), { imports: [UiIconToggle] });

    const button = screen.getByRole('button', { pressed: true });
    expect(button).toHaveClass('aria-pressed:bg-[image:linear-gradient(var(--soft),var(--soft))]');
    expect(button.className).not.toContain('aria-pressed:bg-(--soft)');
  });

  it('reflects the pressed state it is given', async () => {
    await render(
      '<button uiIconToggle aria-label="Hide amounts" [attr.aria-pressed]="on" (click)="on = !on"></button>',
      {
        imports: [UiIconToggle],
        componentProperties: { on: false },
      },
    );

    const button = screen.getByRole('button', { pressed: false });
    await userEvent.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});
