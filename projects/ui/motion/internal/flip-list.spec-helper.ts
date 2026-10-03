export const ROW = 50;

export const shift = (y: number): string => `matrix(1, 0, 0, 1, 0, ${y})`;

const shownShift = (element: HTMLElement): number => {
  const match = /^matrix\((.+)\)$/.exec(element.style.transform);
  return match ? parseFloat((match[1] as string).split(',')[5] as string) : 0;
};

export const layout = (host: HTMLElement, origin = 0): void => {
  const place = (element: HTMLElement, top: number): number => {
    const children = Array.from(element.children) as HTMLElement[];
    const bottom = children.length === 0 ? top + ROW : children.reduce((cursor, child) => place(child, cursor), top);
    element.getBoundingClientRect = () => {
      let offset = 0;
      for (let node: HTMLElement | null = element; node; node = node === host ? null : node.parentElement) {
        offset += shownShift(node);
      }
      return { top: origin + top + offset } as DOMRect;
    };
    return bottom;
  };
  (Array.from(host.children) as HTMLElement[]).reduce((cursor, child) => place(child, cursor), 0);
  host.getBoundingClientRect = () => ({ top: origin + shownShift(host) }) as DOMRect;
};

export function animationsFromTransforms(this: Element, options?: GetAnimationsOptions): Animation[] {
  const scope = options?.subtree ? [this, ...Array.from(this.querySelectorAll('*'))] : [this];
  return scope
    .filter((element) => (element as HTMLElement).style.transform !== '')
    .map((element) => ({ effect: { target: element } }) as unknown as Animation);
}

export const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));
