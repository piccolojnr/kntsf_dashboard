"use server";

import prisma from "@/lib/prisma/client";
import { z } from "zod";

const DEFAULT_APPROVAL_NOTICE =
  "This position has one candidate. You are voting to approve or reject the candidate. If rejected, the position may be left vacant or filled through a separate process if necessary.";

const candidateSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  bio: z.string().optional(),
  manifesto: z.string().optional(),
  photoUrl: z.string().optional(),
});

const positionSchema = z.object({
  title: z.string().min(1, "Position title is required"),
  description: z.string().optional(),
  seatCount: z.number().int().min(1).max(1).default(1),
  candidates: z.array(candidateSchema).min(1, "Each position requires at least one candidate"),
});

const createElectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startAt: z.date(),
  endAt: z.date(),
  resultVisibility: z.enum(["AFTER_PUBLISH", "AFTER_CLOSE"]).default("AFTER_PUBLISH"),
  positions: z.array(positionSchema).min(1, "At least one position is required"),
});

const updateElectionSchema = createElectionSchema.partial().extend({
  id: z.number(),
});

const ballotChoiceSchema = z
  .object({
    positionId: z.number(),
    candidateId: z.number().optional(),
    approvalDecision: z.enum(["APPROVE", "REJECT"]).optional(),
  })
  .refine((value) => value.candidateId || value.approvalDecision, {
    message: "Each ballot choice requires a candidate selection or approval decision",
  });

const submitBallotSchema = z.object({
  electionId: z.number(),
  studentId: z.string().min(1, "Student ID is required"),
  choices: z.array(ballotChoiceSchema).min(1, "At least one choice is required"),
});

export type CreateElectionData = z.infer<typeof createElectionSchema>;
export type UpdateElectionData = z.infer<typeof updateElectionSchema>;
export type SubmitElectionBallotData = z.infer<typeof submitBallotSchema>;

