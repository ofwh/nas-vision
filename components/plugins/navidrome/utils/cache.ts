import type { State } from 'swr';

const MAX_CACHE_ENTRIES = 256;

export class WindowCache extends Map<string, State<unknown, unknown>> {
  private active = true;

  override set(key: string, value: State<unknown, unknown>): this {
    if (!this.active) {
      return this;
    }

    super.delete(key);
    super.set(key, value);

    while (this.size > MAX_CACHE_ENTRIES) {
      const oldest = this.keys().next();

      if (!oldest.done) {
        super.delete(oldest.value);
      }
    }

    return this;
  }

  activate() {
    this.active = true;
  }

  dispose() {
    this.active = false;
    this.clear();
  }
}
