import { PrismaClient } from '@prisma/client';
import { DEMO_ELECTION_ID, demoStudents } from './seed-election.data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo election...');

  const adminUser = await prisma.user.findUnique({
    where: { username: 'admin' },
    select: { id: true },
  });

  if (!adminUser) {
    throw new Error("Admin user not found. Run 'pnpm prisma:seed' first.");
  }

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

  await prisma.election.upsert({
    where: { id: DEMO_ELECTION_ID },
    update: {
      title: 'SRC General Election Demo',
      description: 'Sample multi-position election seeded for local development and UX testing.',
      startAt: new Date('2026-04-10T09:00:00.000Z'),
      endAt: new Date('2026-04-20T17:00:00.000Z'),
      status: 'APPROVED',
      resultVisibility: 'AFTER_PUBLISH',
      createdById: adminUser.id,
      approvedById: adminUser.id,
      approvedAt: new Date('2026-04-09T12:00:00.000Z'),
      publishedAt: null,
      rejectionReason: null,
    },
    create: {
      id: DEMO_ELECTION_ID,
      title: 'SRC General Election Demo',
      description: 'Sample multi-position election seeded for local development and UX testing.',
      startAt: new Date('2026-04-10T09:00:00.000Z'),
      endAt: new Date('2026-04-20T17:00:00.000Z'),
      status: 'APPROVED',
      resultVisibility: 'AFTER_PUBLISH',
      createdById: adminUser.id,
      approvedById: adminUser.id,
      approvedAt: new Date('2026-04-09T12:00:00.000Z'),
    },
  });

  await prisma.electionBallotChoice.deleteMany({
    where: {
      ballot: {
        electionId: DEMO_ELECTION_ID,
      },
    },
  });
  await prisma.electionBallot.deleteMany({
    where: { electionId: DEMO_ELECTION_ID },
  });
  await prisma.electionParticipation.deleteMany({
    where: { electionId: DEMO_ELECTION_ID },
  });
  await prisma.electionCandidate.deleteMany({
    where: {
      position: {
        electionId: DEMO_ELECTION_ID,
      },
    },
  });
  await prisma.electionPosition.deleteMany({
    where: { electionId: DEMO_ELECTION_ID },
  });

  await prisma.electionPosition.create({
    data: {
      electionId: DEMO_ELECTION_ID,
      title: 'President',
      description: 'Leads the SRC executive council.',
      sortOrder: 0,
      seatCount: 1,
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
  });

  await prisma.electionPosition.create({
    data: {
      electionId: DEMO_ELECTION_ID,
      title: 'General Secretary',
      description: 'Coordinates records, communication, and administration.',
      sortOrder: 1,
      seatCount: 1,
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
  });

  await prisma.electionPosition.create({
    data: {
      electionId: DEMO_ELECTION_ID,
      title: 'Treasurer',
      description: 'Oversees SRC finances and spending transparency.',
      sortOrder: 2,
      seatCount: 1,
      candidates: {
        create: [
          {
            studentId: studentMap.get('KUC/EL/005')!,
            bio: 'Finance-focused leader with interest in budgeting discipline.',
            manifesto: 'Publish clearer spending reports and budget summaries.',
          },
          {
            studentId: studentMap.get('KUC/EL/006')!,
            bio: 'Interested in accountable resource management.',
            manifesto: 'Improve financial planning and student visibility into SRC spending.',
          },
        ],
      },
    },
  });

  console.log(`Demo election seeded with id ${DEMO_ELECTION_ID}.`);
}

main()
  .catch((error) => {
    console.error('Error during demo election seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
