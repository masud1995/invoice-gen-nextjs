-- AlterTable
ALTER TABLE `sales` MODIFY `type` ENUM('Customer', 'Partner') NOT NULL DEFAULT 'Customer';

-- AlterTable
ALTER TABLE `salesitems` MODIFY `discount` DOUBLE NULL;
