-- DropForeignKey
ALTER TABLE `StudentIdea` DROP FOREIGN KEY `StudentIdea_studentId_fkey`;

-- DropIndex
DROP INDEX `StudentIdea_studentId_fkey` ON `StudentIdea`;

-- AlterTable
ALTER TABLE `Student` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `StudentIdea` ADD CONSTRAINT `StudentIdea_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
