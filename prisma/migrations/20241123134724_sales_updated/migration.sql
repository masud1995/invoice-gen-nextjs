-- AddForeignKey
ALTER TABLE `SalesItems` ADD CONSTRAINT `SalesItems_salesId_fkey` FOREIGN KEY (`salesId`) REFERENCES `Sales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
