'use server'

import prisma from '@/lib/prisma/client'
import { z } from "zod";

// Validation schemas
const createPollSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["FIXED_OPTIONS", "DYNAMIC_OPTIONS"]).default("FIXED_OPTIONS"),
  startAt: z.date(),
  endAt: z.date(),
  showResults: z.boolean().default(true),
  options: z.array(z.object({
    text: z.string().min(1, "Option text is required")
  })).optional()
});

const updatePollSchema = createPollSchema.partial().extend({
  id: z.number(),
  forceUpdateOptions: z.boolean().optional() // Flag to explicitly allow option updates that clear votes
});

const castVoteSchema = z.object({
  pollId: z.number(),
  optionId: z.number(),
  studentId: z.string()
});

const addOptionSchema = z.object({
  pollId: z.number(),
  text: z.string().min(1, "Option text is required").max(500, "Option text too long"),
  studentId: z.string()
});

const updateOptionSchema = z.object({
  optionId: z.number(),
  text: z.string().min(1, "Option text is required").max(500, "Option text too long")
});

export type CreatePollData = z.infer<typeof createPollSchema>;
export type UpdatePollData = z.infer<typeof updatePollSchema>;
export type CastVoteData = z.infer<typeof castVoteSchema>;
export type AddOptionData = z.infer<typeof addOptionSchema>;
export type UpdateOptionData = z.infer<typeof updateOptionSchema>;

// Helper function to calculate text similarity (Levenshtein distance)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));

  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  return maxLength === 0 ? 1 : (maxLength - matrix[s2.length][s1.length]) / maxLength;
}

// Helper function to find similar options
export async function findSimilarOptions(pollId: number, text: string, threshold: number = 0.8) {
  const existingOptions = await prisma.pollOption.findMany({
    where: {
      pollId,
      status: "ACTIVE"
    },
    select: { id: true, text: true }
  });

  const similarOptions = existingOptions
    .map(option => ({
      ...option,
      similarity: calculateSimilarity(text, option.text)
    }))
    .filter(option => option.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);

  return similarOptions;
}

// Helper function to check if poll has votes
export async function checkPollHasVotes(pollId: number) {
  const voteCount = await prisma.pollVote.count({
    where: { pollId }
  });

  return {
    hasVotes: voteCount > 0,
    voteCount
  };
}

// Helper function to backup votes before deletion
export async function backupPollVotes(pollId: number) {
  const votes = await prisma.pollVote.findMany({
    where: { pollId },
    include: {
      student: {
        select: { studentId: true, name: true }
      },
      option: {
        select: { text: true }
      }
    }
  });

  return {
    pollId,
    backupDate: new Date().toISOString(),
    totalVotes: votes.length,
    votes: votes.map(vote => ({
      studentId: vote.student.studentId,
      studentName: vote.student.name,
      optionText: vote.option.text,
      votedAt: vote.createdAt
    }))
  };
}

