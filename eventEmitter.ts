type EventMap = Record<string, (...args: any[]) => void>;
export class EventEmitter<Events extends EventMap> {
  private listeners: { [K in keyof Events]?: Set<Events[K]> } = {};
  on<K extends keyof Events>(event: K, listener: Events[K]): () => void {
    const set = this.listeners[event] ?? (this.listeners[event] = new Set());
    set.add(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: Events[K]): void {
    this.listeners[event]?.delete(listener);
  }
  once<K extends keyof Events>(event: K, listener: Events[K]): () => void {
    const wrapper = ((...args: Parameters<Events[K]>) => {
      this.off(event, wrapper as Events[K]);
      listener(...(args as any));
    }) as Events[K];

    return this.on(event, wrapper);
  }
  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    const set = this.listeners[event];
    if (!set || set.size === 0) return;

    for (const listener of Array.from(set)) {
      listener(...(args as any));
    }
  }
  removeAllListeners<K extends keyof Events>(event?: K): void {
    if (event === undefined) {
      this.listeners = {};
    } else {
      delete this.listeners[event];
    }
  }

  listenerCount<K extends keyof Events>(event: K): number {
    return this.listeners[event]?.size ?? 0;
  }
}