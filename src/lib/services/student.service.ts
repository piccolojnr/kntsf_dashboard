'use server'
import prisma from '../prisma/client'
import { parse } from 'csv-parse/sync'
import { log } from '../logger'
import { ServiceResponse, PaginatedResponse, StudentDetails } from '../types/common'
import { Prisma, Student } from '@prisma/client'
import { handleError } from '../utils'


interface CreateStudentData {
  studentId: string
  name: string
  email: string
  course: string
  level: string
  number: string
}


export async function create(studentData: CreateStudentData): Promise<ServiceResponse<Student>> {
  try {
    const student = await prisma.student.create({
      data: studentData
    })
    return { success: true, data: student }
  } catch (error) {
    log.error('Failed to create student:', error)
    return handleError(error)
  }
}

export async function getAll(params: {
  page?: number
  pageSize?: number
  search?: string
  level?: string
  course?: string
}): Promise<PaginatedResponse<Student>> {
  try {
    const { page = 1, pageSize = 10, search, level, course } = params

    const where: Prisma.StudentWhereInput = {
      deletedAt: null,
      ...(search
        ? {
          OR: [
            { name: { contains: search } },
            { studentId: { contains: search } },
            { email: { contains: search } },
            { course: { contains: search } },
          ],
        }
        : {}),
      ...(level ? { level: level } : {}),
      ...(course ? { course: course } : {}),
    }
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
  } catch (error) {
    log.error('Error fetching students:', error)
    // if (error instanceof Error) {
    //   return { success: false, error: error.message }
    // }
    return handleError(error)
  }
}

export async function getDistinctFilters(): Promise<ServiceResponse<{ levels: string[]; courses: string[] }>> {
  try {
    const [levelsRaw, coursesRaw] = await Promise.all([
      prisma.student.groupBy({
        by: ['level'],
        where: { deletedAt: null },
      }),
      prisma.student.groupBy({
        by: ['course'],
        where: { deletedAt: null },
      }),
    ])

    const levels = levelsRaw
      .map((r) => r.level)
      .filter((v): v is string => !!v)
      .sort()

    const courses = coursesRaw
      .map((r) => r.course)
      .filter((v): v is string => !!v)
      .sort()

    return { success: true, data: { levels, courses } }
  } catch (error) {
    log.error('Failed to get distinct student filters:', error)
    return handleError(error)
  }
}

export async function getById(studentId: string): Promise<ServiceResponse<StudentDetails>> {
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
  } catch (error) {
    log.error('Failed to get student by ID:', error)
    return handleError(error)
  }
}

export async function update(
  studentId: string,
  studentData: Partial<Student>
): Promise<ServiceResponse<Student>> {
  try {
    const student = await prisma.student.update({
      where: { studentId: studentId },
      data: studentData
    })
    return { success: true, data: student }
  } catch (error) {
    log.error('Failed to update student:', error)
    return handleError(error)
  }
}

export async function deleteStudent(studentId: string): Promise<ServiceResponse<void>> {
  try {
    await prisma.$transaction(async (tx) => {
      const st = await tx.student.findUnique({
        where: { studentId: studentId }
      })
      if (!st) {
        throw new Error('Student not found')
      }
      await tx.permit.deleteMany({ where: { studentId: st.id } })
      await tx.studentIdea.deleteMany({ where: { studentId: st.id } })
      await tx.student.update({
        where: { studentId },
        data: {
          deletedAt: new Date(),
          studentId: `ARCHIVED-${st.studentId}-${Date.now()}`,
          name: `[ARCHIVED] ${st.name}`,
          email: `archived-${Date.now()}-${st.email}`,
        }
      })
    })
    return { success: true }
  } catch (error) {
    log.error('Failed to delete student:', error)
    return handleError(error)
  }
}

export async function importStudent(fileContent: string): Promise<ServiceResponse<{ imported: number; failed: number; errors: string[] }>> {
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
      } catch (error) {
        failed++
        log.error(`Failed to import student ${record.studentId}:`, error)
        if (error instanceof Error) {
          errors.push(`Failed to import student ${record.studentId}: ${error.message}`)
        } else {
          errors.push(`Failed to import student ${record.studentId}: Unknown error`)
        }
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
  } catch (error) {
    log.error('Error importing students:', error)
    return handleError(error)
  }
}


// search student by studentId or name
export async function searchStudent(
  query: string
): Promise<ServiceResponse<Student[]>> {
  try {
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { studentId: { contains: query } },
          { name: { contains: query } }
        ],
        deletedAt: null
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: students }
  } catch (error) {
    log.error('Failed to search students:', error)
    return handleError(error)
  }
}
