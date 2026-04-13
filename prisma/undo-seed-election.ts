import { PrismaClient } from '@prisma/client';
import { DEMO_ELECTION_ID, demoStudents } from './seed-election.data';

const prisma = new PrismaClient();

async function main() {
  console.log('Removing demo election seed...');

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
  await prisma.election.deleteMany({
    where: { id: DEMO_ELECTION_ID },
  });

  await prisma.student.deleteMany({
    where: {
      studentId: {
        in: demoStudents.map((student) => student.studentId),
      },
    },
  });

  console.log(`Demo election ${DEMO_ELECTION_ID} and its sample students have been removed.`);
}

main()
  .catch((error) => {
    console.error('Error removing demo election seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
