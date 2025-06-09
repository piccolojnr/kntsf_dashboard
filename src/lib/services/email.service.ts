'use server'
import nodemailer from 'nodemailer'
import { log } from '../logger'
import { ServiceResponse } from '../types/common'
import { generatePermitEmailTemplate } from '../email/templates-views/permit-email-template'
import { generateReceiptEmailTemplate } from '../email/templates-views/receipt-email-template'
import { generateRevokedPermitEmailTemplate } from '../email/templates-views/revoked-permit-email-template'
import { render } from '@react-email/components'

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
})

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
        address: process.env.EMAIL_USER || 'knutsforduniversitysrc@gmail.com'
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
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function sendPermitEmails(data: PermitEmailData): Promise<ServiceResponse> {
  try {
    const { student, permit, qrCode, permitCode } = data
    const base64Image = qrCode.split(',')[1] // removes "data:image/png;base64,"

    // Send permit details email
    const permitEmail = generatePermitEmailTemplate({ student, permit, permitCode, qrCode })
    await sendEmail({
      to: student.email,
      subject: `Knutsford University SRC - Permit Issued (${permitCode})`,
      template: permitEmail,

    })

    // Send receipt email
    const receiptEmail = generateReceiptEmailTemplate({ student, permit, permitCode })
    await sendEmail({
      to: student.email,
      subject: `Knutsford University SRC - Payment Receipt (${permitCode})`,
      template: receiptEmail,
      attachments: [
        {
          filename: "receipt-qr-code.png",
          content: base64Image,
          encoding: 'base64',
          cid: 'qr-code.png'
        }
      ]
    })

    return { success: true }
  } catch (error) {
    log.error('Error sending permit emails:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
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
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}
