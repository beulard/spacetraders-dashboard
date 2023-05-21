import { createContext } from "react";

enum MessageType {
  Hi,
  LocateSystem,
}

export interface LocateSystemPayload {
  symbol: string;
  x: number;
  y: number;
}

// type MessageCallback = HiCallback | LocateCallback;
interface MessageCallback {
  (payload: any): void;
}

class MessageQueue {
  // private _instance: MessageQueue | null = null;
  private listeners: Map<MessageType, MessageCallback[]> = new Map();
  private static _instance: MessageQueue = new MessageQueue();

  private constructor() {}

  public static Instance() {
    return this._instance;
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

  public clear() {
    this.listeners.clear();
  }
}

const msgQueue = MessageQueue.Instance();

const MessageContext = createContext<{ msgQueue: MessageQueue }>({
  msgQueue: msgQueue,
});

export { MessageQueue, MessageContext, MessageType };
