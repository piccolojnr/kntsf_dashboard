"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Vote } from "lucide-react";
import { submitElectionBallotAction } from "@/app/actions/election.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ElectionBallotProps {
  election: any;
}

export function ElectionBallot({ election }: ElectionBallotProps) {
  const [studentId, setStudentId] = useState("");
  const [choices, setChoices] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isComplete = useMemo(
    () => election.positions.every((position: any) => Boolean(choices[position.id])),
    [choices, election.positions]
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitElectionBallotAction({
        electionId: election.id,
        studentId: studentId.trim(),
        choices: election.positions.map((position: any) => ({
          positionId: position.id,
          candidateId: choices[position.id],
        })),
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
              <AlertDescription>Choose one candidate for each position. Ballots are anonymous after submission.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {election.positions.map((position: any) => (
        <Card key={position.id}>
          <CardHeader>
            <CardTitle>{position.title}</CardTitle>
            {position.description ? <p className="text-sm text-muted-foreground">{position.description}</p> : null}
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={choices[position.id]?.toString() || ""}
              onValueChange={(value) => setChoices((current) => ({ ...current, [position.id]: Number(value) }))}
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
