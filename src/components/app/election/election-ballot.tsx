"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  ThumbsDown,
  ThumbsUp,
  Vote,
} from "lucide-react";
import { submitElectionBallotAction } from "@/app/actions/election.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ElectionBallotProps {
  election: any;
}

export function ElectionBallot({ election }: ElectionBallotProps) {
  const [studentId, setStudentId] = useState("");
  const [candidateChoices, setCandidateChoices] = useState<
    Record<number, number>
  >({});
  const [approvalChoices, setApprovalChoices] = useState<
    Record<number, "APPROVE" | "REJECT">
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isComplete = useMemo(
    () =>
      election.positions.every((position: any) =>
        position.votingMode === "CANDIDATE_APPROVAL"
          ? Boolean(approvalChoices[position.id])
          : Boolean(candidateChoices[position.id]),
      ),
    [approvalChoices, candidateChoices, election.positions],
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitElectionBallotAction({
        electionId: election.id,
        studentId: studentId.trim(),
        choices: election.positions.map((position: any) =>
          position.votingMode === "CANDIDATE_APPROVAL"
            ? {
                positionId: position.id,
                approvalDecision: approvalChoices[position.id],
              }
            : {
                positionId: position.id,
                candidateId: candidateChoices[position.id],
              },
        ),
      });

      if (!result.success) {
        toast.error(result.error || "Unable to submit ballot");
        return;
      }

      setSubmitted(true);
      toast.success("Ballot submitted");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 pt-0 dark:border-slate-700">
        <CardHeader className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white p-10 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium">
              Anonymous ballot
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium">
              {election.positions.length} position
              {election.positions.length === 1 ? "" : "s"}
            </span>
          </div>
          <CardTitle className="text-2xl md:text-3xl">
            {election.title}
          </CardTitle>
          {election.description ? (
            <p className="text-slate-200">{election.description}</p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4 p-6 ">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              placeholder="Enter your verified student ID"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              disabled={submitted}
            />
          </div>

          {submitted ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Your ballot has been received. The system has recorded your
                participation without exposing your vote selections.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Choose one option for each position. For single-candidate
                positions, you are voting to approve or reject the candidate.
                If rejected, the position may be left vacant or filled through
                a separate process if necessary. Ballots are anonymous after
                submission.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {election.positions.map((position: any, positionIndex: number) => (
        <Card
          key={position.id}
          className="overflow-hidden border-slate-200 dark:border-slate-700"
        >
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700/50 dark:text-slate-300">
                Position {positionIndex + 1}
              </span>
              <CardTitle>{position.title}</CardTitle>
              {position.votingMode === "CANDIDATE_APPROVAL" ? (
                <Badge variant="outline">Approval Vote</Badge>
              ) : null}
            </div>
            {position.description ? (
              <p className="text-sm text-muted-foreground">
                {position.description}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {position.votingMode === "CANDIDATE_APPROVAL" ? (
              <div className="space-y-4">
                {position.approvalNotice ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {position.approvalNotice}
                    </AlertDescription>
                  </Alert>
                ) : null}
                {position.candidates[0] ? (
                  <div className="grid gap-5 rounded-2xl border bg-slate-50/70 p-5 md:grid-cols-[240px_1fr] dark:bg-slate-800/50">
                    <CandidatePortrait candidate={position.candidates[0]} />
                    <div className="space-y-2">
                      <p className="text-xl font-semibold">
                        {position.candidates[0].student.name ||
                          position.candidates[0].student.studentId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {position.candidates[0].student.studentId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {[
                          position.candidates[0].student.course,
                          position.candidates[0].student.level,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                      {position.candidates[0].bio ? (
                        <p className="text-sm text-muted-foreground">
                          {position.candidates[0].bio}
                        </p>
                      ) : null}
                      {position.candidates[0].manifesto ? (
                        <p className="text-sm leading-6">
                          {position.candidates[0].manifesto}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <RadioGroup
                  value={approvalChoices[position.id] || ""}
                  onValueChange={(value: "APPROVE" | "REJECT") =>
                    setApprovalChoices((current) => ({
                      ...current,
                      [position.id]: value,
                    }))
                  }
                  disabled={submitted}
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/10">
                      <RadioGroupItem
                        value="APPROVE"
                        id={`approve-${position.id}`}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-medium">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          Approve Candidate
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Support this candidate for the position.
                        </p>
                      </div>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4 shadow-sm transition hover:border-red-300 hover:bg-red-50/40 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-red-500 dark:hover:bg-red-500/10">
                      <RadioGroupItem
                        value="REJECT"
                        id={`reject-${position.id}`}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-medium">
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                          Reject Candidate
                        </div>
                        <p className="text-sm text-muted-foreground">
                          If rejected, the position may be left vacant or filled
                          through a separate process if necessary.
                        </p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>
            ) : (
              <RadioGroup
                value={candidateChoices[position.id]?.toString() || ""}
                onValueChange={(value) =>
                  setCandidateChoices((current) => ({
                    ...current,
                    [position.id]: Number(value),
                  }))
                }
                disabled={submitted}
              >
                <div className="grid gap-4">
                  {position.candidates.map((candidate: any) => (
                    <label
                      key={candidate.id}
                      className="grid cursor-pointer gap-5 rounded-2xl border bg-white p-5 shadow-sm transition hover:border-slate-400 hover:bg-slate-50/70 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-500 dark:hover:bg-slate-800/80 md:grid-cols-[32px_240px_1fr]"
                    >
                      <RadioGroupItem
                        value={candidate.id.toString()}
                        id={`candidate-${candidate.id}`}
                        className="mt-2"
                      />
                      <CandidatePortrait candidate={candidate} />
                      <div className="space-y-2">
                        <p className="text-xl font-semibold">
                          {candidate.student.name ||
                            candidate.student.studentId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {candidate.student.studentId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {[candidate.student.course, candidate.student.level]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                        {candidate.bio ? (
                          <p className="text-sm text-muted-foreground">
                            {candidate.bio}
                          </p>
                        ) : null}
                        {candidate.manifesto ? (
                          <p className="text-sm leading-6">
                            {candidate.manifesto}
                          </p>
                        ) : null}
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button
          disabled={
            !studentId.trim() || !isComplete || isSubmitting || submitted
          }
          onClick={handleSubmit}
        >
          <Vote className="mr-2 h-4 w-4" />
          {isSubmitting
            ? "Submitting..."
            : submitted
              ? "Submitted"
              : "Submit Ballot"}
        </Button>
      </div>
    </div>
  );
}

function CandidatePortrait({ candidate }: { candidate: any }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="relative aspect-[4/5] w-full">
        {candidate.photoUrl ? (
          <Image
            src={candidate.photoUrl}
            alt={`${candidate.student.name || candidate.student.studentId} profile`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-300">
            No image
          </div>
        )}
      </div>
    </div>
  );
}
