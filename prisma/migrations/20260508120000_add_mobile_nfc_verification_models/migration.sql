-- AlterTable
-- Preserve existing lowercase permit status values while constraining future writes.
ALTER TABLE `Permit` MODIFY `status` ENUM('active', 'expired', 'revoked') NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE `StudentAuth` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `lastFailedLoginAt` DATETIME(3) NULL,
    `loginCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StudentAuth_studentId_key`(`studentId`),
    UNIQUE INDEX `StudentAuth_username_key`(`username`),
    UNIQUE INDEX `StudentAuth_email_key`(`email`),
    INDEX `StudentAuth_email_idx`(`email`),
    INDEX `StudentAuth_username_idx`(`username`),
    INDEX `StudentAuth_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NfcCard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `uidHash` VARCHAR(191) NOT NULL,
    `uidLast4` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive', 'lost', 'stolen', 'replaced', 'damaged') NOT NULL DEFAULT 'inactive',
    `issuedAt` DATETIME(3) NULL,
    `activatedAt` DATETIME(3) NULL,
    `deactivatedAt` DATETIME(3) NULL,
    `replacedAt` DATETIME(3) NULL,
    `lostAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NfcCard_uidHash_key`(`uidHash`),
    INDEX `NfcCard_studentId_idx`(`studentId`),
    INDEX `NfcCard_uidHash_idx`(`uidHash`),
    INDEX `NfcCard_status_idx`(`status`),
    INDEX `NfcCard_status_studentId_idx`(`status`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `method` ENUM('student_id', 'nfc', 'qr', 'permit_code') NOT NULL,
    `result` ENUM('valid', 'invalid', 'expired', 'revoked', 'not_found', 'card_inactive', 'mismatch', 'error') NOT NULL,
    `identifierHash` VARCHAR(191) NULL,
    `reason` TEXT NULL,
    `metadata` JSON NULL,
    `studentId` INTEGER NULL,
    `permitId` INTEGER NULL,
    `cardId` INTEGER NULL,
    `verifierUserId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VerificationLog_studentId_idx`(`studentId`),
    INDEX `VerificationLog_permitId_idx`(`permitId`),
    INDEX `VerificationLog_cardId_idx`(`cardId`),
    INDEX `VerificationLog_verifierUserId_idx`(`verifierUserId`),
    INDEX `VerificationLog_createdAt_idx`(`createdAt`),
    INDEX `VerificationLog_method_createdAt_idx`(`method`, `createdAt`),
    INDEX `VerificationLog_result_createdAt_idx`(`result`, `createdAt`),
    INDEX `VerificationLog_studentId_createdAt_idx`(`studentId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Permit_status_idx` ON `Permit`(`status`);

-- AddForeignKey
ALTER TABLE `StudentAuth` ADD CONSTRAINT `StudentAuth_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NfcCard` ADD CONSTRAINT `NfcCard_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VerificationLog` ADD CONSTRAINT `VerificationLog_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `NfcCard`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VerificationLog` ADD CONSTRAINT `VerificationLog_permitId_fkey` FOREIGN KEY (`permitId`) REFERENCES `Permit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VerificationLog` ADD CONSTRAINT `VerificationLog_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VerificationLog` ADD CONSTRAINT `VerificationLog_verifierUserId_fkey` FOREIGN KEY (`verifierUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
