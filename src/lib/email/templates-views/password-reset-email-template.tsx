import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PasswordResetEmailProps {
  name: string;
  username: string;
  resetToken: string;
}

export const generatePasswordResetEmailTemplate = ({
  name,
  username,
  resetToken,
}: PasswordResetEmailProps) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/games/reset-password?token=${resetToken}`;

  return {
    text: `Hello ${name},

You requested a password reset for your Game Hub account.

Username: ${username}

To reset your password, click the link below:
${resetUrl}

This link will expire in 15 minutes for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
Knutsford University SRC Game Hub Team`,

    html: (
      <Html>
        <Head />
        <Preview>Reset your Game Hub password</Preview>
        <Body style={main}>
          <Container style={container}>
            <Section style={logoContainer}>
              <Img
                src={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`}
                width="120"
                height="40"
                alt="Knutsford University SRC"
                style={logo}
              />
            </Section>

            <Heading style={h1}>Password Reset Request</Heading>

            <Text style={text}>
              Hello <strong>{name}</strong>,
            </Text>

            <Text style={text}>
              You requested a password reset for your Game Hub account.
            </Text>

            <Section style={infoBox}>
              <Text style={infoText}>
                <strong>Username:</strong> {username}
              </Text>
            </Section>

            <Text style={text}>
              To reset your password, click the button below:
            </Text>

            <Section style={buttonContainer}>
              <Link href={resetUrl} style={button}>
                Reset Password
              </Link>
            </Section>

            <Text style={text}>
              Or copy and paste this link into your browser:
            </Text>
            <Text style={linkText}>{resetUrl}</Text>

            <Section style={warningBox}>
              <Text style={warningText}>
                <strong>Important:</strong> This link will expire in 15 minutes for security reasons.
              </Text>
            </Section>

            <Text style={text}>
              If you didn&apos;t request this password reset, please ignore this email and your password will remain unchanged.
            </Text>

            <Text style={footer}>
              Best regards,<br />
              Knutsford University SRC Game Hub Team
            </Text>
          </Container>
        </Body>
      </Html>
    ),
  };
};

const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '20px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const infoBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const infoText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  border: 'none',
  cursor: 'pointer',
};

const linkText = {
  color: '#007bff',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  margin: '16px 0',
};

const warningBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  color: '#856404',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const footer = {
  color: '#6c757d',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
};

