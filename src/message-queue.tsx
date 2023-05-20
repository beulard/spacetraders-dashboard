import { createContext } from "react";

enum MessageType {
  Hi,
  Locate,
}

// interface HiCallback {
//   (payload: { message: string }): void;
// }

// interface LocateCallback {
//   (payload: { x: number; y: number }): void;
// }

// type MessageCallback = HiCallback | LocateCallback;
interface MessageCallback {
  (payload: any): void;
}

class MessageQueue {
  private listeners: Map<MessageType, MessageCallback[]> = new Map();

  public hi() {
    console.log("hi from msg queue");
  }

  public post(message: MessageType, payload: any) {
    const callbacks = this.listeners.get(message);
    if (callbacks) {
      for (const callback of callbacks) {
        callback(payload);
      }
    }
  }

  public listen(message: MessageType, callback: MessageCallback) {
    const callbacks = this.listeners.get(message) || [];
    callbacks.push(callback);
    this.listeners.set(message, callbacks);
  }
}

const MessageContext = createContext<MessageQueue | null>(null);

export { MessageQueue, MessageContext, MessageType };
