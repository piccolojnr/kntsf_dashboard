import { Metadata } from "next";
import { DocumentClient } from "./client";

export const metadata: Metadata = {
  title: "Document Management | KNUTSFORD SRC",
  description: "Manage and organize important documents",
};

export default function DocumentPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Document Management</h1>
      </div>
      <DocumentClient />
    </div>
  );
}
