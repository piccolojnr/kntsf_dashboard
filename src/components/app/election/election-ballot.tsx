"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, ThumbsDown, ThumbsUp, Vote } from "lucide-react";
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
  const [candidateChoices, setCandidateChoices] = useState<Record<number, number>>({});
  const [approvalChoices, setApprovalChoices] = useState<Record<number, "APPROVE" | "REJECT">>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isComplete = useMemo(
    () =>
      election.positions.every((position: any) =>
        position.votingMode === "CANDIDATE_APPROVAL"
          ? Boolean(approvalChoices[position.id])
          : Boolean(candidateChoices[position.id])
      ),
    [approvalChoices, candidateChoices, election.positions]
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
              }
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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{election.title}</CardTitle>
          {election.description ? <p className="text-muted-foreground">{election.description}</p> : null}
        </CardHeader>
        <CardContent className="space-y-3">
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
              <AlertDescription>Your ballot has been received. The system has recorded your participation without exposing your vote selections.</AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Choose one option for each position. For single-candidate positions, you are voting to approve or reject the candidate. Ballots are anonymous after submission.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {election.positions.map((position: any) => (
        <Card key={position.id}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{position.title}</CardTitle>
              {position.votingMode === "CANDIDATE_APPROVAL" ? <Badge variant="outline">Approval Vote</Badge> : null}
            </div>
            {position.description ? <p className="text-sm text-muted-foreground">{position.description}</p> : null}
          </CardHeader>
          <CardContent>
            {position.votingMode === "CANDIDATE_APPROVAL" ? (
              <div className="space-y-4">
                {position.approvalNotice ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{position.approvalNotice}</AlertDescription>
                  </Alert>
                ) : null}
                {position.candidates[0] ? (
                  <div className="rounded-lg border p-4 space-y-1">
                    <p className="font-medium">{position.candidates[0].student.name || position.candidates[0].student.studentId}</p>
                    <p className="text-sm text-muted-foreground">{position.candidates[0].student.studentId}</p>
                    {position.candidates[0].bio ? <p className="text-sm text-muted-foreground">{position.candidates[0].bio}</p> : null}
                    {position.candidates[0].manifesto ? <p className="text-sm">{position.candidates[0].manifesto}</p> : null}
                  </div>
                ) : null}
                <RadioGroup
                  value={approvalChoices[position.id] || ""}
                  onValueChange={(value: "APPROVE" | "REJECT") =>
                    setApprovalChoices((current) => ({ ...current, [position.id]: value }))
                  }
                  disabled={submitted}
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
                      <RadioGroupItem value="APPROVE" id={`approve-${position.id}`} className="mt-1" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-medium">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          Approve Candidate
                        </div>
                        <p className="text-sm text-muted-foreground">Support this candidate for the position.</p>
                      </div>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
                      <RadioGroupItem value="REJECT" id={`reject-${position.id}`} className="mt-1" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-medium">
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                          Reject Candidate
                        </div>
                        <p className="text-sm text-muted-foreground">If rejected, the committee will appoint someone to fill the role.</p>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>
            ) : (
              <RadioGroup
                value={candidateChoices[position.id]?.toString() || ""}
                onValueChange={(value) => setCandidateChoices((current) => ({ ...current, [position.id]: Number(value) }))}
                disabled={submitted}
              >
                <div className="space-y-3">
                  {position.candidates.map((candidate: any) => (
                    <label key={candidate.id} className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
                      <RadioGroupItem value={candidate.id.toString()} id={`candidate-${candidate.id}`} className="mt-1" />
                      <div className="space-y-1">
                        <p className="font-medium">{candidate.student.name || candidate.student.studentId}</p>
                        <p className="text-sm text-muted-foreground">{candidate.student.studentId}</p>
                        {candidate.bio ? <p className="text-sm text-muted-foreground">{candidate.bio}</p> : null}
                        {candidate.manifesto ? <p className="text-sm">{candidate.manifesto}</p> : null}
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
        <Button disabled={!studentId.trim() || !isComplete || isSubmitting || submitted} onClick={handleSubmit}>
          <Vote className="mr-2 h-4 w-4" />
          {isSubmitting ? "Submitting..." : submitted ? "Submitted" : "Submit Ballot"}
        </Button>
      </div>
    </div>
  );
}
