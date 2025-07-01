import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface NewsletterConfirmationEmailProps {
  name: string;
  confirmationLink: string;
}

export const generateNewsletterConfirmationTemplate = ({
  name,
  confirmationLink,
}: NewsletterConfirmationEmailProps) => ({
  text: `Hi ${name},\n\nThank you for subscribing to our newsletter! Please click the link below to confirm your subscription:\n\n${confirmationLink}\n\nBest regards,\nThe KNUTSFORD SRC Team`,
  html: (
    <Html>
      <Head />
      <Preview>Confirm your newsletter subscription</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Our Newsletter!</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Thank you for subscribing to our newsletter! We&apos;re excited to
            keep you updated with the latest news and events from KNUTSFORD SRC.
          </Text>
          <Text style={text}>
            To confirm your subscription, please click the button below:
          </Text>
          <Link href={confirmationLink} target="_blank" style={button}>
            Confirm Subscription
          </Link>
          <Text style={text}>
            If you didn&apos;t request this subscription, you can safely ignore
            this email.
          </Text>
          <Text style={footer}>
            Best regards,
            <br />
            The KNUTSFORD SRC Team
          </Text>
        </Container>
      </Body>
    </Html>
  ),
});

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "16px 0",
};

const text = {
  color: "#444",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "16px 0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#fff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "1.5",
  margin: "16px 0",
  padding: "12px 24px",
  textDecoration: "none",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "16px 0",
};
