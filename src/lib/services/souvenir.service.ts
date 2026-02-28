'use server'
import prisma from '../prisma/client'
import { log } from '../logger'
import { ServiceResponse } from '../types/common'
import { Souvenir, StudentSouvenir } from '@prisma/client'
import { handleError } from '../utils'

export async function getAllSouvenirs(): Promise<ServiceResponse<Souvenir[]>> {
    try {
        const souvenirs = await prisma.souvenir.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: souvenirs };
    } catch (error) {
        log.error('Failed to fetch souvenirs', error);
        return handleError(error);
    }
}

export async function createSouvenir(name: string, description?: string): Promise<ServiceResponse<Souvenir>> {
    try {
        const souvenir = await prisma.souvenir.create({
            data: {
                name,
                description
            }
        });
        return { success: true, data: souvenir };
    } catch (error) {
        log.error('Failed to create souvenir', error);
        return handleError(error);
    }
}

export async function toggleSouvenirStatus(id: number, isActive: boolean): Promise<ServiceResponse<Souvenir>> {
    try {
        const souvenir = await prisma.souvenir.update({
            where: { id },
            data: { isActive }
        });
        return { success: true, data: souvenir };
    } catch (error) {
        log.error('Failed to toggle souvenir status', error);
        return handleError(error);
    }
}

export async function recordStudentSouvenir(studentId: number, souvenirId: number, recordedById: number): Promise<ServiceResponse<StudentSouvenir>> {
    try {
        const record = await prisma.studentSouvenir.create({
            data: {
                studentId,
                souvenirId,
                recordedById
            }
        });
        return { success: true, data: record };
    } catch (error) {
        log.error('Failed to record student souvenir', error);
        return handleError(error);
    }
}

export async function removeStudentSouvenir(id: number): Promise<ServiceResponse<void>> {
    try {
        await prisma.studentSouvenir.delete({
            where: { id }
        });
        return { success: true };
    } catch (error) {
        log.error('Failed to remove student souvenir', error);
        return handleError(error);
    }
}
