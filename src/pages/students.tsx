'use client'

import type { Student } from '@prisma/client'
import type React from 'react'
import { useEffect, useState } from 'react'
import { StudentFormValues } from '../lib/schemas/student-schema'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import CreatePermitForm from './permit/create-permit-form'
import { StudentForm } from './students/student-form'
import { StudentTable } from './students/student-table'
import { StudentToolbar } from './students/student-toolbar'
import { toast } from 'sonner'
import { usePermissions } from '@/hooks/use-permissions'
import { MyPagination } from '@/components/common/my-pagination'

export function Students() {
  const permissions = usePermissions()
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPermitDialogOpen, setIsPermitDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedStudentForPermit, setSelectedStudentForPermit] = useState<Student | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery])

  const loadStudents = async () => {
    try {
      setIsLoading(true)
      const response = await window.api.student.getAll({
        page: currentPage,
        pageSize,
        search: searchQuery
      })
      if (response.success && response.data) {
        setStudents(response.data.data)
        setTotalPages(response.data.totalPages)
      } else {
        console.error('Failed to load students:', response.error)
        toast.error(response.error || 'Failed to load students')
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to load students')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: StudentFormValues) => {
    if (!permissions.canManageStudents()) {
      toast.error("You don't have permission to manage students")
      return
    }

    try {
      setIsSubmitting(true)
      const response = selectedStudent
        ? await window.api.student.update(selectedStudent.studentId, data)
        : await window.api.student.create(data)

      if (response.success) {
        toast.success(`Student ${selectedStudent ? 'updated' : 'created'} successfully`)
        setIsDialogOpen(false)
        loadStudents()
      } else {
        toast.error(response.error || `Failed to ${selectedStudent ? 'update' : 'create'} student`)
      }
    } catch (error) {
      console.error('Error submitting student form:', error)
      toast.error(`Failed to ${selectedStudent ? 'update' : 'create'} student`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (studentId: string) => {
    if (!permissions.canManageStudents()) {
      toast.error("You don't have permission to manage students")
      return
    }

    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const response = await window.api.student.delete(studentId)
      if (response.success) {
        toast.success('Student deleted successfully')
        loadStudents()
      } else {
        toast.error(response.error || 'Failed to delete student')
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      toast.error('Failed to delete student')
    }
  }

  const handleImport = async () => {
    if (!permissions.canManageStudents()) {
      toast.error("You don't have permission to manage students")
      return
    }

    const fileInput = document.getElementById('import-file') as HTMLInputElement
    fileInput?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const response = await window.api.student.import(content)

      if (response.success && response.data) {
        toast.success(
          `Successfully imported ${response.data.imported} students. ${response.data.failed} failed.`
        )
        if (response.data.errors.length > 0) {
          console.error('Import errors:', response.data.errors)
        }
        loadStudents()
      } else {
        toast.error(response.error || 'Failed to import students')
      }
    } catch (error) {
      console.error('Error importing students:', error)
      toast.error('Failed to import students')
    }

    // Reset the file input
    e.target.value = ''
  }

  const handleEdit = (student: Student) => {
    if (!permissions.canManageStudents()) {
      toast.error("You don't have permission to manage students")
      return
    }

    setSelectedStudent(student)
    setIsDialogOpen(true)
  }

  const handleAddStudent = () => {
    if (!permissions.canManageStudents()) {
      toast.error("You don't have permission to manage students")
      return
    }

    setSelectedStudent(null)
    setIsDialogOpen(true)
  }

  const handleCreatePermit = (student: Student) => {
    setSelectedStudentForPermit(student)
    setIsPermitDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setSelectedStudent(null)
    }
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page on new search
  }

  return (
    <div className="space-y-4">
      <StudentToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onAddStudent={handleAddStudent}
        onImport={handleImport}
        canManageStudents={permissions.canManageStudents()}
      />

      <Input
        type="file"
        accept=".csv"
        className="hidden"
        id="import-file"
        onChange={handleFileChange}
      />

      <StudentTable
        students={students}
        isLoading={isLoading}
        canManageStudents={permissions.canManageStudents()}
        canCreatePermits={permissions.canCreatePermits()}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreatePermit={handleCreatePermit}
      />

      <MyPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
            <DialogDescription>
              {selectedStudent ? 'Update student information' : 'Add a new student to the system'}
            </DialogDescription>
          </DialogHeader>
          <StudentForm
            student={selectedStudent}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {permissions.canCreatePermits() && (
        <Dialog open={isPermitDialogOpen} onOpenChange={setIsPermitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Permit</DialogTitle>
              <DialogDescription>Create a new permit for a student</DialogDescription>
            </DialogHeader>
            <CreatePermitForm
              onSuccess={() => {
                setIsPermitDialogOpen(false)
              }}
              setIsDialogOpen={setIsPermitDialogOpen}
              studentId={selectedStudentForPermit?.studentId || ''}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
