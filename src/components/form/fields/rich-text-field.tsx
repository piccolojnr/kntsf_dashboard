"use client";

import { ControllerRenderProps } from "react-hook-form";
import { SerializedEditorState } from "lexical";

import { Editor } from "@/components/blocks/editor-00/editor";
import { getInitialEditorState } from "./initial-value";

interface RichTextFieldProps {
  name: string;
  field: ControllerRenderProps<any, string>;
}

export function RichTextField({ name, field }: RichTextFieldProps) {
  const parsedValue: SerializedEditorState = getInitialEditorState(field.value);

  return (
    <div className="w-full space-y-2">
      <Editor
        editorSerializedState={parsedValue}
        onSerializedChange={(newVal) => {
          field.onChange(JSON.stringify(newVal));
        }}
      />

      {/* Hidden input for HTML forms or debugging */}
      <input
        type="hidden"
        name={name}
        ref={field.ref}
        value={JSON.stringify(parsedValue)}
      />
    </div>
  );
}
