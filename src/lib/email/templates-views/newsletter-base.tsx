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
  Hr,
} from "@react-email/components";

interface NewsletterBaseProps {
  title: string;
  content: string;
  previewText?: string;
  unsubscribeUrl?: string;
  organizationName?: string;
}

export const NewsletterBase = ({
  title,
  content,
  previewText = "Newsletter from KNUTSFORD SRC",
  unsubscribeUrl = "#",
  organizationName = "KNUTSFORD SRC",
}: NewsletterBaseProps) => ({
  text: `Hi there,\n\n${title}\n\n${content}\n\nYou're receiving this email because you subscribed to ${organizationName} newsletter.\n\nUnsubscribe from these emails: ${unsubscribeUrl}\n\n© 2024 ${organizationName}. All rights reserved.`,
  html: (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={process.env.KNUTSFORD_LOGO_URL}
              width="70"
              height="80"
              alt={organizationName}
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={contentStyle}>
            <Heading style={h1}>{title}</Heading>
            <Text style={text}>{content}</Text>
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
            <Text style={footerText}>
              © 2024 {organizationName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  ),
});

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
};

const header = {
  padding: "20px 30px",
  backgroundColor: "#1f2937",
};

const logo = {
  margin: "0 auto",
};

const contentStyle = {
  padding: "30px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  padding: "0",
  lineHeight: "42px",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  whiteSpace: "pre-wrap" as const,
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
