"use server"

import prisma from "@/lib/prisma/client"
import { log } from "@/lib/logger"
import type { ServiceResponse } from "@/lib/types/common"
import { handleError } from "@/lib/utils"
import type { Event, Prisma } from "@prisma/client"
import { getSession } from "@/lib/auth/auth"
import cloudinary from "@/lib/cloudinary"
import slugify from "slugify"

export interface EventData {
    title: string
    description: string
    excerpt: string
    date: Date
    time: string
    location: string
    category: string
    categoryColor: string
    featured: boolean
    published: boolean
    maxAttendees: number
}

export interface EventWithOrganizer extends Event {
    organizer: {
        username: string
        image: string | null
    }
}

interface ImageUploadResult {
    url: string
    publicId: string
}

async function uploadImageToCloudinary(file: File, folder: string): Promise<ImageUploadResult> {
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder,
                    public_id: `${folder}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    transformation: [{ width: 1200, height: 630, crop: "fill", quality: "auto" }],
                },
                (error, result) => {
                    if (error) {
                        log.error("Cloudinary upload error:", error)
                        reject(error)
                    } else {
                        resolve(result)
                    }
                },
            )
            .end(buffer)
    })

    return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
    }
}

async function deleteImageFromCloudinary(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        log.error("Failed to delete image from Cloudinary:", error)
    }
}

export async function createEvent(
    eventData: EventData,
    imageFiles: File[], // Changed to array
): Promise<ServiceResponse<Event>> {
    try {
        const session = await getSession()
        if (!session?.user) {
            return { success: false, error: "Unauthorized - Please log in" }
        }

        const { id: organizerId } = session.user as any
        if (!organizerId) {
            return { success: false, error: "Invalid user session" }
        }

        // Validate at least one image
        if (!imageFiles || imageFiles.length === 0) {
            return { success: false, error: "At least one image is required" }
        }

        // Validate image files
        const maxImages = 5
        if (imageFiles.length > maxImages) {
            return { success: false, error: `Maximum ${maxImages} images allowed` }
        }

        // Check each file
        for (const file of imageFiles) {
            if (file.size > 5 * 1024 * 1024) {
                return { success: false, error: "Each image must be less than 5MB" }
            }
            if (!file.type.startsWith("image/")) {
                return { success: false, error: "All files must be images" }
            }
        }

        // Upload all images to Cloudinary
        const imageUploads = await Promise.all(
            imageFiles.map(file => uploadImageToCloudinary(file, "events"))
        )

        // First image is the featured image
        const featuredImage = imageUploads[0]

        // Additional images metadata
        const additionalImages = imageUploads.slice(1).map((upload, index) => ({
            url: upload.url,
            publicId: upload.publicId,
            order: index + 1
        }))

        // Create unique slug from title
        let slug = slugify(eventData.title, { lower: true, strict: true })

        // Check if slug exists and make it unique
        const existingEvent = await prisma.event.findUnique({
            where: { slug },
        })

        if (existingEvent) {
            slug = `${slug}-${Date.now()}`
        }

        const event = await prisma.event.create({
            data: {
                ...eventData,
                slug,
                date: new Date(eventData.date),
                time: eventData.time,
                image: featuredImage.url,
                images: additionalImages.length > 0 ? additionalImages : undefined,
                organizerId: Number.parseInt(organizerId),
                publishedAt: eventData.published ? new Date() : null,
                currentAttendees: 0,
            },
        })

        log.log(`Event created: ${event.id} - ${event.title}`)
        return { success: true, data: event }
    } catch (error) {
        log.error("Failed to create event:", error)
        return handleError(error)
    }
}

export async function updateEvent(
    eventId: number,
    eventData: Partial<EventData>,
    imageFiles?: File[], // Changed to array
): Promise<ServiceResponse<Event>> {
    try {
        const session = await getSession()
        if (!session?.user) {
            return { success: false, error: "Unauthorized - Please log in" }
        }

        // Check if event exists
        const existingEvent = await prisma.event.findUnique({
            where: { id: eventId },
        })

        if (!existingEvent) {
            return { success: false, error: "Event not found" }
        }

        const updateData: any = { ...eventData }

        // Handle image uploads if provided
        if (imageFiles && imageFiles.length > 0) {
            // Validate image files
            const maxImages = 5
            if (imageFiles.length > maxImages) {
                return { success: false, error: `Maximum ${maxImages} images allowed` }
            }

            // Check each file
            for (const file of imageFiles) {
                if (file.size > 5 * 1024 * 1024) {
                    return { success: false, error: "Each image must be less than 5MB" }
                }
                if (!file.type.startsWith("image/")) {
                    return { success: false, error: "All files must be images" }
                }
            }

            // Upload all new images to Cloudinary
            const imageUploads = await Promise.all(
                imageFiles.map(file => uploadImageToCloudinary(file, "events"))
            )

            // First image is the featured image
            const featuredImage = imageUploads[0]

            // Additional images metadata
            const additionalImages = imageUploads.slice(1).map((upload, index) => ({
                url: upload.url,
                publicId: upload.publicId,
                order: index + 1
            }))

            updateData.image = featuredImage.url
            updateData.images = additionalImages.length > 0 ? additionalImages : undefined

            // Delete old images from Cloudinary
            if (existingEvent.image) {
                try {
                    const publicId = existingEvent.image.split("/").pop()?.split(".")[0]
                    if (publicId) {
                        await deleteImageFromCloudinary(`events/${publicId}`)
                    }
                } catch (error) {
                    log.warn("Failed to delete old featured image from Cloudinary:", error)
                }
            }

            // Delete old additional images
            if (existingEvent.images) {
                try {
                    const oldImages = Array.isArray(existingEvent.images)
                        ? existingEvent.images as any[]
                        : JSON.parse(existingEvent.images as string)

                    for (const oldImage of oldImages) {
                        if (oldImage.publicId) {
                            await deleteImageFromCloudinary(oldImage.publicId)
                        }
                    }
                } catch (error) {
                    log.warn("Failed to delete old additional images from Cloudinary:", error)
                }
            }
        }

        // Update slug if title is changed
        if (eventData.title && eventData.title !== existingEvent.title) {
            let newSlug = slugify(eventData.title, { lower: true, strict: true })

            // Check if new slug exists (excluding current event)
            const slugExists = await prisma.event.findFirst({
                where: {
                    slug: newSlug,
                    id: { not: eventId },
                },
            })

            if (slugExists) {
                newSlug = `${newSlug}-${Date.now()}`
            }

            updateData.slug = newSlug
        }

        // Set publishedAt if event is being published for the first time
        if (eventData.published && !existingEvent.published) {
            updateData.publishedAt = new Date()
        } else if (eventData.published === false) {
            updateData.publishedAt = null
        }

        const event = await prisma.event.update({
            where: { id: eventId },
            data: {
                ...updateData,
                date: eventData.date ? new Date(eventData.date) : existingEvent.date,
                time: eventData.time || existingEvent.time,
            },
        })

        log.log(`Event updated: ${event.id} - ${event.title}`)
        return { success: true, data: event }
    } catch (error) {
        log.error("Failed to update event:", error)
        return handleError(error)
    }
}

export async function deleteEvent(eventId: number): Promise<ServiceResponse<Event>> {
    try {
        const session = await getSession()
        if (!session?.user) {
            return { success: false, error: "Unauthorized - Please log in" }
        }

        // Check if event exists
        const existingEvent = await prisma.event.findUnique({
            where: { id: eventId },
        })

        if (!existingEvent) {
            return { success: false, error: "Event not found" }
        }

        const event = await prisma.event.delete({
            where: { id: eventId },
        })

        // Delete images from Cloudinary
        if (event.image) {
            try {
                const publicId = event.image.split("/").pop()?.split(".")[0]
                if (publicId) {
                    await deleteImageFromCloudinary(`events/${publicId}`)
                }
            } catch (error) {
                log.warn("Failed to delete featured image from Cloudinary:", error)
            }
        }

        // Delete additional images
        if (event.images) {
            try {
                const additionalImages = Array.isArray(event.images)
                    ? event.images as any[]
                    : JSON.parse(event.images as string)

                for (const image of additionalImages) {
                    if (image.publicId) {
                        await deleteImageFromCloudinary(image.publicId)
                    }
                }
            } catch (error) {
                log.warn("Failed to delete additional images from Cloudinary:", error)
            }
        }

        log.log(`Event deleted: ${event.id} - ${event.title}`)
        return { success: true, data: event }
    } catch (error) {
        log.error("Failed to delete event:", error)
        return handleError(error)
    }
}

export async function getEvent(slug: string): Promise<ServiceResponse<EventWithOrganizer>> {
    try {
        const event = await prisma.event.findUnique({
            where: { slug },
            include: {
                organizer: {
                    select: {
                        username: true,
                        image: true,
                    },
                },
            },
        })

        if (!event) {
            return { success: false, error: "Event not found" }
        }

        return { success: true, data: event }
    } catch (error) {
        log.error("Failed to get event:", error)
        return handleError(error)
    }
}

export async function getAllEvents(params: {
    page?: number
    pageSize?: number
    search?: string
    category?: string
    featured?: boolean
    published?: boolean
}): Promise<
    ServiceResponse<{
        events: EventWithOrganizer[]
        total: number
    }>
> {
    try {
        const { page = 1, pageSize = 10, search, category, featured, published } = params

        const where: Prisma.EventWhereInput = {
            ...(category && { category }),
            ...(published !== undefined && { published }),
            ...(featured !== undefined && { featured }),
            ...(search && {
                OR: [
                    { title: { contains: search } },
                    { description: { contains: search } },
                    { excerpt: { contains: search } },
                    { location: { contains: search } },
                    { organizer: { name: { contains: search } } },
                ],
            }),
        }

        const skip = Math.max((page - 1) * pageSize, 0)

        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where,
                include: {
                    organizer: {
                        select: {
                            username: true,
                            image: true,
                        },
                    },
                },
                orderBy: [
                    { featured: "desc" },
                    { date: "asc" },
                    { publishedAt: "desc" },
                    { createdAt: "desc" },
                ],
                skip,
                take: pageSize,
            }),
            prisma.event.count({ where }),
        ])

        return { success: true, data: { events, total } }
    } catch (error) {
        log.error("Failed to get events:", error)
        return handleError(error)
    }
}

export async function getPublishedEvents(params: {
    page?: number
    pageSize?: number
    search?: string
    category?: string
    featured?: boolean
}): Promise<
    ServiceResponse<{
        events: EventWithOrganizer[]
        total: number
    }>
> {
    return getAllEvents({ ...params, published: true })
}

export async function getFeaturedEvents(limit = 5): Promise<ServiceResponse<EventWithOrganizer[]>> {
    try {
        const events = await prisma.event.findMany({
            where: {
                published: true,
                featured: true,
                date: {
                    gte: new Date(), // Only future events
                },
            },
            include: {
                organizer: {
                    select: {
                        username: true,
                        image: true,
                    },
                },
            },
            orderBy: { date: "asc" },
            take: limit,
        })

        return { success: true, data: events }
    } catch (error) {
        log.error("Failed to get featured events:", error)
        return handleError(error)
    }
}

export async function updateEventAttendance(
    eventId: number,
    increment: boolean = true
): Promise<ServiceResponse<Event>> {
    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        })

        if (!event) {
            return { success: false, error: "Event not found" }
        }

        // Check if incrementing would exceed max attendees
        if (increment && event.currentAttendees >= event.maxAttendees) {
            return { success: false, error: "Event is at maximum capacity" }
        }

        // Check if decrementing would go below 0
        if (!increment && event.currentAttendees <= 0) {
            return { success: false, error: "No attendees to remove" }
        }

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {
                currentAttendees: {
                    increment: increment ? 1 : -1,
                },
            },
        })

        return { success: true, data: updatedEvent }
    } catch (error) {
        log.error("Failed to update event attendance:", error)
        return handleError(error)
    }
} 