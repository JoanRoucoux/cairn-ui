import { SheetDrag } from './sheet-drag';

type PointerInit = { x?: number; y: number; at: number; id?: number; button?: number };

const pointer = (target: Element, type: string, { x = 50, y, at, id = 1, button = 0 }: PointerInit): void => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button });
  Object.defineProperty(event, 'pointerId', { value: id });
  Object.defineProperty(event, 'timeStamp', { value: at });
  target.dispatchEvent(event);
};

const mockMatchMedia = (desktop: boolean): void => {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: desktop, media: query }));
};

describe('SheetDrag', () => {
  let panel: HTMLElement;
  let handle: HTMLElement;
  let header: HTMLElement;
  let cross: HTMLButtonElement;
  let dismiss: ReturnType<typeof vi.fn<() => void>>;
  let drag: SheetDrag;

  beforeAll(() => {
    Object.defineProperty(Element.prototype, 'setPointerCapture', { value: vi.fn(), configurable: true });
  });

  afterAll(() => {
    delete (Element.prototype as Partial<Element>).setPointerCapture;
  });

  beforeEach(() => {
    mockMatchMedia(false);
    panel = document.createElement('dialog');
    handle = document.createElement('div');
    header = document.createElement('div');
    cross = document.createElement('button');
    header.append(cross);
    panel.append(handle, header);
    document.body.append(panel);
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ height: 400 } as DOMRect);
    dismiss = vi.fn<() => void>();
    drag = new SheetDrag(panel, [handle, header], dismiss);
  });

  afterEach(() => {
    drag.destroy();
    panel.remove();
    vi.unstubAllGlobals();
  });

  const offset = (): string => panel.style.getPropertyValue('--drag-y');

  it('makes the panel follow the pointer down, without a transition', () => {
    pointer(handle, 'pointerdown', { y: 100, at: 0 });
    pointer(handle, 'pointermove', { y: 160, at: 100 });

    expect(offset()).toBe('60px');
    expect(panel).toHaveAttribute('data-dragging');
  });

  it('captures the pointer, so the drag goes on outside the grip', () => {
    pointer(handle, 'pointerdown', { y: 100, at: 0, id: 7 });

    expect(handle.setPointerCapture).toHaveBeenCalledWith(7);
  });

  it('never lifts the panel above its resting place', () => {
    pointer(header, 'pointerdown', { y: 100, at: 0 });
    pointer(header, 'pointermove', { y: 110, at: 50 });
    pointer(header, 'pointermove', { y: 40, at: 100 });

    expect(offset()).toBe('0px');
  });

  it('leaves a press that barely moves alone', () => {
    pointer(handle, 'pointerdown', { y: 100, at: 0 });
    pointer(handle, 'pointermove', { y: 104, at: 5 });
    pointer(handle, 'pointerup', { y: 104, at: 6 });

    expect(offset()).toBe('');
    expect(panel).not.toHaveAttribute('data-dragging');
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('ignores a sideways swipe, even when it turns downwards later', () => {
    pointer(handle, 'pointerdown', { x: 50, y: 100, at: 0 });
    pointer(handle, 'pointermove', { x: 90, y: 105, at: 20 });
    pointer(handle, 'pointermove', { x: 90, y: 300, at: 40 });
    pointer(handle, 'pointerup', { x: 90, y: 300, at: 41 });

    expect(offset()).toBe('');
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('closes when released past 30 % of its height, starting the exit from where it was let go', () => {
    pointer(handle, 'pointerdown', { y: 100, at: 0 });
    for (let step = 1; step <= 13; step++) {
      pointer(handle, 'pointermove', { y: 100 + step * 10, at: step * 40 });
    }
    pointer(handle, 'pointerup', { y: 230, at: 800 });

    expect(dismiss).toHaveBeenCalledOnce();
    expect(offset()).toBe('130px');
    expect(panel).not.toHaveAttribute('data-dragging');
  });

  it('closes on a fast flick, however short', () => {
    pointer(header, 'pointerdown', { y: 100, at: 0 });
    pointer(header, 'pointermove', { y: 120, at: 10 });
    pointer(header, 'pointermove', { y: 140, at: 20 });
    pointer(header, 'pointerup', { y: 150, at: 25 });

    expect(dismiss).toHaveBeenCalledOnce();
  });

  it('springs back from a short slow drag', () => {
    pointer(handle, 'pointerdown', { y: 100, at: 0 });
    for (let step = 1; step <= 10; step++) {
      pointer(handle, 'pointermove', { y: 100 + step * 10, at: step * 40 });
    }
    pointer(handle, 'pointerup', { y: 200, at: 700 });

    expect(dismiss).not.toHaveBeenCalled();
    expect(offset()).toBe('');
    expect(panel).not.toHaveAttribute('data-dragging');
  });

  it('only counts the last 100 ms of movement as the release speed', () => {
    pointer(handle, 'pointerdown', { y: 100, at: 0 });
    pointer(handle, 'pointermove', { y: 180, at: 40 });
    pointer(handle, 'pointermove', { y: 181, at: 300 });
    pointer(handle, 'pointerup', { y: 181, at: 320 });

    expect(dismiss).not.toHaveBeenCalled();
  });

  it('springs back when the browser cancels the pointer', () => {
    pointer(handle, 'pointerdown', { y: 100, at: 0 });
    pointer(handle, 'pointermove', { y: 300, at: 400 });
    pointer(handle, 'pointercancel', { y: 300, at: 401 });

    expect(dismiss).not.toHaveBeenCalled();
    expect(offset()).toBe('');
    expect(panel).not.toHaveAttribute('data-dragging');
  });

  it('follows only the pointer that started the drag', () => {
    pointer(handle, 'pointerdown', { y: 100, at: 0, id: 1 });
    pointer(handle, 'pointermove', { y: 300, at: 20, id: 2 });
    pointer(handle, 'pointerup', { y: 300, at: 30, id: 2 });

    expect(offset()).toBe('');
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('ignores a release or a cancel that no press started', () => {
    pointer(handle, 'pointermove', { y: 300, at: 20 });
    pointer(handle, 'pointerup', { y: 300, at: 30 });
    pointer(handle, 'pointercancel', { y: 300, at: 40 });

    expect(offset()).toBe('');
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('leaves the close cross and every other control of the header to their click', () => {
    pointer(cross, 'pointerdown', { y: 100, at: 0 });
    pointer(cross, 'pointermove', { y: 300, at: 20 });
    pointer(cross, 'pointerup', { y: 300, at: 30 });

    expect(offset()).toBe('');
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('ignores any mouse button but the main one', () => {
    pointer(handle, 'pointerdown', { y: 100, at: 0, button: 2 });
    pointer(handle, 'pointermove', { y: 300, at: 20 });

    expect(offset()).toBe('');
  });

  it('does not drag a centred dialog from 64rem', () => {
    mockMatchMedia(true);

    pointer(handle, 'pointerdown', { y: 100, at: 0 });
    pointer(handle, 'pointermove', { y: 300, at: 20 });

    expect(offset()).toBe('');
  });

  it('does not drag where media queries cannot be read', () => {
    vi.stubGlobal('matchMedia', undefined);

    pointer(handle, 'pointerdown', { y: 100, at: 0 });
    pointer(handle, 'pointermove', { y: 300, at: 20 });

    expect(offset()).toBe('');
  });

  it('drops the offset left by a dismissing drag on reset', () => {
    pointer(handle, 'pointerdown', { y: 100, at: 0 });
    pointer(handle, 'pointermove', { y: 300, at: 20 });
    pointer(handle, 'pointerup', { y: 300, at: 30 });

    drag.reset();

    expect(offset()).toBe('');
  });

  it('stops listening once destroyed', () => {
    drag.destroy();

    pointer(handle, 'pointerdown', { y: 100, at: 0 });
    pointer(handle, 'pointermove', { y: 300, at: 20 });

    expect(offset()).toBe('');
  });
});
