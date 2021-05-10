import React from "react";
import { Alert } from "reactstrap";
import mermaid from "mermaid";

interface Props {
    content?: string;
}

const Mermaid: React.FC<Props> = ({ content }: Props) => {
    const randomId = `mermaid-${Math.random().toString(36).substr(2, 10)}`;
    return (
        <>
            {!content && (
                <Alert color="danger">
                    Content not provided for the Mermaid plugin
                </Alert>
            )}
            {content && (
                <div
                    className="text-center"
                    dangerouslySetInnerHTML={{
                        __html: mermaid.render(randomId, content),
                    }}
                />
            )}
        </>
    );
};

export default Mermaid;