const electionInclude = {
  createdBy: {
    select: {
      id: true,
      name: true,
      username: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  },
  approvedBy: {
    select: {
      id: true,
      name: true,
      username: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  },
  positions: {
    orderBy: {
      sortOrder: "asc" as const,
    },
    include: {
      candidates: {
        where: {
          status: "APPROVED" as const,
        },
        include: {
          student: {
            select: {
              id: true,
              studentId: true,
              name: true,
              email: true,
              course: true,
              level: true,
            },
          },
          choices: {
            select: {
              id: true,
              approvalDecision: true,
            },
          },
        },
      },
    },
  },
  participations: {
    select: {
      id: true,
      studentId: true,
      submittedAt: true,
    },
  },
} as const;

function assertDateRange(startAt: Date, endAt: Date) {
  if (endAt <= startAt) {
    throw new Error("End date must be after start date");
  }
}

async function resolveCandidateStudentIds(positions: CreateElectionData["positions"]) {
  const requestedStudentIds = [...new Set(positions.flatMap((position) => position.candidates.map((candidate) => candidate.studentId.trim())))];
  const students = await prisma.student.findMany({
    where: {
      studentId: {
        in: requestedStudentIds,
      },
      deletedAt: null,
    },
    select: {
      id: true,
      studentId: true,
    },
  });

  const studentMap = new Map(students.map((student) => [student.studentId, student.id]));
  const missing = requestedStudentIds.filter((studentId) => !studentMap.has(studentId));
  if (missing.length > 0) {
    throw new Error(`Candidate student records not found: ${missing.join(", ")}`);
  }

  return studentMap;
}

function ensureDraftStatus(status: string) {
  if (status !== "DRAFT") {
    throw new Error("Only draft elections can be edited");
  }
}

function canViewResults(status: string, resultVisibility: string, publishedAt: Date | null) {
  if (status === "ARCHIVED") return false;
  if (status === "RESULTS_PUBLISHED") return true;
  if (resultVisibility === "AFTER_CLOSE" && (status === "CLOSED" || status === "RESULTS_PUBLISHED")) return true;
  return Boolean(publishedAt);
}

function getVotingMode(candidateCount: number) {
  return candidateCount === 1 ? "CANDIDATE_APPROVAL" : "CANDIDATE_SELECTION";
}

function getApprovalNotice(candidateCount: number) {
  return candidateCount === 1 ? DEFAULT_APPROVAL_NOTICE : null;
}

async function serializeElection(election: any) {
  const totalEligibleVoters = await prisma.student.count({
    where: { deletedAt: null },
  });
  const turnout = election.participations.length;

  return {
    ...election,
    totalEligibleVoters,
    turnout,
    turnoutRate: totalEligibleVoters > 0 ? (turnout / totalEligibleVoters) * 100 : 0,
    positions: election.positions.map((position: any) => {
      if (position.votingMode === "CANDIDATE_APPROVAL") {
        const candidate = position.candidates[0] ?? null;
        const yesCount = candidate
          ? candidate.choices.filter((choice: any) => choice.approvalDecision === "APPROVE").length
          : 0;
        const noCount = candidate
          ? candidate.choices.filter((choice: any) => choice.approvalDecision === "REJECT").length
          : 0;

        return {
          ...position,
          approvalStats: {
            yesCount,
            noCount,
            totalVotes: yesCount + noCount,
          },
          candidates: position.candidates.map((candidate: any) => ({
            ...candidate,
            voteCount: candidate.choices.length,
            yesCount: candidate.choices.filter((choice: any) => choice.approvalDecision === "APPROVE").length,
            noCount: candidate.choices.filter((choice: any) => choice.approvalDecision === "REJECT").length,
          })),
        };
      }

      return {
        ...position,
        candidates: position.candidates.map((candidate: any) => ({
          ...candidate,
          voteCount: candidate.choices.length,
        })),
      };
    }),
  };
}

async function syncPositionOutcomes(electionId: number) {
  const positions = await prisma.electionPosition.findMany({
    where: { electionId },
    include: {
      candidates: {
        where: { status: "APPROVED" },
        include: {
          choices: {
            select: {
              id: true,
              approvalDecision: true,
            },
          },
        },
      },
    },
  });

  await prisma.$transaction(
    positions.map((position) => {
      let outcomeStatus: "PENDING" | "ELECTED" | "APPOINTMENT_REQUIRED" = "PENDING";

      if (position.votingMode === "CANDIDATE_APPROVAL") {
        const candidate = position.candidates[0];
        if (candidate) {
          const yesCount = candidate.choices.filter((choice) => choice.approvalDecision === "APPROVE").length;
          const noCount = candidate.choices.filter((choice) => choice.approvalDecision === "REJECT").length;
          if (yesCount > 0 || noCount > 0) {
            outcomeStatus = yesCount > noCount ? "ELECTED" : "APPOINTMENT_REQUIRED";
          }
        }
      } else {
        const winningCandidate = position.candidates.reduce(
          (best, candidate) => (candidate.choices.length > best.choices.length ? candidate : best),
          position.candidates[0]
        );
        if (winningCandidate && winningCandidate.choices.length > 0) {
          outcomeStatus = "ELECTED";
        }
      }

      return prisma.electionPosition.update({
        where: { id: position.id },
        data: { outcomeStatus },
      });
    })
  );
}

export async function createElection(data: CreateElectionData, createdById: number) {
  const validated = createElectionSchema.parse(data);
  assertDateRange(validated.startAt, validated.endAt);
  const candidateStudentMap = await resolveCandidateStudentIds(validated.positions);

  const election = await prisma.election.create({
    data: {
      title: validated.title,
      description: validated.description,
      startAt: validated.startAt,
      endAt: validated.endAt,
      resultVisibility: validated.resultVisibility,
      createdById,
      positions: {
        create: validated.positions.map((position, index) => ({
          title: position.title,
          description: position.description,
          sortOrder: index,
          seatCount: position.seatCount,
          votingMode: getVotingMode(position.candidates.length),
          approvalNotice: getApprovalNotice(position.candidates.length),
          candidates: {
            create: position.candidates.map((candidate) => ({
              studentId: candidateStudentMap.get(candidate.studentId.trim())!,
              bio: candidate.bio,
              manifesto: candidate.manifesto,
              photoUrl: candidate.photoUrl,
            })),
          },
        })),
      },
    },
    include: electionInclude,
  });

  return serializeElection(election);
}

export async function updateElection(id: number, data: Partial<CreateElectionData>) {
  const validated = updateElectionSchema.parse({ id, ...data });
  const existing = await prisma.election.findUnique({
    where: { id },
    select: {
      status: true,
    },
  });

  if (!existing) {
    throw new Error("Election not found");
  }

  ensureDraftStatus(existing.status);

  const startAt = validated.startAt ?? undefined;
  const endAt = validated.endAt ?? undefined;
  if (startAt && endAt) {
    assertDateRange(startAt, endAt);
  }

  let candidateStudentMap: Map<string, number> | undefined;
  if (validated.positions) {
    candidateStudentMap = await resolveCandidateStudentIds(validated.positions as CreateElectionData["positions"]);
  }

  const election = await prisma.election.update({
    where: { id },
    data: {
      title: validated.title,
      description: validated.description,
      startAt: validated.startAt,
      endAt: validated.endAt,
      resultVisibility: validated.resultVisibility,
      ...(validated.positions
        ? {
            positions: {
              deleteMany: {},
              create: validated.positions.map((position, index) => ({
                title: position.title,
                description: position.description,
                sortOrder: index,
                seatCount: position.seatCount,
                votingMode: getVotingMode(position.candidates.length),
                approvalNotice: getApprovalNotice(position.candidates.length),
                candidates: {
                  create: position.candidates.map((candidate) => ({
                    studentId: candidateStudentMap!.get(candidate.studentId.trim())!,
                    bio: candidate.bio,
                    manifesto: candidate.manifesto,
                    photoUrl: candidate.photoUrl,
                  })),
                },
              })),
            },
          }
        : {}),
    },
    include: electionInclude,
  });

  return serializeElection(election);
}

export async function listElections() {
  const elections = await prisma.election.findMany({
    include: electionInclude,
    orderBy: [
      { createdAt: "desc" },
    ],
  });

  const totalEligibleVoters = await prisma.student.count({
    where: { deletedAt: null },
  });

  return elections.map((election) => ({
    ...election,
    totalEligibleVoters,
    turnout: election.participations.length,
    turnoutRate: totalEligibleVoters > 0 ? (election.participations.length / totalEligibleVoters) * 100 : 0,
    positions: election.positions.map((position) => ({
      ...position,
      candidates: position.candidates.map((candidate) => ({
        ...candidate,
        voteCount: candidate.choices.length,
      })),
    })),
  }));
}

export async function getElectionById(id: number) {
  const election = await prisma.election.findUnique({
    where: { id },
    include: electionInclude,
  });

  if (!election) {
    throw new Error("Election not found");
  }

  return serializeElection(election);
}

async function updateElectionStatus(id: number, status: string, extraData: Record<string, unknown> = {}) {
  const election = await prisma.election.update({
    where: { id },
    data: {
      status: status as never,
      ...extraData,
    },
    include: electionInclude,
  });

  return serializeElection(election);
}

export async function submitElectionForApproval(id: number) {
  const election = await prisma.election.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!election) throw new Error("Election not found");
  ensureDraftStatus(election.status);
  return updateElectionStatus(id, "PENDING_APPROVAL", { rejectionReason: null });
}

export async function approveElection(id: number, approvedById: number) {
  const election = await prisma.election.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!election) throw new Error("Election not found");
  if (election.status !== "PENDING_APPROVAL") {
    throw new Error("Only elections pending approval can be approved");
  }
  return updateElectionStatus(id, "APPROVED", {
    approvedById,
    approvedAt: new Date(),
    rejectionReason: null,
  });
}

