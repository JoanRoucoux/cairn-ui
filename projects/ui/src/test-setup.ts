import '@testing-library/jest-dom/vitest';

const modals = new WeakSet<HTMLDialogElement>();
const matches = Element.prototype.matches;

HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement): void {
  this.open = true;
  modals.add(this);
};

HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement): void {
  this.open = false;
  modals.delete(this);
  this.dispatchEvent(new Event('close'));
};

Object.defineProperty(HTMLDialogElement.prototype, 'matches', {
  configurable: true,
  value: function matchesModal(this: HTMLDialogElement, selectors: string): boolean {
    return selectors === ':modal' ? modals.has(this) && this.open : matches.call(this, selectors);
  },
});

function dispatchPopoverToggle(element: HTMLElement, newState: 'open' | 'closed'): void {
  const event = new Event('toggle');
  Object.defineProperty(event, 'newState', { value: newState });
  element.dispatchEvent(event);
}

HTMLElement.prototype.showPopover = function showPopover(this: HTMLElement): void {
  this.style.display = 'block';
  dispatchPopoverToggle(this, 'open');
};

HTMLElement.prototype.hidePopover = function hidePopover(this: HTMLElement): void {
  this.style.display = 'none';
  dispatchPopoverToggle(this, 'closed');
};
