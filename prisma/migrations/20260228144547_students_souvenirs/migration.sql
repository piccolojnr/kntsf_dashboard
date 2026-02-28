-- CreateTable
CREATE TABLE `Souvenir` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Souvenir_name_key`(`name`),
    INDEX `Souvenir_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentSouvenir` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `souvenirId` INTEGER NOT NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `recordedById` INTEGER NOT NULL,

    INDEX `StudentSouvenir_studentId_idx`(`studentId`),
    INDEX `StudentSouvenir_souvenirId_idx`(`souvenirId`),
    INDEX `StudentSouvenir_recordedById_fkey`(`recordedById`),
    UNIQUE INDEX `StudentSouvenir_studentId_souvenirId_key`(`studentId`, `souvenirId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentSouvenir` ADD CONSTRAINT `StudentSouvenir_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentSouvenir` ADD CONSTRAINT `StudentSouvenir_souvenirId_fkey` FOREIGN KEY (`souvenirId`) REFERENCES `Souvenir`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentSouvenir` ADD CONSTRAINT `StudentSouvenir_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
