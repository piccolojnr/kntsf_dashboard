"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createElectionAction,
  searchElectionStudentsAction,
  updateElectionAction,
  uploadElectionCandidateImageAction,
} from "@/app/actions/election.actions";
import { ImageUpload } from "@/components/common/image-upload";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type StudentSearchResult = {
  id: number;
  studentId: string;
  name: string;
  email: string;
  course: string;
  level: string;
};

type CandidateForm = {
  studentId: string;
  student?: StudentSearchResult | null;
  bio: string;
  manifesto: string;
  photoUrl: string;
  photoFile?: File | null;
  searchQuery: string;
  searchResults: StudentSearchResult[];
  isSearching: boolean;
};

type PositionForm = {
  title: string;
  description: string;
  candidates: CandidateForm[];
};

type ElectionFormData = {
  title: string;
  description: string;
  startDate: Date | undefined;
  startTime: string;
  endDate: Date | undefined;
  endTime: string;
  resultVisibility: "AFTER_PUBLISH" | "AFTER_CLOSE";
  positions: PositionForm[];
};

interface ElectionFormProps {
  initialData?: {
    id: number;
    status: string;
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
          id?: number;
          studentId: string;
          name?: string | null;
          email?: string | null;
          course?: string | null;
          level?: string | null;
        };
        bio?: string | null;
        manifesto?: string | null;
        photoUrl?: string | null;
      }>;
    }>;
  };
}

function splitDateTime(dateString: string) {
  const date = new Date(dateString);
  return {
    date,
    time: format(date, "HH:mm"),
  };
}

function combineDateAndTime(date: Date | undefined, time: string) {
  if (!date || !time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(date);
  value.setHours(hours || 0, minutes || 0, 0, 0);
  return value;
}

const emptyCandidate = (): CandidateForm => ({
  studentId: "",
  student: null,
  bio: "",
  manifesto: "",
  photoUrl: "",
  photoFile: null,
  searchQuery: "",
  searchResults: [],
  isSearching: false,
});

const emptyPosition = (): PositionForm => ({
  title: "",
  description: "",
  candidates: [emptyCandidate()],
});

function DateTimeField({
  label,
  date,
  time,
  minDate,
  disabled,
  onDateChange,
  onTimeChange,
}: {
  label: string;
  date: Date | undefined;
  time: string;
  minDate?: Date;
  disabled?: boolean;
  onDateChange: (value: Date | undefined) => void;
  onTimeChange: (value: string) => void;
}) {
  const normalizedMinDate = minDate ? new Date(minDate) : undefined;
  if (normalizedMinDate) {
    normalizedMinDate.setHours(0, 0, 0, 0);
  }

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_140px]">
      <div className="space-y-2">
        <Label>{label}</Label>
        <Popover modal={true}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn("justify-between text-left font-normal", !date && "text-muted-foreground")}
            >
              {date ? format(date, "PPP") : "Pick a date"}
              <CalendarIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" onOpenAutoFocus={(event) => event.preventDefault()}>
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              disabled={(value) => (normalizedMinDate ? value < normalizedMinDate : false)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label>{label} Time</Label>
        <Input type="time" value={time} onChange={(event) => onTimeChange(event.target.value)} disabled={disabled} />
      </div>
    </div>
  );
}

