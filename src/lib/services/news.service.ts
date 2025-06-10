'use server'
import prisma from '../prisma/client'
import { log } from '../logger'
import { ServiceResponse } from '../types/common'
import { handleError } from '../utils'
import { NewsArticle } from '@prisma/client'
import { getSession } from '../auth/auth'
import cloudinary from '@/lib/cloudinary'
import slugify from 'slugify'

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

export async function createArticle(articleData: NewsArticleData, imageFile: File): Promise<ServiceResponse<NewsArticle>> {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { id: authorId } = session.user as any;
        if (!authorId) {
            return { success: false, error: 'Unauthorized' };
        }

        // Upload image to Cloudinary
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'news_articles',
                    public_id: `article_${Date.now()}`,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        // Create slug from title
        const slug = slugify(articleData.title, { lower: true, strict: true });

        const article = await prisma.newsArticle.create({
            data: {
                ...articleData,
                slug,
                image: uploadResult.secure_url,
                authorId: parseInt(authorId),
                publishedAt: articleData.published ? new Date() : null,
            },
        });

        return { success: true, data: article };
    } catch (error) {
        log.error('Failed to create article:', error);
        return handleError(error);
    }
}

export async function updateArticle(
    articleId: number,
    articleData: Partial<NewsArticleData>,
    imageFile?: File
): Promise<ServiceResponse<NewsArticle>> {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' };
        }

        const updateData: any = { ...articleData };

        // Handle image upload if provided
        if (imageFile) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const uploadResult = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'news_articles',
                        public_id: `article_${Date.now()}`,
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });
            updateData.image = uploadResult.secure_url;
        }

        // Update slug if title is changed
        if (articleData.title) {
            updateData.slug = slugify(articleData.title, { lower: true, strict: true });
        }

        // Set publishedAt if article is being published
        if (articleData.published) {
            updateData.publishedAt = new Date();
        }

        const article = await prisma.newsArticle.update({
            where: { id: articleId },
            data: updateData,
        });

        return { success: true, data: article };
    } catch (error) {
        log.error('Failed to update article:', error);
        return handleError(error);
    }
}

export async function deleteArticle(articleId: number): Promise<ServiceResponse<NewsArticle>> {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' };
        }

        const article = await prisma.newsArticle.delete({
            where: { id: articleId },
        });

        // Delete image from Cloudinary
        const publicId = article.image.split('/').pop()?.split('.')[0];
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }

        return { success: true, data: article };
    } catch (error) {
        log.error('Failed to delete article:', error);
        return handleError(error);
    }
}

export async function getArticle(slug: string): Promise<ServiceResponse<NewsArticle & {
    author: {
        name: string;
        image: string | null;
    };
}>> {
    try {
        const article = await prisma.newsArticle.findUnique({
            where: { slug },
            include: {
                author: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
        });

        if (!article) {
            return { success: false, error: 'Article not found' };
        }

        return { success: true, data: article };
    } catch (error) {
        log.error('Failed to get article:', error);
        return handleError(error);
    }
}

export async function getAllArticles(
    page = 1,
    limit = 10,
    featured?: boolean,
    category?: string
): Promise<ServiceResponse<{
    articles: (
        NewsArticle & {
            author: {
                name: string;
                image: string | null;
            };
        }
    )[]; total: number
}>> {
    try {
        console.log('Fetching articles:', { page, limit, featured, category });
        const where = {
            ...(featured !== undefined && { featured }),
            ...(category && { category }),
            published: true,
        };

        const [articles, total] = await Promise.all([
            prisma.newsArticle.findMany({
                where,
                include: {
                    author: {
                        select: {
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: { publishedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.newsArticle.count({ where }),
        ]);

        return { success: true, data: { articles, total } };
    } catch (error) {
        log.error('Failed to get articles:', error);
        return handleError(error);
    }
}

export async function getAdminArticles(
    page = 1,
    limit = 10
): Promise<ServiceResponse<{ articles: NewsArticle[]; total: number }>> {
    try {
        const session = await getSession();
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' };
        }

        const [articles, total] = await Promise.all([
            prisma.newsArticle.findMany({
                include: {
                    author: {
                        select: {
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.newsArticle.count(),
        ]);

        return { success: true, data: { articles, total } };
    } catch (error) {
        log.error('Failed to get admin articles:', error);
        return handleError(error);
    }
} 