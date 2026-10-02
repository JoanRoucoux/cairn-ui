import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular-vite';

import { UiTab, UiTabBar } from './tab-bar';

const ICON = (path: string): string =>
  `<svg tabIcon width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

const meta: Meta = {
  title: 'Data display/Tab bar',
  decorators: [moduleMetadata({ imports: [UiTab, UiTabBar] })],
  parameters: {
    docs: {
      description: {
        component: `Bottom navigation bar shown below \`64rem\`: 52px of tabs plus \`env(safe-area-inset-bottom)\`,
never a fixed 34px, so it sits above the home indicator on every device. \`ui-nav-item\` is its
sidebar counterpart on the desktop layout.

The component only lays out its tabs; the app positions the bar itself (\`fixed\` or \`sticky\`) and
pads the page content by the same height so nothing hides behind it. While it is on the page the bar
publishes that height as \`--tab-bar-height\` on the root element, so the app pads with
\`pb-(--tab-bar-height)\` instead of restating 52px; \`ui-action-bar\` and \`ui-toaster\` sit above it.

#### When to use

* As the primary navigation on a narrow viewport, mirroring the sidebar's destinations exactly.

#### When not to use

* Above \`64rem\`, where the sidebar (\`ui-nav-item\`) carries navigation instead.

#### Accessibility

* The active tab carries \`aria-current="page"\` and is shown in 600 weight on \`--foreground\`; an
  inactive tab stays on \`--muted-foreground\`.
* Renders on native \`<a>\` elements inside a \`<nav>\`, so keyboard focus and navigation come from the
  platform.`,
      },
    },
  },
  render: () => ({
    template: `
      <div class="w-[390px] overflow-hidden rounded-[12px] pb-3 shadow-[0_-1px_0_var(--hairline),0_0_0_1px_var(--border)]"><nav ui-tab-bar>
        <a ui-tab active href="#">
          ${ICON('<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>')}
          Portefeuille
        </a>
        <a ui-tab href="#">
          ${ICON('<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M3 15h18"></path><path d="M12 3v18"></path>')}
          Lignes
        </a>
        <a ui-tab href="#">
          ${ICON('<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"></path><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>')}
          Répartition
        </a>
        <a ui-tab href="#">
          ${ICON('<line x1="3" x2="21" y1="22" y2="22"></line><line x1="6" x2="6" y1="18" y2="11"></line><line x1="10" x2="10" y1="18" y2="11"></line><line x1="14" x2="14" y1="18" y2="11"></line><line x1="18" x2="18" y1="18" y2="11"></line><polygon points="12 2 20 7 4 7"></polygon>')}
          Comptes
        </a>
      </nav></div>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
