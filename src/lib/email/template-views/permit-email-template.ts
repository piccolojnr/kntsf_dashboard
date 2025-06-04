import { BASE_URL } from '@/lib/constants'

interface PermitEmailData {
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

export function generatePermitEmailTemplate({ student, permit, permitCode }: PermitEmailData) {
  const text = `Dear ${student.name},

Your SRC permit has been created successfully.

Permit Code: ${permitCode}
Student ID: ${student.studentId}
Course: ${student.course}
Level: ${student.level}
Amount Paid: GHS ${permit.amountPaid}
Expiry Date: ${permit.expiryDate.toLocaleDateString()}

Please keep this information safe.

Best regards,
Knutsford University SRC Team`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Permit Details</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="${BASE_URL}/knutsford_logo.png" alt="Knutsford University Logo" style="max-width: 200px; height: auto;">
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #0d6efd; margin-top: 0;">Permit Created Successfully</h2>

            <p>Dear ${student.name},</p>

            <p>Your SRC permit has been created successfully. Please find your permit details below:</p>

            <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Permit Code:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${permitCode}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Student ID:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${student.studentId}</td>
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
                        <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Expiry Date:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${permit.expiryDate.toLocaleDateString()}</td>
                    </tr>
                </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <img src="cid:qr-code.png" alt="Permit QR Code" style="max-width: 200px; height: auto;">
            </div>

            <p style="color: #666; font-size: 14px;">Please keep this information safe and present your permit code when required.</p>
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
