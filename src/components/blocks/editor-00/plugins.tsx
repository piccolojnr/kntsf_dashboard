import { useState } from "react";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import { ContentEditable } from "@/components/editor/editor-ui/content-editable";
import { Toolbar } from "./toolbar";

import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";

export function Plugins() {
  const [, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

  const handleRef = (elem: HTMLDivElement | null) => {
    if (elem) setFloatingAnchorElem(elem);
  };

  return (
    <div className="relative">
      <Toolbar />

      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div ref={handleRef}>
              <ContentEditable placeholder="Start typing ..." />
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ClickableLinkPlugin />
      </div>
    </div>
  );
}
