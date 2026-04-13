"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Archive, CheckCircle2, Eye, Play, Plus, RefreshCw, Send, Square, XCircle } from "lucide-react";
import {
  activateElectionAction,
  approveElectionAction,
  archiveElectionAction,
  closeElectionAction,
  listElectionsAction,
  publishElectionResultsAction,
  rejectElectionAction,
  submitElectionForApprovalAction,
} from "@/app/actions/election.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccessRoles } from "@/lib/role";

function formatStatus(status: string) {
  return status.toLowerCase().replaceAll("_", " ");
}

interface ElectionsClientProps {
  permissions: AccessRoles;
}

export function ElectionsClient({ permissions }: ElectionsClientProps) {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const fetchElections = async () => {
    setLoading(true);
    const result = await listElectionsAction();
    if (!result.success) {
      toast.error(result.error || "Unable to load elections");
      setLoading(false);
      return;
    }
    setElections(result.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const runAction = async (key: string, action: () => Promise<any>, successMessage: string) => {
    setBusyAction(key);
    const result = await action();
    if (!result.success) {
      toast.error(result.error || "Action failed");
      setBusyAction(null);
      return;
    }
    toast.success(successMessage);
    await fetchElections();
    setBusyAction(null);
  };

  if (loading) {
    return <div className="py-12 text-center"><RefreshCw className="mx-auto h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/elections/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Election
            </Link>
          </Button>
          <Button variant="outline" onClick={fetchElections}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        <Button asChild variant="outline">
          <Link href="/elections">Open Student Voting View</Link>
        </Button>
      </div>

      {elections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No elections found. Create a draft to start building a managed voting cycle.
          </CardContent>
        </Card>
      ) : (
        elections.map((election) => (
          <Card key={election.id}>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <CardTitle>{election.title}</CardTitle>
                  {election.description ? <p className="text-sm text-muted-foreground">{election.description}</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="capitalize">{formatStatus(election.status)}</Badge>
                    <Badge variant="outline">{election.positions.length} position{election.positions.length === 1 ? "" : "s"}</Badge>
                    <Badge variant="outline">{election.turnout} votes cast</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/elections/${election.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                  {election.status === "DRAFT" ? (
                    <>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/elections/${election.id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => runAction(`submit-${election.id}`, () => submitElectionForApprovalAction(election.id), "Election submitted for approval")}
                        disabled={busyAction === `submit-${election.id}`}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                      </Button>
                    </>
                  ) : null}
                  {permissions.isAdmin && election.status === "PENDING_APPROVAL" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => runAction(`approve-${election.id}`, () => approveElectionAction(election.id), "Election approved")}
                        disabled={busyAction === `approve-${election.id}`}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const reason = window.prompt("Reason for rejection", "Needs updated candidate list");
                          if (!reason) return;
                          runAction(`reject-${election.id}`, () => rejectElectionAction(election.id, reason), "Election returned to draft");
                        }}
                        disabled={busyAction === `reject-${election.id}`}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  ) : null}
                  {permissions.isAdmin && election.status === "APPROVED" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => runAction(`activate-${election.id}`, () => activateElectionAction(election.id), "Election activated")}
                        disabled={busyAction === `activate-${election.id}`}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Activate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runAction(`close-${election.id}`, () => closeElectionAction(election.id), "Election closed")}
                        disabled={busyAction === `close-${election.id}`}
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Close
                      </Button>
                    </>
                  ) : null}
                  {permissions.isAdmin && election.status === "ACTIVE" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runAction(`close-${election.id}`, () => closeElectionAction(election.id), "Election closed")}
                      disabled={busyAction === `close-${election.id}`}
                    >
                      <Square className="mr-2 h-4 w-4" />
                      Close
                    </Button>
                  ) : null}
                  {permissions.isAdmin && election.status === "CLOSED" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => runAction(`publish-${election.id}`, () => publishElectionResultsAction(election.id), "Election results published")}
                        disabled={busyAction === `publish-${election.id}`}
                      >
                        Publish Results
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runAction(`archive-${election.id}`, () => archiveElectionAction(election.id), "Election archived")}
                        disabled={busyAction === `archive-${election.id}`}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 text-sm md:grid-cols-4">
                <div>
                  <p className="font-medium">Start</p>
                  <p className="text-muted-foreground">{format(new Date(election.startAt), "MMM dd, yyyy h:mm a")}</p>
                </div>
                <div>
                  <p className="font-medium">End</p>
                  <p className="text-muted-foreground">{format(new Date(election.endAt), "MMM dd, yyyy h:mm a")}</p>
                </div>
                <div>
                  <p className="font-medium">Turnout</p>
                  <p className="text-muted-foreground">{election.turnoutRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="font-medium">Visibility</p>
                  <p className="text-muted-foreground">{election.resultVisibility === "AFTER_CLOSE" ? "After close" : "After manual publish"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
