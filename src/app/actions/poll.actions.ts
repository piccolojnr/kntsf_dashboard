"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/auth";
import services from "@/lib/services";
import { CreatePollData, CastVoteData } from "@/lib/services/poll.service";

export async function createPollAction(data: CreatePollData) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        const poll = await services.poll.createPoll(data);



        revalidatePath("/dashboard/polls");
        return { success: true, data: poll };
    } catch (error) {
        console.error("Error creating poll:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create poll"
        };
    }
}

export async function updatePollAction(id: number, data: Partial<CreatePollData & { forceUpdateOptions?: boolean }>) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        const poll = await services.poll.updatePoll(id, data);

        revalidatePath("/dashboard/polls");
        revalidatePath(`/dashboard/polls/${id}`);
        return { success: true, data: poll };
    } catch (error) {
        console.error("Error updating poll:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update poll"
        };
    }
}

export async function deletePollAction(id: number) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        const poll = await services.poll.getPollById(id);
        if (!poll) {
            throw new Error("Poll not found");
        }

        await services.poll.deletePoll(id);



        revalidatePath("/dashboard/polls");
        return { success: true };
    } catch (error) {
        console.error("Error deleting poll:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete poll"
        };
    }
}

export async function closePollAction(id: number) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        const poll = await services.poll.closePoll(id);


        revalidatePath("/dashboard/polls");
        revalidatePath(`/dashboard/polls/${id}`);
        revalidatePath("/polls");
        return { success: true, data: poll };
    } catch (error) {
        console.error("Error closing poll:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to close poll"
        };
    }
}

export async function castVoteAction(data: CastVoteData) {
    try {
        const vote = await services.poll.castVote(data);

        revalidatePath("/polls");
        revalidatePath(`/polls/${data.pollId}`);
        return { success: true, data: vote };
    } catch (error) {
        console.error("Error casting vote:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to cast vote"
        };
    }
}

export async function getActivePollsAction() {
    try {
        const polls = await services.poll.getActivePolls();
        return { success: true, data: polls };
    } catch (error) {
        console.error("Error fetching active polls:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch polls"
        };
    }
}

export async function getAllPollsAction() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        const polls = await services.poll.getAllPolls();
        return { success: true, data: polls };
    } catch (error) {
        console.error("Error fetching all polls:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch polls"
        };
    }
}

export async function getPollResultsAction(id: number) {
    try {
        const results = await services.poll.getPollResults(id);
        return { success: true, data: results };
    } catch (error) {
        console.error("Error fetching poll results:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch poll results"
        };
    }
}

export async function updatePollSafeAction(id: number, data: Omit<Partial<CreatePollData>, 'options'>) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Unauthorized");
        }

        const poll = await services.poll.updatePollSafe(id, data);

        revalidatePath("/dashboard/polls");
        revalidatePath(`/dashboard/polls/${id}`);
        return { success: true, data: poll };
    } catch (error) {
        console.error("Error updating poll safely:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update poll"
        };
    }
}

export async function checkPollHasVotesAction(pollId: number) {
    try {
        const result = await services.poll.checkPollHasVotes(pollId);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error checking poll votes:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to check poll votes"
        };
    }
}

export async function getStudentVoteAction(pollId: number, studentId: string) {
    try {
        const vote = await services.poll.getStudentVote(pollId, studentId);
        return { success: true, data: vote };
    } catch (error) {
        console.error("Error fetching student vote:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch student vote"
        };
    }
}
