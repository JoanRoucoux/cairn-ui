import { type RenderResult, render, screen } from '@testing-library/angular';

import { type AvatarSize, UiAvatar } from './avatar';

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
  ])('applies the %s size classes', async (size, expectedClass) => {
    await renderAvatar(size);

    expect(screen.getByRole('img', { name: 'My account' })).toHaveClass(expectedClass);
  });
});
