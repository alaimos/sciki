import { unset, has } from "lodash";

type Callback<T> = (e: T) => void;

class DispatcherEvent<T> {
    private callbacks: Callback<T>[] = [];

    registerCallback(callback: Callback<T>): void {
        this.callbacks.push(callback);
    }

    unregisterCallback(callback: Callback<T>): void {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    fire(data: T): void {
        const callbacks = this.callbacks.slice(0);
        callbacks.forEach((cb) => cb(data));
    }

    empty(): boolean {
        return this.callbacks.length === 0;
    }
}

export default class Dispatcher {
    private events: Record<string, DispatcherEvent<unknown>> = {};

    dispatch<T>(eventName: string, data: T): this {
        const event = this.events[eventName];
        if (event) {
            event.fire(data);
        }
        return this;
    }

    on<T>(eventName: string, callback: Callback<T>): this {
        if (!has(this.events, eventName)) {
            this.events[eventName] =
                new DispatcherEvent<T>() as DispatcherEvent<unknown>;
        }
        const event = this.events[eventName] as DispatcherEvent<T>;
        event.registerCallback(callback);
        return this;
    }

    off<T>(eventName: string, callback: Callback<T>): this {
        const event = this.events[eventName] as DispatcherEvent<T>;
        if (event) {
            event.unregisterCallback(callback);
            if (event.empty()) {
                unset(this.events, eventName);
            }
        }
        return this;
    }
}
