// @ts-nocheck
import React, { useRef } from "react";
import mermaid from "mermaid";
import katex from "katex";
import TUIEditorObject from "@toast-ui/editor";
import { Editor as TUIEditor } from "@toast-ui/react-editor";
import colorSyntax from "@toast-ui/editor-plugin-color-syntax";
import codeSyntaxHighlight from "@toast-ui/editor-plugin-code-syntax-highlight";
import tableMergedCell from "@toast-ui/editor-plugin-table-merged-cell";
import hljs from "highlight.js";
import jv from "w-jsonview-tree";
import "codemirror/lib/codemirror.css";
import "@toast-ui/editor/dist/toastui-editor.css";
import "tui-color-picker/dist/tui-color-picker.css";
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";
import PluginInfo = toastui.PluginInfo;
import route from "ziggy-js";
import AutoLinksParser from "./AutoLinksParser";

interface Props {
    value: string;
    onChange: (newValue: string) => void;
}

function katexPlugin(editor: TUIEditorObject) {
    const katexPluginReplacer = (codeBlockContent: string) => {
        const html = katex.renderToString(codeBlockContent, {
            throwOnError: false,
        });

        return `<div>${html}</div>`;
    };

    editor.setCodeBlockLanguages(["KaTeX"]);
    const { codeBlockManager } = Object.getPrototypeOf(editor).constructor;
    codeBlockManager.setReplacer("KaTeX", katexPluginReplacer);
}

function mermaidPlugin(editor: TUIEditorObject) {
    const mermaidPluginReplacer = (codeBlockContent: string) => {
        const randomId = `mermaid-${Math.random().toString(36).substr(2, 10)}`;
        try {
            const svg = mermaid.render(randomId, codeBlockContent);
            return `<div>${svg}</div>`;
        } catch (e) {
            document.querySelector(`#d${randomId}`)?.remove();
            return `<div class="text-danger">Error: ${e.message}</div>`;
        }
    };

    editor.setCodeBlockLanguages(["mermaid"]);
    const { codeBlockManager } = Object.getPrototypeOf(editor).constructor;
    codeBlockManager.setReplacer("mermaid", mermaidPluginReplacer);
}

function scikiPlugin(editor: TUIEditorObject) {
    const scikiPluginReplacer = (codeBlockContent: string) => {
        const randomId = `sciki-${Math.random().toString(36).substr(2, 10)}`;
        try {
            const jsonData = JSON.parse(codeBlockContent);
            setTimeout(() => {
                const container = document.querySelector(`#${randomId}`);
                try {
                    jv(jsonData, container, { expanded: true });
                } catch (e) {
                    container.innerHTML = `<div class="text-danger">Error: ${e.message}</div>`;
                }
            }, 0);
            return `<div><strong>SciKi Component:</strong><div id="${randomId}"></div></div>`;
        } catch (e) {
            return `<div class="text-danger">Error: ${e.message}</div>`;
        }
    };

    editor.setCodeBlockLanguages(["SciKi"]);
    const { codeBlockManager } = Object.getPrototypeOf(editor).constructor;
    codeBlockManager.setReplacer("SciKi", scikiPluginReplacer);
}

const scikiExtendedMarkdownPlugin: PluginInfo = {
    pluginFn() {
        return;
    },
    renderer: {},
    parser: {
        image(node, { entering }) {
            if (entering) {
                const { destination } = node;
                if (destination.startsWith("#") && destination.endsWith("#")) {
                    node.destination = destination; //@todo replace with real image
                    node.orgDestination = destination;
                }
            }
        },
        link(node, { entering }) {
            if (entering) {
                const { destination } = node;
                if (destination.startsWith("@")) {
                    node.destination = route(
                        "wiki.show",
                        destination.substr(1)
                    );
                    node.orgDestination = destination;
                }
            }
        },
    },
};

const Editor: React.FC<Props> = ({ value, onChange }: Props) => {
    const editorRef = useRef<TUIEditor>(null);

    return (
        <>
            <TUIEditor
                initialValue={value}
                previewStyle="tab"
                height="600px"
                initialEditType="markdown"
                useCommandShortcut={true}
                usageStatistics={false}
                hideModeSwitch={true}
                extendedAutolinks={AutoLinksParser}
                onChange={() =>
                    onChange(
                        editorRef.current?.getInstance().getMarkdown() ?? ""
                    )
                }
                plugins={[
                    scikiPlugin,
                    tableMergedCell,
                    mermaidPlugin,
                    colorSyntax,
                    katexPlugin,
                    [codeSyntaxHighlight, { hljs }],
                    scikiExtendedMarkdownPlugin,
                ]}
                ref={editorRef}
            />
        </>
    );
};

export default Editor;
