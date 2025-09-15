"use server"

import prisma from "@/lib/prisma/client"
import { log } from "@/lib/logger"
import type { ServiceResponse } from "@/lib/types/common"
import { handleError } from "@/lib/utils"
import type { NewsArticle, Prisma } from "@prisma/client"
import { getSession } from "@/lib/auth/auth"
import cloudinary from "@/lib/cloudinary"
import slugify from "slugify"

export interface NewsArticleData {
    title: string
    content: string
    excerpt: string
    category: string
    categoryColor: string
    featured: boolean
    published: boolean
    readTime: string
}

export interface NewsArticleWithAuthor extends NewsArticle {
    author: {
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

export async function createArticle(
    articleData: NewsArticleData,
    imageFiles: File[], // Changed to array
): Promise<ServiceResponse<NewsArticle>> {
    try {
        const session = await getSession()
        if (!session?.user) {
            return { success: false, error: "Unauthorized - Please log in" }
        }

        const { id: authorId } = session.user as any
        if (!authorId) {
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
            imageFiles.map(file => uploadImageToCloudinary(file, "news_articles"))
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
        let slug = slugify(articleData.title, { lower: true, strict: true })

        // Check if slug exists and make it unique
        const existingArticle = await prisma.newsArticle.findUnique({
            where: { slug },
        })

        if (existingArticle) {
            slug = `${slug}-${Date.now()}`
        }

        const article = await prisma.newsArticle.create({
            data: {
                ...articleData,
                slug,
                image: featuredImage.url,
                images: additionalImages.length > 0 ? additionalImages : undefined,
                authorId: Number.parseInt(authorId),
                publishedAt: articleData.published ? new Date() : null,
            },
        })

        log.log(`Article created: ${article.id} - ${article.title}`)
        return { success: true, data: article }
    } catch (error) {
        log.error("Failed to create article:", error)
        return handleError(error)
    }
}

export async function updateArticle(
    articleId: number,
    articleData: Partial<NewsArticleData>,
    imageFiles?: File[], // Changed to array
): Promise<ServiceResponse<NewsArticle>> {
    try {
        const session = await getSession()
        if (!session?.user) {
            return { success: false, error: "Unauthorized - Please log in" }
        }

        // Check if article exists
        const existingArticle = await prisma.newsArticle.findUnique({
            where: { id: articleId },
        })

        if (!existingArticle) {
            return { success: false, error: "Article not found" }
        }

        const updateData: any = { ...articleData }

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
                imageFiles.map(file => uploadImageToCloudinary(file, "news_articles"))
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
            if (existingArticle.image) {
                try {
                    const publicId = existingArticle.image.split("/").pop()?.split(".")[0]
                    if (publicId) {
                        await deleteImageFromCloudinary(`news_articles/${publicId}`)
                    }
                } catch (error) {
                    log.warn("Failed to delete old featured image from Cloudinary:", error)
                }
            }

            // Delete old additional images
            if (existingArticle.images) {
                try {
                    const oldImages = Array.isArray(existingArticle.images)
                        ? existingArticle.images as any[]
                        : JSON.parse(existingArticle.images as string)

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
        if (articleData.title && articleData.title !== existingArticle.title) {
            let newSlug = slugify(articleData.title, { lower: true, strict: true })

            // Check if new slug exists (excluding current article)
            const slugExists = await prisma.newsArticle.findFirst({
                where: {
                    slug: newSlug,
                    id: { not: articleId },
                },
            })

            if (slugExists) {
                newSlug = `${newSlug}-${Date.now()}`
            }

            updateData.slug = newSlug
        }

        // Set publishedAt if article is being published for the first time
        if (articleData.published && !existingArticle.published) {
            updateData.publishedAt = new Date()
        } else if (articleData.published === false) {
            updateData.publishedAt = null
        }

        const article = await prisma.newsArticle.update({
            where: { id: articleId },
            data: updateData,
        })

        log.log(`Article updated: ${article.id} - ${article.title}`)
        return { success: true, data: article }
    } catch (error) {
        log.error("Failed to update article:", error)
        return handleError(error)
    }
}

export async function deleteArticle(articleId: number): Promise<ServiceResponse<NewsArticle>> {
    try {
        const session = await getSession()
        if (!session?.user) {
            return { success: false, error: "Unauthorized - Please log in" }
        }

        // Check if article exists
        const existingArticle = await prisma.newsArticle.findUnique({
            where: { id: articleId },
        })

        if (!existingArticle) {
            return { success: false, error: "Article not found" }
        }

        const article = await prisma.newsArticle.delete({
            where: { id: articleId },
        })

        // Delete images from Cloudinary
        if (article.image) {
            try {
                const publicId = article.image.split("/").pop()?.split(".")[0]
                if (publicId) {
                    await deleteImageFromCloudinary(`news_articles/${publicId}`)
                }
            } catch (error) {
                log.warn("Failed to delete featured image from Cloudinary:", error)
            }
        }

        // Delete additional images
        if (article.images) {
            try {
                const additionalImages = Array.isArray(article.images)
                    ? article.images as any[]
                    : JSON.parse(article.images as string)

                for (const image of additionalImages) {
                    if (image.publicId) {
                        await deleteImageFromCloudinary(image.publicId)
                    }
                }
            } catch (error) {
                log.warn("Failed to delete additional images from Cloudinary:", error)
            }
        }

        log.log(`Article deleted: ${article.id} - ${article.title}`)
        return { success: true, data: article }
    } catch (error) {
        log.error("Failed to delete article:", error)
        return handleError(error)
    }
}

export async function getArticle(slug: string): Promise<ServiceResponse<NewsArticleWithAuthor>> {
    try {
        const article = await prisma.newsArticle.findUnique({
            where: { slug },
            include: {
                author: {
                    select: {
                        username: true,
                        image: true,
                    },
                },
            },
        })


        if (!article) {
            return { success: false, error: "Article not found" }
        }

        return { success: true, data: article }
    } catch (error) {
        log.error("Failed to get article:", error)
        return handleError(error)
    }
}

export async function getAllArticles(params: {
    page?: number
    pageSize?: number
    search?: string
    category?: string
    featured?: boolean
    published?: boolean
}): Promise<
    ServiceResponse<{
        articles: NewsArticleWithAuthor[]
        total: number
    }>
> {
    try {
        const { page = 1, pageSize = 10, search, category, featured, published } = params

        const where: Prisma.NewsArticleWhereInput = {
            ...(category && { category }),
            ...(published !== undefined && { published }),
            ...(featured !== undefined && { featured }),
            ...(search && {
                OR: [
                    { title: { contains: search, } },
                    { content: { contains: search, } },
                    { excerpt: { contains: search, } },
                    { author: { name: { contains: search, } } },
                ],
            }),
        }

        const skip = Math.max((page - 1) * pageSize, 0)

        const [articles, total] = await Promise.all([
            prisma.newsArticle.findMany({
                where,
                include: {
                    author: {
                        select: {
                            username: true,
                            image: true,
                        },
                    },
                },
                orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
                skip,
                take: pageSize,
            }),
            prisma.newsArticle.count({ where }),
        ])

        return { success: true, data: { articles, total } }
    } catch (error) {
        log.error("Failed to get articles:", error)
        return handleError(error)
    }
}

export async function getPublishedArticles(params: {
    page?: number
    pageSize?: number
    search?: string
    category?: string
    featured?: boolean
}): Promise<
    ServiceResponse<{
        articles: NewsArticleWithAuthor[]
        total: number
    }>
> {
    return getAllArticles({ ...params, published: true })
}

export async function getFeaturedArticles(limit = 5): Promise<ServiceResponse<NewsArticleWithAuthor[]>> {
    try {
        const articles = await prisma.newsArticle.findMany({
            where: {
                published: true,
                featured: true,
            },
            include: {
                author: {
                    select: {
                        username: true,
                        image: true,
                    },
                },
            },
            orderBy: { publishedAt: "desc" },
            take: limit,
        })

        return { success: true, data: articles }
    } catch (error) {
        log.error("Failed to get featured articles:", error)
        return handleError(error)
    }
}
