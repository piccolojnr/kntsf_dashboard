"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Lock,
  Calendar,
  Users,
  BarChart3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePollAction, closePollAction } from "@/app/actions/poll.actions";
import { toast } from "sonner";
import { format } from "date-fns";

interface Poll {
  id: number;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  showResults: boolean;
  createdAt: string;
  updatedAt: string;
  options: {
    id: number;
    text: string;
  }[];
  votes: {
    id: number;
    student: {
      name?: string;
      studentId: string;
    };
  }[];
}

interface PollListProps {
  polls: Poll[];
  onEdit: (poll: Poll) => void;
  onViewResults: (pollId: number) => void;
  onRefresh: () => void;
}

export function PollList({ polls, onEdit, onViewResults, onRefresh }: PollListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);

  const getPollStatus = (poll: Poll) => {
    const now = new Date();
    const startAt = new Date(poll.startAt);
    const endAt = new Date(poll.endAt);

    if (now < startAt) {
      return { status: "scheduled", color: "bg-blue-100 text-blue-800" };
    } else if (now > endAt) {
      return { status: "closed", color: "bg-gray-100 text-gray-800" };
    } else {
      return { status: "active", color: "bg-green-100 text-green-800" };
    }
  };

  const handleDelete = async (pollId: number) => {
    setDeletingId(pollId);
    try {
      const result = await deletePollAction(pollId);
      if (result.success) {
        toast.success("Poll deleted successfully");
        onRefresh();
      } else {
        toast.error(result.error || "Failed to delete poll");
      }
    } catch (error) {
      console.error("Error deleting poll:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClose = async (pollId: number) => {
    setClosingId(pollId);
    try {
      const result = await closePollAction(pollId);
      if (result.success) {
        toast.success("Poll closed successfully");
        onRefresh();
      } else {
        toast.error(result.error || "Failed to close poll");
      }
    } catch (error) {
      console.error("Error closing poll:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setClosingId(null);
    }
  };

  if (polls.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No polls found</h3>
          <p className="text-muted-foreground text-center">
            Create your first poll to start gathering student feedback.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {polls.map((poll) => {
        const pollStatus = getPollStatus(poll);
        const totalVotes = poll.votes.length;
        
        return (
          <Card key={poll.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{poll.title}</CardTitle>
                  {poll.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {poll.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={pollStatus.color}>
                    {pollStatus.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(poll)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewResults(poll.id)}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Results
                      </DropdownMenuItem>
                      {pollStatus.status === "active" && (
                        <DropdownMenuItem 
                          onClick={() => handleClose(poll.id)}
                          disabled={closingId === poll.id}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          {closingId === poll.id ? "Closing..." : "Close Poll"}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(poll.id)}
                        disabled={deletingId === poll.id}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deletingId === poll.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Start Date</p>
                    <p className="text-muted-foreground">
                      {format(new Date(poll.startAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">End Date</p>
                    <p className="text-muted-foreground">
                      {format(new Date(poll.endAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Total Votes</p>
                    <p className="text-muted-foreground">{totalVotes}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Options ({poll.options.length})</p>
                <div className="flex flex-wrap gap-2">
                  {poll.options.map((option) => (
                    <Badge key={option.id} variant="outline">
                      {option.text}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {poll.showResults ? (
                    <Badge variant="secondary">Results Visible</Badge>
                  ) : (
                    <Badge variant="outline">Results Hidden</Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewResults(poll.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
