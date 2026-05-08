ALTER TABLE `StudentAuth`
MODIFY `passwordHash` VARCHAR(191) NULL;

CREATE TABLE `StudentAuthToken` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `studentAuthId` INTEGER NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `type` ENUM('setup_password', 'reset_password') NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `StudentAuthToken_tokenHash_key`(`tokenHash`),
  INDEX `StudentAuthToken_studentAuthId_type_usedAt_idx`(`studentAuthId`, `type`, `usedAt`),
  INDEX `StudentAuthToken_expiresAt_idx`(`expiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `StudentAuthToken`
ADD CONSTRAINT `StudentAuthToken_studentAuthId_fkey`
FOREIGN KEY (`studentAuthId`) REFERENCES `StudentAuth`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;
