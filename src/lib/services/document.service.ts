'use server'

import prisma from '../prisma/client'
import { log } from '../logger'
import { PaginatedResponse, ServiceResponse } from '../types/common'
import { handleError } from '../utils'
import cloudinary from '../cloudinary'
import { getSession } from '../auth/auth'

export interface DocumentData {
    title: string
    description?: string
    category: string
    file: File
    isPublic?: boolean
}

export interface DocumentWithRelations {
    id: number
    title: string
    description: string | null
    category: string
    fileUrl: string
    fileType: string
    fileSize: number
    downloads: number
    isPublic: boolean
    uploadedBy: {
        username: string
        email: string
    }
    createdAt: Date
}

// get file extension from file name
function getFileExtension(fileName: string): string {
    const parts = fileName.split('.')
    return parts.length > 1 ? parts.pop() || '' : ''
}

export async function uploadDocument(data: DocumentData): Promise<ServiceResponse<DocumentWithRelations>> {
    try {
        const session = await getSession()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const { id } = session.user as any
        if (!id) {
            return { success: false, error: 'Unauthorized' }
        }

        // Validate input data
        if (!data.title || !data.file || !data.category) {
            return {
                success: false,
                error: 'Title, file, and category are required fields'
            }
        }

        // unique title validation
        const existingDocument = await prisma.document.findFirst({
            where: {
                title: data.title,
            }
        })

        if (existingDocument) {
            return {
                success: false,
                error: 'A document with this title already exists'
            }
        }

        const extension = getFileExtension(data.file.name)
        const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx']
        if (!allowedExtensions.includes(extension)) {
            return {
                success: false,
                error: 'Invalid file type. Allowed types are: ' + allowedExtensions.join(', ')
            }
        }

        if (data.file.size > 10 * 1024 * 1024) { // 10 MB limit
            return {
                success: false,
                error: 'File size exceeds the maximum limit of 10 MB'
            }
        }

        // create filename from document title
        const fileName = data.title.replace(/\s+/g, '_').toLowerCase() + `.${extension}`
        const buffer = Buffer.from(await data.file.arrayBuffer())
        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'documents',
                    resource_type: 'raw',
                    public_id: fileName,
                    filename: fileName
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            ).end(buffer)
        })

        // Create document record
        const document = await prisma.document.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                fileUrl: uploadResult.secure_url,
                fileType: data.file.type,
                fileSize: data.file.size,
                isPublic: data.isPublic ?? true,
                uploadedBy: {
                    connect: { id: parseInt(id) }
                }
            },
            include: {
                uploadedBy: {
                    select: {
                        username: true,
                        email: true
                    }
                }
            }
        })

        return {
            success: true,
            data: document
        }
    } catch (error) {
        log.error('Error uploading document:', error)
        return handleError(error)
    }
}

export async function getDocuments(category?: string,
    page: number = 1,
    limit: number = 10
): Promise<PaginatedResponse<DocumentWithRelations>> {
    try {
        // Calculate skip value for pagination
        const skip = (page - 1) * limit

        // Get total count for pagination
        const total = await prisma.studentIdea.count({
            where: {
                ...(status && status !== 'all' ? { status: status as any } : {})
            }
        })
        const documents = await prisma.document.findMany({
            where: {
                isPublic: true,
                ...(category
                    && category !== 'all'
                    ? { category } : {})
            },
            include: {
                uploadedBy: {
                    select: {
                        username: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: skip,
            take: limit
        })
        return {
            success: true,
            data: {
                total: total,
                page: page,
                pageSize: limit,
                totalPages: Math.ceil(total / limit),
                data: documents
            }
        }
    } catch (error) {
        log.error('Error fetching documents:', error)
        return handleError(error)
    }
}

export async function getDocumentById(id: number): Promise<ServiceResponse<DocumentWithRelations>> {
    try {
        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                uploadedBy: {
                    select: {
                        username: true,
                        email: true
                    }
                }
            }
        })

        if (!document) {
            return {
                success: false,
                error: 'Document not found'
            }
        }

        // Increment download count
        await prisma.document.update({
            where: { id },
            data: {
                downloads: {
                    increment: 1
                }
            }
        })

        return {
            success: true,
            data: document
        }
    } catch (error) {
        log.error('Error fetching document:', error)
        return handleError(error)
    }
}

export async function deleteDocument(id: number): Promise<ServiceResponse> {
    try {
        const session = await getSession()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const document = await prisma.document.findUnique({
            where: { id }
        })

        if (!document) {
            return {
                success: false,
                error: 'Document not found'
            }
        }

        // Delete file from Cloudinary
        const publicId = document.fileUrl.split('/').slice(-1)[0].split('.')[0]
        await cloudinary.uploader.destroy(publicId)

        // Delete document record
        await prisma.document.delete({
            where: { id }
        })

        return {
            success: true,
            data: {
                message: 'Document deleted successfully'
            }
        }
    } catch (error) {
        log.error('Error deleting document:', error)
        return handleError(error)
    }
} 