'use server'
import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { log } from '../logger'
import { ServiceResponse } from '../types/common'
import { generatePermitEmailTemplate } from '../email/templates-views/permit-email-template'
import { generateReceiptEmailTemplate } from '../email/templates-views/receipt-email-template'
import { generateRevokedPermitEmailTemplate } from '../email/templates-views/revoked-permit-email-template'
import { generatePasswordResetEmailTemplate } from '../email/templates-views/password-reset-email-template'
import { generateStudentAuthPasswordEmailTemplate } from '../email/templates-views/student-auth-password-email-template'
import { render } from '@react-email/components'
import { handleError } from '../utils'
import { generateContactEmailTemplate } from '../email/templates-views/contact-email-template'
console.log('Email service initialized with SMTP host:', process.env.SMTP_HOST, 'and port:', process.env.SMTP_PORT)

const smtpHost = process.env.SMTP_HOST || "smtp.zoho.com"
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465
const smtpSecure = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === 'true'
  : smtpPort === 465
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  ...(smtpUser && smtpPass
    ? {
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    }
    : {}),
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
    // const receiptEmail = generateReceiptEmailTemplate({ student, permit, permitCode, qrCode })
    // await sendEmail({
    //   to: student.email,
    //   subject: `Knutsford University SRC - Payment Receipt (${permitCode})`,
    //   template: receiptEmail,

    // })

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

export async function sendPasswordResetEmail({ email, name, username, resetToken }: { email: string, name: string, username: string, resetToken: string }): Promise<ServiceResponse> {
  try {
    const passwordResetEmail = generatePasswordResetEmailTemplate({ name, username, resetToken })
    await sendEmail({
      to: email,
      subject: 'Game Hub - Password Reset Request',
      template: passwordResetEmail,
    })
    return { success: true }
  } catch (error) {
    log.error('Error sending password reset email:', error)
    return handleError(error)
  }
}

export async function sendStudentAuthPasswordEmail({
  email,
  name,
  username,
  setupUrl,
  purpose,
  expiresInHours
}: {
  email: string
  name: string
  username: string
  setupUrl: string
  purpose: 'setup_password' | 'reset_password'
  expiresInHours: number
}): Promise<ServiceResponse> {
  try {
    const template = generateStudentAuthPasswordEmailTemplate({
      name,
      username,
      setupUrl,
      purpose,
      expiresInHours
    })
    await sendEmail({
      to: email,
      subject: purpose === 'reset_password'
        ? 'Knutsford SRC App - Reset your student password'
        : 'Knutsford SRC App - Set up your student password',
      template
    })
    return { success: true }
  } catch (error) {
    log.error('Error sending student auth password email:', error)
    return handleError(error)
  }
}
