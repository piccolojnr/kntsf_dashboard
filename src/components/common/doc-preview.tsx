"use client";
import React from "react";
import dynamic from "next/dynamic";

// Dynamically import DocViewer to avoid SSR issues
const DocViewer = dynamic(() => import("react-doc-viewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[80vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  ),
});
export function DocPreview({ url }: { url: string }) {
  return (
    <DocViewer
      documents={[{ uri: url }]}
      theme={{
        primary: "#f97316",
        secondary: "#1e293b",
        tertiary: "#0f172a",
        text_primary: "#ffffff",
        text_secondary: "#94a3b8",
        text_tertiary: "#475569",
        disableThemeScrollbar: false,
      }}
      style={{
        width: "100%",
        height: "100%", // MUST be matched by parent
        overflow: "hidden",
      }}
      config={{
        header: {
          disableHeader: true,
          disableFileName: false,
          retainURLParams: false,
        },
      }}
    />
  );
}
