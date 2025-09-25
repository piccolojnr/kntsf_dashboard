"use client";

import { useState,  } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Edit, 
  Trash2, 
  Merge, 
  AlertTriangle,
  Users,
  CheckCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner"; 

interface PollOption {
  id: number;
  text: string;
  createdBy?: {
    studentId: string;
    name?: string;
  };
  votes?: {
    id: number;
    student: {
      name?: string;
      studentId: string;
    };
  }[];
}

interface DynamicPollManagerProps {
  pollId: number;
  options: PollOption[];
  onOptionsChange: () => void;
}

export function DynamicPollManager({ options, onOptionsChange }: DynamicPollManagerProps) {
  const [editingOption, setEditingOption] = useState<PollOption | null>(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const handleEditOption = async () => {
    if (!editingOption || !editText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/polls/options/${editingOption.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Option updated successfully");
        setEditingOption(null);
        setEditText("");
        onOptionsChange();
      } else {
        toast.error(result.error || "Failed to update option");
      }
    } catch (error) {
      console.error("Error updating option:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/polls/options/${optionId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Option deleted successfully");
        onOptionsChange();
      } else {
        toast.error(result.error || "Failed to delete option");
      }
    } catch (error) {
      console.error("Error deleting option:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMergeOptions = async () => {
    if (selectedOptions.length !== 2) {
      toast.error("Please select exactly 2 options to merge");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/polls/merge-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceOptionId: selectedOptions[0],
          targetOptionId: selectedOptions[1],
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Options merged successfully. ${result.data.votesMoved} votes moved.`);
        setMergeDialogOpen(false);
        setSelectedOptions([]);
        onOptionsChange();
      } else {
        toast.error(result.error || "Failed to merge options");
      }
    } catch (error) {
      console.error("Error merging options:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVoteCount = (option: PollOption) => {
    return option.votes?.length || 0;
  };

  const totalVotes = options.reduce((sum, option) => sum + getVoteCount(option), 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Options</p>
                <p className="text-2xl font-bold">{options.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Total Votes</p>
                <p className="text-2xl font-bold">{totalVotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium">Avg. Votes/Option</p>
                <p className="text-2xl font-bold">
                  {options.length > 0 ? Math.round(totalVotes / options.length) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Options List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Poll Options</CardTitle>
            <div className="flex items-center space-x-2">
              <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={selectedOptions.length !== 2}
                  >
                    <Merge className="w-4 h-4 mr-2" />
                    Merge Selected
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Merge Options</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This will merge the selected options and move all votes from the source to the target option.
                        The source option will be marked as merged and hidden from students.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Label>Source Option (votes will be moved from this)</Label>
                      <p className="text-sm text-muted-foreground">
                        {options.find(opt => opt.id === selectedOptions[0])?.text}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Option (votes will be moved to this)</Label>
                      <p className="text-sm text-muted-foreground">
                        {options.find(opt => opt.id === selectedOptions[1])?.text}
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleMergeOptions} disabled={isSubmitting}>
                        {isSubmitting ? "Merging..." : "Merge Options"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {options.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No options yet</h3>
              <p className="text-muted-foreground">
                Students haven&apos;t added any options to this poll yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {options.map((option) => {
                const voteCount = getVoteCount(option);
                const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                const isSelected = selectedOptions.includes(option.id);

                return (
                  <div
                    key={option.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{option.text}</h4>
                          {option.createdBy && (
                            <Badge variant="outline" className="text-xs">
                              by {option.createdBy.name || option.createdBy.studentId}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{voteCount} votes</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        {voteCount > 0 && (
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedOptions(selectedOptions.filter(id => id !== option.id));
                            } else if (selectedOptions.length < 2) {
                              setSelectedOptions([...selectedOptions, option.id]);
                            }
                          }}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingOption(option);
                                setEditText(option.text);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Option</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="editText">Option Text</Label>
                                <Input
                                  id="editText"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  placeholder="Enter option text"
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setEditingOption(null)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleEditOption} 
                                  disabled={isSubmitting || !editText.trim()}
                                >
                                  {isSubmitting ? "Updating..." : "Update Option"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={voteCount > 0}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Option</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this option? This action cannot be undone.
                                {voteCount > 0 && (
                                  <span className="block mt-2 text-red-600">
                                    This option has {voteCount} vote(s) and cannot be deleted.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOption(option.id)}
                                disabled={voteCount > 0}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Option
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
