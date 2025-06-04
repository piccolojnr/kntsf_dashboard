import { toast } from 'sonner'
import { generatePermitEmailTemplate } from './template-views/permit-email-template'
import { generateReceiptEmailTemplate } from './template-views/receipt-email-template'
import { generateRevokedPermitEmailTemplate } from './template-views/revoked-permit-email-template'

interface PermitResponse {
  data: {
    student: {
      email: string
      name: string
      studentId: string
      course: string
      level: string
    }
    id: string
    amountPaid: number
    expiryDate: Date
  }
  qrCode: string
  permitCode: string
}

export async function sendPermitEmails(response: PermitResponse) {
  const { data, qrCode, permitCode } = response
  const { student, ...permit } = data

  try {
    // Send permit details email
    await sendPermitDetailsEmail(student, permit, qrCode, permitCode)

    // Send receipt email
    await sendReceiptEmail(student, permit, qrCode, permitCode)

    toast.success("Permit details and receipt have been sent to the student's email.")
  } catch (error) {
    console.error('Error sending emails:', error)
    toast.error('Failed to send emails. Please check your email settings.')
  }
}

async function sendPermitDetailsEmail(
  student: PermitResponse['data']['student'],
  permit: Omit<PermitResponse['data'], 'student'>,
  qrCode: string,
  permitCode: string
) {
  const { html, text } = generatePermitEmailTemplate({
    student,
    permit,
    permitCode
  })
  const base64Image = qrCode.split(',')[1] // removes "data:image/png;base64,"

  return window.api.email.send({
    to: student.email,
    subject: 'Knutsford University SRC - Your Permit Details',
    text,
    html,
    attachments: [
      {
        filename: 'qr-code.png',
        content: base64Image,
        encoding: 'base64',
        cid: 'qr-code.png' // this ID will be referenced in your HTML
      }
    ]
  })
}

async function sendReceiptEmail(
  student: PermitResponse['data']['student'],
  permit: Omit<PermitResponse['data'], 'student'>,
  qrCode: string,
  permitCode: string
) {
  const { html, text } = generateReceiptEmailTemplate({
    student,
    permit,
    permitCode
  })
  const base64Image = qrCode.split(',')[1] // removes "data:image/png;base64,"
  return window.api.email.send({
    to: student.email,
    subject: 'Knutsford University SRC - Payment Receipt',
    text,
    html,
    attachments: [
      {
        filename: 'qr-code.png',
        content: base64Image,
        encoding: 'base64',
        cid: 'qr-code.png' // this ID will be referenced in your HTML
      }
    ]
  })
}

export async function sendRevokedPermitEmail(
  student: {
    email: string
    name: string
    studentId: string
    course: string
    level: string
  },
  permit: {
    id: string
    amountPaid: number
    expiryDate: Date
  },
  permitCode: string
) {
  const { html, text } = generateRevokedPermitEmailTemplate({
    student,
    permit,
    permitCode
  })

  try {
    await window.api.email.send({
      to: student.email,
      subject: 'Knutsford University SRC - Permit Revoked',
      text,
      html
    })

    toast.success("Revocation notice has been sent to the student's email.")
  } catch (error) {
    console.error('Error sending revoked permit email:', error)
    toast.error('Failed to send revocation notice. Please check your email settings.')
  }
}
