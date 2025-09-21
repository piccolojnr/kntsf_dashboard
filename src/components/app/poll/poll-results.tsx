"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, Calendar, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";

interface PollResult {
  id: number;
  text: string;
  voteCount: number;
  percentage: number;
}

interface PollResultsProps {
  poll: {
    id: number;
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    showResults: boolean;
    createdAt: string;
    updatedAt: string;
    results: PollResult[];
    totalVotes: number;
  };
}

export function PollResults({ poll }: PollResultsProps) {
  const now = new Date();
  const startAt = new Date(poll.startAt);
  const endAt = new Date(poll.endAt);
  
  const isActive = now >= startAt && now <= endAt;
  const isScheduled = now < startAt;

  const getStatusBadge = () => {
    if (isScheduled) {
      return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
    } else if (isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{poll.title}</CardTitle>
              {poll.description && (
                <p className="text-muted-foreground">{poll.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              {poll.showResults ? (
                <Badge variant="secondary" className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  Results Visible
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center">
                  <EyeOff className="w-3 h-3 mr-1" />
                  Results Hidden
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(startAt, "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(endAt, "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Votes</p>
                <p className="text-sm text-muted-foreground">{poll.totalVotes}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Poll Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {poll.totalVotes === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No votes yet</h3>
              <p className="text-muted-foreground">
                {isActive ? "Votes will appear here as students participate." : "This poll has no votes."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {poll.results
                .sort((a, b) => b.voteCount - a.voteCount)
                .map((result, index) => (
                  <div key={result.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="font-medium">{result.text}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">
                          {result.voteCount} vote{result.voteCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({result.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress value={result.percentage} className="h-2" />
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {poll.showResults && poll.totalVotes > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vote Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {poll.results.map((result) => (
                <div key={result.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate">{result.text}</span>
                    <span className="text-muted-foreground">
                      {result.voteCount} ({result.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={result.percentage} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
