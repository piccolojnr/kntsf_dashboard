/*
  Warnings:

  - You are about to drop the column `appDescription` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `appFavicon` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `appLogo` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `appName` on the `Config` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinks` on the `Config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Config` DROP COLUMN `appDescription`,
    DROP COLUMN `appFavicon`,
    DROP COLUMN `appLogo`,
    DROP COLUMN `appName`,
    DROP COLUMN `socialLinks`;

-- AlterTable
ALTER TABLE `ContactInfo` ADD COLUMN `socialLinks` JSON NULL;
