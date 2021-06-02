import React, { ReactNode, useContext } from "react";
import Dispatcher from "../Common/dispatcher";

const defaultDispatcher = new Dispatcher();

const DispatcherContext = React.createContext<Dispatcher>(defaultDispatcher);

export function useDispatcher(): Dispatcher {
    return useContext<Dispatcher>(DispatcherContext);
}

const DispatcherProvider: React.FC = ({
    children,
}: {
    children?: ReactNode;
}) => {
    return (
        <DispatcherContext.Provider value={defaultDispatcher}>
            {children}
        </DispatcherContext.Provider>
    );
};

export default DispatcherProvider;
