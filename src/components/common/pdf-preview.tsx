"use client";
import React from "react";

export function PdfPreview({ url }: { url: string }) {
  return (
    <object
      data={url}
      type="application/pdf"
      className="w-full h-[70vh] border rounded"
    >
      <p>
        Alternative text - include a link <a href={url}>to the PDF!</a>
      </p>
    </object>
  );
}
