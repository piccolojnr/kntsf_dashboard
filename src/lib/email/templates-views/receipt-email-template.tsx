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

interface ReceiptEmailTemplateProps {
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
  qrCode: string; // Assuming QR code is a string URL or base64 encoded image
}

export const generateReceiptEmailTemplate = ({
  student,
  permit,
  permitCode,
  qrCode,
}: ReceiptEmailTemplateProps) => {
  const previewText = `Payment Receipt - Knutsford University SRC - ${permitCode}`;
  const receiptNumber = `RCP-${permit.id.slice(-8).toUpperCase()}`;
  const paymentDate = new Date();

  return {
    text: `Dear ${student.name},\n\nThank you for your payment. Here is your receipt:\n\nReceipt No: ${receiptNumber}\nPermit Code: ${permitCode}\nAmount Paid: GHS ${permit.amountPaid}\nDate: ${paymentDate.toLocaleDateString()}\n\nBest regards,\nKnutsford University SRC`,
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

            {/* Receipt Banner */}
            <Section style={receiptBanner}>
              <Text style={receiptBannerText}>💳 Payment Received</Text>
            </Section>

            {/* Main Content */}
            <Section style={contentSection}>
              <Heading style={h1}>Payment Receipt</Heading>
              <Text style={greeting}>Dear {student.name},</Text>
              <Text style={text}>
                Thank you for your payment. Your transaction has been
                successfully processed.
              </Text>

              {/* Receipt Number Highlight */}
              <Section style={receiptNumberSection}>
                <Text style={receiptNumberLabel}>Receipt Number</Text>
                <Text style={receiptNumberValue}>{receiptNumber}</Text>
              </Section>

              {/* Receipt Details */}
              <Section style={receiptCard}>
                <Text style={receiptTitle}>OFFICIAL RECEIPT</Text>
                <Hr style={receiptDivider} />

                <Row style={receiptRow}>
                  <Column style={receiptLeftColumn}>
                    <Text style={receiptLabel}>Date & Time:</Text>
                    <Text style={receiptLabel}>Permit Code:</Text>
                    <Text style={receiptLabel}>Student ID:</Text>
                    <Text style={receiptLabel}>Course:</Text>
                    <Text style={receiptLabel}>Level:</Text>
                  </Column>
                  <Column style={receiptRightColumn}>
                    <Text style={receiptValue}>
                      {paymentDate.toLocaleDateString()} at{" "}
                      {paymentDate.toLocaleTimeString()}
                    </Text>
                    <Text style={receiptValue}>{permitCode}</Text>
                    <Text style={receiptValue}>{student.studentId}</Text>
                    <Text style={receiptValue}>{student.course}</Text>
                    <Text style={receiptValue}>{student.level}</Text>
                  </Column>
                </Row>

                <Hr style={totalDivider} />

                {/* Amount Section */}
                <Section style={amountSection}>
                  <Row>
                    <Column style={amountLeftColumn}>
                      <Text style={amountLabel}>Total Amount Paid:</Text>
                    </Column>
                    <Column style={amountRightColumn}>
                      <Text style={amountValue}>
                        GHS {permit.amountPaid.toFixed(2)}
                      </Text>
                    </Column>
                  </Row>
                </Section>

                <Text style={paymentMethod}>
                  Payment Method: Online Payment
                </Text>
              </Section>

              {/* QR Code Section */}
              <Section style={qrSection}>
                <Text style={qrTitle}>Your Digital Receipt</Text>
                <Text style={qrSubtext}>
                  This QR code contains your receipt information for
                  verification purposes.
                </Text>
                <Section style={qrContainer}>
                  <Img
                    src={qrCode}
                    width="150"
                    height="150"
                    alt="Receipt QR Code"
                    style={qrCodeStyle}
                  />
                  <Text style={qrCodeText}>{permitCode}</Text>
                </Section>
              </Section>

              {/* Important Information */}
              <Section style={infoSection}>
                <Text style={infoTitle}>Important Information:</Text>
                <Text style={infoItem}>
                  • This receipt serves as proof of payment for your permit
                </Text>
                <Text style={infoItem}>
                  • Keep this receipt for your records and future reference
                </Text>
                <Text style={infoItem}>
                  • Your permit is valid until{" "}
                  {permit.expiryDate.toLocaleDateString()}
                </Text>
                <Text style={infoItem}>
                  • Contact the SRC office if you need any clarification
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
                This is an automated receipt. Please do not reply to this
                message.
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
  backgroundColor: "#059669",
  padding: "32px 48px 24px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto 12px",
  filter: "brightness(0) invert(1)",
};

const headerSubtext = {
  color: "#d1fae5",
  fontSize: "14px",
  margin: "0",
  fontWeight: "500",
};

const receiptBanner = {
  backgroundColor: "#10b981",
  padding: "16px 48px",
  textAlign: "center" as const,
};

const receiptBannerText = {
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

const receiptNumberSection = {
  backgroundColor: "#ecfdf5",
  border: "2px solid #10b981",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "24px 0 32px",
};

const receiptNumberLabel = {
  color: "#065f46",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const receiptNumberValue = {
  color: "#065f46",
  fontSize: "28px",
  fontWeight: "800",
  margin: "0",
  fontFamily: "monospace",
};

const receiptCard = {
  backgroundColor: "#ffffff",
  border: "2px solid #e5e7eb",
  borderRadius: "12px",
  padding: "32px",
  margin: "32px 0",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
};

const receiptTitle = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0 0 20px",
  letterSpacing: "0.1em",
};

const receiptDivider = {
  borderColor: "#d1d5db",
  margin: "0 0 24px",
};

const receiptRow = {
  margin: "0 0 24px",
};

const receiptLeftColumn = {
  width: "40%",
  paddingRight: "16px",
};

const receiptRightColumn = {
  width: "60%",
};

const receiptLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
  margin: "8px 0",
};

const receiptValue = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: "600",
  margin: "8px 0",
};

const totalDivider = {
  borderColor: "#059669",
  borderWidth: "2px",
  margin: "24px 0 20px",
};

const amountSection = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "16px",
  margin: "0 0 16px",
};

const amountLeftColumn = {
  width: "60%",
};

const amountRightColumn = {
  width: "40%",
  textAlign: "right" as const,
};

const amountLabel = {
  color: "#166534",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
};

const amountValue = {
  color: "#166534",
  fontSize: "24px",
  fontWeight: "800",
  margin: "0",
};

const paymentMethod = {
  color: "#6b7280",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "16px 0 0",
  fontStyle: "italic",
};

const qrSection = {
  backgroundColor: "#f0f9ff",
  border: "2px solid #0ea5e9",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "32px 0",
};

const qrTitle = {
  color: "#0c4a6e",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const qrSubtext = {
  color: "#0369a1",
  fontSize: "14px",
  margin: "0 0 20px",
};

const qrContainer = {
  backgroundColor: "#ffffff",
  border: "2px solid #e5e7eb",
  borderRadius: "8px",
  padding: "16px",
  display: "inline-block",
};

const qrCodeStyle = {
  margin: "0 auto 12px",
  border: "2px solid #ffffff",
  borderRadius: "4px",
};

const qrCodeText = {
  color: "#374151",
  fontSize: "12px",
  fontWeight: "600",
  margin: "0",
  fontFamily: "monospace",
};

const infoSection = {
  backgroundColor: "#fffbeb",
  border: "1px solid #fbbf24",
  borderRadius: "8px",
  padding: "20px",
  margin: "32px 0",
};

const infoTitle = {
  color: "#92400e",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const infoItem = {
  color: "#78350f",
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
