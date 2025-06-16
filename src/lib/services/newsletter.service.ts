'use server'

import prisma from '../prisma/client'
import { log } from '../logger'
import { ServiceResponse } from '../types/common'
import { handleError } from '../utils'
import { randomBytes } from 'crypto'
import { sendEmail } from './email.service'
import { generateNewsletterConfirmationTemplate } from '@/lib/email/templates-views/newsletter-confirmation-template'
import { generateNewsletterEmailTemplate } from '@/lib/email/templates-views/newsletter-email-template'
import { getSession } from '../auth/auth'
import { Newsletter } from '@prisma/client'

export interface SubscribeData {
    email: string
    name?: string
    studentId?: string
}

export interface NewsletterData {
    title: string
    content: string
    status?: 'DRAFT' | 'SCHEDULED' | 'SENT'
}
export interface NewsletterWithRelations extends Newsletter {
    sentBy: {
        name: string
        email: string
    }
}

export interface NewsletterSubscriber {
    id: number
    email: string
    name: string | null
    studentId: number | null
    status: 'ACTIVE' | 'PENDING' | 'UNSUBSCRIBED'
    createdAt: Date
}


export async function subscribe(data: SubscribeData): Promise<ServiceResponse<{ message: string }>> {
    try {

        // Check if email already exists
        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: data.email }
        })

        if (existingSubscriber) {
            if (existingSubscriber.status === 'ACTIVE') {
                return {
                    success: false,
                    error: 'You are already subscribed to our newsletter'
                }
            }
            if (existingSubscriber.status === 'PENDING') {
                return {
                    success: false,
                    error: 'Please check your email to confirm your subscription'
                }
            }
        }

        // Generate verification token
        const token = randomBytes(32).toString('hex')

        // Create new subscriber
        await prisma.newsletterSubscriber.create({
            data: {
                email: data.email,
                name: data.name,
                studentId: parseInt(data.studentId || '0', 10),
                token
            }
        })

        // Send confirmation email
        const emailTemplate = generateNewsletterConfirmationTemplate({
            name: data.name || 'there',
            confirmationLink: `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/confirm?token=${token}`
        })

        await sendEmail({
            to: data.email,
            subject: 'Confirm your newsletter subscription',
            template: emailTemplate
        })

        return {
            success: true,
            data: {
                message: 'Please check your email to confirm your subscription'
            }
        }
    } catch (error) {
        log.error('Error subscribing to newsletter:', error)
        return handleError(error)
    }
}

export async function confirmSubscription(token: string): Promise<ServiceResponse<{ message: string }>> {
    try {
        const subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { token }
        })

        if (!subscriber) {
            return {
                success: false,
                error: 'Invalid or expired confirmation link'
            }
        }

        if (subscriber.status === 'ACTIVE') {
            return {
                success: false,
                error: 'Subscription already confirmed'
            }
        }

        await prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: {
                status: 'ACTIVE',
                token: undefined // Clear the token after confirmation
            }
        })

        return {
            success: true,
            data: {
                message: 'Your subscription has been confirmed'
            }
        }
    } catch (error) {
        log.error('Error confirming newsletter subscription:', error)
        return handleError(error)
    }
}

export async function unsubscribe(email: string): Promise<ServiceResponse<{ message: string }>> {
    try {
        const subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        })

        if (!subscriber) {
            return {
                success: false,
                error: 'Subscriber not found'
            }
        }

        await prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: {
                status: 'UNSUBSCRIBED'
            }
        })

        return {
            success: true,
            data: {
                message: 'You have been unsubscribed from the newsletter'
            }
        }
    } catch (error) {
        log.error('Error unsubscribing from newsletter:', error)
        return handleError(error)
    }
}

export async function getSubscribers(): Promise<ServiceResponse<NewsletterSubscriber[]>> {
    try {
        const subscribers = await prisma.newsletterSubscriber.findMany({
            where: {
                status: 'ACTIVE'
            },
            select: {
                id: true,
                email: true,
                name: true,
                status: true,
                studentId: true,
                createdAt: true
            }
        })

        return {
            success: true,
            data: subscribers
        }
    } catch (error) {
        log.error('Error fetching newsletter subscribers:', error)
        return handleError(error)
    }
}

export async function createNewsletter(data: NewsletterData): Promise<ServiceResponse<NewsletterWithRelations>> {
    try {
        const session = await getSession();

        if (!session?.user) {
            return { success: false, error: 'Unauthorized' };
        }

        const { id } = session.user as any;

        if (!id) {
            return { success: false, error: 'Unauthorized' };
        }
        const newsletter = await prisma.newsletter.create({
            data: {
                title: data.title,
                content: data.content,
                status: data.status || 'DRAFT',
                sentBy: {
                    connect: { id: parseInt(id, 10) } // Ensure id is a number
                }
            },
            include: {
                sentBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        return {
            success: true,
            data: newsletter
        }
    } catch (error) {
        log.error('Error creating newsletter:', error)
        return handleError(error)
    }
}

export async function updateNewsletter(id: number, data: Partial<NewsletterData>): Promise<ServiceResponse<NewsletterWithRelations>> {
    try {
        const newsletter = await prisma.newsletter.update({
            where: { id },
            data,
            include: {
                sentBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        return {
            success: true,
            data: newsletter
        }
    } catch (error) {
        log.error('Error updating newsletter:', error)
        return handleError(error)
    }
}

export async function getNewsletters(): Promise<ServiceResponse<NewsletterWithRelations[]>> {
    try {
        const newsletters = await prisma.newsletter.findMany({
            include: {
                sentBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return {
            success: true,
            data: newsletters
        }
    } catch (error) {
        log.error('Error fetching newsletters:', error)
        return handleError(error)
    }
}

export async function sendNewsletter(id: number): Promise<ServiceResponse<{ message: string }>> {
    try {
        const newsletter = await prisma.newsletter.findUnique({
            where: { id }
        })

        if (!newsletter) {
            return {
                success: false,
                error: 'Newsletter not found'
            }
        }

        if (newsletter.status === 'SENT') {
            return {
                success: false,
                error: 'Newsletter has already been sent'
            }
        }

        // Get all active subscribers
        const subscribers = await prisma.newsletterSubscriber.findMany({
            where: {
                status: 'ACTIVE'
            }
        })

        // Send email to each subscriber
        for (const subscriber of subscribers) {
            const emailTemplate = generateNewsletterEmailTemplate({
                name: subscriber.name || 'there',
                title: newsletter.title,
                content: newsletter.content
            })

            await sendEmail({
                to: subscriber.email,
                subject: newsletter.title,
                template: emailTemplate
            })
        }

        // Update newsletter status
        await prisma.newsletter.update({
            where: { id },
            data: {
                status: 'SENT',
                sentAt: new Date()
            }
        })

        return {
            success: true,
            data: {
                message: `Newsletter sent to ${subscribers.length} subscribers`
            }
        }
    } catch (error) {
        log.error('Error sending newsletter:', error)
        return handleError(error)
    }
} 