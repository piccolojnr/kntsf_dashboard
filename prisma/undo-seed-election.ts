import { PrismaClient } from '@prisma/client';
import { demoElectionIdList, demoStudents } from './seed-election.data';

const prisma = new PrismaClient();

async function main() {
  console.log('Removing demo election lifecycle seed...');

  await prisma.electionBallotChoice.deleteMany({
    where: {
      ballot: {
        electionId: {
          in: demoElectionIdList,
        },
      },
    },
  });
  await prisma.electionBallot.deleteMany({
    where: {
      electionId: {
        in: demoElectionIdList,
      },
    },
  });
  await prisma.electionParticipation.deleteMany({
    where: {
      electionId: {
        in: demoElectionIdList,
      },
    },
  });
  await prisma.electionCandidate.deleteMany({
    where: {
      position: {
        electionId: {
          in: demoElectionIdList,
        },
      },
    },
  });
  await prisma.electionPosition.deleteMany({
    where: {
      electionId: {
        in: demoElectionIdList,
      },
    },
  });
  await prisma.election.deleteMany({
    where: {
      id: {
        in: demoElectionIdList,
      },
    },
  });

  await prisma.student.deleteMany({
    where: {
      studentId: {
        in: demoStudents.map((student) => student.studentId),
      },
    },
  });

  console.log(`Removed demo elections ${demoElectionIdList.join(', ')} and their sample students.`);
}

main()
  .catch((error) => {
    console.error('Error removing demo election seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
