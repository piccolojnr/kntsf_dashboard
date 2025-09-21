'use server'

import prisma from '@/lib/prisma/client'
import { z } from "zod";

// Validation schemas
const createPollSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startAt: z.date(),
  endAt: z.date(),
  showResults: z.boolean().default(true),
  options: z.array(z.object({
    text: z.string().min(1, "Option text is required")
  })).min(2, "At least 2 options are required")
});

const updatePollSchema = createPollSchema.partial().extend({
  id: z.number()
});

const castVoteSchema = z.object({
  pollId: z.number(),
  optionId: z.number(),
  studentId: z.string()
});

export type CreatePollData = z.infer<typeof createPollSchema>;
export type UpdatePollData = z.infer<typeof updatePollSchema>;
export type CastVoteData = z.infer<typeof castVoteSchema>;

// Service functions
export async function createPoll(data: CreatePollData) {
  const validatedData = createPollSchema.parse(data);

  if (validatedData.endAt <= validatedData.startAt) {
    throw new Error("End date must be after start date");
  }

  return await prisma.poll.create({
    data: {
      title: validatedData.title,
      description: validatedData.description,
      startAt: validatedData.startAt,
      endAt: validatedData.endAt,
      showResults: validatedData.showResults,
      options: {
        create: validatedData.options.map(option => ({
          text: option.text
        }))
      }
    },
    include: {
      options: true,
      votes: {
        include: {
          student: true,
          option: true
        }
      }
    }
  });
};

export async function updatePoll(id: number, data: Partial<CreatePollData>) {
  const validatedData = updatePollSchema.parse({ id, ...data });

  if (validatedData.endAt && validatedData.startAt && validatedData.endAt <= validatedData.startAt) {
    throw new Error("End date must be after start date");
  }

  // If updating options, delete existing ones and create new ones
  if (validatedData.options) {
    await prisma.pollOption.deleteMany({
      where: { pollId: id }
    });
  }

  return await prisma.poll.update({
    where: { id },
    data: {
      title: validatedData.title,
      description: validatedData.description,
      startAt: validatedData.startAt,
      endAt: validatedData.endAt,
      showResults: validatedData.showResults,
      ...(validatedData.options && {
        options: {
          create: validatedData.options.map(option => ({
            text: option.text
          }))
        }
      })
    },
    include: {
      options: true,
      votes: {
        include: {
          student: true,
          option: true
        }
      }
    }
  });
};

export async function deletePoll(id: number) {
  return await prisma.poll.delete({
    where: { id }
  });
};

export async function closePoll(id: number) {
  return await prisma.poll.update({
    where: { id },
    data: {
      endAt: new Date() // Set end date to now
    },
    include: {
      options: true,
      votes: {
        include: {
          student: true,
          option: true
        }
      }
    }
  });
};

export async function castVote(data: CastVoteData) {
  const validatedData = castVoteSchema.parse(data);

  // Find student by studentId
  const student = await prisma.student.findUnique({
    where: { studentId: validatedData.studentId }
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Check if poll is still active
  const poll = await prisma.poll.findUnique({
    where: { id: validatedData.pollId },
    include: { options: true }
  });

  if (!poll) {
    throw new Error("Poll not found");
  }

  const now = new Date();
  if (now < poll.startAt || now > poll.endAt) {
    throw new Error("Poll is not currently active");
  }

  // Check if option belongs to poll
  const option = poll.options.find(opt => opt.id === validatedData.optionId);
  if (!option) {
    throw new Error("Invalid option for this poll");
  }

  // Upsert vote (insert or update)
  return await prisma.pollVote.upsert({
    where: {
      pollId_studentId: {
        pollId: validatedData.pollId,
        studentId: student.id
      }
    },
    update: {
      optionId: validatedData.optionId,
      updatedAt: new Date()
    },
    create: {
      pollId: validatedData.pollId,
      optionId: validatedData.optionId,
      studentId: student.id
    },
    include: {
      student: true,
      option: true,
      poll: true
    }
  });
};

export async function getActivePolls() {
  const now = new Date();

  return await prisma.poll.findMany({
    where: {
      startAt: { lte: now },
      endAt: { gte: now }
    },
    include: {
      options: true,
      votes: {
        include: {
          student: true,
          option: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export async function getAllPolls() {
  return await prisma.poll.findMany({
    include: {
      options: true,
      votes: {
        include: {
          student: true,
          option: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export async function getPollResults(id: number) {
  const poll = await prisma.poll.findUnique({
    where: { id },
    include: {
      options: {
        include: {
          votes: {
            include: {
              student: true
            }
          }
        }
      },
      votes: {
        include: {
          student: true,
          option: true
        }
      }
    }
  });

  if (!poll) {
    throw new Error("Poll not found");
  }

  // Calculate vote counts for each option
  const results = poll.options.map(option => ({
    id: option.id,
    text: option.text,
    voteCount: option.votes.length,
    percentage: poll.votes.length > 0 ? (option.votes.length / poll.votes.length) * 100 : 0
  }));

  return {
    ...poll,
    results,
    totalVotes: poll.votes.length
  };
};

export async function getPollById(id: number) {
  return await prisma.poll.findUnique({
    where: { id },
    include: {
      options: true,
      votes: {
        include: {
          student: true,
          option: true
        }
      }
    }
  });
};

export async function getStudentVote(pollId: number, studentId: string) {
  const student = await prisma.student.findUnique({
    where: { studentId }
  });

  if (!student) {
    return null;
  }

  return await prisma.pollVote.findUnique({
    where: {
      pollId_studentId: {
        pollId,
        studentId: student.id
      }
    },
    include: {
      option: true
    }
  });
};
