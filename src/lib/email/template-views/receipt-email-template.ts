import { BASE_URL } from '@/lib/constants'

interface ReceiptEmailData {
  student: {
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
  permitCode: string
}

export function generateReceiptEmailTemplate({ student, permit, permitCode }: ReceiptEmailData) {
  const currentDate = new Date()

  const text = `Dear ${student.name},

Thank you for your payment. Please find your receipt details below:

Receipt No: ${permit.id}
Date: ${currentDate.toLocaleDateString()}
Time: ${currentDate.toLocaleTimeString()}
Student ID: ${student.studentId}
Name: ${student.name}
Course: ${student.course}
Level: ${student.level}
Amount Paid: GHS ${permit.amountPaid}
Permit Code: ${permitCode}
Expiry Date: ${permit.expiryDate.toLocaleDateString()}
Status: Active

Best regards,
Knutsford University SRC Team`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="${BASE_URL}/knutsford_logo.png" alt="Knutsford University Logo" style="max-width: 200px; height: auto;">
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #0d6efd; margin-top: 0;">Payment Receipt</h2>

            <p>Dear ${student.name},</p>

            <p>Thank you for your payment. Please find your receipt details below:</p>

            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Receipt No:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${permit.id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${currentDate.toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${currentDate.toLocaleTimeString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Student ID:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${student.studentId}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${student.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Course:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${student.course}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Level:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${student.level}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">GHS ${permit.amountPaid}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Permit Code:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${permitCode}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Expiry Date:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${permit.expiryDate.toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Status:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">Active</td>
                    </tr>
                </table>
            </div>

            <p style="color: #666; font-size: 14px;">Please keep this receipt for your records.</p>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; font-size: 14px; color: #666;">
            <p style="margin: 0;">Best regards,<br>Knutsford University SRC Team</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Knutsford University SRC. All rights reserved.</p>
        </div>
    </body>
    </html>
  `

  return { html, text }
}
