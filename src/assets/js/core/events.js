/**
 * Tiny publish/subscribe event bus for decoupled cross-module communication
 * (e.g. a header module reacting to a cart module without importing it
 * directly). For interacting with Salla's own component events, use the
 * `Salla.hooks` API instead — this bus is strictly internal to this theme's
 * custom scripts.
 *
 * @module core/events
 */

class EventBus {
  #listeners = new Map();

  /**
   * @param {string} eventName
   * @param {(payload?: unknown) => void} handler
   * @returns {() => void} unsubscribe function
   */
  on(eventName, handler) {
    if (!this.#listeners.has(eventName)) {
      this.#listeners.set(eventName, new Set());
    }

    this.#listeners.get(eventName).add(handler);

    return () => this.off(eventName, handler);
  }

  /**
   * @param {string} eventName
   * @param {(payload?: unknown) => void} handler
   */
  off(eventName, handler) {
    this.#listeners.get(eventName)?.delete(handler);
  }

  /**
   * @param {string} eventName
   * @param {unknown} [payload]
   */
  emit(eventName, payload) {
    this.#listeners.get(eventName)?.forEach(handler => handler(payload));
  }
}

export const events = new EventBus();
export default events;
