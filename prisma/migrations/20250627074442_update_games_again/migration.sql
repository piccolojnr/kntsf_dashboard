/*
  Warnings:

  - You are about to drop the column `gameId` on the `LeaderboardEntry` table. All the data in the column will be lost.
  - You are about to drop the column `weekStart` on the `LeaderboardEntry` table. All the data in the column will be lost.
  - You are about to drop the `HistoricalLeaderboardEntry` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,periodId]` on the table `LeaderboardEntry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `periodId` to the `LeaderboardEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `HistoricalLeaderboardEntry` DROP FOREIGN KEY `HistoricalLeaderboardEntry_userId_fkey`;

-- DropForeignKey
ALTER TABLE `LeaderboardEntry` DROP FOREIGN KEY `LeaderboardEntry_userId_fkey`;

-- DropIndex
DROP INDEX `LeaderboardEntry_userId_gameId_idx` ON `LeaderboardEntry`;

-- DropIndex
DROP INDEX `LeaderboardEntry_weekStart_idx` ON `LeaderboardEntry`;

-- AlterTable
ALTER TABLE `LeaderboardEntry` DROP COLUMN `gameId`,
    DROP COLUMN `weekStart`,
    ADD COLUMN `periodId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `HistoricalLeaderboardEntry`;

-- CreateTable
CREATE TABLE `LeaderboardPeriod` (
    `id` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `winnerId` VARCHAR(191) NULL,

    UNIQUE INDEX `LeaderboardPeriod_startDate_endDate_key`(`startDate`, `endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `LeaderboardEntry_userId_periodId_key` ON `LeaderboardEntry`(`userId`, `periodId`);

-- AddForeignKey
ALTER TABLE `LeaderboardPeriod` ADD CONSTRAINT `LeaderboardPeriod_winnerId_fkey` FOREIGN KEY (`winnerId`) REFERENCES `GameUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaderboardEntry` ADD CONSTRAINT `LeaderboardEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `GameUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaderboardEntry` ADD CONSTRAINT `LeaderboardEntry_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `LeaderboardPeriod`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
