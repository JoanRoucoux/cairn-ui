export const DRAWER_STYLES = `
dialog {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out),
    overlay var(--duration-base) allow-discrete,
    display var(--duration-base) allow-discrete;
  opacity: 1;
  transform: none;
}

dialog:not([open]) {
  opacity: 0;
  transform: translateX(24px);
  transition-duration: var(--duration-exit);
}

@starting-style {
  dialog[open] {
    opacity: 0;
    transform: translateX(24px);
  }
}

@media (prefers-reduced-motion: reduce) {
  dialog:not([open]) {
    transform: none;
  }

  @starting-style {
    dialog[open] {
      transform: none;
    }
  }
}

dialog::backdrop {
  transition: opacity var(--duration-base) var(--ease-out);
  opacity: 1;
}

dialog:not([open])::backdrop {
  opacity: 0;
  transition-duration: var(--duration-exit);
}

@starting-style {
  dialog[open]::backdrop {
    opacity: 0;
  }
}
`;
