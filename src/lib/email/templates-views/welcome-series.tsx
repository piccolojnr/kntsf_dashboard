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
  Button,
  Hr,
} from "@react-email/components";

interface WelcomeSeriesProps {
  firstName?: string;
  organizationName?: string;
  logoUrl?: string;
  unsubscribeUrl?: string;
  websiteUrl?: string;
}

export const WelcomeSeries = ({
  firstName = "there",
  organizationName = "KNUTSFORD SRC",
  logoUrl = "/placeholder.svg?height=60&width=200",
  unsubscribeUrl = "#",
  websiteUrl = "#",
}: WelcomeSeriesProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Welcome to {organizationName}! We&apos;re excited to have you.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={logoUrl}
              width="200"
              height="60"
              alt={organizationName}
              style={logo}
            />
          </Section>

          {/* Welcome Banner */}
          <Section style={welcomeBanner}>
            <Text style={welcomeEmoji}>🎉</Text>
            <Heading style={welcomeHeading}>
              Welcome to {organizationName}!
            </Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {firstName},</Text>

            <Text style={text}>
              We&apos;re thrilled to have you join our community! You&apos;ve
              successfully subscribed to our newsletter, and we can&apos;t wait
              to share exciting updates, events, and opportunities with you.
            </Text>

            <Section style={benefitsSection}>
              <Heading style={h2}>What to expect:</Heading>
              <Text style={benefitItem}>
                📰 Weekly updates on campus activities
              </Text>
              <Text style={benefitItem}>
                🎓 Academic resources and opportunities
              </Text>
              <Text style={benefitItem}>
                🎉 Event announcements and invitations
              </Text>
              <Text style={benefitItem}>
                🏆 Student achievements and success stories
              </Text>
            </Section>

            <Text style={text}>
              Stay connected with us and make the most of your university
              experience. If you have any questions or suggestions, feel free to
              reach out!
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={websiteUrl}>
                Visit Our Website
              </Button>
            </Section>

            <Text style={signature}>
              Best regards,
              <br />
              The {organizationName} Team
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this email because you subscribed to{" "}
              {organizationName} newsletter.
            </Text>
            <Text style={footerText}>
              <Link href={unsubscribeUrl} style={link}>
                Unsubscribe
              </Link>{" "}
              from these emails.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "20px 30px",
  backgroundColor: "#1f2937",
};

const logo = {
  margin: "0 auto",
};

const welcomeBanner = {
  backgroundColor: "#dbeafe",
  padding: "40px 30px",
  textAlign: "center" as const,
};

const welcomeEmoji = {
  fontSize: "48px",
  margin: "0 0 20px 0",
};

const welcomeHeading = {
  color: "#1e40af",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0",
  lineHeight: "40px",
};

const content = {
  padding: "30px",
};

const greeting = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 20px 0",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "20px 0",
};

const h2 = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "30px 0 15px 0",
};

const benefitsSection = {
  backgroundColor: "#f9fafb",
  padding: "25px",
  borderRadius: "8px",
  margin: "25px 0",
};

const benefitItem = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const signature = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "30px 0 0 0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const footer = {
  padding: "0 30px",
};

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "16px 0",
};

const link = {
  color: "#3b82f6",
  textDecoration: "underline",
};
