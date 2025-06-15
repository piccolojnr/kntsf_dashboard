'use server'

import prisma from '../prisma/client'
import { log } from '../logger'
import { ServiceResponse } from '../types/common'
import { handleError } from '../utils'
import { Config, ContactInfo, PermitConfig, SemesterConfig } from '@prisma/client'
import cloudinary from '../cloudinary'

export interface ConfigUpdateData {
    appName?: string
    appDescription?: string
    appLogo?: string
    appFavicon?: string
    primaryColor?: string
    secondaryColor?: string
    socialLinks?: Record<string, string>
}

export interface ContactInfoUpdateData {
    email?: string
    phone?: string
    address?: string
    website?: string
}

export interface FooterSectionUpdateData {
    id?: number
    title: string
    content: string
    order: number
}

export interface SemesterConfigUpdateData {
    currentSemester: string
    academicYear: string
    startDate: Date
    endDate: Date
    isActive: boolean
}

export interface PermitConfigUpdateData {
    expirationDate: Date
    defaultAmount: number
    currency: string
}

export interface ConfigWithRelations extends Config {
    contactInfo: ContactInfo | null
    semesterConfig: SemesterConfig | null
    permitConfig: PermitConfig | null
}

export interface PublicConfig {
    appName: string
    appDescription: string | null
    appLogo: string | null
    appFavicon: string | null
    socialLinks: Record<string, string> | null
    contactInfo: {
        email: string | null
        phone: string | null
        address: string | null
        website: string | null
    } | null
    semesterConfig: {
        currentSemester: string
        academicYear: string
        startDate: Date
        endDate: Date
        isActive: boolean
    } | null
    permitConfig: {
        defaultAmount: number
        currency: string
    } | null
}

export async function getConfig(): Promise<ServiceResponse<ConfigWithRelations>> {
    try {
        const config = await prisma.config.findFirst({
            include: {
                contactInfo: true,
                semesterConfig: true,
                permitConfig: true
            }
        })

        if (!config) {
            return {
                success: false,
                error: 'Configuration not found'
            }
        }

        return {
            success: true,
            data: config
        }
    } catch (error: any) {
        log.error('Error fetching configuration:', error)
        return handleError(error)
    }
}

export async function getPublicConfig(): Promise<ServiceResponse<PublicConfig>> {
    try {
        const config = await prisma.config.findFirst({
            include: {
                contactInfo: true,
                semesterConfig: true,
                permitConfig: true
            }
        })

        if (!config) {
            return {
                success: false,
                error: 'Configuration not found'
            }
        }

        // Transform the config to only include public information
        const publicConfig: PublicConfig = {
            appName: config.appName,
            appDescription: config.appDescription,
            appLogo: config.appLogo,
            appFavicon: config.appFavicon,
            socialLinks: config.socialLinks as Record<string, string> | null,
            contactInfo: config.contactInfo ? {
                email: config.contactInfo.email,
                phone: config.contactInfo.phone,
                address: config.contactInfo.address,
                website: config.contactInfo.website
            } : null,
            semesterConfig: config.semesterConfig ? {
                currentSemester: config.semesterConfig.currentSemester,
                academicYear: config.semesterConfig.academicYear,
                startDate: config.semesterConfig.startDate,
                endDate: config.semesterConfig.endDate,
                isActive: config.semesterConfig.isActive
            } : null,
            permitConfig: config.permitConfig ? {
                defaultAmount: config.permitConfig.defaultAmount,
                currency: config.permitConfig.currency
            } : null
        }

        return {
            success: true,
            data: publicConfig
        }
    } catch (error: any) {
        log.error('Error fetching public configuration:', error)
        return handleError(error)
    }
}

export async function uploadConfigImage(formData: FormData, type: 'logo' | 'favicon'): Promise<ServiceResponse<{ url: string }>> {
    try {
        const file = formData.get('image') as File;
        if (!file) {
            return { success: false, error: 'No file uploaded' };
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'knust-src',
                    public_id: `config_${type}`,
                    overwrite: true,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        return {
            success: true,
            data: { url: uploadResult.secure_url }
        };
    } catch (error) {
        log.error('Failed to upload config image:', error);
        return handleError(error);
    }
}

export async function updateConfig(data: ConfigUpdateData): Promise<ServiceResponse> {
    try {
        const config = await prisma.config.update({
            where: { id: 1 },
            data
        })

        return {
            success: true,
            data: config
        }
    } catch (error: any) {
        log.error('Error updating configuration:', error)
        return handleError(error)
    }
}

export async function updateContactInfo(data: ContactInfoUpdateData): Promise<ServiceResponse> {
    try {
        const contactInfo = await prisma.contactInfo.update({
            where: { configId: 1 },
            data
        })

        return {
            success: true,
            data: contactInfo
        }
    } catch (error: any) {
        log.error('Error updating contact info:', error)
        return handleError(error)
    }
}

export async function updateSemesterConfig(data: SemesterConfigUpdateData): Promise<ServiceResponse> {
    try {
        const semesterConfig = await prisma.semesterConfig.update({
            where: { configId: 1 },
            data
        })

        return {
            success: true,
            data: semesterConfig
        }
    } catch (error: any) {
        log.error('Error updating semester configuration:', error)
        return handleError(error)
    }
}

export async function updatePermitConfig(data: PermitConfigUpdateData): Promise<ServiceResponse> {
    try {
        const permitConfig = await prisma.permitConfig.update({
            where: { configId: 1 },
            data
        })

        return {
            success: true,
            data: permitConfig
        }
    } catch (error: any) {
        log.error('Error updating permit configuration:', error)
        return handleError(error)
    }
} 