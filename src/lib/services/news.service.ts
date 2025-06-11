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

export async function createArticle(
    articleData: NewsArticleData,
    imageFile: File,
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
                        folder: "news_articles",
                        public_id: `article_${Date.now()}`,
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
                image: uploadResult.secure_url,
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
    imageFile?: File,
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
                            folder: "news_articles",
                            public_id: `article_${articleId}_${Date.now()}`,
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
            if (existingArticle.image) {
                try {
                    const publicId = existingArticle.image.split("/").pop()?.split(".")[0]
                    if (publicId) {
                        await cloudinary.uploader.destroy(`news_articles/${publicId}`)
                    }
                } catch (error) {
                    log.warn("Failed to delete old image from Cloudinary:", error)
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

        // Delete image from Cloudinary
        if (article.image) {
            try {
                const publicId = article.image.split("/").pop()?.split(".")[0]
                if (publicId) {
                    await cloudinary.uploader.destroy(`news_articles/${publicId}`)
                }
            } catch (error) {
                log.warn("Failed to delete image from Cloudinary:", error)
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
