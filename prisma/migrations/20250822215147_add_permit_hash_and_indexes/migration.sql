-- AlterTable
ALTER TABLE `Permit` ADD COLUMN `permitHash` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Permit_permitCode_status_idx` ON `Permit`(`permitCode`, `status`);

-- CreateIndex
CREATE INDEX `Permit_permitHash_status_idx` ON `Permit`(`permitHash`, `status`);

-- CreateIndex
CREATE INDEX `Student_studentId_idx` ON `Student`(`studentId`);

-- CreateIndex
CREATE INDEX `Student_email_idx` ON `Student`(`email`);
