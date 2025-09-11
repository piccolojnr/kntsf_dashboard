"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImageItem {
  file?: File;
  url?: string;
  id: string;
}

interface MultipleImageUploadProps {
  value?: string[]; // Array of existing image URLs
  onChange: (files: File[]) => void;
  className?: string;
  maxImages?: number;
  maxSizePerImage?: number; // in bytes
}

export function MultipleImageUpload({
  value = [],
  onChange,
  className,
  maxImages = 5,
  maxSizePerImage = 5 * 1024 * 1024, // 5MB
}: MultipleImageUploadProps) {
  const [images, setImages] = useState<ImageItem[]>(() =>
    value.map((url, index) => ({ url, id: `existing-${index}` }))
  );
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      // Check for rejected files
      if (rejectedFiles.length > 0) {
        const reasons = rejectedFiles
          .map((f) => f.errors[0]?.message)
          .join(", ");
        setError(`Some files were rejected: ${reasons}`);
      }

      // Check total count after adding new files
      const totalCount = images.length + acceptedFiles.length;
      if (totalCount > maxImages) {
        setError(
          `Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more images.`
        );
        return;
      }

      // Add new images
      const newImages = acceptedFiles.map((file, index) => ({
        file,
        id: `new-${Date.now()}-${index}`,
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);

      // Extract only new files for onChange
      const allFiles = updatedImages
        .filter((img) => img.file)
        .map((img) => img.file!);

      onChange(allFiles);
    },
    [images, maxImages, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxSize: maxSizePerImage,
    disabled: images.length >= maxImages,
  });

  const removeImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);
    setImages(updatedImages);

    // Extract only new files for onChange
    const allFiles = updatedImages
      .filter((img) => img.file)
      .map((img) => img.file!);

    onChange(allFiles);
    setError(null);
  };

  const getImageSrc = (image: ImageItem): string => {
    if (image.file) {
      return URL.createObjectURL(image.file);
    }
    return image.url || "/placeholder.svg";
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Images ({images.length}/{maxImages})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Existing Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={getImageSrc(image)}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Featured
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(image.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Area */}
        {images.length < maxImages && (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-muted-foreground/50",
              isDragActive && "border-primary bg-primary/5",
              images.length >= maxImages && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-muted p-3">
                {isDragActive ? (
                  <Upload className="h-6 w-6 text-muted-foreground animate-bounce" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isDragActive
                    ? "Drop images here"
                    : images.length === 0
                      ? "Upload images"
                      : `Add more images (${maxImages - images.length} remaining)`}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG, GIF, WEBP up to{" "}
                  {Math.round(maxSizePerImage / (1024 * 1024))}MB each
                </p>
                {images.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    First image will be used as featured image
                  </p>
                )}
              </div>
              <Button type="button" variant="outline" size="sm">
                Select Images
              </Button>
            </div>
          </div>
        )}

        {images.length >= maxImages && (
          <p className="text-sm text-muted-foreground text-center">
            Maximum number of images reached
          </p>
        )}
      </CardContent>
    </Card>
  );
}
