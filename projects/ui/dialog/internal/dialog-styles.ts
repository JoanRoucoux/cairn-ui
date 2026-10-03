export const DIALOG_STYLES = `
dialog {
  --dialog-ease: var(--ease-sheet);
  transition:
    transform var(--duration-base) var(--dialog-ease),
    overlay var(--duration-base) allow-discrete,
    display var(--duration-base) allow-discrete;
  transform: translateY(var(--drag-y, 0px));
}

dialog:not([open]) {
  transform: translateY(100%);
  transition-duration: var(--duration-exit);
}

@starting-style {
  dialog[open] {
    transform: translateY(100%);
  }
}

dialog[data-dragging] {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  dialog {
    transition:
      opacity var(--duration-base) var(--dialog-ease),
      overlay var(--duration-base) allow-discrete,
      display var(--duration-base) allow-discrete;
    opacity: 1;
  }

  dialog:not([open]) {
    opacity: 0;
    transform: translateY(var(--drag-y, 0px));
  }

  @starting-style {
    dialog[open] {
      opacity: 0;
      transform: translateY(0);
    }
  }
}

@media (min-width: 64rem) {
  dialog {
    --dialog-ease: var(--ease-out);
    transition:
      opacity var(--duration-base) var(--dialog-ease),
      transform var(--duration-base) var(--dialog-ease),
      overlay var(--duration-base) allow-discrete,
      display var(--duration-base) allow-discrete;
    opacity: 1;
    transform: scale(1);
  }

  dialog:not([open]) {
    opacity: 0;
    transform: scale(var(--enter-scale));
  }

  @starting-style {
    dialog[open] {
      opacity: 0;
      transform: scale(var(--enter-scale));
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
