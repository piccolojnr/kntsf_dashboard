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

interface MonthlyDigestProps {
  month: string;
  year: string;
  highlights: Array<{
    title: string;
    description: string;
    imageUrl?: string;
    readMoreUrl?: string;
  }>;
  upcomingEvents: Array<{
    title: string;
    date: string;
    location: string;
  }>;
  organizationName?: string;
  logoUrl?: string;
  unsubscribeUrl?: string;
}

export const MonthlyDigest = ({
  month,
  year,
  highlights,
  upcomingEvents,
  organizationName = "KNUST SRC",
  logoUrl = "/placeholder.svg?height=60&width=200",
  unsubscribeUrl = "#",
}: MonthlyDigestProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        {month} {year} Digest - {organizationName}
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

          {/* Title Section */}
          <Section style={titleSection}>
            <Heading style={h1}>
              {month} {year} Digest
            </Heading>
            <Text style={subtitle}>
              Your monthly roundup of campus news and events
            </Text>
          </Section>

          {/* Highlights Section */}
          <Section style={content}>
            <Heading style={h2}>📰 This Month&apos;s Highlights</Heading>

            {highlights.map((highlight, index) => (
              <Section key={index} style={highlightItem}>
                {highlight.imageUrl && (
                  <Img
                    src={highlight.imageUrl}
                    width="100%"
                    height="200"
                    alt={highlight.title}
                    style={highlightImage}
                  />
                )}
                <Heading style={h3}>{highlight.title}</Heading>
                <Text style={text}>{highlight.description}</Text>
                {highlight.readMoreUrl && (
                  <Link href={highlight.readMoreUrl} style={readMoreLink}>
                    Read more →
                  </Link>
                )}
              </Section>
            ))}

            {/* Upcoming Events */}
            <Hr style={sectionDivider} />
            <Heading style={h2}>📅 Upcoming Events</Heading>

            <Section style={eventsContainer}>
              {upcomingEvents.map((event, index) => (
                <Section key={index} style={eventItem}>
                  <Text style={eventTitle}>{event.title}</Text>
                  <Text style={eventDetails}>
                    📅 {event.date} • 📍 {event.location}
                  </Text>
                </Section>
              ))}
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href="#">
                View All Events
              </Button>
            </Section>
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

const titleSection = {
  padding: "40px 30px 20px",
  textAlign: "center" as const,
  backgroundColor: "#f8fafc",
};

const h1 = {
  color: "#1f2937",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 10px 0",
  lineHeight: "40px",
};

const subtitle = {
  color: "#6b7280",
  fontSize: "16px",
  margin: "0",
};

const content = {
  padding: "30px",
};

const h2 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0 20px 0",
  lineHeight: "32px",
};

const h3 = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "15px 0 10px 0",
  lineHeight: "28px",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "10px 0",
};

const highlightItem = {
  marginBottom: "30px",
  paddingBottom: "20px",
  borderBottom: "1px solid #e5e7eb",
};

const highlightImage = {
  borderRadius: "8px",
  marginBottom: "15px",
};

const readMoreLink = {
  color: "#3b82f6",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
};

const sectionDivider = {
  borderColor: "#e5e7eb",
  margin: "40px 0 30px 0",
};

const eventsContainer = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "8px",
  margin: "20px 0",
};

const eventItem = {
  marginBottom: "15px",
  paddingBottom: "15px",
  borderBottom: "1px solid #e5e7eb",
};

const eventTitle = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 5px 0",
};

const eventDetails = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "0",
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
