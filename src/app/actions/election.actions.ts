"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";
import services from "@/lib/services";
import cloudinary from "@/lib/cloudinary";
import {
  CreateElectionData,
  SubmitElectionBallotData,
} from "@/lib/services/election.service";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
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

async function requireElectionManager() {
  const user = await requireUser();
  const permissions = await getRole({ user });
  if (!permissions.isExecutive) {
    throw new Error("Forbidden");
  }
  return user;
}

async function requireElectionAdmin() {
  const user = await requireUser();
  const permissions = await getRole({ user });
  if (!permissions.isAdmin) {
    throw new Error("Forbidden");
  }
  return user;
}

async function logElectionAction(userId: number, action: string, details: string) {
  await services.audit.create({
    userId,
    action,
    details,
  });
}

export async function createElectionAction(data: CreateElectionData) {
  try {
    const user = await requireElectionManager();
    const userId = getNumericUserId(user);
    const election = await services.election.createElection(data, userId);
    await logElectionAction(userId, "election.create", `Created election "${election.title}" (#${election.id})`);
    revalidatePath("/dashboard/elections");
    return { success: true, data: election };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create election" };
  }
}

export async function updateElectionAction(id: number, data: Partial<CreateElectionData>) {
  try {
    const user = await requireElectionManager();
    const userId = getNumericUserId(user);
    const election = await services.election.updateElection(id, data);
    await logElectionAction(userId, "election.update", `Updated election "${election.title}" (#${election.id})`);
    revalidatePath("/dashboard/elections");
    revalidatePath(`/dashboard/elections/${id}`);
    return { success: true, data: election };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update election" };
  }
}

export async function listElectionsAction() {
  try {
    await requireElectionManager();
    const elections = await services.election.listElections();
    return { success: true, data: elections };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch elections" };
  }
}

export async function getElectionByIdAction(id: number) {
  try {
    await requireElectionManager();
    const election = await services.election.getElectionById(id);
    return { success: true, data: election };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch election" };
  }
}

export async function submitElectionForApprovalAction(id: number) {
  try {
    const user = await requireElectionManager();
    const userId = getNumericUserId(user);
    const election = await services.election.submitElectionForApproval(id);
    await logElectionAction(userId, "election.submit_for_approval", `Submitted election "${election.title}" (#${id}) for approval`);
    revalidatePath("/dashboard/elections");
    revalidatePath(`/dashboard/elections/${id}`);
    return { success: true, data: election };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to submit election" };
  }
}

export async function approveElectionAction(id: number) {
  try {
    const user = await requireElectionAdmin();
    const userId = getNumericUserId(user);
    const election = await services.election.approveElection(id, userId);
    await logElectionAction(userId, "election.approve", `Approved election "${election.title}" (#${id})`);
    revalidatePath("/dashboard/elections");
    revalidatePath(`/dashboard/elections/${id}`);
    return { success: true, data: election };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to approve election" };
  }
}

export async function rejectElectionAction(id: number, reason: string) {
  try {
    const user = await requireElectionAdmin();
    const userId = getNumericUserId(user);
    const election = await services.election.rejectElection(id, reason);
    await logElectionAction(userId, "election.reject", `Rejected election "${election.title}" (#${id}) with reason: ${reason}`);
    revalidatePath("/dashboard/elections");
    revalidatePath(`/dashboard/elections/${id}`);
    return { success: true, data: election };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to reject election" };
  }
}

export async function activateElectionAction(id: number) {
  try {
    const user = await requireElectionAdmin();
    const userId = getNumericUserId(user);
    const election = await services.election.activateElection(id);
    await logElectionAction(userId, "election.activate", `Activated election "${election.title}" (#${id})`);
    revalidatePath("/dashboard/elections");
    revalidatePath(`/dashboard/elections/${id}`);
    revalidatePath("/elections");
    return { success: true, data: election };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to activate election" };
  }
}

export async function closeElectionAction(id: number) {
  try {
    const user = await requireElectionAdmin();
    const userId = getNumericUserId(user);
    const election = await services.election.closeElection(id);
    await logElectionAction(userId, "election.close", `Closed election "${election.title}" (#${id})`);
    revalidatePath("/dashboard/elections");
    revalidatePath(`/dashboard/elections/${id}`);
    revalidatePath("/elections");
    return { success: true, data: election };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to close election" };
  }
}

export async function publishElectionResultsAction(id: number) {
  try {
    const user = await requireElectionAdmin();
    const userId = getNumericUserId(user);
    const election = await services.election.publishElectionResults(id);
    await logElectionAction(userId, "election.publish_results", `Published results for election "${election.title}" (#${id})`);
    revalidatePath("/dashboard/elections");
    revalidatePath(`/dashboard/elections/${id}`);
    revalidatePath("/elections");
    return { success: true, data: election };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to publish election results" };
  }
}

export async function archiveElectionAction(id: number) {
  try {
    const user = await requireElectionAdmin();
    const userId = getNumericUserId(user);
    const election = await services.election.archiveElection(id);
    await logElectionAction(userId, "election.archive", `Archived election "${election.title}" (#${id})`);
    revalidatePath("/dashboard/elections");
    revalidatePath(`/dashboard/elections/${id}`);
    revalidatePath("/elections");
    revalidatePath("/elections/results");
    revalidatePath(`/elections/${id}/results`);
    return { success: true, data: election };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to archive election" };
  }
}

export async function getActiveElectionsForVotingAction() {
  try {
    const elections = await services.election.getActiveElectionsForVoting();
    return { success: true, data: elections };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch active elections" };
  }
}

export async function getElectionBallotAction(id: number) {
  try {
    const election = await services.election.getElectionBallot(id);
    return { success: true, data: election };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch election ballot" };
  }
}

export async function submitElectionBallotAction(data: SubmitElectionBallotData) {
  try {
    const ballot = await services.election.submitElectionBallot(data);
    revalidatePath("/elections");
    revalidatePath(`/elections/${data.electionId}`);
    return { success: true, data: ballot };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to submit ballot" };
  }
}

export async function getStudentElectionParticipationAction(electionId: number, studentId: string) {
  try {
    const participation = await services.election.getStudentElectionParticipation(electionId, studentId);
    return { success: true, data: participation };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch participation" };
  }
}

export async function getElectionResultsAction(id: number, includeHidden = false) {
  try {
    if (includeHidden) {
      await requireElectionManager();
    }
    const election = await services.election.getElectionResults(id, includeHidden);
    return { success: true, data: election };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch election results" };
  }
}

export async function getPublicElectionResultsListAction() {
  try {
    const elections = await services.election.getPublicElectionResultsList();
    return { success: true, data: elections };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch election results" };
  }
}

export async function searchElectionStudentsAction(query: string) {
  try {
    await requireElectionManager();
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      return { success: true, data: [] };
    }

    const result = await services.student.searchStudent(normalizedQuery);
    if (!result.success) {
      throw new Error(result.error || "Failed to search students");
    }

    const students = (result.data || []).slice(0, 8).map((student: any) => ({
      id: student.id,
      studentId: student.studentId,
      name: student.name || "",
      email: student.email || "",
      course: student.course || "",
      level: student.level || "",
    }));

    return { success: true, data: students };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to search students" };
  }
}

export async function uploadElectionCandidateImageAction(formData: FormData) {
  try {
    await requireElectionManager();

    const file = formData.get("image") as File | null;
    if (!file) {
      throw new Error("No image uploaded");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "election_candidates",
          public_id: `candidate_${Date.now()}`,
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return { success: true, data: { url: uploadResult.secure_url } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to upload candidate image" };
  }
}
