-- CreateTable
CREATE TABLE `Election` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'CLOSED', 'RESULTS_PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `resultVisibility` ENUM('AFTER_PUBLISH', 'AFTER_CLOSE') NOT NULL DEFAULT 'AFTER_PUBLISH',
    `createdById` INTEGER NOT NULL,
    `approvedById` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,
    `publishedAt` DATETIME(3) NULL,
    `rejectionReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Election_status_idx`(`status`),
    INDEX `Election_startAt_endAt_idx`(`startAt`, `endAt`),
    INDEX `Election_createdById_fkey`(`createdById`),
    INDEX `Election_approvedById_fkey`(`approvedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ElectionPosition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `electionId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `seatCount` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ElectionPosition_electionId_idx`(`electionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ElectionCandidate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `positionId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `bio` TEXT NULL,
    `manifesto` TEXT NULL,
    `photoUrl` VARCHAR(191) NULL,
    `status` ENUM('APPROVED', 'WITHDRAWN') NOT NULL DEFAULT 'APPROVED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ElectionCandidate_positionId_studentId_key`(`positionId`, `studentId`),
    INDEX `ElectionCandidate_positionId_idx`(`positionId`),
    INDEX `ElectionCandidate_studentId_idx`(`studentId`),
    INDEX `ElectionCandidate_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ElectionParticipation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `electionId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ElectionParticipation_electionId_studentId_key`(`electionId`, `studentId`),
    INDEX `ElectionParticipation_electionId_idx`(`electionId`),
    INDEX `ElectionParticipation_studentId_idx`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ElectionBallot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `electionId` INTEGER NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ElectionBallot_electionId_idx`(`electionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ElectionBallotChoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ballotId` INTEGER NOT NULL,
    `positionId` INTEGER NOT NULL,
    `candidateId` INTEGER NOT NULL,

    UNIQUE INDEX `ElectionBallotChoice_ballotId_positionId_key`(`ballotId`, `positionId`),
    INDEX `ElectionBallotChoice_ballotId_idx`(`ballotId`),
    INDEX `ElectionBallotChoice_positionId_idx`(`positionId`),
    INDEX `ElectionBallotChoice_candidateId_idx`(`candidateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Election` ADD CONSTRAINT `Election_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Election` ADD CONSTRAINT `Election_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ElectionPosition` ADD CONSTRAINT `ElectionPosition_electionId_fkey` FOREIGN KEY (`electionId`) REFERENCES `Election`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ElectionCandidate` ADD CONSTRAINT `ElectionCandidate_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `ElectionPosition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ElectionCandidate` ADD CONSTRAINT `ElectionCandidate_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ElectionParticipation` ADD CONSTRAINT `ElectionParticipation_electionId_fkey` FOREIGN KEY (`electionId`) REFERENCES `Election`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ElectionParticipation` ADD CONSTRAINT `ElectionParticipation_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ElectionBallot` ADD CONSTRAINT `ElectionBallot_electionId_fkey` FOREIGN KEY (`electionId`) REFERENCES `Election`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ElectionBallotChoice` ADD CONSTRAINT `ElectionBallotChoice_ballotId_fkey` FOREIGN KEY (`ballotId`) REFERENCES `ElectionBallot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ElectionBallotChoice` ADD CONSTRAINT `ElectionBallotChoice_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `ElectionPosition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ElectionBallotChoice` ADD CONSTRAINT `ElectionBallotChoice_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `ElectionCandidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
