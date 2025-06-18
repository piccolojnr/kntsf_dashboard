"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import services from "@/lib/services";
import { MyPagination } from "@/components/common/my-pagination";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

export function IdeaClient() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  //   const categories = [
  //     "Academic",
  //     "Student Life",
  //     "Administrative",
  //     "Facilities",
  //     "Events",
  //     "Other",
  //   ];

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    UNDER_REVIEW: "bg-blue-100 text-blue-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    IMPLEMENTED: "bg-purple-100 text-purple-800",
  } as const;

  // Query for fetching ideas
  const { data: ideasData, isLoading } = useQuery({
    queryKey: ["ideas", selectedStatus, currentPage],
    queryFn: async () => {
      const response = await services.idea.getIdeas(
        selectedStatus,
        currentPage,
        ITEMS_PER_PAGE
      );
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });

  // Mutation for updating idea status
  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: number;
      status: string;
      notes?: string;
    }) => {
      const response = await services.idea.updateIdeaStatus(
        id,
        status as any,
        notes
      );
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const handleStatusUpdate = async (
    id: number,
    status: string,
    notes?: string
  ) => {
    statusMutation.mutate({ id, status, notes });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="IMPLEMENTED">Implemented</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!ideasData?.data.length && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No ideas found
                  </TableCell>
                </TableRow>
              ) : isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                ideasData?.data.map((idea) => (
                  <TableRow key={idea.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal"
                        asChild>
                        <Link href={`/dashboard/ideas/${idea.id}`}>
                          {idea.title}
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{idea.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[idea.status]}>
                        {idea.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{idea.student.name}</TableCell>
                    <TableCell>
                      {new Date(idea.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={idea.status}
                          onValueChange={(value) =>
                            handleStatusUpdate(idea.id, value)
                          }
                          disabled={statusMutation.isPending}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UNDER_REVIEW">
                              Under Review
                            </SelectItem>
                            <SelectItem value="APPROVED">Approve</SelectItem>
                            <SelectItem value="REJECTED">Reject</SelectItem>
                            <SelectItem value="IMPLEMENTED">
                              Implement
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {(ideasData?.totalPages ?? 0) > 1 && (
        <div className="flex justify-center mt-4">
          <MyPagination
            currentPage={currentPage}
            totalPages={ideasData?.totalPages ?? 0}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
