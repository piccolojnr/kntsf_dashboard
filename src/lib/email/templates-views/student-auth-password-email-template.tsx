import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

type StudentAuthPasswordEmailProps = {
  name: string
  username: string
  setupUrl: string
  purpose: 'setup_password' | 'reset_password'
  expiresInHours: number
}

export function generateStudentAuthPasswordEmailTemplate({
  name,
  username,
  setupUrl,
  purpose,
  expiresInHours
}: StudentAuthPasswordEmailProps) {
  const isReset = purpose === 'reset_password'
  const title = isReset ? 'Reset Your Student App Password' : 'Set Up Your Student App Password'
  const action = isReset ? 'reset your password' : 'set up your password'

  return {
    text: `Hello ${name},

${isReset ? 'A password reset was requested for your student mobile account.' : 'Your student mobile account has been activated.'}

Username: ${username}

Use this secure link to ${action}:
${setupUrl}

This link expires in ${expiresInHours} hours. If you did not expect this email, contact the SRC office.

Knutsford University SRC`,
    html: (
      <Html>
        <Head />
        <Preview>{title}</Preview>
        <Body style={main}>
          <Container style={container}>
            <Heading style={h1}>{title}</Heading>
            <Text style={text}>Hello <strong>{name}</strong>,</Text>
            <Text style={text}>
              {isReset
                ? 'A password reset was requested for your student mobile account.'
                : 'Your student mobile account has been activated.'}
            </Text>
            <Section style={infoBox}>
              <Text style={infoText}><strong>Username:</strong> {username}</Text>
            </Section>
            <Text style={text}>Use the secure button below to {action}.</Text>
            <Section style={buttonContainer}>
              <Link href={setupUrl} style={button}>{isReset ? 'Reset Password' : 'Set Password'}</Link>
            </Section>
            <Text style={text}>Or copy and paste this link into your browser:</Text>
            <Text style={linkText}>{setupUrl}</Text>
            <Section style={warningBox}>
              <Text style={warningText}>
                This link expires in {expiresInHours} hours and can only be used once.
              </Text>
            </Section>
            <Text style={footer}>Knutsford University SRC</Text>
          </Container>
        </Body>
      </Html>
    )
  }
}

const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '20px 0'
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  padding: '28px 32px 40px'
}

const h1 = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0'
}

const infoBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '14px 16px',
  margin: '22px 0'
}

const infoText = {
  color: '#111827',
  fontSize: '14px',
  margin: '0'
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0'
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '12px 22px',
  textDecoration: 'none'
}

const linkText = {
  color: '#2563eb',
  fontSize: '14px',
  lineHeight: '20px',
  wordBreak: 'break-all' as const
}

const warningBox = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '8px',
  padding: '14px 16px',
  margin: '24px 0'
}

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  margin: '0'
}

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '30px 0 0',
  textAlign: 'center' as const
}
