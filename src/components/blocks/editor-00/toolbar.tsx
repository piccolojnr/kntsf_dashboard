import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin";
import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote";
import { FormatCheckList } from "@/components/editor/plugins/toolbar/block-format/format-check-list";
import { FormatBulletedList } from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list";
import { FormatNumberedList } from "@/components/editor/plugins/toolbar/block-format/format-numbered-list";
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading";
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph";
import { ElementFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/element-format-toolbar-plugin";
import { FontFamilyToolbarPlugin } from "@/components/editor/plugins/toolbar/font-family-toolbar-plugin";
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin";
import { FontSizeToolbarPlugin } from "@/components/editor/plugins/toolbar/font-size-toolbar-plugin";
import { LinkToolbarPlugin } from "@/components/editor/plugins/toolbar/link-toolbar-plugin";

export function Toolbar() {
  return (
    <ToolbarPlugin>
      {() => (
        <div className="sticky top-0 z-10 flex flex-wrap gap-2 overflow-auto border-b p-2 bg-background">
          {/* Group 2: Block Formatting */}
          <div className="flex items-center gap-2 border-l pl-2">
            <BlockFormatDropDown>
              <FormatParagraph />
              <FormatHeading levels={["h1", "h2", "h3"]} />
              <FormatNumberedList />
              <FormatBulletedList />
              <FormatCheckList />
              <FormatQuote />
            </BlockFormatDropDown>
            <ElementFormatToolbarPlugin />
          </div>

          {/* Group 3: Font Styling */}
          <div className="flex items-center gap-2 border-l pl-2">
            <FontFormatToolbarPlugin format="bold" />
            <FontFormatToolbarPlugin format="italic" />
            <FontFormatToolbarPlugin format="underline" />
            <FontFormatToolbarPlugin format="strikethrough" />
            <FontSizeToolbarPlugin />
            <FontFamilyToolbarPlugin />
          </div>

          {/* Group 4: Colors and Links */}
          <div className="flex items-center gap-2 border-l pl-2">
            <LinkToolbarPlugin />
          </div>
        </div>
      )}
    </ToolbarPlugin>
  );
}