export async function rejectElection(id: number, reason: string) {
  const election = await prisma.election.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!election) throw new Error("Election not found");
  if (election.status !== "PENDING_APPROVAL") {
    throw new Error("Only elections pending approval can be rejected");
  }
  return updateElectionStatus(id, "DRAFT", {
    rejectionReason: reason,
    approvedById: null,
    approvedAt: null,
  });
}

export async function activateElection(id: number) {
  const election = await prisma.election.findUnique({
    where: { id },
    select: { status: true, startAt: true, endAt: true },
  });
  if (!election) throw new Error("Election not found");
  if (election.status !== "APPROVED") {
    throw new Error("Only approved elections can be activated");
  }
  assertDateRange(election.startAt, election.endAt);
  return updateElectionStatus(id, "ACTIVE");
}

export async function closeElection(id: number) {
  const election = await prisma.election.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!election) throw new Error("Election not found");
  if (!["ACTIVE", "APPROVED"].includes(election.status)) {
    throw new Error("Only approved or active elections can be closed");
  }
  await updateElectionStatus(id, "CLOSED");
  await syncPositionOutcomes(id);
  return getElectionById(id);
}

export async function publishElectionResults(id: number) {
  const election = await prisma.election.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!election) throw new Error("Election not found");
  if (!["CLOSED", "RESULTS_PUBLISHED"].includes(election.status)) {
    throw new Error("Results can only be published for closed elections");
  }
  await updateElectionStatus(id, "RESULTS_PUBLISHED", {
    publishedAt: new Date(),
  });
  await syncPositionOutcomes(id);
  return getElectionById(id);
}

