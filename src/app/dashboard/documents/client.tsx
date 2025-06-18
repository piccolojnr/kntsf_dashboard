"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Download, Plus, Trash2 } from "lucide-react";
import services from "@/lib/services";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MyPagination } from "@/components/common/my-pagination";
import Link from "next/link";
const ITEMS_PER_PAGE = 10;

export function DocumentClient() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    file: null as File | null,
    isPublic: true,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    "Academic",
    "Student Life",
    "Administrative",
    "Forms",
    "Policies",
  ];

  // Query for fetching documents
  const { data: documentsData, isLoading } = useQuery({
    queryKey: ["documents", selectedCategory, currentPage],
    queryFn: async () => {
      const response = await services.document.getDocuments(
        selectedCategory,
        currentPage,
        ITEMS_PER_PAGE
      );
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });

  // Mutation for uploading document
  const uploadMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      category: string;
      file: File;
      isPublic: boolean;
    }) => {
      const response = await services.document.uploadDocument(data);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded successfully");
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        file: null,
        isPublic: true,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload document");
    },
  });

  // Mutation for deleting document
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await services.document.deleteDocument(id);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete document");
    },
  });

  // Mutation for downloading document
  const downloadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await services.document.getDocumentById(id);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (!data) return;

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = data.fileUrl;
      link.download = data.title + "." + data.fileUrl.split(".").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download document");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        file: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error("Please select a file");
      return;
    }

    uploadMutation.mutate({ ...formData, file: formData.file! });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    deleteMutation.mutate(id);
  };

  const handleDownload = async (id: number) => {
    downloadMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <Button type="submit" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!documentsData?.data?.length && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                documentsData?.data?.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal"
                        asChild
                      >
                        <Link href={`/dashboard/documents/${doc.id}`}>
                          {doc.title}
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{doc.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger>
                          <p className="cursor-pointer max-w-xs overflow-hidden text-ellipsis">
                            {doc.fileType}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-xs">
                            {doc.fileType} - {doc.fileSize} bytes
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{doc.downloads}</TableCell>
                    <TableCell>{doc.uploadedBy.username}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(doc.id)}
                          disabled={downloadMutation.isPending}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(doc.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {(documentsData?.totalPages ?? 0) > 1 && (
        <div className="flex justify-center mt-4">
          <MyPagination
            currentPage={currentPage}
            totalPages={documentsData?.totalPages ?? 0}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
