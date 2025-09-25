-- AlterTable
ALTER TABLE `Poll` ADD COLUMN `type` ENUM('FIXED_OPTIONS', 'DYNAMIC_OPTIONS') NOT NULL DEFAULT 'FIXED_OPTIONS';

-- AlterTable
ALTER TABLE `PollOption` ADD COLUMN `createdById` INTEGER NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'MERGED') NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX `Poll_type_idx` ON `Poll`(`type`);

-- CreateIndex
CREATE INDEX `PollOption_createdById_idx` ON `PollOption`(`createdById`);

-- CreateIndex
CREATE INDEX `PollOption_status_idx` ON `PollOption`(`status`);

-- AddForeignKey
ALTER TABLE `PollOption` ADD CONSTRAINT `PollOption_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
