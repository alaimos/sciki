import { DependencyList, useEffect } from "react";
import { useDispatcher } from "../Contexts/DispatcherProvider";

interface Identifiable {
    sender: string;
}

export default function useDispatcherEvent<T>(
    eventName: string,
    callback: (data: T) => void,
    deps?: DependencyList
): void {
    const dispatcher = useDispatcher();
    useEffect(
        () => {
            dispatcher.on(eventName, callback);
            return () => {
                dispatcher.off(eventName, callback);
            };
        },
        deps ? [...deps, callback] : deps
    );
}

export function useDispatcherEventWithSender<T extends Identifiable>(
    eventName: string,
    callback: (data: T) => void,
    connectTo?: string | string[],
    deps?: DependencyList
): void {
    useDispatcherEvent<T>(
        eventName,
        (data) => {
            const { sender } = data;
            if (
                connectTo &&
                ((typeof connectTo === "string" && sender === connectTo) ||
                    connectTo.includes(sender))
            ) {
                callback(data);
            }
        },
        deps ? [...deps, callback, connectTo] : deps
    );
}
