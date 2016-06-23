export class EventEmitter<T> {
  listeners: Function[];

  constructor() {
    this.listeners = [];
  }

  emit(event: T) {
    this.listeners.forEach((listener) => {
      listener(event);
    });
  }

  subscribe(listener: (x: T) => void) {
    this.listeners.push(listener);
    return this.listeners.length - 1;
  }
}