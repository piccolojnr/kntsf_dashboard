"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/auth";
import prisma from "@/lib/prisma/client";
import { getRole } from "@/lib/role";
import services from "@/lib/services";

async function requireStudentAccountManager() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const permissions = await getRole({ user });
  if (!permissions.isExecutive) {
    throw new Error("Forbidden");
  }

  return user;
}

function getNumericUserId(user: { id: number | string }) {
  const userId = Number(user.id);
  if (!Number.isInteger(userId)) {
    throw new Error("Invalid user ID");
  }
  return userId;
}

async function getAuditableUserId(user: { id: number | string }) {
  const userId = getNumericUserId(user);
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existingUser) {
    throw new Error("Current dashboard user was not found. Please sign out and sign in again.");
  }

  return existingUser.id;
}

function handleActionError(error: unknown, fallback: string) {
  return {
    success: false,
    error: error instanceof Error ? error.message : fallback,
  };
}

export async function getStudentAccountStatusAction(studentId: string) {
  try {
    await requireStudentAccountManager();
    return await services.studentAuth.getStudentAccountStatus(studentId);
  } catch (error) {
    return handleActionError(error, "Failed to load student account status");
  }
}

export async function activateStudentAccountAction(studentId: string) {
  try {
    const user = await requireStudentAccountManager();
    const response = await services.studentAuth.activateStudentAccount(
      studentId,
      await getAuditableUserId(user),
    );
    revalidatePath(`/dashboard/students/${studentId}`);
    return response;
  } catch (error) {
    return handleActionError(error, "Failed to activate student account");
  }
}

export async function sendStudentPasswordSetupLinkAction(studentId: string) {
  try {
    const user = await requireStudentAccountManager();
    const response = await services.studentAuth.sendStudentPasswordSetupLink(
      studentId,
      await getAuditableUserId(user),
    );
    revalidatePath(`/dashboard/students/${studentId}`);
    return response;
  } catch (error) {
    return handleActionError(error, "Failed to send setup link");
  }
}

export async function sendStudentPasswordResetLinkAction(studentId: string) {
  try {
    const user = await requireStudentAccountManager();
    const response = await services.studentAuth.sendStudentPasswordResetLink(
      studentId,
      await getAuditableUserId(user),
    );
    revalidatePath(`/dashboard/students/${studentId}`);
    return response;
  } catch (error) {
    return handleActionError(error, "Failed to send reset link");
  }
}

export async function disableStudentAccountAction(studentId: string) {
  try {
    const user = await requireStudentAccountManager();
    const response = await services.studentAuth.disableStudentAccount(
      studentId,
      await getAuditableUserId(user),
    );
    revalidatePath(`/dashboard/students/${studentId}`);
    return response;
  } catch (error) {
    return handleActionError(error, "Failed to disable student account");
  }
}

export async function validateStudentAuthTokenAction(token: string) {
  try {
    if (!token) {
      return { success: false, error: "Token is required" };
    }
    return await services.studentAuth.validateStudentAuthToken(token);
  } catch (error) {
    return handleActionError(error, "Failed to validate password setup link");
  }
}

export async function setStudentPasswordAction(token: string, password: string) {
  try {
    if (!token) {
      return { success: false, error: "Token is required" };
    }
    return await services.studentAuth.setStudentPassword(token, password);
  } catch (error) {
    return handleActionError(error, "Failed to set student password");
  }
}
