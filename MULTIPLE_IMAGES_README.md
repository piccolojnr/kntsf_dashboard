# Multiple Image Upload Implementation

This implementation adds support for uploading multiple images to both news articles and events with a configurable cap.

## Features

- **Multiple Image Upload**: Support for up to 5 images per article/event
- **Featured Image**: First uploaded image becomes the featured image
- **Image Gallery**: Interactive gallery view with lightbox for viewing multiple images
- **File Validation**: Size (5MB per image) and type validation
- **Cloud Storage**: All images stored in Cloudinary with automatic cleanup
- **Responsive Design**: Works well on both desktop and mobile

## Database Changes

### Schema Updates
- `NewsArticle.images`: JSON field storing additional image metadata
- `Event.images`: JSON field storing additional image metadata

### Migration
- Migration `20250911000533_add_multiple_images_support` adds the `images` field to both tables

## Components

### MultipleImageUpload
- **Location**: `src/components/common/multiple-image-upload.tsx`
- **Features**: 
  - Drag & drop support
  - Image previews
  - Maximum image limit (configurable)
  - File size and type validation
  - Featured image indicator

### ImageGallery
- **Location**: `src/components/common/image-gallery.tsx`
- **Features**:
  - Featured image display
  - Thumbnail grid for additional images
  - Lightbox modal with navigation
  - Click to expand functionality

## API Changes

### News Service (`src/lib/services/news.service.ts`)
- `createArticle()`: Now accepts `File[]` instead of `File`
- `updateArticle()`: Now accepts `File[]` instead of `File`
- `deleteArticle()`: Now deletes all associated images

### Events Service (`src/lib/services/events.service.ts`)
- `createEvent()`: Now accepts `File[]` instead of `File`
- `updateEvent()`: Now accepts `File[]` instead of `File`
- `deleteEvent()`: Now deletes all associated images

## Usage

### Creating Articles/Events
```typescript
// Multiple images are now required for new articles/events
const result = await createArticle(articleData, imageFiles);
const result = await createEvent(eventData, imageFiles);
```

### Image Limits
- **Maximum Images**: 5 per article/event
- **File Size**: 5MB per image
- **Supported Formats**: PNG, JPG, JPEG, GIF, WEBP

### Image Structure
```typescript
interface ImageMetadata {
  url: string;
  publicId: string; // For Cloudinary cleanup
  order: number;    // Display order
}
```

## Image Display

### Featured Image
- The first uploaded image is automatically set as the featured image
- Used in article/event cards and listings
- Displayed prominently in the gallery

### Additional Images
- Stored as JSON metadata in the database
- Displayed in a responsive grid below the featured image
- Click any image to open the lightbox gallery

## Breaking Changes

⚠️ **API Changes**: The image upload functions now expect arrays instead of single files. Update any existing code that calls these functions.

## Migration Notes

- Existing articles/events with single images will continue to work
- The `images` field will be `null` for existing records
- No data loss during migration
