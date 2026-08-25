import { Component, computed, input } from '@angular/core';

/** Available avatar sizes. `AvatarSize` is derived from this tuple. */
export const AVATAR_SIZES = ['sm', 'md'] as const;
export type AvatarSize = (typeof AVATAR_SIZES)[number];

const BASE_CLASSES =
  'inline-flex items-center justify-center rounded-full border border-(--primary) bg-(--soft) font-semibold tabular-nums text-(--primary)';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'size-8 text-xs',
  md: 'size-11 text-sm',
};

/**
 * Initials in a disc, standing in for a person. Single-user application: there is exactly one.
 *
 * @example
 * <ui-avatar initials="JR" label="My account" />
 */
@Component({
  selector: 'ui-avatar',
  template: '<span aria-hidden="true">{{ initials() }}</span>',
  host: {
    role: 'img',
    '[attr.aria-label]': 'label()',
    '[class]': 'classes()',
  },
})
export class UiAvatar {
  readonly initials = input.required<string>();
  readonly label = input.required<string>();
  readonly size = input<AvatarSize>('md');

  protected readonly classes = computed(() => `${BASE_CLASSES} ${SIZE_CLASSES[this.size()]}`);
}
