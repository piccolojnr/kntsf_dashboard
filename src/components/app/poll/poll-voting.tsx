"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Vote, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Eye,
  EyeOff
} from "lucide-react";
import { castVoteAction } from "@/app/actions/poll.actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { PollResults } from "./poll-results";

interface PollOption {
  id: number;
  text: string;
}

interface PollVotingProps {
  poll: {
    id: number;
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    showResults: boolean;
    options: PollOption[];
  };
  studentVote?: {
    id: number;
    optionId: number;
    option: {
      id: number;
      text: string;
    };
  } | null;
  onVoteSuccess?: () => void;
}

export function PollVoting({ poll, studentVote, onVoteSuccess }: PollVotingProps) {
  const [studentId, setStudentId] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(
    studentVote?.optionId || null
  );
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(!!studentVote);
  const [showResults, setShowResults] = useState(false);

  const now = new Date();
  const startAt = new Date(poll.startAt);
  const endAt = new Date(poll.endAt);
  
  const isActive = now >= startAt && now <= endAt;
  const isScheduled = now < startAt;
  const isClosed = now > endAt;

  const handleVote = async () => {
    if (!studentId.trim()) {
      toast.error("Please enter your student ID");
      return;
    }

    if (!selectedOption) {
      toast.error("Please select an option");
      return;
    }

    setIsVoting(true);
    try {
      const result = await castVoteAction({
        pollId: poll.id,
        optionId: selectedOption,
        studentId: studentId.trim()
      });

      if (result.success) {
        toast.success(hasVoted ? "Vote updated successfully" : "Vote cast successfully");
        setHasVoted(true);
        onVoteSuccess?.();
      } else {
        toast.error(result.error || "Failed to cast vote");
      }
    } catch (error) {
      console.error("Error casting vote:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsVoting(false);
    }
  };

  const getStatusInfo = () => {
    if (isScheduled) {
      return {
        icon: Calendar,
        message: `Poll starts on ${format(startAt, "MMM dd, yyyy 'at' h:mm a")}`,
        color: "text-blue-600"
      };
    } else if (isClosed) {
      return {
        icon: AlertCircle,
        message: `Poll ended on ${format(endAt, "MMM dd, yyyy 'at' h:mm a")}`,
        color: "text-gray-600"
      };
    } else {
      return {
        icon: Vote,
        message: `Poll ends on ${format(endAt, "MMM dd, yyyy 'at' h:mm a")}`,
        color: "text-green-600"
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

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
              <Badge className={isActive ? "bg-green-100 text-green-800" : isScheduled ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                {isActive ? "Active" : isScheduled ? "Scheduled" : "Closed"}
              </Badge>
              {poll.showResults && (
                <Badge variant="secondary" className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  Results Visible
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className={statusInfo.color}>
            <StatusIcon className="h-4 w-4" />
            <AlertDescription>{statusInfo.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Vote className="w-5 h-5 mr-2" />
              {hasVoted ? "Update Your Vote" : "Cast Your Vote"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID *</Label>
              <Input
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter your student ID"
                disabled={hasVoted}
              />
            </div>

            <div className="space-y-4">
              <Label>Select an option *</Label>
              <RadioGroup
                value={selectedOption?.toString() || ""}
                onValueChange={(value: string) => setSelectedOption(parseInt(value))}
              >
                {poll.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                    <Label htmlFor={option.id.toString()} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button
              onClick={handleVote}
              disabled={isVoting || !studentId.trim() || !selectedOption}
              className="w-full"
            >
              {isVoting ? (
                "Processing..."
              ) : hasVoted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Vote
                </>
              ) : (
                <>
                  <Vote className="w-4 h-4 mr-2" />
                  Cast Vote
                </>
              )}
            </Button>

            {hasVoted && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You have successfully voted for: <strong>{studentVote?.option.text}</strong>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {poll.showResults && (isClosed || hasVoted) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Poll Results
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResults(!showResults)}
              >
                {showResults ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Results
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show Results
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showResults && (
            <CardContent>
              <PollResults poll={poll as any} />
            </CardContent>
          )}
        </Card>
      )}

      {!poll.showResults && (isClosed || hasVoted) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <EyeOff className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Results Hidden</h3>
            <p className="text-muted-foreground text-center">
              Poll results are not visible to students for this poll.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
