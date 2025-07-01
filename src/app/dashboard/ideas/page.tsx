import { Metadata } from "next";
import { IdeaClient } from "./client";

export const metadata: Metadata = {
  title: "Student Ideas | KNUTSFORD SRC",
  description: "Manage and review student ideas and suggestions",
};

export default function IdeaPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Ideas</h1>
      </div>
      <IdeaClient />
    </div>
  );
}
