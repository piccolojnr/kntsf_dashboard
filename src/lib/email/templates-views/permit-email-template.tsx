import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from "@react-email/components";

interface PermitEmailTemplateProps {
  student: {
    name: string;
    studentId: string;
    course: string;
    level: string;
  };
  permit: {
    id: string;
    amountPaid: number;
    expiryDate: Date;
  };
  permitCode: string;
}

export const generatePermitEmailTemplate = ({
  student,
  permit,
  permitCode,
}: PermitEmailTemplateProps) => {
  const previewText = `Your Knutsford University SRC Permit - ${permitCode}`;

  return {
    text: `Dear ${student.name},\n\nYour permit has been successfully processed. Permit Code: ${permitCode}\n\nAmount Paid: GHS ${permit.amountPaid}\nExpiry Date: ${permit.expiryDate.toLocaleDateString()}\n\nPlease find your QR code in this email.\n\nBest regards,\nKnutsford University SRC`,
    html: (
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Body style={main}>
          <Container style={container}>
            {/* Header Section */}
            <Section style={header}>
              <Img
                src={process.env.KNUTSFORD_LOGO_URL}
                width="70"
                height="80"
                alt="Knutsford University"
                style={logo}
              />
              <Text style={headerSubtext}>Student Representative Council</Text>
            </Section>

            {/* Success Banner */}
            <Section style={successBanner}>
              <Text style={successText}>✅ Permit Successfully Issued</Text>
            </Section>

            {/* Main Content */}
            <Section style={contentSection}>
              <Heading style={h1}>Your Permit Details</Heading>
              <Text style={greeting}>Dear {student.name},</Text>
              <Text style={text}>
                Congratulations! Your permit has been successfully processed and
                is now active.
              </Text>

              {/* Permit Code Highlight */}
              <Section style={permitCodeSection}>
                <Text style={permitCodeLabel}>Permit Code</Text>
                <Text style={permitCodeValue}>{permitCode}</Text>
              </Section>

              {/* Student & Permit Details */}
              <Row style={detailsRow}>
                <Column style={leftColumn}>
                  <Section style={detailsCard}>
                    <Text style={cardTitle}>Student Information</Text>
                    <Hr style={divider} />
                    <Text style={detailItem}>
                      <span style={detailLabel}>Student ID:</span>
                      <span style={detailValue}>{student.studentId}</span>
                    </Text>
                    <Text style={detailItem}>
                      <span style={detailLabel}>Course:</span>
                      <span style={detailValue}>{student.course}</span>
                    </Text>
                    <Text style={detailItem}>
                      <span style={detailLabel}>Level:</span>
                      <span style={detailValue}>{student.level}</span>
                    </Text>
                  </Section>
                </Column>
                <Column style={rightColumn}>
                  <Section style={detailsCard}>
                    <Text style={cardTitle}>Permit Information</Text>
                    <Hr style={divider} />
                    <Text style={detailItem}>
                      <span style={detailLabel}>Amount Paid:</span>
                      <span style={detailValue}>GHS {permit.amountPaid}</span>
                    </Text>
                    <Text style={detailItem}>
                      <span style={detailLabel}>Issue Date:</span>
                      <span style={detailValue}>
                        {new Date().toLocaleDateString()}
                      </span>
                    </Text>
                    <Text style={detailItem}>
                      <span style={detailLabel}>Expiry Date:</span>
                      <span style={detailValue}>
                        {permit.expiryDate.toLocaleDateString()}
                      </span>
                    </Text>
                  </Section>
                </Column>
              </Row>

              {/* QR Code Section */}
              <Section style={qrSection}>
                <Text style={qrTitle}>Your Digital Permit</Text>
                <Text style={qrSubtext}>
                  Present this QR code when required. Save it to your phone for
                  easy access.
                </Text>
                <Section style={qrContainer}>
                  <Img
                    src="cid:qr-code.png"
                    width="200"
                    height="200"
                    alt="Permit QR Code"
                    style={qrCode}
                  />
                  <Text style={qrCodeText}>{permitCode}</Text>
                </Section>
              </Section>

              {/* Important Notes */}
              <Section style={notesSection}>
                <Text style={notesTitle}>Important Notes:</Text>
                <Text style={noteItem}>
                  • Keep this QR code accessible on your mobile device
                </Text>
                <Text style={noteItem}>
                  • Present this permit when entering campus facilities
                </Text>
                <Text style={noteItem}>
                  • Contact the SRC office if you have any questions
                </Text>
                <Text style={noteItem}>
                  • This permit expires on{" "}
                  {permit.expiryDate.toLocaleDateString()}
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section style={footer}>
              <Hr style={footerDivider} />
              <Text style={footerText}>
                <strong>Knutsford University SRC</strong>
                <br />
                Student Representative Council
                <br />
                📧 knutsforduniversitysrc@gmail.com
                <br />
                🌐 www.knutsforduniversity.edu.gh
              </Text>
              <Text style={footerDisclaimer}>
                This is an automated email. Please do not reply to this message.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    ),
  };
};