export async function archiveElection(id: number) {
  const election = await prisma.election.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!election) throw new Error("Election not found");
  if (!["CLOSED", "RESULTS_PUBLISHED"].includes(election.status)) {
    throw new Error("Only closed elections can be archived");
  }
  return updateElectionStatus(id, "ARCHIVED");
}

export async function getActiveElectionsForVoting() {
  const now = new Date();
  return prisma.election.findMany({
    where: {
      status: "ACTIVE",
      startAt: { lte: now },
      endAt: { gte: now },
    },
    orderBy: {
      startAt: "asc",
    },
    include: {
      positions: {
        orderBy: { sortOrder: "asc" },
        include: {
          candidates: {
            where: { status: "APPROVED" },
            include: {
              student: {
                select: {
                  studentId: true,
                  name: true,
                  course: true,
                  level: true,
                },
              },
            },
          },
        },
      },
      participations: {
        select: {
          studentId: true,
        },
      },
    },
  });
}

export async function getPublicElectionResultsList() {
  const elections = await prisma.election.findMany({
    where: {
      status: {
        in: ["CLOSED", "RESULTS_PUBLISHED"],
      },
    },
    include: electionInclude,
    orderBy: {
      endAt: "desc",
    },
  });

  const visibleElections = elections.filter((election) =>
    canViewResults(election.status, election.resultVisibility, election.publishedAt)
  );

  const totalEligibleVoters = await prisma.student.count({
    where: { deletedAt: null },
  });

  return visibleElections.map((election) => ({
    ...election,
    totalEligibleVoters,
    turnout: election.participations.length,
    turnoutRate: totalEligibleVoters > 0 ? (election.participations.length / totalEligibleVoters) * 100 : 0,
  }));
}

