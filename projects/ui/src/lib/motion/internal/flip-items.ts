import { Injectable } from '@angular/core';

@Injectable()
export class FlipItems {
  private readonly items = new Set<HTMLElement>();
  private readonly destroyed = new Set<HTMLElement>();
  private used = false;

  get marked(): boolean {
    return this.used;
  }

  add(item: HTMLElement): void {
    this.used = true;
    this.items.add(item);
  }

  remove(item: HTMLElement): void {
    this.destroyed.add(item);
  }

  inside(host: HTMLElement): HTMLElement[] {
    const inside: HTMLElement[] = [];
    for (const item of this.items) {
      if (host.contains(item)) {
        inside.push(item);
      } else if (this.destroyed.has(item)) {
        this.items.delete(item);
        this.destroyed.delete(item);
      }
    }
    return inside;
  }
}