// Styles
const main = {
  backgroundColor: "#f8fafc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: "20px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
};

const header = {
  backgroundColor: "#1e40af",
  padding: "32px 48px 24px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto 12px",
  filter: "brightness(0) invert(1)",
};

const headerSubtext = {
  color: "#e0e7ff",
  fontSize: "14px",
  margin: "0",
  fontWeight: "500",
};

const successBanner = {
  backgroundColor: "#10b981",
  padding: "16px 48px",
  textAlign: "center" as const,
};

const successText = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
};

const contentSection = {
  padding: "32px 48px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const greeting = {
  color: "#374151",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};

const permitCodeSection = {
  backgroundColor: "#fef3c7",
  border: "2px solid #f59e0b",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "24px 0 32px",
};

const permitCodeLabel = {
  color: "#92400e",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const permitCodeValue = {
  color: "#92400e",
  fontSize: "32px",
  fontWeight: "800",
  margin: "0",
  fontFamily: "monospace",
};

const detailsRow = {
  margin: "32px 0",
};

const leftColumn = {
  width: "48%",
  paddingRight: "2%",
};

const rightColumn = {
  width: "48%",
  paddingLeft: "2%",
};

const detailsCard = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "20px",
  height: "100%",
};

const cardTitle = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const divider = {
  borderColor: "#d1d5db",
  margin: "0 0 16px",
};

const detailItem = {
  margin: "12px 0",
  fontSize: "14px",
  lineHeight: "1.5",
};

const detailLabel = {
  color: "#6b7280",
  fontWeight: "500",
  display: "inline-block",
  width: "100px",
};

const detailValue = {
  color: "#1f2937",
  fontWeight: "600",
};

const qrSection = {
  backgroundColor: "#f0f9ff",
  border: "2px solid #0ea5e9",
  borderRadius: "12px",
  padding: "32px",
  textAlign: "center" as const,
  margin: "32px 0",
};

const qrTitle = {
  color: "#0c4a6e",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const qrSubtext = {
  color: "#0369a1",
  fontSize: "14px",
  margin: "0 0 24px",
};

const qrContainer = {
  backgroundColor: "#ffffff",
  border: "2px solid #e5e7eb",
  borderRadius: "12px",
  padding: "24px",
  display: "inline-block",
};

const qrCode = {
  margin: "0 auto 16px",
  border: "4px solid #ffffff",
  borderRadius: "8px",
};

const qrCodeText = {
  color: "#374151",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
  fontFamily: "monospace",
};

const notesSection = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: "20px",
  margin: "32px 0",
};

const notesTitle = {
  color: "#dc2626",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const noteItem = {
  color: "#7f1d1d",
  fontSize: "14px",
  margin: "8px 0",
  lineHeight: "1.5",
};

const footer = {
  padding: "32px 48px",
  backgroundColor: "#f9fafb",
};

const footerDivider = {
  borderColor: "#e5e7eb",
  margin: "0 0 24px",
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "0 0 16px",
};

const footerDisclaimer = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
  fontStyle: "italic",
};
