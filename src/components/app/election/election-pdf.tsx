import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  primary: "#000000",
  accent: "#000000",
  success: "#000000",
  danger: "#000000",
  amber: "#000000",
  muted: "#666666",
  border: "#cccccc",
  bg: "#f5f5f5",
  white: "#ffffff",
  black: "#000000",
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.black,
    backgroundColor: C.white,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
  },

  // ── fixed header / footer ──
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: C.primary,
    marginBottom: 12,
  },
  headerLeft: { flexDirection: "column" },
  headerOrg: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.black,
  },
  headerRight: { alignItems: "flex-end" },
  headerTag: { fontSize: 7, color: C.muted, marginBottom: 2 },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: C.black,
  },
  statusText: {
    fontSize: 7,
    color: C.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 5,
  },
  footerText: { fontSize: 7, color: C.muted },

  // ── summary strip ──
  summaryStrip: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  summaryCell: {
    flex: 1,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  summaryCellLabel: {
    fontSize: 6.5,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  summaryCellValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
  },
  summaryCellSub: { fontSize: 6.5, color: C.muted, marginTop: 1 },

  // ── meta line ──
  metaLine: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  metaItem: { flexDirection: "row", gap: 4, alignItems: "center" },
  metaLabel: { fontSize: 7, color: C.muted, fontFamily: "Helvetica-Bold" },
  metaValue: { fontSize: 7, color: C.black },

  // ── section heading ──
  sectionHeading: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  // ── position card ──
  positionCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  positionHeader: {
    backgroundColor: C.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  positionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.white,
  },
  positionMeta: { fontSize: 7, color: "#cccccc" },
  positionBody: { padding: 10 },
  positionDesc: { fontSize: 7.5, color: C.muted, marginBottom: 8 },

  // ── candidate row ──
  candidateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  rankBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  rankBadgeWinner: { backgroundColor: C.success },
  rankText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white },
  candidateInfo: { flex: 1 },
  candidateName: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: C.black,
  },
  candidateSub: { fontSize: 7, color: C.muted },
  candidateStats: { alignItems: "flex-end" },
  candidateVotes: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
  },
  candidatePct: { fontSize: 7, color: C.muted },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    marginTop: 3,
    marginBottom: 2,
    overflow: "hidden",
  },
  barFill: { height: 4, borderRadius: 2, backgroundColor: C.accent },
  barFillWinner: { backgroundColor: C.success },

  // ── approval vote ──
  outcomePill: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  outcomePillText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: C.white,
  },
  approvalNotice: {
    backgroundColor: C.bg,
    borderLeftWidth: 2,
    borderLeftColor: C.amber,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 8,
    borderRadius: 2,
  },
  approvalNoticeText: { fontSize: 7.5, color: C.black },
  voteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 5,
  },
  voteLabel: { width: 72, fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  voteBar: {
    flex: 1,
    height: 7,
    borderRadius: 3,
    backgroundColor: C.border,
    overflow: "hidden",
  },
  voteBarFillYes: { height: 7, borderRadius: 3, backgroundColor: C.success },
  voteBarFillNo: { height: 7, borderRadius: 3, backgroundColor: C.danger },
  voteCount: { width: 64, fontSize: 7.5, color: C.muted, textAlign: "right" },

  // ── signature strip ──
  sigStrip: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sigBlock: { width: "35%" },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: C.black,
    marginBottom: 5,
    width: "100%",
  },
  sigName: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.black },
  sigRole: { fontSize: 7, color: C.muted, marginTop: 1 },
  sigNote: {
    fontSize: 7,
    color: C.muted,
    textAlign: "center",
    flex: 1,
    paddingHorizontal: 12,
    lineHeight: 1.5,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatStatus(status: string) {
  return status.toLowerCase().replaceAll("_", " ");
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SelectionPosition({ position }: { position: any }) {
  const totalVotes = position.candidates.reduce(
    (sum: number, c: any) => sum + c.voteCount,
    0,
  );
  const sorted = [...position.candidates].sort(
    (a: any, b: any) => b.voteCount - a.voteCount,
  );

  return (
    <View style={s.positionCard}>
      <View style={s.positionHeader}>
        <Text style={s.positionTitle}>{position.title}</Text>
        <Text style={s.positionMeta}>
          {position.seatCount} seat{position.seatCount > 1 ? "s" : ""} ·{" "}
          {totalVotes} vote
          {totalVotes !== 1 ? "s" : ""}
        </Text>
      </View>
      <View style={s.positionBody}>
        {position.description ? (
          <Text style={s.positionDesc}>{position.description}</Text>
        ) : null}
        {sorted.map((candidate: any, i: number) => {
          const pct =
            totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
          const isWinner = i < position.seatCount;
          return (
            <View key={candidate.id}>
              <View style={s.candidateRow}>
                <View style={[s.rankBadge, isWinner ? s.rankBadgeWinner : {}]}>
                  <Text style={s.rankText}>{i + 1}</Text>
                </View>
                <View style={s.candidateInfo}>
                  <Text style={s.candidateName}>
                    {candidate.student.name || candidate.student.studentId}
                    {isWinner ? "  ✓" : ""}
                  </Text>
                  <Text style={s.candidateSub}>
                    {candidate.student.studentId}
                    {candidate.student.course
                      ? ` · ${candidate.student.course}`
                      : ""}
                    {candidate.student.level
                      ? ` · L${candidate.student.level}`
                      : ""}
                  </Text>
                </View>
                <View style={s.candidateStats}>
                  <Text style={s.candidateVotes}>
                    {candidate.voteCount} votes
                  </Text>
                  <Text style={s.candidatePct}>{pct.toFixed(1)}%</Text>
                </View>
              </View>
              <View style={s.barTrack}>
                <View
                  style={[
                    s.barFill,
                    isWinner ? s.barFillWinner : {},
                    { width: `${pct}%` },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ApprovalPosition({ position }: { position: any }) {
  const candidate = position.candidates[0];
  const yesCount = position.approvalStats?.yesCount || 0;
  const noCount = position.approvalStats?.noCount || 0;
  const totalVotes = position.approvalStats?.totalVotes || 0;
  const yesPct = totalVotes > 0 ? (yesCount / totalVotes) * 100 : 0;
  const noPct = totalVotes > 0 ? (noCount / totalVotes) * 100 : 0;

  const outcomeColor =
    position.outcomeStatus === "ELECTED"
      ? C.success
      : position.outcomeStatus === "APPOINTMENT_REQUIRED"
        ? C.danger
        : C.amber;

  const outcomeLabel =
    position.outcomeStatus === "ELECTED"
      ? "Approved"
      : position.outcomeStatus === "APPOINTMENT_REQUIRED"
        ? "Committee Appointment Required"
        : "Pending";

  return (
    <View style={s.positionCard}>
      <View style={s.positionHeader}>
        <Text style={s.positionTitle}>{position.title}</Text>
        <Text style={s.positionMeta}>
          Approval Vote · {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
        </Text>
      </View>
      <View style={s.positionBody}>
        {position.description ? (
          <Text style={s.positionDesc}>{position.description}</Text>
        ) : null}

        <View style={[s.outcomePill, { backgroundColor: outcomeColor }]}>
          <Text style={s.outcomePillText}>{outcomeLabel}</Text>
        </View>

        {candidate ? (
          <Text style={[s.candidateName, { marginBottom: 8 }]}>
            {candidate.student.name || candidate.student.studentId}
            {candidate.student.studentId
              ? `  ·  ${candidate.student.studentId}`
              : ""}
            {candidate.student.course ? `  ·  ${candidate.student.course}` : ""}
            {candidate.student.level ? `  ·  L${candidate.student.level}` : ""}
          </Text>
        ) : null}

        <View style={s.voteRow}>
          <Text style={[s.voteLabel, { color: C.success }]}>Yes / Approve</Text>
          <View style={s.voteBar}>
            <View style={[s.voteBarFillYes, { width: `${yesPct}%` }]} />
          </View>
          <Text style={s.voteCount}>
            {yesCount} ({yesPct.toFixed(1)}%)
          </Text>
        </View>
        <View style={s.voteRow}>
          <Text style={[s.voteLabel, { color: C.danger }]}>No / Reject</Text>
          <View style={s.voteBar}>
            <View style={[s.voteBarFillNo, { width: `${noPct}%` }]} />
          </View>
          <Text style={s.voteCount}>
            {noCount} ({noPct.toFixed(1)}%)
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Document ─────────────────────────────────────────────────────────────────
export interface ElectionPdfDocumentProps {
  election: any;
}

export function ElectionPdfDocument({ election }: ElectionPdfDocumentProps) {
  const generatedAt = format(new Date(), "MMM dd, yyyy h:mm a");
  const startStr = format(new Date(election.startAt), "MMM dd, yyyy h:mm a");
  const endStr = format(new Date(election.endAt), "MMM dd, yyyy h:mm a");
  const approvedStr = election.approvedAt
    ? format(new Date(election.approvedAt), "MMM dd, yyyy")
    : null;

  const ref = `EL-${String(election.id).padStart(4, "0")}`;

  return (
    <Document
      title={`${election.title} — Official Election Results`}
      author="KNTSF Dashboard"
      subject="Election Results"
      creator="KNTSF Dashboard System"
    >
      <Page size="A4" style={s.page}>
        {/* ── Fixed page header ── */}
        <View style={s.pageHeader} fixed>
          <View style={s.headerLeft}>
            <Text style={s.headerOrg}>KNTSF · Official Election Results</Text>
            <Text style={s.headerTitle}>{election.title}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerTag}>{ref}</Text>
            <View style={s.statusPill}>
              <Text style={s.statusText}>{formatStatus(election.status)}</Text>
            </View>
          </View>
        </View>

        {/* ── Summary strip ── */}
        <View style={s.summaryStrip}>
          <View style={s.summaryCell}>
            <Text style={s.summaryCellLabel}>Eligible Voters</Text>
            <Text style={s.summaryCellValue}>
              {election.totalEligibleVoters.toLocaleString()}
            </Text>
          </View>
          <View style={s.summaryCell}>
            <Text style={s.summaryCellLabel}>Votes Cast</Text>
            <Text style={s.summaryCellValue}>
              {election.turnout.toLocaleString()}
            </Text>
          </View>
          <View style={s.summaryCell}>
            <Text style={s.summaryCellLabel}>Voter Turnout</Text>
            <Text style={s.summaryCellValue}>
              {election.turnoutRate.toFixed(1)}%
            </Text>
          </View>
          <View style={s.summaryCell}>
            <Text style={s.summaryCellLabel}>Positions</Text>
            <Text style={s.summaryCellValue}>{election.positions.length}</Text>
          </View>
        </View>

        {/* ── Meta line ── */}
        <View style={s.metaLine}>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Period:</Text>
            <Text style={s.metaValue}>
              {startStr} — {endStr}
            </Text>
          </View>
          {/* {election.approvedBy ? (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Approved by:</Text>
              <Text style={s.metaValue}>
                {election.approvedBy.name || election.approvedBy.email}
                {approvedStr ? ` · ${approvedStr}` : ""}
              </Text>
            </View>
          ) : null} */}
        </View>

        {/* ── Position results ── */}
        <Text style={s.sectionHeading}>Position Results</Text>

        {election.positions.map((position: any) =>
          position.votingMode === "CANDIDATE_APPROVAL" ? (
            <ApprovalPosition key={position.id} position={position} />
          ) : (
            <SelectionPosition key={position.id} position={position} />
          ),
        )}

        {/* ── Signature strip ── */}
        {/* <View style={s.sigStrip}>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigName}>
              {election.approvedBy?.name || election.approvedBy?.email || "____________________"}
            </Text>
            <Text style={s.sigRole}>Election Approver</Text>
            {approvedStr ? <Text style={s.sigRole}>{approvedStr}</Text> : null}
          </View>
          <Text style={s.sigNote}>
            This document certifies the official results of the {election.title}.
            Generated by the KNTSF Dashboard system on {generatedAt}.
            Ref: {ref}
          </Text>
          <View style={s.sigBlock}>
            <View style={s.sigLine} />
            <Text style={s.sigName}>KNTSF Dashboard System</Text>
            <Text style={s.sigRole}>Automated Record</Text>
            <Text style={s.sigRole}>{generatedAt}</Text>
          </View>
        </View> */}

        {/* ── Fixed page footer ── */}
        <View style={s.pageFooter} fixed>
          <Text style={s.footerText}>KNTSF · {election.title}</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
          <Text style={s.footerText}>
            {ref} · Generated {generatedAt}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
