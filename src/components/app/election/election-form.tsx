"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createElectionAction, updateElectionAction } from "@/app/actions/election.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CandidateForm = {
  studentId: string;
  bio: string;
  manifesto: string;
  photoUrl: string;
};

type PositionForm = {
  title: string;
  description: string;
  candidates: CandidateForm[];
};

type ElectionFormData = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  resultVisibility: "AFTER_PUBLISH" | "AFTER_CLOSE";
  positions: PositionForm[];
};

interface ElectionFormProps {
  initialData?: {
    id: number;
    title: string;
    description?: string | null;
    startAt: string;
    endAt: string;
    resultVisibility: "AFTER_PUBLISH" | "AFTER_CLOSE";
    positions: Array<{
      title: string;
      description?: string | null;
      candidates: Array<{
        student: {
          studentId: string;
        };
        bio?: string | null;
        manifesto?: string | null;
        photoUrl?: string | null;
      }>;
    }>;
  };
  onSuccess?: () => void;
}

const emptyCandidate = (): CandidateForm => ({
  studentId: "",
  bio: "",
  manifesto: "",
  photoUrl: "",
});

const emptyPosition = (): PositionForm => ({
  title: "",
  description: "",
  candidates: [emptyCandidate()],
});

function toInputDate(date: string) {
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
}

