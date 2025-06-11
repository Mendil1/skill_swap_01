// Create a utility file for event bus system to facilitate component communication
// This helps components communicate without direct props or parent-child relationships

// Type definitions for the event bus
type EventCallback<T = unknown> = (data: T) => void;
type EventListeners = Record<string, EventCallback[]>;

// Create a simple event bus for component communication
const eventBus = {
  // Store event listeners
  listeners: {} as EventListeners,

  // Subscribe to an event
  on<T = unknown>(event: string, callback: EventCallback<T>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback as EventCallback);

    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(
        (listener: EventCallback) => listener !== callback
      );
    };
  },

  // Publish an event
  emit<T = unknown>(event: string, data: T) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback: EventCallback) => {
        callback(data);
      });
    }

    // Also dispatch as a DOM event for backward compatibility
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent(event, { detail: data })
        );
      } catch (e) {
        console.error(`Error dispatching ${event} event:`, e);
      }
    }
  },

  // Remove all listeners for an event
  off(event: string) {
    delete this.listeners[event];
  }
};

export default eventBus;
