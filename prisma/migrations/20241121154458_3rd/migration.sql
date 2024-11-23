-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    ADD COLUMN `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active';