export function ElectionForm({ initialData, onSuccess }: ElectionFormProps) {
  const [form, setForm] = useState<ElectionFormData>({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    resultVisibility: "AFTER_PUBLISH",
    positions: [emptyPosition()],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (!initialData) return;
    setForm({
      title: initialData.title,
      description: initialData.description ?? "",
      startAt: toInputDate(initialData.startAt),
      endAt: toInputDate(initialData.endAt),
      resultVisibility: initialData.resultVisibility,
      positions: initialData.positions.map((position) => ({
        title: position.title,
        description: position.description ?? "",
        candidates: position.candidates.map((candidate) => ({
          studentId: candidate.student.studentId,
          bio: candidate.bio ?? "",
          manifesto: candidate.manifesto ?? "",
          photoUrl: candidate.photoUrl ?? "",
        })),
      })),
    });
  }, [initialData]);

  const canSubmit = useMemo(() => {
    if (!form.title.trim() || !form.startAt || !form.endAt || form.positions.length === 0) {
      return false;
    }
    return form.positions.every(
      (position) =>
        position.title.trim() &&
        position.candidates.length > 0 &&
        position.candidates.every((candidate) => candidate.studentId.trim())
    );
  }, [form]);

  const updatePosition = (index: number, patch: Partial<PositionForm>) => {
    setForm((current) => ({
      ...current,
      positions: current.positions.map((position, positionIndex) =>
        positionIndex === index ? { ...position, ...patch } : position
      ),
    }));
  };

  const updateCandidate = (positionIndex: number, candidateIndex: number, patch: Partial<CandidateForm>) => {
    setForm((current) => ({
      ...current,
      positions: current.positions.map((position, pIndex) =>
        pIndex === positionIndex
          ? {
              ...position,
              candidates: position.candidates.map((candidate, cIndex) =>
                cIndex === candidateIndex ? { ...candidate, ...patch } : candidate
              ),
            }
          : position
      ),
    }));
  };

  const addPosition = () => {
    setForm((current) => ({
      ...current,
      positions: [...current.positions, emptyPosition()],
    }));
  };

  const removePosition = (index: number) => {
    setForm((current) => ({
      ...current,
      positions: current.positions.filter((_, positionIndex) => positionIndex !== index),
    }));
  };

  const addCandidate = (positionIndex: number) => {
    setForm((current) => ({
      ...current,
      positions: current.positions.map((position, index) =>
        index === positionIndex ? { ...position, candidates: [...position.candidates, emptyCandidate()] } : position
      ),
    }));
  };

  const removeCandidate = (positionIndex: number, candidateIndex: number) => {
    setForm((current) => ({
      ...current,
      positions: current.positions.map((position, index) =>
        index === positionIndex
          ? {
              ...position,
              candidates: position.candidates.filter((_, currentCandidateIndex) => currentCandidateIndex !== candidateIndex),
            }
          : position
      ),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        startAt: new Date(form.startAt),
        endAt: new Date(form.endAt),
        resultVisibility: form.resultVisibility,
        positions: form.positions.map((position) => ({
          title: position.title.trim(),
          description: position.description.trim() || undefined,
          seatCount: 1,
          candidates: position.candidates.map((candidate) => ({
            studentId: candidate.studentId.trim(),
            bio: candidate.bio.trim() || undefined,
            manifesto: candidate.manifesto.trim() || undefined,
            photoUrl: candidate.photoUrl.trim() || undefined,
          })),
        })),
      };

      const result = isEditing
        ? await updateElectionAction(initialData!.id, payload)
        : await createElectionAction(payload);

      if (!result.success) {
        toast.error(result.error || "Unable to save election");
        return;
      }

      toast.success(isEditing ? "Election updated" : "Election created");
      onSuccess?.();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="title">Election Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          placeholder="SRC General Elections 2026"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          rows={3}
          placeholder="Who is voting, what offices are open, and when results will be released."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="startAt">Start Date</Label>
          <Input
            id="startAt"
            type="datetime-local"
            value={form.startAt}
            onChange={(event) => setForm((current) => ({ ...current, startAt: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endAt">End Date</Label>
          <Input
            id="endAt"
            type="datetime-local"
            value={form.endAt}
            onChange={(event) => setForm((current) => ({ ...current, endAt: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resultVisibility">Results Visibility</Label>
          <Select
            value={form.resultVisibility}
            onValueChange={(value: "AFTER_PUBLISH" | "AFTER_CLOSE") =>
              setForm((current) => ({ ...current, resultVisibility: value }))
            }
          >
            <SelectTrigger id="resultVisibility">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AFTER_PUBLISH">After manual publish</SelectItem>
              <SelectItem value="AFTER_CLOSE">After election close</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Positions</h3>
            <p className="text-sm text-muted-foreground">Each voter will choose one candidate per position.</p>
          </div>
          <Button type="button" variant="outline" onClick={addPosition}>
            <Plus className="mr-2 h-4 w-4" />
            Add Position
          </Button>
        </div>

        {form.positions.map((position, positionIndex) => (
          <Card key={`position-${positionIndex}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-base">Position {positionIndex + 1}</CardTitle>
              {form.positions.length > 1 ? (
                <Button type="button" size="icon" variant="ghost" onClick={() => removePosition(positionIndex)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Position Title</Label>
                <Input
                  value={position.title}
                  onChange={(event) => updatePosition(positionIndex, { title: event.target.value })}
                  placeholder="President"
                />
              </div>
              <div className="space-y-2">
                <Label>Position Description</Label>
                <Textarea
                  value={position.description}
                  onChange={(event) => updatePosition(positionIndex, { description: event.target.value })}
                  rows={2}
                  placeholder="Optional notes for voters."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Candidates</Label>
                  <Button type="button" size="sm" variant="outline" onClick={() => addCandidate(positionIndex)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Candidate
                  </Button>
                </div>

                {position.candidates.map((candidate, candidateIndex) => (
                  <div key={`candidate-${positionIndex}-${candidateIndex}`} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Candidate {candidateIndex + 1}</p>
                      {position.candidates.length > 1 ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeCandidate(positionIndex, candidateIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label>Student ID</Label>
                      <Input
                        value={candidate.studentId}
                        onChange={(event) => updateCandidate(positionIndex, candidateIndex, { studentId: event.target.value })}
                        placeholder="KUC/2026/001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Short Bio</Label>
                      <Textarea
                        value={candidate.bio}
                        onChange={(event) => updateCandidate(positionIndex, candidateIndex, { bio: event.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Manifesto</Label>
                      <Textarea
                        value={candidate.manifesto}
                        onChange={(event) => updateCandidate(positionIndex, candidateIndex, { manifesto: event.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Photo URL</Label>
                      <Input
                        value={candidate.photoUrl}
                        onChange={(event) => updateCandidate(positionIndex, candidateIndex, { photoUrl: event.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Election" : "Create Election"}
        </Button>
      </div>
    </form>
  );
}
