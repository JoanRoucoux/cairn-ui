import '@testing-library/jest-dom/vitest';

HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement): void {
  this.open = true;
};

HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement): void {
  this.open = false;
  this.dispatchEvent(new Event('close'));
};

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
