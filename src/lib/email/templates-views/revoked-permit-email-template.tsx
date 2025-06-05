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

interface RevokedPermitEmailTemplateProps {
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

export const generateRevokedPermitEmailTemplate = ({
  student,
  permit,
  permitCode,
}: RevokedPermitEmailTemplateProps) => {
  const previewText = `URGENT: Your Knutsford University SRC Permit Has Been Revoked - ${permitCode}`;
  const revocationDate = new Date();

  return {
    text: `Dear ${student.name},\n\nIMPORTANT NOTICE: Your permit (Code: ${permitCode}) has been revoked effective ${revocationDate.toLocaleDateString()}.\n\nIf you believe this is an error or have any questions, please contact the SRC office immediately.\n\nBest regards,\nKnutsford University SRC`,
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

            {/* Alert Banner */}
            <Section style={alertBanner}>
              <Text style={alertText}>⚠️ PERMIT REVOCATION NOTICE</Text>
            </Section>

            {/* Main Content */}
            <Section style={contentSection}>
              <Heading style={h1}>Permit Revoked</Heading>
              <Text style={greeting}>Dear {student.name},</Text>
              <Text style={urgentText}>
                This is an important notice regarding your student permit. Your
                permit has been officially revoked.
              </Text>

              {/* Revocation Details */}
              <Section style={revocationCard}>
                <Text style={revocationTitle}>REVOCATION DETAILS</Text>
                <Hr style={revocationDivider} />

                <Row style={detailsRow}>
                  <Column style={leftColumn}>
                    <Section style={permitSection}>
                      <Text style={sectionTitle}>Permit Information</Text>
                      <Text style={detailItem}>
                        <span style={detailLabel}>Permit Code:</span>
                        <span style={detailValue}>{permitCode}</span>
                      </Text>
                      <Text style={detailItem}>
                        <span style={detailLabel}>Revocation Date:</span>
                        <span style={detailValue}>
                          {revocationDate.toLocaleDateString()}
                        </span>
                      </Text>
                      <Text style={detailItem}>
                        <span style={detailLabel}>Original Expiry:</span>
                        <span style={detailValue}>
                          {permit.expiryDate.toLocaleDateString()}
                        </span>
                      </Text>
                    </Section>
                  </Column>
                  <Column style={rightColumn}>
                    <Section style={studentSection}>
                      <Text style={sectionTitle}>Student Information</Text>
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
                </Row>
              </Section>

              {/* Status Section */}
              <Section style={statusSection}>
                <Text style={statusTitle}>Current Status</Text>
                <Text style={statusText}>🚫 PERMIT INVALID - DO NOT USE</Text>
                <Text style={statusDescription}>
                  This permit is no longer valid for any university activities
                  or access to facilities.
                </Text>
              </Section>

              {/* Next Steps */}
              <Section style={nextStepsSection}>
                <Text style={nextStepsTitle}>What You Need to Do:</Text>
                <Text style={stepItem}>
                  1. Stop using this permit immediately
                </Text>
                <Text style={stepItem}>
                  2. Contact the SRC office within 48 hours if you believe this
                  is an error
                </Text>
                <Text style={stepItem}>
                  3. Provide any relevant documentation to support your case
                </Text>
                <Text style={stepItem}>
                  4. Wait for official communication before applying for a new
                  permit
                </Text>
              </Section>

              {/* Contact Information */}
              <Section style={contactSection}>
                <Text style={contactTitle}>Need Help?</Text>
                <Text style={contactText}>
                  If you believe this revocation is an error or if you have
                  questions, please contact the SRC office immediately:
                </Text>
                <Text style={contactDetails}>
                  📧 Email: knutsforduniversitysrc@gmail.com
                  <br />
                  🏢 Office: SRC Building, Ground Floor
                  <br />⏰ Hours: Monday - Friday, 8:00 AM - 5:00 PM
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
                This is an official notice. Please take immediate action as
                required.
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
  backgroundColor: "#dc2626",
  padding: "32px 48px 24px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto 12px",
  filter: "brightness(0) invert(1)",
};

const headerSubtext = {
  color: "#fecaca",
  fontSize: "14px",
  margin: "0",
  fontWeight: "500",
};

const alertBanner = {
  backgroundColor: "#ef4444",
  padding: "16px 48px",
  textAlign: "center" as const,
};

const alertText = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0",
  letterSpacing: "0.05em",
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

const urgentText = {
  color: "#dc2626",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px",
  fontWeight: "600",
  backgroundColor: "#fef2f2",
  padding: "16px",
  borderRadius: "8px",
  border: "1px solid #fecaca",
};

const revocationCard = {
  backgroundColor: "#ffffff",
  border: "2px solid #dc2626",
  borderRadius: "12px",
  padding: "32px",
  margin: "32px 0",
};

const revocationTitle = {
  color: "#dc2626",
  fontSize: "20px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0 0 20px",
  letterSpacing: "0.1em",
};

const revocationDivider = {
  borderColor: "#dc2626",
  borderWidth: "2px",
  margin: "0 0 24px",
};

const detailsRow = {
  margin: "0",
};

const leftColumn = {
  width: "48%",
  paddingRight: "2%",
};

const rightColumn = {
  width: "48%",
  paddingLeft: "2%",
};

const permitSection = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: "20px",
};

const studentSection = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "20px",
};

const sectionTitle = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
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
  width: "120px",
};

const detailValue = {
  color: "#1f2937",
  fontWeight: "600",
};

const statusSection = {
  backgroundColor: "#fef2f2",
  border: "2px solid #dc2626",
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "32px 0",
};

const statusTitle = {
  color: "#dc2626",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0 0 12px",
};

const statusText = {
  color: "#dc2626",
  fontSize: "24px",
  fontWeight: "800",
  margin: "0 0 12px",
};

const statusDescription = {
  color: "#7f1d1d",
  fontSize: "14px",
  margin: "0",
  fontStyle: "italic",
};

const nextStepsSection = {
  backgroundColor: "#fffbeb",
  border: "1px solid #fbbf24",
  borderRadius: "8px",
  padding: "24px",
  margin: "32px 0",
};

const nextStepsTitle = {
  color: "#92400e",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const stepItem = {
  color: "#78350f",
  fontSize: "14px",
  margin: "8px 0",
  lineHeight: "1.5",
  paddingLeft: "8px",
};

const contactSection = {
  backgroundColor: "#f0f9ff",
  border: "1px solid #0ea5e9",
  borderRadius: "8px",
  padding: "24px",
  margin: "32px 0",
};

const contactTitle = {
  color: "#0c4a6e",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const contactText = {
  color: "#0369a1",
  fontSize: "14px",
  margin: "0 0 16px",
  lineHeight: "1.5",
};

const contactDetails = {
  color: "#0c4a6e",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
  lineHeight: "1.6",
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
  color: "#dc2626",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
  fontWeight: "600",
};
