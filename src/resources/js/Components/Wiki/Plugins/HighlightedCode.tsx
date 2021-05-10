import React from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

interface Props {
    lang?: string;
    content?: string;
}

const HighlightedCode: React.FC<Props> = ({ lang, content }: Props) => {
    const hasValidLanguage = !!lang && hljs.getLanguage(lang);
    return (
        <>
            {!hasValidLanguage && (
                <pre className="pre-scrollable">
                    <code>{content}</code>
                </pre>
            )}
            {hasValidLanguage && (
                <pre className="pre-scrollable">
                    <code
                        dangerouslySetInnerHTML={{
                            __html: hljs.highlight(lang, content).value,
                        }}
                    />
                </pre>
            )}
        </>
    );
};

export default HighlightedCode;
