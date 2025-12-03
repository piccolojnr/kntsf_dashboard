import { hash } from "bcryptjs"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ServiceResponse } from "./types/common"
import { Prisma } from "@prisma/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// get initials
export function getInitials(name: string): string {
  const names = name.split(' ')
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase()
  }
  return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase()
}


export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}



export function handleError(error: unknown): ServiceResponse<any> {
  if (error instanceof Error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violation
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes('studentId')) {
          return { success: false, error: "A student with this ID already exists" };
        }
        if (target?.includes('email')) {
          return { success: false, error: "A student with this email already exists" };
        }
        return { success: false, error: "This record already exists" };
      }

      // Handle record not found
      if (error.code === 'P2025') {
        return { success: false, error: "Record not found" };
      }

      // Handle foreign key constraint violation
      if (error.code === 'P2003') {
        return { success: false, error: "Related record does not exist" };
      }

      // Handle invalid input data
      if (error.code === 'P2000') {
        return { success: false, error: "The provided value is too long for the field" };
      }

      // Generic database error
      return { success: false, error: "Database error occurred" };
    }
    return { success: false, error: error.message };
  }
  return { success: false, error: 'An unexpected error occurred' };
}