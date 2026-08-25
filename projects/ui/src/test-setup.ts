import '@testing-library/jest-dom/vitest';

// jsdom ships <dialog> without its modal behavior: showModal and close are simply absent.
HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement): void {
  this.open = true;
};

HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement): void {
  this.open = false;
  this.dispatchEvent(new Event('close'));
};
