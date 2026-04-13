import { PrismaClient, ElectionStatus, ElectionResultVisibility } from '@prisma/client';
import { DEMO_ELECTION_IDS, demoStudents } from './seed-election.data';

const prisma = new PrismaClient();

const APPROVAL_NOTICE =
  'This position has one candidate. You are voting to approve or reject the candidate. If rejected, the committee will appoint someone to fill the role.';

function daysFromNow(days: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function ensureDemoStudents() {
  for (const student of demoStudents) {
    await prisma.student.upsert({
      where: { studentId: student.studentId },
      update: {
        name: student.name,
        email: student.email,
        course: student.course,
        level: student.level,
        number: student.number,
        deletedAt: null,
      },
      create: student,
    });
  }

  const students = await prisma.student.findMany({
    where: {
      studentId: {
        in: demoStudents.map((student) => student.studentId),
      },
    },
    select: {
      id: true,
      studentId: true,
    },
  });

  const studentMap = new Map(students.map((student) => [student.studentId, student.id]));
  for (const student of demoStudents) {
    if (!studentMap.has(student.studentId)) {
      throw new Error(`Missing demo student after upsert: ${student.studentId}`);
    }
  }

  return studentMap;
}

async function resetElectionStructure(electionId: number) {
  await prisma.electionBallotChoice.deleteMany({
    where: {
      ballot: {
        electionId,
      },
    },
  });
  await prisma.electionBallot.deleteMany({
    where: { electionId },
  });
  await prisma.electionParticipation.deleteMany({
    where: { electionId },
  });
  await prisma.electionCandidate.deleteMany({
    where: {
      position: {
        electionId,
      },
    },
  });
  await prisma.electionPosition.deleteMany({
    where: { electionId },
  });
}

async function createElectionSkeleton({
  id,
  title,
  description,
  startAt,
  endAt,
  status,
  resultVisibility,
  adminUserId,
  approvalOffsetDays,
  publishedOffsetDays,
}: {
  id: number;
  title: string;
  description: string;
  startAt: Date;
  endAt: Date;
  status: ElectionStatus;
  resultVisibility: ElectionResultVisibility;
  adminUserId: number;
  approvalOffsetDays?: number;
  publishedOffsetDays?: number;
}) {
  await prisma.election.upsert({
    where: { id },
    update: {
      title,
      description,
      startAt,
      endAt,
      status,
      resultVisibility,
      createdById: adminUserId,
      approvedById: [ 'APPROVED', 'ACTIVE', 'CLOSED', 'RESULTS_PUBLISHED', 'ARCHIVED' ].includes(status) ? adminUserId : null,
      approvedAt: approvalOffsetDays !== undefined ? daysFromNow(approvalOffsetDays, 12) : null,
      publishedAt: publishedOffsetDays !== undefined ? daysFromNow(publishedOffsetDays, 12) : null,
      rejectionReason: null,
    },
    create: {
      id,
      title,
      description,
      startAt,
      endAt,
      status,
      resultVisibility,
      createdById: adminUserId,
      approvedById: [ 'APPROVED', 'ACTIVE', 'CLOSED', 'RESULTS_PUBLISHED', 'ARCHIVED' ].includes(status) ? adminUserId : null,
      approvedAt: approvalOffsetDays !== undefined ? daysFromNow(approvalOffsetDays, 12) : null,
      publishedAt: publishedOffsetDays !== undefined ? daysFromNow(publishedOffsetDays, 12) : null,
    },
  });

  await resetElectionStructure(id);
}

async function createElectionPositions(electionId: number, studentMap: Map<string, number>) {
  const presidentPosition = await prisma.electionPosition.create({
    data: {
      electionId,
      title: 'President',
      description: 'Leads the SRC executive council.',
      sortOrder: 0,
      seatCount: 1,
      votingMode: 'CANDIDATE_SELECTION',
      candidates: {
        create: [
          {
            studentId: studentMap.get('KUC/EL/001')!,
            bio: 'Focused on student welfare and transparent leadership.',
            manifesto: 'Improve communication, academic support, and student services.',
          },
          {
            studentId: studentMap.get('KUC/EL/002')!,
            bio: 'Technology-minded candidate for stronger student engagement.',
            manifesto: 'Digitize SRC services and improve accountability across committees.',
          },
        ],
      },
    },
    include: { candidates: true },
  });

  const secretaryPosition = await prisma.electionPosition.create({
    data: {
      electionId,
      title: 'General Secretary',
      description: 'Coordinates records, communication, and administration.',
      sortOrder: 1,
      seatCount: 1,
      votingMode: 'CANDIDATE_SELECTION',
      candidates: {
        create: [
          {
            studentId: studentMap.get('KUC/EL/003')!,
            bio: 'Strong administrative background with attention to detail.',
            manifesto: 'Improve meeting documentation and student-facing notices.',
          },
          {
            studentId: studentMap.get('KUC/EL/004')!,
            bio: 'Interested in making SRC operations easier to follow.',
            manifesto: 'Create clearer updates and more reliable communication channels.',
          },
        ],
      },
    },
    include: { candidates: true },
  });

  const treasurerPosition = await prisma.electionPosition.create({
    data: {
      electionId,
      title: 'Treasurer',
      description: 'Oversees SRC finances and spending transparency.',
      sortOrder: 2,
      seatCount: 1,
      votingMode: 'CANDIDATE_APPROVAL',
      approvalNotice: APPROVAL_NOTICE,
      outcomeStatus: 'PENDING',
      candidates: {
        create: [
          {
            studentId: studentMap.get('KUC/EL/005')!,
            bio: 'Finance-focused leader with interest in budgeting discipline.',
            manifesto: 'Publish clearer spending reports and budget summaries.',
          },
        ],
      },
    },
    include: { candidates: true },
  });

  return { presidentPosition, secretaryPosition, treasurerPosition };
}

async function seedBallotsForResultsPublishedElection(
  electionId: number,
  studentMap: Map<string, number>,
  positions: Awaited<ReturnType<typeof createElectionPositions>>
) {
  const presidentAmaCandidate = positions.presidentPosition.candidates.find((candidate) => candidate.studentId === studentMap.get('KUC/EL/001')!);
  const presidentKojoCandidate = positions.presidentPosition.candidates.find((candidate) => candidate.studentId === studentMap.get('KUC/EL/002')!);
  const secretaryEfuaCandidate = positions.secretaryPosition.candidates.find((candidate) => candidate.studentId === studentMap.get('KUC/EL/003')!);
  const secretaryYawCandidate = positions.secretaryPosition.candidates.find((candidate) => candidate.studentId === studentMap.get('KUC/EL/004')!);
  const treasurerAkosuaCandidate = positions.treasurerPosition.candidates.find((candidate) => candidate.studentId === studentMap.get('KUC/EL/005')!);

  if (!presidentAmaCandidate || !presidentKojoCandidate || !secretaryEfuaCandidate || !secretaryYawCandidate || !treasurerAkosuaCandidate) {
    throw new Error('Failed to resolve seeded election candidates');
  }

  const seededVoters = [
    {
      studentId: studentMap.get('KUC/EL/001')!,
      choices: [
        { positionId: positions.presidentPosition.id, candidateId: presidentAmaCandidate.id },
        { positionId: positions.secretaryPosition.id, candidateId: secretaryEfuaCandidate.id },
        { positionId: positions.treasurerPosition.id, candidateId: treasurerAkosuaCandidate.id, approvalDecision: 'APPROVE' as const },
      ],
    },
    {
      studentId: studentMap.get('KUC/EL/002')!,
      choices: [
        { positionId: positions.presidentPosition.id, candidateId: presidentKojoCandidate.id },
        { positionId: positions.secretaryPosition.id, candidateId: secretaryYawCandidate.id },
        { positionId: positions.treasurerPosition.id, candidateId: treasurerAkosuaCandidate.id, approvalDecision: 'REJECT' as const },
      ],
    },
    {
      studentId: studentMap.get('KUC/EL/006')!,
      choices: [
        { positionId: positions.presidentPosition.id, candidateId: presidentAmaCandidate.id },
        { positionId: positions.secretaryPosition.id, candidateId: secretaryEfuaCandidate.id },
        { positionId: positions.treasurerPosition.id, candidateId: treasurerAkosuaCandidate.id, approvalDecision: 'REJECT' as const },
      ],
    },
  ];

  for (const voter of seededVoters) {
    await prisma.electionBallot.create({
      data: {
        electionId,
        choices: {
          create: voter.choices.map((choice) => ({
            positionId: choice.positionId,
            candidateId: choice.candidateId,
            approvalDecision: choice.approvalDecision,
          })),
        },
      },
    });

    await prisma.electionParticipation.create({
      data: {
        electionId,
        studentId: voter.studentId,
      },
    });
  }

  await prisma.electionPosition.update({
    where: { id: positions.treasurerPosition.id },
    data: { outcomeStatus: 'APPOINTMENT_REQUIRED' },
  });
  await prisma.electionPosition.update({
    where: { id: positions.presidentPosition.id },
    data: { outcomeStatus: 'ELECTED' },
  });
  await prisma.electionPosition.update({
    where: { id: positions.secretaryPosition.id },
    data: { outcomeStatus: 'ELECTED' },
  });
}

async function main() {
  console.log('Seeding demo elections across lifecycle phases...');

  const adminUser = await prisma.user.findUnique({
    where: { username: 'admin' },
    select: { id: true },
  });

  if (!adminUser) {
    throw new Error("Admin user not found. Run 'pnpm prisma:seed' first.");
  }

  const studentMap = await ensureDemoStudents();

  const lifecycleSeeds = [
    {
      id: DEMO_ELECTION_IDS.draft,
      title: 'Draft SRC Election Demo',
      description: 'Draft election prepared for internal editing and candidate updates.',
      startAt: daysFromNow(14, 9),
      endAt: daysFromNow(16, 17),
      status: 'DRAFT' as const,
      resultVisibility: 'AFTER_PUBLISH' as const,
    },
    {
      id: DEMO_ELECTION_IDS.pendingApproval,
      title: 'Pending Approval Election Demo',
      description: 'Election submitted and waiting for admin approval.',
      startAt: daysFromNow(10, 9),
      endAt: daysFromNow(12, 17),
      status: 'PENDING_APPROVAL' as const,
      resultVisibility: 'AFTER_PUBLISH' as const,
    },
    {
      id: DEMO_ELECTION_IDS.approved,
      title: 'Approved Election Demo',
      description: 'Approved election that is scheduled but not yet active.',
      startAt: daysFromNow(5, 9),
      endAt: daysFromNow(7, 17),
      status: 'APPROVED' as const,
      resultVisibility: 'AFTER_PUBLISH' as const,
      approvalOffsetDays: -1,
    },
    {
      id: DEMO_ELECTION_IDS.active,
      title: 'Active Election Demo',
      description: 'Currently active election for testing student voting and approval ballots.',
      startAt: daysFromNow(-1, 9),
      endAt: daysFromNow(2, 17),
      status: 'ACTIVE' as const,
      resultVisibility: 'AFTER_CLOSE' as const,
      approvalOffsetDays: -3,
    },
    {
      id: DEMO_ELECTION_IDS.closed,
      title: 'Closed Election Demo',
      description: 'Closed election awaiting result publication.',
      startAt: daysFromNow(-8, 9),
      endAt: daysFromNow(-4, 17),
      status: 'CLOSED' as const,
      resultVisibility: 'AFTER_PUBLISH' as const,
      approvalOffsetDays: -10,
    },
    {
      id: DEMO_ELECTION_IDS.resultsPublished,
      title: 'Published Results Election Demo',
      description: 'Published election results including a single-candidate approval vote.',
      startAt: daysFromNow(-16, 9),
      endAt: daysFromNow(-12, 17),
      status: 'RESULTS_PUBLISHED' as const,
      resultVisibility: 'AFTER_CLOSE' as const,
      approvalOffsetDays: -18,
      publishedOffsetDays: -11,
    },
    {
      id: DEMO_ELECTION_IDS.archived,
      title: 'Archived Election Demo',
      description: 'Archived election kept for dashboard history testing.',
      startAt: daysFromNow(-24, 9),
      endAt: daysFromNow(-20, 17),
      status: 'ARCHIVED' as const,
      resultVisibility: 'AFTER_CLOSE' as const,
      approvalOffsetDays: -26,
      publishedOffsetDays: -19,
    },
  ];

  for (const seed of lifecycleSeeds) {
    await createElectionSkeleton({
      ...seed,
      adminUserId: adminUser.id,
    });
    const positions = await createElectionPositions(seed.id, studentMap);

    if (seed.id === DEMO_ELECTION_IDS.resultsPublished) {
      await seedBallotsForResultsPublishedElection(seed.id, studentMap, positions);
    }

    if (seed.id === DEMO_ELECTION_IDS.archived) {
      await prisma.electionPosition.updateMany({
        where: { electionId: seed.id },
        data: { outcomeStatus: 'ELECTED' },
      });
    }
  }

  console.log(`Seeded demo elections for phases: ${Object.keys(DEMO_ELECTION_IDS).join(', ')}.`);
}

main()
  .catch((error) => {
    console.error('Error during demo election seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
