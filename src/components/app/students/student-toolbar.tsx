"use client";

import { FileUp, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StudentToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddStudent: () => void;
  onImport: () => void;
  isExecutive: boolean;
}

export function StudentToolbar({
  searchQuery,
  onSearchChange,
  onAddStudent,
  onImport,
  isExecutive,
}: StudentToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold tracking-tight">Students</h2>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {isExecutive && (
          <>
            <Button onClick={onAddStudent}>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
            <div className="relative">
              <Input
                type="file"
                accept=".csv"
                className="hidden"
                id="import-file"
              />
              <Button variant="outline" onClick={onImport}>
                <FileUp className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
