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

interface EventAnnouncementProps {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventDescription: string;
  eventImageUrl?: string;
  registrationUrl?: string;
  organizationName?: string;
  logoUrl?: string;
  unsubscribeUrl?: string;
}

export const EventAnnouncement = ({
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  eventDescription,
  eventImageUrl = "/placeholder.svg?height=300&width=600",
  registrationUrl = "#",
  organizationName = "KNUTSFORD SRC",
  logoUrl = "/placeholder.svg?height=60&width=200",
  unsubscribeUrl = "#",
}: EventAnnouncementProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Join us for {eventTitle} - {eventDate}
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

          {/* Event Image */}
          <Section style={imageSection}>
            <Img
              src={eventImageUrl}
              width="600"
              height="300"
              alt={eventTitle}
              style={eventImage}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>{eventTitle}</Heading>

            <Section style={eventDetails}>
              <Text style={detailItem}>
                <strong>📅 Date:</strong> {eventDate}
              </Text>
              <Text style={detailItem}>
                <strong>🕐 Time:</strong> {eventTime}
              </Text>
              <Text style={detailItem}>
                <strong>📍 Location:</strong> {eventLocation}
              </Text>
            </Section>

            <Text style={description}>{eventDescription}</Text>

            <Section style={buttonContainer}>
              <Button style={button} href={registrationUrl}>
                Register Now
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

const imageSection = {
  padding: "0",
};

const eventImage = {
  width: "100%",
  height: "auto",
};

const content = {
  padding: "30px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 30px 0",
  lineHeight: "36px",
};

const eventDetails = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "8px",
  margin: "20px 0",
};

const detailItem = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
};

const description = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "20px 0",
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
