import { $generateHtmlFromNodes } from "@lexical/html";
import {
    createEditor,
    ParagraphNode,
    SerializedEditorState,
    TextNode,
} from "lexical";
import { HeadingNode, QuoteNode, } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";

export const initialValue = {
    root: {
        children: [
            {
                children: [
                    {
                        text: "",
                        type: "text",
                        format: "",
                        indent: 0,
                        direction: "ltr",
                        version: 1,
                    },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
            },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
    },
} as unknown as SerializedEditorState;

const getDefaultEditorState = (st: string): SerializedEditorState => {
    return {
        root: {
            children: [
                {
                    children: [
                        {
                            text: st,
                            type: "text",
                            format: "",
                            indent: 0,
                            direction: "ltr",
                            version: 1,
                        },
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "paragraph",
                    version: 1,
                },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1,
        },
    } as unknown as SerializedEditorState;
}

export const getInitialEditorState = (value: unknown): SerializedEditorState => {
    if (typeof value === "string" && value.trim().length > 0) {
        try {
            return JSON.parse(value);
        } catch {
            return getDefaultEditorState(value as string);
        }
    }

    // If value is already parsed
    if (typeof value === "object" && value !== null && "root" in value) {
        return value as SerializedEditorState;
    }

    return initialValue;
};


export function renderToHTML(serialized: SerializedEditorState): string {
    const editor = createEditor({
        namespace: "html-renderer",
        onError: (e) => console.error(e),
        nodes: [
            HeadingNode,
            QuoteNode,
            ListNode,
            ListItemNode,
            LinkNode,
            AutoLinkNode,
            ParagraphNode,
            TextNode,
        ], // same nodes you use in the editor
    });

    let html = "";
    editor.setEditorState(editor.parseEditorState(serialized));
    editor.update(() => {
        html = $generateHtmlFromNodes(editor, null);
    });

    return html;
}
export function getHTMLFromSerializedState(serialized: SerializedEditorState): string {
    return renderToHTML(serialized);
}

export function getHtmlFromString(value: string): string {
    const parsedValue = getInitialEditorState(value);
    return renderToHTML(parsedValue);
}