/*
  Warnings:

  - You are about to drop the column `paystackRef` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gatewayRef]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Payment_paystackRef_key` ON `Payment`;

-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `paystackRef`,
    ADD COLUMN `gatewayRef` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_gatewayRef_key` ON `Payment`(`gatewayRef`);
