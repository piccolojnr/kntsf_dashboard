"use client";

import { format } from "date-fns";
import { AlertTriangle, Award, BarChart3, Calendar, CheckCircle2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ElectionResultsProps {
  election: any;
}

function formatStatus(status: string) {
  return status.toLowerCase().replaceAll("_", " ");
}

export function ElectionResults({ election }: ElectionResultsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{election.title}</CardTitle>
              {election.description ? <p className="mt-2 text-muted-foreground">{election.description}</p> : null}
            </div>
            <Badge variant="secondary" className="capitalize">
              {formatStatus(election.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start</p>
                <p className="text-sm text-muted-foreground">{format(new Date(election.startAt), "MMM dd, yyyy h:mm a")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">End</p>
                <p className="text-sm text-muted-foreground">{format(new Date(election.endAt), "MMM dd, yyyy h:mm a")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Turnout</p>
                <p className="text-sm text-muted-foreground">
                  {election.turnout} / {election.totalEligibleVoters} ({election.turnoutRate.toFixed(1)}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Visibility</p>
                <p className="text-sm text-muted-foreground">{election.resultVisibility === "AFTER_CLOSE" ? "After close" : "Manual publish"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {election.positions.map((position: any) => {
        if (position.votingMode === "CANDIDATE_APPROVAL") {
          const candidate = position.candidates[0];
          const yesCount = position.approvalStats?.yesCount || 0;
          const noCount = position.approvalStats?.noCount || 0;
          const totalVotes = position.approvalStats?.totalVotes || 0;
          const approved = yesCount > noCount;
          const yesPercentage = totalVotes > 0 ? (yesCount / totalVotes) * 100 : 0;
          const noPercentage = totalVotes > 0 ? (noCount / totalVotes) * 100 : 0;

          return (
            <Card key={position.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    {position.title}
                  </CardTitle>
                  <Badge variant="outline">Approval Vote</Badge>
                  <Badge variant={approved ? "secondary" : "destructive"}>
                    {position.outcomeStatus === "ELECTED" ? "Approved" : position.outcomeStatus === "APPOINTMENT_REQUIRED" ? "Committee Appointment Required" : "Pending"}
                  </Badge>
                </div>
                {position.description ? <p className="text-sm text-muted-foreground">{position.description}</p> : null}
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate ? (
                  <div className="rounded-lg border p-4">
                    <p className="font-medium">{candidate.student.name || candidate.student.studentId}</p>
                    <p className="text-sm text-muted-foreground">{candidate.student.studentId}</p>
                  </div>
                ) : null}
                {position.approvalNotice ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    {position.approvalNotice}
                  </div>
                ) : null}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Yes / Approve
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {yesCount} ({yesPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={yesPercentage} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        No / Reject
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {noCount} ({noPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={noPercentage} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }

        const totalVotes = position.candidates.reduce((sum: number, candidate: any) => sum + candidate.voteCount, 0);
        const sortedCandidates = [...position.candidates].sort((left: any, right: any) => right.voteCount - left.voteCount);
        return (
          <Card key={position.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                {position.title}
              </CardTitle>
              {position.description ? <p className="text-sm text-muted-foreground">{position.description}</p> : null}
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedCandidates.map((candidate: any, index: number) => {
                const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
                return (
                  <div key={candidate.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{candidate.student.name || candidate.student.studentId}</p>
                        <p className="text-sm text-muted-foreground">{candidate.student.studentId}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          #{index + 1} · {candidate.voteCount} vote{candidate.voteCount === 1 ? "" : "s"}
                        </p>
                        <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
