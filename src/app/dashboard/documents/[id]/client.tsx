"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import services from "@/lib/services";
import { SessionUser } from "@/lib/types/common";
import { AccessRoles } from "@/lib/role";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { PdfPreview } from "@/components/common/pdf-preview";
import Image from "next/image";

interface DocumentViewClientProps {
  user: SessionUser;
  permissions: AccessRoles;
  documentId: string;
}

export function DocumentViewClient({ documentId }: DocumentViewClientProps) {
  const router = useRouter();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    data: document,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["document", documentId],
    queryFn: async () => {
      const response = await services.document.getDocumentById(
        parseInt(documentId)
      );
      if (!response.success) {
        throw new Error(response.error || "Failed to load document details");
      }
      return response.data;
    },
    retry: 1,
  });

  if (error) {
    toast.error(error.message || "Failed to load document details");
    router.back();
    return null;
  }

  const handleDownload = () => {
    if (!document) return;

    const link = window.document.createElement("a");
    link.href = document.fileUrl;
    link.download = document.title + "." + document.fileUrl.split(".").pop();
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const isImageFile = document?.fileType.startsWith("image/");
  const isPdfFile = document?.fileType === "application/pdf";
  const isDocFile =
    document?.fileType === "application/msword" ||
    document?.fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const canPreview = isImageFile || isPdfFile || isDocFile;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="h-9 w-48 bg-muted animate-pulse rounded" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="h-6 w-40 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-6 w-full bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Document Not Found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{document.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          {canPreview && (
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Preview</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-y-auto min-h-[400px] flex flex-col">
                {" "}
                <DialogHeader className="h-fit w-full">
                  <DialogTitle>Document Preview</DialogTitle>
                  <DialogDescription>
                    Preview the document before downloading.
                  </DialogDescription>
                </DialogHeader>
                <div className="w-full h-full flex items-center justify-center ">
                  {isImageFile && (
                    <Image
                      src={document.fileUrl}
                      alt={document.title}
                      width={800}
                      height={600}
                      className="w-full h-auto"
                    />
                  )}
                  {isPdfFile && <PdfPreview url={document.fileUrl} />}
                  {isDocFile && (
                    <div className="w-full h-full">
                      <iframe
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(
                          document.fileUrl
                        )}&embedded=true`}
                        className="w-full h-[70vh] border rounded"
                        title="Document Preview"
                      />
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap">
                  {document.description || "No description provided"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Category
                  </p>
                  <p className="mt-1">
                    <Badge variant="secondary">{document.category}</Badge>
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm font-medium text-muted-foreground"
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "break-word",
                    }}
                  >
                    File Type
                  </p>
                  <p className="mt-1">{document.fileType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    File Size
                  </p>
                  <p className="mt-1">
                    {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Downloads
                  </p>
                  <p className="mt-1">{document.downloads}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Uploaded By
                  </p>
                  <p className="mt-1">{document.uploadedBy.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Upload Date
                  </p>
                  <p className="mt-1">
                    {format(new Date(document.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Visibility
                  </p>
                  <p className="mt-1">
                    <Badge
                      variant={document.isPublic ? "default" : "secondary"}
                    >
                      {document.isPublic ? "Public" : "Private"}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
