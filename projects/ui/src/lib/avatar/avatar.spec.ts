import { type RenderResult, render, screen } from '@testing-library/angular';

import { type AvatarSize, UiAvatar, UiAvatarLink } from './avatar';

const renderAvatar = (size: AvatarSize = 'md'): Promise<RenderResult<unknown>> =>
  render('<ui-avatar initials="JR" label="My account" [size]="size" />', {
    imports: [UiAvatar],
    componentProperties: { size },
  });

describe('UiAvatar', () => {
  it('exposes itself as an image named by its label', async () => {
    await renderAvatar();

    expect(screen.getByRole('img', { name: 'My account' })).toBeInTheDocument();
  });

  it('hides the initials from assistive technology', async () => {
    const { container } = await renderAvatar();

    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('JR');
  });

  it('sits on the muted surface without a border', async () => {
    await renderAvatar();

    const avatar = screen.getByRole('img', { name: 'My account' });
    expect(avatar).toHaveClass('bg-(--muted)', 'font-medium');
    expect(avatar).not.toHaveClass('border');
  });

  it.each<[AvatarSize, string]>([
    ['sm', 'size-8'],
    ['md', 'size-[34px]'],
    ['lg', 'size-14'],
    ['auto', 'size-[34px]'],
    ['auto', 'lg:size-8'],
    ['auto', 'lg:text-caption'],
  ])('applies the %s size classes', async (size, expectedClass) => {
    await renderAvatar(size);

    expect(screen.getByRole('img', { name: 'My account' })).toHaveClass(expectedClass);
  });
});

describe('UiAvatarLink', () => {
  const link = '<a uiAvatarLink href="/profile"><ui-avatar initials="JR" label="Profil" /></a>';

  it('wraps the avatar in a round 44 px hit area, 40 px from 64rem', async () => {
    await render(link, { imports: [UiAvatar, UiAvatarLink] });

    expect(screen.getByRole('link', { name: 'Profil' })).toHaveClass(
      'rounded-pill',
      'size-11',
      'lg:size-10',
      'place-items-center',
      'hover:bg-(--glow)',
      'active:scale-(--press-scale)',
      'focus-visible:outline-offset-2',
    );
  });

  it('draws no pressed fill', async () => {
    await render(link, { imports: [UiAvatar, UiAvatarLink] });

    expect(screen.getByRole('link', { name: 'Profil' }).className).not.toContain('active:bg-');
  });

  it('holds a soft halo on the current page', async () => {
    await render('<a uiAvatarLink href="/profile" aria-current="page"><ui-avatar initials="JR" label="Profil" /></a>', {
      imports: [UiAvatar, UiAvatarLink],
    });

    expect(screen.getByRole('link', { name: 'Profil' })).toHaveClass('aria-[current=page]:bg-(--soft)');
  });
});
