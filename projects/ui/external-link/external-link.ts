import { Component } from '@angular/core';

/**
 * Link to another site: the label followed by an external-link icon.
 *
 * @example
 * <a ui-external-link href="https://example.com" target="_blank" rel="noopener">Page on example.com</a>
 */
@Component({
  selector: 'a[ui-external-link]',
  template: `
    <ng-content />
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.75"
      viewBox="0 0 24 24"
      width="14"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  `,
  host: {
    class:
      'inline-flex min-h-11 items-center gap-1.5 rounded-[4px] text-label leading-[17px] font-medium lg:min-h-0 hover:underline underline-offset-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) [&>svg]:flex-none',
  },
})
export class UiExternalLink {}
