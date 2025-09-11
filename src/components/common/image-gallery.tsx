"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: Array<{
    url: string;
    order?: number;
  }>;
  featuredImage?: string;
  alt?: string;
  className?: string;
}

export function ImageGallery({
  images,
  featuredImage,
  alt = "Gallery image",
  className,
}: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  // Combine featured image with additional images
  const allImages = [
    ...(featuredImage ? [{ url: featuredImage, order: 0 }] : []),
    ...images.sort((a, b) => (a.order || 0) - (b.order || 0)),
  ];

  if (allImages.length === 0) return null;

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (
      selectedImageIndex !== null &&
      selectedImageIndex < allImages.length - 1
    ) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {/* Featured Image */}
        {allImages[0] && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div
                className="relative aspect-video w-full cursor-pointer group"
                onClick={() => openLightbox(0)}
              >
                <Image
                  src={allImages[0].url}
                  alt={`${alt} - Featured`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                {allImages.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-sm px-2 py-1 rounded">
                    {allImages.length} photos
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Images Grid */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {allImages.slice(1).map((image, index) => (
              <Card
                key={index + 1}
                className="overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(index + 1)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={image.url}
                      alt={`${alt} ${index + 2}`}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation Buttons */}
            {selectedImageIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {selectedImageIndex < allImages.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300"
                onClick={goToNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            {/* Main Image */}
            <div className="relative w-full h-full">
              <Image
                src={allImages[selectedImageIndex].url}
                alt={`${alt} ${selectedImageIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
