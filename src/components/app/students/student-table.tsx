"use client";

import { format } from "date-fns";
import { MenuIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Student } from "@prisma/client";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentTableProps {
  isLoading?: boolean;
  students: Student[];
  isExecutive: boolean;
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onCreatePermit: (student: Student) => void;
}

export function StudentTable({
  students,
  isLoading,
  isExecutive,
  onEdit,
  onDelete,
  onCreatePermit,
}: StudentTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-48 h-10" />
          <Skeleton className="w-32 h-10" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="w-8 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-24 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-32 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-20 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-24 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-24 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-24 h-4" />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Skeleton className="w-16 h-9" />
                        <Skeleton className="h-9 w-9" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created At</TableHead>
              {isExecutive && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/students/${student.studentId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {student.studentId}
                  </Link>
                </TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.course}</TableCell>
                <TableCell>{student.level}</TableCell>
                <TableCell>{student.number}</TableCell>
                <TableCell>
                  {format(new Date(student.createdAt), "MMM d, yyyy")}
                </TableCell>
                {isExecutive && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MenuIcon className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {isExecutive && (
                          <>
                            <DropdownMenuItem onClick={() => onEdit(student)}>
                              <Pencil className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDelete(student.studentId)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                        {isExecutive && (
                          <DropdownMenuItem>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="justify-start w-full h-auto p-0"
                              onClick={() => onCreatePermit(student)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              New Permit
                            </Button>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
