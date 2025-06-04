import { prisma } from '../prisma/client'
import { Prisma, Student } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { log } from '../logger'

export interface StudentData {
  studentId: string
  name: string
  email: string
  course: string
  level: string
  number: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export class StudentService {
  static async createStudent(
    studentData: StudentData
  ): Promise<{ success: boolean; data?: Student; error?: string }> {
    try {
      const student = await prisma.student.create({
        data: studentData
      })
      return { success: true, data: student }
    } catch (error: any) {
      log.error('Failed to create student:', error)
      return { success: false, error: error.message }
    }
  }

  static async getStudents(params: {
    page?: number
    pageSize?: number
    search?: string
  }): Promise<{ success: boolean; data?: PaginatedResponse<Student>; error?: string }> {
    try {
      const { page = 1, pageSize = 10, search } = params
      const where: Prisma.StudentWhereInput = search
        ? {
            OR: [
              { name: { contains: search } },
              { studentId: { contains: search } },
              { email: { contains: search } },
              { course: { contains: search } }
            ]
          }
        : {}
      const skip = Math.max((page - 1) * pageSize, 0)
      const [total, students] = await Promise.all([
        prisma.student.count({ where }),
        prisma.student.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' }
        })
      ])

      return {
        success: true,
        data: {
          data: students,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    } catch (error: any) {
      log.error('Error fetching students:', error)
      return { success: false, error: error.message }
    }
  }

  static async getStudentById(studentId: string): Promise<{
    success: boolean
    data?: Student & { permits: { issuedBy: { username: string } | null }[] }
    error?: string
  }> {
    try {
      const student = await prisma.student.findUnique({
        where: { studentId: studentId },
        include: {
          permits: {
            include: {
              issuedBy: {
                select: {
                  username: true
                }
              }
            }
          }
        }
      })

      if (!student) {
        return { success: false, error: 'Student not found' }
      }

      return { success: true, data: student }
    } catch (error: any) {
      log.error('Failed to get student by ID:', error)
      return { success: false, error: error.message }
    }
  }

  static async updateStudent(
    studentId: string,
    studentData: Partial<StudentData>
  ): Promise<{ success: boolean; data?: Student; error?: string }> {
    try {
      const student = await prisma.student.update({
        where: { studentId: studentId },
        data: studentData
      })
      return { success: true, data: student }
    } catch (error: any) {
      log.error('Failed to update student:', error)
      return { success: false, error: error.message }
    }
  }

  static async deleteStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await prisma.student.delete({
        where: { studentId: studentId }
      })
      return { success: true }
    } catch (error: any) {
      log.error('Failed to delete student:', error)
      return { success: false, error: error.message }
    }
  }

  static async importStudents(fileContent: string): Promise<{
    success: boolean
    data?: { imported: number; failed: number; errors: string[] }
    error?: string
  }> {
    try {
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      })

      const errors: string[] = []
      let imported = 0
      let failed = 0

      for (const record of records) {
        try {
          await prisma.student.create({
            data: {
              studentId: record.studentId,
              name: record.name,
              email: record.email,
              course: record.course,
              level: record.level,
              number: record.number
            }
          })
          imported++
        } catch (error: any) {
          failed++
          log.error(`Failed to import student ${record.studentId}:`, error)
          errors.push(`Failed to import student ${record.studentId}: ${error.message}`)
        }
      }

      return {
        success: true,
        data: {
          imported,
          failed,
          errors
        }
      }
    } catch (error: any) {
      log.error('Error importing students:', error)
      return { success: false, error: error.message }
    }
  }
}
