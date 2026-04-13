-- AlterTable
ALTER TABLE `ElectionPosition`
  ADD COLUMN `votingMode` ENUM('CANDIDATE_SELECTION', 'CANDIDATE_APPROVAL') NOT NULL DEFAULT 'CANDIDATE_SELECTION',
  ADD COLUMN `approvalNotice` TEXT NULL,
  ADD COLUMN `outcomeStatus` ENUM('PENDING', 'ELECTED', 'APPOINTMENT_REQUIRED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `ElectionBallotChoice`
  ADD COLUMN `approvalDecision` ENUM('APPROVE', 'REJECT') NULL,
  MODIFY `candidateId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `ElectionBallotChoice` DROP FOREIGN KEY `ElectionBallotChoice_candidateId_fkey`;

ALTER TABLE `ElectionBallotChoice`
  ADD CONSTRAINT `ElectionBallotChoice_candidateId_fkey`
  FOREIGN KEY (`candidateId`) REFERENCES `ElectionCandidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
