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
      return { success: false, error: "Database error occurred" };
    }
    return { success: false, error: error.message };
  }
  return { success: false, error: 'An unexpected error occurred' };
}