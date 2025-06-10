-- AlterTable
ALTER TABLE `User` ADD COLUMN `biography` TEXT NULL,
    ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `position` VARCHAR(191) NULL,
    ADD COLUMN `positionDescription` TEXT NULL,
    ADD COLUMN `socialLinks` JSON NULL;
