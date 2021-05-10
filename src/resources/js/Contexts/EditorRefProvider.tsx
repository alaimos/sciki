import React, { ReactNode, useContext, useRef } from "react";
import { Editor as TUIEditor } from "@toast-ui/react-editor";

// @ts-ignore
const EditorRefContext = React.createContext<React.RefObject<TUIEditor>>();

export function useEditorRefContext(): React.RefObject<TUIEditor> {
    return useContext<React.RefObject<TUIEditor>>(EditorRefContext);
}

const EditorRefProvider: React.FC = ({
    children,
}: {
    children?: ReactNode;
}) => {
    const ref = useRef<TUIEditor>(null);

    return (
        <EditorRefContext.Provider value={ref}>
            {children}
        </EditorRefContext.Provider>
    );
};

export default EditorRefProvider;
