/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameScore` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `GameScore` DROP FOREIGN KEY `GameScore_gameId_fkey`;

-- DropForeignKey
ALTER TABLE `GameScore` DROP FOREIGN KEY `GameScore_studentId_fkey`;

-- DropTable
DROP TABLE `Game`;

-- DropTable
DROP TABLE `GameScore`;

-- CreateTable
CREATE TABLE `GameUser` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(255) NULL,
    `password` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `studentId` INTEGER NOT NULL,

    UNIQUE INDEX `GameUser_username_key`(`username`),
    UNIQUE INDEX `GameUser_studentId_key`(`studentId`),
    INDEX `GameUser_username_idx`(`username`),
    INDEX `GameUser_createdAt_idx`(`createdAt`),
    INDEX `GameUser_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaderboardEntry` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `playerName` VARCHAR(191) NOT NULL,
    `totalScore` INTEGER NOT NULL,
    `gamesPlayed` INTEGER NOT NULL,
    `avgScore` INTEGER NOT NULL,
    `weekStart` DATETIME(3) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LeaderboardEntry_userId_gameId_idx`(`userId`, `gameId`),
    INDEX `LeaderboardEntry_weekStart_idx`(`weekStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistoricalLeaderboardEntry` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `playerName` VARCHAR(191) NOT NULL,
    `totalScore` INTEGER NOT NULL,
    `gamesPlayed` INTEGER NOT NULL,
    `avgScore` INTEGER NOT NULL,
    `weekStart` DATETIME(3) NOT NULL,
    `weekEnd` DATETIME(3) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HistoricalLeaderboardEntry_userId_gameId_weekStart_idx`(`userId`, `gameId`, `weekStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GameUser` ADD CONSTRAINT `GameUser_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaderboardEntry` ADD CONSTRAINT `LeaderboardEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `GameUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoricalLeaderboardEntry` ADD CONSTRAINT `HistoricalLeaderboardEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `GameUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
