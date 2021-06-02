import { DependencyList, useEffect } from "react";
import { useDispatcher } from "../Contexts/DispatcherProvider";

export default function useDispatcherEvent<T>(
    eventName: string,
    callback: (data: T) => void,
    deps?: DependencyList
): void {
    const dispatcher = useDispatcher();
    useEffect(() => {
        dispatcher.on(eventName, callback);
        return () => {
            dispatcher.off(eventName, callback);
        };
    }, deps);
}
