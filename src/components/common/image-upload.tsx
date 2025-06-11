"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        onChange(file);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        {preview ? (
          <div className="relative">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-muted-foreground/50",
              isDragActive && "border-primary bg-primary/5"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-4">
                {isDragActive ? (
                  <Upload className="h-8 w-8 text-muted-foreground animate-bounce" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive ? "Drop the image here" : "Upload an image"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag and drop an image, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG, GIF, WEBP up to 5MB
                </p>
              </div>
              <Button type="button" variant="outline">
                Select Image
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
