"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getActiveElectionsForVotingAction } from "@/app/actions/election.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ElectionsVotingClient() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveElectionsForVotingAction().then((result) => {
      if (!result.success) {
        toast.error(result.error || "Unable to load elections");
        setLoading(false);
        return;
      }
      setElections(result.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="py-12 text-center">Loading elections...</div>;
  }

  if (elections.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          There are no active elections right now.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {elections.map((election) => (
        <Card key={election.id}>
          <CardHeader>
            <CardTitle>{election.title}</CardTitle>
            {election.description ? <p className="text-sm text-muted-foreground">{election.description}</p> : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3 md:gap-6">
              <span>Starts: {format(new Date(election.startAt), "MMM dd, yyyy h:mm a")}</span>
              <span>Ends: {format(new Date(election.endAt), "MMM dd, yyyy h:mm a")}</span>
              <span>{election.positions.length} position{election.positions.length === 1 ? "" : "s"}</span>
            </div>
            <Button asChild>
              <Link href={`/elections/${election.id}`}>Open Ballot</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
