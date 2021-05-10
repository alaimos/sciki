import React from "react";
import { Alert } from "reactstrap";
import katex from "katex";
import "katex/dist/katex.min.css";

interface Props {
    content?: string;
}

const Katex: React.FC<Props> = ({ content }: Props) => {
    return (
        <>
            {!content && (
                <Alert color="danger">
                    Content not provided for the Katex plugin
                </Alert>
            )}
            {content && (
                <div
                    className="text-center"
                    dangerouslySetInnerHTML={{
                        __html: katex.renderToString(content, {
                            throwOnError: false,
                        }),
                    }}
                />
            )}
        </>
    );
};

export default Katex;