// Service functions
export async function createPoll(data: CreatePollData) {
  const validatedData = createPollSchema.parse(data);

  if (validatedData.endAt <= validatedData.startAt) {
    throw new Error("End date must be after start date");
  }

  // For FIXED_OPTIONS polls, require at least 2 options
  if (validatedData.type === "FIXED_OPTIONS" && (!validatedData.options || validatedData.options.length < 2)) {
    throw new Error("Fixed options polls require at least 2 options");
  }

  return await prisma.poll.create({
    data: {
      title: validatedData.title,
      description: validatedData.description,
      type: validatedData.type,
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

export async function updatePoll(id: number, data: Partial<CreatePollData & { forceUpdateOptions?: boolean }>) {
  const validatedData = updatePollSchema.parse({ id, ...data });

  if (validatedData.endAt && validatedData.startAt && validatedData.endAt <= validatedData.startAt) {
    throw new Error("End date must be after start date");
  }

  // If updating options, check for existing votes first
  if (validatedData.options) {
    // Check if poll has existing votes
    const existingVotes = await prisma.pollVote.count({
      where: { pollId: id }
    });

    if (existingVotes > 0 && !validatedData.forceUpdateOptions) {
      throw new Error(
        `Cannot update poll options: This poll has ${existingVotes} existing vote(s). ` +
        "Updating options will permanently delete all votes. " +
        "To proceed anyway, set 'forceUpdateOptions' to true."
      );
    }

    // Backup votes before deletion if any exist
    let voteBackup = null;
    if (existingVotes > 0) {
      console.warn(`Backing up and deleting ${existingVotes} votes from poll ${id} due to option update`);
      voteBackup = await backupPollVotes(id);

      // You could save this backup to a file, database, or return it
      console.log('Vote backup created:', JSON.stringify(voteBackup, null, 2));
    }

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

// Safe update function that doesn't allow option updates
export async function updatePollSafe(id: number, data: Omit<Partial<CreatePollData>, 'options'>) {
  const validatedData = updatePollSchema.parse({ id, ...data });

  if (validatedData.endAt && validatedData.startAt && validatedData.endAt <= validatedData.startAt) {
    throw new Error("End date must be after start date");
  }

  // Explicitly exclude options from being updated
  return await prisma.poll.update({
    where: { id },
    data: {
      title: validatedData.title,
      description: validatedData.description,
      startAt: validatedData.startAt,
      endAt: validatedData.endAt,
      showResults: validatedData.showResults,
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
  const poll = await prisma.poll.findUnique({
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

  // participationRate calculation
  let participationRate = 0;
  if (poll) {
    const totalStudents = await prisma.student.count();
    const totalVotes = poll.votes.length;
    participationRate = totalStudents > 0 ? (totalVotes / totalStudents) * 100 : 0;
  }

  return {
    ...poll,
    participationRate
  };
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

// Add option to dynamic poll
export async function addPollOption(data: AddOptionData) {
  const validatedData = addOptionSchema.parse(data);

  // Find student by studentId
  const student = await prisma.student.findUnique({
    where: { studentId: validatedData.studentId }
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Check if poll exists and is dynamic
  const poll = await prisma.poll.findUnique({
    where: { id: validatedData.pollId }
  });

  if (!poll) {
    throw new Error("Poll not found");
  }

  if (poll.type !== "DYNAMIC_OPTIONS") {
    throw new Error("Only dynamic polls allow adding options");
  }

  // Check if poll is still active
  const now = new Date();
  if (now < poll.startAt || now > poll.endAt) {
    throw new Error("Poll is not currently active");
  }

  // Check for similar options
  const similarOptions = await findSimilarOptions(validatedData.pollId, validatedData.text, 0.9);
  if (similarOptions.length > 0) {
    throw new Error(`Similar option already exists: "${similarOptions[0].text}"`);
  }

  // Create the option
  return await prisma.pollOption.create({
    data: {
      text: validatedData.text,
      pollId: validatedData.pollId,
      createdById: student.id
    },
    include: {
      createdBy: {
        select: { studentId: true, name: true }
      }
    }
  });
};

// Update option (admin only)
export async function updatePollOption(data: UpdateOptionData) {
  const validatedData = updateOptionSchema.parse(data);

  // Check if option exists
  const existingOption = await prisma.pollOption.findUnique({
    where: { id: validatedData.optionId },
    include: { poll: true }
  });

  if (!existingOption) {
    throw new Error("Option not found");
  }

  // Check for similar options (excluding current option)
  const similarOptions = await findSimilarOptions(existingOption.pollId, validatedData.text, 0.9);
  const conflictingOptions = similarOptions.filter(opt => opt.id !== validatedData.optionId);

  if (conflictingOptions.length > 0) {
    throw new Error(`Similar option already exists: "${conflictingOptions[0].text}"`);
  }

  // Update the option
  return await prisma.pollOption.update({
    where: { id: validatedData.optionId },
    data: {
      text: validatedData.text,
      updatedAt: new Date()
    },
    include: {
      createdBy: {
        select: { studentId: true, name: true }
      }
    }
  });
};

// Delete option (admin only)
export async function deletePollOption(optionId: number) {
  const option = await prisma.pollOption.findUnique({
    where: { id: optionId },
    include: { votes: true }
  });

  if (!option) {
    throw new Error("Option not found");
  }

  if (option.votes.length > 0) {
    throw new Error(`Cannot delete option with ${option.votes.length} vote(s). Consider merging instead.`);
  }

  return await prisma.pollOption.delete({
    where: { id: optionId }
  });
};

// Merge options (admin only) - moves votes from source to target
export async function mergePollOptions(sourceOptionId: number, targetOptionId: number) {
  const sourceOption = await prisma.pollOption.findUnique({
    where: { id: sourceOptionId },
    include: { votes: true, poll: true }
  });

  const targetOption = await prisma.pollOption.findUnique({
    where: { id: targetOptionId },
    include: { votes: true }
  });

  if (!sourceOption || !targetOption) {
    throw new Error("One or both options not found");
  }

  if (sourceOption.pollId !== targetOption.pollId) {
    throw new Error("Options must be from the same poll");
  }

  // Move votes from source to target
  await prisma.pollVote.updateMany({
    where: { optionId: sourceOptionId },
    data: { optionId: targetOptionId }
  });

  // Mark source option as merged
  await prisma.pollOption.update({
    where: { id: sourceOptionId },
    data: { status: "MERGED" }
  });

  return {
    sourceOption: { ...sourceOption, status: "MERGED" },
    targetOption: { ...targetOption, voteCount: targetOption.votes.length + sourceOption.votes.length },
    votesMoved: sourceOption.votes.length
  };
};
