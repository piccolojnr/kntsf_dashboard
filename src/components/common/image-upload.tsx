"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (file: File) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null as any);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative h-40 w-40 rounded-lg border-2 border-dashed border-gray-300 p-2">
          {preview ? (
            <>
              <Image
                src={preview}
                alt="Preview"
                fill
                className="rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 h-6 w-6"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImagePlus className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            Upload Image
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}