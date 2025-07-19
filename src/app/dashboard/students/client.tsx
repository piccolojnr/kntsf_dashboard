"use client";

import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CreatePermitForm from "@/components/app/permit/create-permit-form";
import { StudentForm } from "@/components/app/students/student-form";
import { StudentTable } from "@/components/app/students/student-table";
import { StudentToolbar } from "@/components/app/students/student-toolbar";
import { toast } from "sonner";
import { MyPagination } from "@/components/common/my-pagination";
import services from "@/lib/services";
import { StudentFormValues } from "@/lib/schemas/student-schema";
import { SessionUser } from "@/lib/types/common";
import { AccessRoles } from "@/lib/role";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface StudentsClientProps {
  user: SessionUser;
  permissions: AccessRoles;
}

export function StudentsClient({ permissions }: StudentsClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPermitDialogOpen, setIsPermitDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedStudentForPermit, setSelectedStudentForPermit] =
    useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const queryClient = useQueryClient();

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["students", currentPage, pageSize, debouncedSearch],
    queryFn: async () => {
      const response = await services.student.getAll({
        page: currentPage,
        pageSize,
        search: debouncedSearch,
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to load students");
      }
      return response.data;
    },
  });

  const handleSubmit = useCallback(
    async (data: StudentFormValues) => {
      if (!permissions.isExecutive) {
        toast.error("You don't have permission to manage students");
        return;
      }

      try {
        setIsSubmitting(true);
        const response = selectedStudent
          ? await services.student.update(selectedStudent.studentId, data)
          : await services.student.create(data);

        if (response.success) {
          toast.success(
            `Student ${selectedStudent ? "updated" : "created"} successfully`
          );
          setIsDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ["students"] });
        } else {
          toast.error(
            response.error ||
              `Failed to ${selectedStudent ? "update" : "create"} student`
          );
        }
      } catch (error) {
        console.error("Error submitting student form:", error);
        toast.error(
          `Failed to ${selectedStudent ? "update" : "create"} student`
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedStudent, permissions.isExecutive, queryClient]
  );

  const handleDelete = useCallback(
    async (studentId: string) => {
      if (!permissions.isExecutive) {
        toast.error("You don't have permission to manage students");
        return;
      }

      if (!confirm("Are you sure you want to delete this student?")) return;

      try {
        const response = await services.student.deleteStudent(studentId);
        if (response.success) {
          toast.success("Student deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["students"] });
        } else {
          toast.error(response.error || "Failed to delete student");
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error("Failed to delete student");
      }
    },
    [permissions.isExecutive, queryClient]
  );

  const handleImport = useCallback(async () => {
    if (!permissions.isExecutive) {
      toast.error("You don't have permission to manage students");
      return;
    }

    const fileInput = document.getElementById(
      "import-file"
    ) as HTMLInputElement;
    fileInput?.click();
  }, [permissions.isExecutive]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const content = await file.text();
        const response = await services.student.importStudent(content);

        if (response.success && response.data) {
          toast.success(
            `Successfully imported ${response.data.imported} students. ${response.data.failed} failed.`
          );
          if (response.data.errors.length > 0) {
            console.error("Import errors:", response.data.errors);
          }
          queryClient.invalidateQueries({ queryKey: ["students"] });
        } else {
          toast.error(response.error || "Failed to import students");
        }
      } catch (error) {
        console.error("Error importing students:", error);
        toast.error("Failed to import students");
      }

      e.target.value = "";
    },
    [queryClient]
  );

  const handleEdit = useCallback(
    (student: any) => {
      if (!permissions.isExecutive) {
        toast.error("You don't have permission to manage students");
        return;
      }

      setSelectedStudent(student);
      setIsDialogOpen(true);
    },
    [permissions.isExecutive]
  );

  const handleAddStudent = useCallback(() => {
    if (!permissions.isExecutive) {
      toast.error("You don't have permission to manage students");
      return;
    }

    setSelectedStudent(null);
    setIsDialogOpen(true);
  }, [permissions.isExecutive]);

  const handleCreatePermit = useCallback((student: any) => {
    setSelectedStudentForPermit(student);
    setIsPermitDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedStudent(null);
    }
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  return (
    <div className="space-y-4">
      <StudentToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onAddStudent={handleAddStudent}
        onImport={handleImport}
        isExecutive={permissions.isExecutive}
      />

      <Input
        type="file"
        accept=".csv"
        className="hidden"
        id="import-file"
        onChange={handleFileChange}
      />

      <StudentTable
        students={studentsData?.data || []}
        isLoading={isLoading}
        isExecutive={permissions.isExecutive}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreatePermit={handleCreatePermit}
      />

      <MyPagination
        currentPage={currentPage}
        totalPages={studentsData?.totalPages || 1}
        onPageChange={setCurrentPage}
        itemsPerPage={pageSize}
        onItemsPerPageChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent ? "Edit Student" : "Add Student"}
            </DialogTitle>
            <DialogDescription>
              {selectedStudent
                ? "Update student information"
                : "Add a new student to the system"}
            </DialogDescription>
          </DialogHeader>
          <StudentForm
            student={selectedStudent}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {permissions.isExecutive && (
        <Dialog open={isPermitDialogOpen} onOpenChange={setIsPermitDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Permit</DialogTitle>
              <DialogDescription>
                Create a new permit for a student
              </DialogDescription>
            </DialogHeader>
            <CreatePermitForm
              onSuccess={() => {
                setIsPermitDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["students"] });
              }}
              setIsDialogOpen={setIsPermitDialogOpen}
              studentId={selectedStudentForPermit?.studentId || ""}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