function CandidateSelector({
  candidate,
  onChange,
  onRemove,
  canRemove,
  allowStudentChange,
}: {
  candidate: CandidateForm;
  onChange: (patch: Partial<CandidateForm>) => void;
  onRemove: () => void;
  canRemove: boolean;
  allowStudentChange: boolean;
}) {
  useEffect(() => {
    if (!allowStudentChange) {
      return;
    }

    if (candidate.student || candidate.searchQuery.trim().length < 2) {
      if (candidate.searchResults.length > 0 || candidate.isSearching) {
        onChange({ searchResults: [], isSearching: false });
      }
      return;
    }

    const handle = setTimeout(async () => {
      onChange({ isSearching: true });
      const result = await searchElectionStudentsAction(candidate.searchQuery);
      if (!result.success) {
        onChange({ isSearching: false, searchResults: [] });
        return;
      }
      onChange({ isSearching: false, searchResults: result.data || [] });
    }, 250);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowStudentChange, candidate.student, candidate.searchQuery]);

  const selectStudent = (student: StudentSearchResult) => {
    onChange({
      student,
      studentId: student.studentId,
      searchQuery: `${student.name || student.studentId}`,
      searchResults: [],
      isSearching: false,
    });
  };

  const clearStudent = () => {
    onChange({
      student: null,
      studentId: "",
      searchQuery: "",
      searchResults: [],
      isSearching: false,
    });
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium">Candidate</p>
        {canRemove && allowStudentChange ? (
          <Button type="button" size="icon" variant="ghost" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {!allowStudentChange ? (
        <div className="flex items-start justify-between rounded-md border bg-muted/30 p-3">
          <div className="space-y-1">
            <p className="font-medium">{candidate.student?.name || candidate.student?.studentId || "Candidate locked"}</p>
            {candidate.student ? (
              <>
                <p className="text-sm text-muted-foreground">{candidate.student.studentId}</p>
                <p className="text-xs text-muted-foreground">
                  {[candidate.student.course, candidate.student.level].filter(Boolean).join(" • ")}
                </p>
              </>
            ) : null}
          </div>
        </div>
      ) : candidate.student ? (
        <div className="flex items-start justify-between rounded-md border bg-muted/30 p-3">
          <div className="space-y-1">
            <p className="font-medium">{candidate.student.name || candidate.student.studentId}</p>
            <p className="text-sm text-muted-foreground">{candidate.student.studentId}</p>
            <p className="text-xs text-muted-foreground">
              {[candidate.student.course, candidate.student.level].filter(Boolean).join(" • ")}
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={clearStudent}>
            <X className="mr-1 h-4 w-4" />
            Change
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Find Student</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={candidate.searchQuery}
              onChange={(event) => onChange({ searchQuery: event.target.value })}
              placeholder="Search by student ID or name"
              className="pl-9"
            />
            {candidate.isSearching ? <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" /> : null}
          </div>
          {candidate.searchResults.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              {candidate.searchResults.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  className="flex w-full items-start justify-between gap-4 border-b px-3 py-3 text-left last:border-b-0 hover:bg-muted/50"
                  onClick={() => selectStudent(student)}
                >
                  <div>
                    <p className="font-medium">{student.name || student.studentId}</p>
                    <p className="text-sm text-muted-foreground">{student.studentId}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{[student.course, student.level].filter(Boolean).join(" • ")}</p>
                </button>
              ))}
            </div>
          ) : candidate.searchQuery.trim().length >= 2 && !candidate.isSearching ? (
            <p className="text-sm text-muted-foreground">No matching student found.</p>
          ) : (
            <p className="text-sm text-muted-foreground">Type at least 2 characters to search.</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Candidate Photo</Label>
        <ImageUpload
          value={candidate.photoFile ? undefined : candidate.photoUrl || undefined}
          onChange={(file) => onChange({ photoFile: file, photoUrl: file ? candidate.photoUrl : "" })}
          className="max-w-xl"
        />
      </div>

      <div className="space-y-2">
        <Label>Short Bio</Label>
        <Textarea value={candidate.bio} onChange={(event) => onChange({ bio: event.target.value })} rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Manifesto</Label>
        <Textarea value={candidate.manifesto} onChange={(event) => onChange({ manifesto: event.target.value })} rows={3} />
      </div>
    </div>
  );
}

export function ElectionForm({ initialData }: ElectionFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ElectionFormData>(() => {
    const now = new Date();
    const later = new Date(now);
    later.setDate(later.getDate() + 1);
    return {
      title: "",
      description: "",
      startDate: now,
      startTime: "09:00",
      endDate: later,
      endTime: "17:00",
      resultVisibility: "AFTER_PUBLISH",
      positions: [emptyPosition()],
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData?.id);
  const isActivatedEdit = initialData?.status === "ACTIVE";

  useEffect(() => {
    if (!initialData) return;
    const start = splitDateTime(initialData.startAt);
    const end = splitDateTime(initialData.endAt);
    setForm({
      title: initialData.title,
      description: initialData.description ?? "",
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
      resultVisibility: initialData.resultVisibility,
      positions: initialData.positions.map((position) => ({
        title: position.title,
        description: position.description ?? "",
        candidates: position.candidates.map((candidate) => ({
          studentId: candidate.student.studentId,
          student: {
            id: candidate.student.id || 0,
            studentId: candidate.student.studentId,
            name: candidate.student.name || "",
            email: candidate.student.email || "",
            course: candidate.student.course || "",
            level: candidate.student.level || "",
          },
          bio: candidate.bio ?? "",
          manifesto: candidate.manifesto ?? "",
          photoUrl: candidate.photoUrl ?? "",
          photoFile: null,
          searchQuery: candidate.student.name || candidate.student.studentId,
          searchResults: [],
          isSearching: false,
        })),
      })),
    });
  }, [initialData]);

  const startAt = useMemo(() => combineDateAndTime(form.startDate, form.startTime), [form.startDate, form.startTime]);
  const endAt = useMemo(() => combineDateAndTime(form.endDate, form.endTime), [form.endDate, form.endTime]);

  const canSubmit = useMemo(() => {
    if (!form.title.trim() || !startAt || !endAt || endAt <= startAt) return false;
    return form.positions.every(
      (position) =>
        position.title.trim() &&
        position.candidates.length > 0 &&
        position.candidates.every((candidate) => candidate.studentId.trim())
    );
  }, [form, startAt, endAt]);

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
          ? { ...position, candidates: position.candidates.filter((_, i) => i !== candidateIndex) }
          : position
      ),
    }));
  };

  const uploadCandidateImage = async (candidate: CandidateForm) => {
    if (!candidate.photoFile) return candidate.photoUrl || undefined;
    const formData = new FormData();
    formData.append("image", candidate.photoFile);
    const result = await uploadElectionCandidateImageAction(formData);
    if (!result.success || !result.data?.url) {
      throw new Error(result.error || "Failed to upload candidate image");
    }
    return result.data.url;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startAt || !endAt) {
      toast.error("Choose both start and end schedule.");
      return;
    }
    if (endAt <= startAt) {
      toast.error("End date must be after start date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const positions = await Promise.all(
        form.positions.map(async (position) => ({
          title: position.title.trim(),
          description: position.description.trim() || undefined,
          seatCount: 1,
          candidates: await Promise.all(
            position.candidates.map(async (candidate) => ({
              studentId: candidate.studentId.trim(),
              bio: candidate.bio.trim() || undefined,
              manifesto: candidate.manifesto.trim() || undefined,
              photoUrl: await uploadCandidateImage(candidate),
            }))
          ),
        }))
      );

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        startAt,
        endAt,
        resultVisibility: form.resultVisibility,
        positions,
      };

      const result = isEditing
        ? await updateElectionAction(initialData!.id, payload)
        : await createElectionAction(payload);

      if (!result.success) {
        toast.error(result.error || "Unable to save election");
        return;
      }

      toast.success(isEditing ? "Election updated" : "Election created");
      router.push(isEditing ? `/dashboard/elections/${initialData!.id}` : "/dashboard/elections");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? "Edit Election" : "Create Election"}</h1>
          <p className="mt-2 text-muted-foreground">
            Build a structured SRC ballot with formal scheduling, candidate profiles, and approval-ready data.
          </p>
          {isActivatedEdit ? (
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
              This election is active. You can update text and candidate images, but positions, candidate assignments, and schedule fields are locked.
            </div>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/elections")}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Election" : "Create Election"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Election Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              placeholder="Who is voting, what offices are open, and how results will be released."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <DateTimeField
              label="Start"
              date={form.startDate}
              time={form.startTime}
              disabled={isActivatedEdit}
              onDateChange={(value) => setForm((current) => ({ ...current, startDate: value }))}
              onTimeChange={(value) => setForm((current) => ({ ...current, startTime: value }))}
            />
            <DateTimeField
              label="End"
              date={form.endDate}
              time={form.endTime}
              minDate={form.startDate}
              disabled={isActivatedEdit}
              onDateChange={(value) => setForm((current) => ({ ...current, endDate: value }))}
              onTimeChange={(value) => setForm((current) => ({ ...current, endTime: value }))}
            />
            <div className="space-y-2">
              <Label htmlFor="resultVisibility">Results Visibility</Label>
              <Select
                value={form.resultVisibility}
                disabled={isActivatedEdit}
                onValueChange={(value: "AFTER_PUBLISH" | "AFTER_CLOSE") =>
                  setForm((current) => ({ ...current, resultVisibility: value }))
                }
              >
                <SelectTrigger id="resultVisibility" disabled={isActivatedEdit}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AFTER_PUBLISH">After manual publish</SelectItem>
                  <SelectItem value="AFTER_CLOSE">Automatically after close</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {startAt && endAt ? `Schedule: ${format(startAt, "PPP p")} to ${format(endAt, "PPP p")}` : "Pick both dates and times."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Positions</h2>
            <p className="text-sm text-muted-foreground">Add offices and attach verified students as candidates.</p>
          </div>
          {!isActivatedEdit ? (
            <Button type="button" variant="outline" onClick={addPosition}>
              <Plus className="mr-2 h-4 w-4" />
              Add Position
            </Button>
          ) : null}
        </div>

        {form.positions.map((position, positionIndex) => (
          <Card key={`position-${positionIndex}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>{position.title.trim() || `Position ${positionIndex + 1}`}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {position.candidates.length} candidate{position.candidates.length === 1 ? "" : "s"}
                </p>
              </div>
              {form.positions.length > 1 && !isActivatedEdit ? (
                <Button type="button" size="icon" variant="ghost" onClick={() => removePosition(positionIndex)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Position Title</Label>
                  <Input value={position.title} onChange={(event) => updatePosition(positionIndex, { title: event.target.value })} placeholder="President" />
                </div>
                <div className="space-y-2">
                  <Label>Position Description</Label>
                  <Input
                    value={position.description}
                    onChange={(event) => updatePosition(positionIndex, { description: event.target.value })}
                    placeholder="Optional note for voters"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Candidates</Label>
                  {!isActivatedEdit ? (
                    <Button type="button" size="sm" variant="outline" onClick={() => addCandidate(positionIndex)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Candidate
                    </Button>
                  ) : null}
                </div>

                {position.candidates.map((candidate, candidateIndex) => (
                  <CandidateSelector
                    key={`candidate-${positionIndex}-${candidateIndex}`}
                    candidate={candidate}
                    onChange={(patch) => updateCandidate(positionIndex, candidateIndex, patch)}
                    onRemove={() => removeCandidate(positionIndex, candidateIndex)}
                    canRemove={position.candidates.length > 1}
                    allowStudentChange={!isActivatedEdit}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-4 z-10 flex justify-end gap-2 rounded-lg border bg-background/95 p-4 shadow-sm backdrop-blur">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/elections")}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Election" : "Create Election"}
        </Button>
      </div>
    </form>
  );
}
