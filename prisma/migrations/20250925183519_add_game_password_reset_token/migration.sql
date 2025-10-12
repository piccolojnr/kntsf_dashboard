-- CreateTable
CREATE TABLE `GamePasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `gameUserId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GamePasswordResetToken_token_key`(`token`),
    INDEX `GamePasswordResetToken_token_idx`(`token`),
    INDEX `GamePasswordResetToken_expires_idx`(`expires`),
    INDEX `GamePasswordResetToken_used_idx`(`used`),
    INDEX `GamePasswordResetToken_gameUserId_fkey`(`gameUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GamePasswordResetToken` ADD CONSTRAINT `GamePasswordResetToken_gameUserId_fkey` FOREIGN KEY (`gameUserId`) REFERENCES `GameUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;