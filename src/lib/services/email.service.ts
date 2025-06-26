'use server'
import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { log } from '../logger'
import { ServiceResponse } from '../types/common'
import { generatePermitEmailTemplate } from '../email/templates-views/permit-email-template'
import { generateReceiptEmailTemplate } from '../email/templates-views/receipt-email-template'
import { generateRevokedPermitEmailTemplate } from '../email/templates-views/revoked-permit-email-template'
import { render } from '@react-email/components'
import { handleError } from '../utils'
import { generateContactEmailTemplate } from '../email/templates-views/contact-email-template'
// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.zoho.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "admin@knutsfordsrc.com",
    pass: process.env.SMTP_PASS || "VfLXcDCtKHHT"
  },
  tls: {
    rejectUnauthorized: false
  }
} as SMTPTransport.Options)

export interface EmailOptions {
  to: string
  subject: string
  template: {
    text: string
    html: React.JSX.Element
  }
  attachments?: {
    filename: string
    content: Buffer | string
    encoding?: string
    cid?: string
  }[]
}

export interface PermitEmailData {
  student: {
    email: string
    name: string
    studentId: string
    course: string
    level: string
  }
  permit: {
    id: string
    amountPaid: number
    expiryDate: Date
  }
  qrCode: string
  permitCode: string
}

export async function sendEmail(options: EmailOptions): Promise<ServiceResponse> {
  try {
    const emailHtml = await render(options.template.html, {})
    const mailOptions = {
      from: {
        name: 'Knutsford University SRC',
        address: process.env.SMTP_FROM_ADDRESS || 'admin@knutsfordsrc.com'
      },
      ...options,
      html: emailHtml,
      text: options.template.text,
      headers: {
        'X-Entity-Ref-ID': Date.now().toString(),
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
        Precedence: 'bulk'
      },
      priority: 'high' as 'high' | 'normal' | 'low',
      date: new Date()
    }

    const response = await transporter.sendMail(mailOptions)
    if (!response.accepted || response.accepted.length === 0) {
      return { success: false, error: 'Email not accepted by the server' }
    }
    return { success: true }
  } catch (error) {
    log.error('Error sending email:', error)
    return handleError(error)

  }
}

export async function sendPermitEmails(data: PermitEmailData): Promise<ServiceResponse> {
  try {
    const { student, permit, qrCode, permitCode } = data

    // Send permit details email
    const permitEmail = generatePermitEmailTemplate({ student, permit, permitCode, qrCode })
    await sendEmail({
      to: student.email,
      subject: `Knutsford University SRC - Permit Issued (${permitCode})`,
      template: permitEmail,

    })

    // Send receipt email
    const receiptEmail = generateReceiptEmailTemplate({ student, permit, permitCode, qrCode })
    await sendEmail({
      to: student.email,
      subject: `Knutsford University SRC - Payment Receipt (${permitCode})`,
      template: receiptEmail,

    })

    return { success: true }
  } catch (error) {
    log.error('Error sending permit emails:', error)
    return handleError(error)

  }
}

export async function sendRevokedPermitEmail(
  data: Omit<PermitEmailData, 'qrCode'>
): Promise<ServiceResponse> {
  try {
    const { student, permit, permitCode } = data
    const email = generateRevokedPermitEmailTemplate({ student, permit, permitCode })

    await sendEmail({
      to: student.email,
      subject: `Knutsford University SRC - Permit Revoked (${permitCode})`,
      template: email
    })

    return { success: true }
  } catch (error) {
    log.error('Error sending revoked permit email:', error)
    return handleError(error)

  }
}

export async function sendContactEmail({ name, email, subject, message }: { name: string, email: string, subject: string, message: string }): Promise<ServiceResponse> {
  try {
    const contactEmail = generateContactEmailTemplate({ name, email, subject, message })
    await sendEmail({
      to: process.env.CONTACT_FORM_RECEIVER || 'admin@knutsfordsrc.com',
      subject: `Contact Form Submission: ${subject}`,
      template: contactEmail,
    })
    return { success: true }
  } catch (error) {
    log.error('Error sending contact form email:', error)
    return handleError(error)
  }
}
