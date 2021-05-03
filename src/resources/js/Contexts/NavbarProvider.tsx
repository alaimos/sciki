import React, { ReactNode, useContext, useState } from "react";
import { Nullable } from "../Types/common";

interface NavbarContextType {
    title: Nullable<string>;

    setTitle(title: Nullable<string>): void;
}

const NavBarContext = React.createContext<NavbarContextType>({
    title: undefined,
    setTitle: () => void 0,
});

export function useNavbarContext(): NavbarContextType {
    return useContext<NavbarContextType>(NavBarContext);
}

const NavbarProvider: React.FC = ({ children }: { children?: ReactNode }) => {
    const [title, setTitle] = useState<Nullable<string>>(undefined);

    return (
        <NavBarContext.Provider value={{ title, setTitle }}>
            {children}
        </NavBarContext.Provider>
    );
};

export default NavbarProvider;