export async function getElectionBallot(id: number) {
  const election = await prisma.election.findUnique({
    where: { id },
    include: {
      positions: {
        orderBy: { sortOrder: "asc" },
        include: {
          candidates: {
            where: { status: "APPROVED" },
            include: {
              student: {
                select: {
                  studentId: true,
                  name: true,
                  course: true,
                  level: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!election) {
    throw new Error("Election not found");
  }

  const now = new Date();
  if (election.status !== "ACTIVE" || now < election.startAt || now > election.endAt) {
    throw new Error("Election is not currently active");
  }

  return election;
}

export async function getStudentElectionParticipation(electionId: number, studentId: string) {
  const student = await prisma.student.findFirst({
    where: { studentId, deletedAt: null },
    select: { id: true },
  });

  if (!student) {
    return null;
  }

  return prisma.electionParticipation.findUnique({
    where: {
      electionId_studentId: {
        electionId,
        studentId: student.id,
      },
    },
  });
}

export async function submitElectionBallot(data: SubmitElectionBallotData) {
  const validated = submitBallotSchema.parse(data);
  const student = await prisma.student.findFirst({
    where: {
      studentId: validated.studentId.trim(),
      deletedAt: null,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const election = await prisma.election.findUnique({
    where: { id: validated.electionId },
    include: {
      positions: {
        include: {
          candidates: {
            where: {
              status: "APPROVED",
            },
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!election) {
    throw new Error("Election not found");
  }

  const now = new Date();
  if (election.status !== "ACTIVE" || now < election.startAt || now > election.endAt) {
    throw new Error("Election is not currently active");
  }

  if (validated.choices.length !== election.positions.length) {
    throw new Error("A complete ballot requires one choice for each position");
  }

  const submittedPositionIds = new Set(validated.choices.map((choice) => choice.positionId));
  if (submittedPositionIds.size !== election.positions.length) {
    throw new Error("Duplicate or incomplete ballot positions detected");
  }

  const positionMap = new Map(
    election.positions.map((position) => [
      position.id,
      {
        votingMode: position.votingMode,
        candidateIds: new Set(position.candidates.map((candidate) => candidate.id)),
      },
    ])
  );

  for (const choice of validated.choices) {
    const positionDetails = positionMap.get(choice.positionId);
    if (!positionDetails) {
      throw new Error("Invalid position selection");
    }

    if (positionDetails.votingMode === "CANDIDATE_APPROVAL") {
      if (!choice.approvalDecision) {
        throw new Error("Approval-vote positions require an approve or reject decision");
      }
      if (positionDetails.candidateIds.size !== 1) {
        throw new Error("Approval-vote positions must have exactly one candidate");
      }
    } else if (!choice.candidateId || !positionDetails.candidateIds.has(choice.candidateId)) {
      throw new Error("Invalid candidate selection");
    }
  }

  const existingParticipation = await prisma.electionParticipation.findUnique({
    where: {
      electionId_studentId: {
        electionId: validated.electionId,
        studentId: student.id,
      },
    },
  });

  if (existingParticipation) {
    throw new Error("This student has already voted in the election");
  }

  return prisma.$transaction(async (tx) => {
    const ballot = await tx.electionBallot.create({
      data: {
        electionId: validated.electionId,
        choices: {
          create: validated.choices.map((choice) => ({
            positionId: choice.positionId,
            candidateId:
              choice.candidateId ??
              election.positions.find((position) => position.id === choice.positionId)?.candidates[0]?.id,
            approvalDecision: choice.approvalDecision,
          })),
        },
      },
      include: {
        choices: true,
      },
    });

    await tx.electionParticipation.create({
      data: {
        electionId: validated.electionId,
        studentId: student.id,
      },
    });

    return ballot;
  });
}

export async function getElectionResults(id: number, includeHidden = false) {
  const election = await prisma.election.findUnique({
    where: { id },
    include: electionInclude,
  });

  if (!election) {
    throw new Error("Election not found");
  }

  const visible = canViewResults(election.status, election.resultVisibility, election.publishedAt);
  if (!visible && !includeHidden) {
    throw new Error("Results are not available yet");
  }

  if (["CLOSED", "RESULTS_PUBLISHED"].includes(election.status)) {
    await syncPositionOutcomes(id);
    return getElectionById(id);
  }

  return serializeElection(election);
}
