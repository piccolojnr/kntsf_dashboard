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

export async function createEvent(
    eventData: EventData,
    imageFile: File,
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

        // Validate image file
        if (!imageFile || imageFile.size === 0) {
            return { success: false, error: "Image file is required" }
        }

        // Check file size (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
            return { success: false, error: "Image file must be less than 5MB" }
        }

        // Check file type
        if (!imageFile.type.startsWith("image/")) {
            return { success: false, error: "File must be an image" }
        }

        // Upload image to Cloudinary
        const buffer = Buffer.from(await imageFile.arrayBuffer())
        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: "events",
                        public_id: `event_${Date.now()}`,
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
                image: uploadResult.secure_url,
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
    imageFile?: File,
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

        // Handle image upload if provided
        if (imageFile) {
            // Validate image file
            if (imageFile.size > 5 * 1024 * 1024) {
                return { success: false, error: "Image file must be less than 5MB" }
            }

            if (!imageFile.type.startsWith("image/")) {
                return { success: false, error: "File must be an image" }
            }

            const buffer = Buffer.from(await imageFile.arrayBuffer())
            const uploadResult = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        {
                            folder: "events",
                            public_id: `event_${eventId}_${Date.now()}`,
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

            updateData.image = uploadResult.secure_url

            // Delete old image from Cloudinary
            if (existingEvent.image) {
                try {
                    const publicId = existingEvent.image.split("/").pop()?.split(".")[0]
                    if (publicId) {
                        await cloudinary.uploader.destroy(`events/${publicId}`)
                    }
                } catch (error) {
                    log.warn("Failed to delete old image from Cloudinary:", error)
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

        // Delete image from Cloudinary
        if (event.image) {
            try {
                const publicId = event.image.split("/").pop()?.split(".")[0]
                if (publicId) {
                    await cloudinary.uploader.destroy(`events/${publicId}`)
                }
            } catch (error) {
                log.warn("Failed to delete image from Cloudinary:", error)
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