-- CreateTable
CREATE TABLE `Shop` (
    `shop` VARCHAR(191) NOT NULL,
    `scopes` VARCHAR(191) NULL,
    `isInstalled` BOOLEAN NOT NULL,
    `installedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `uninstalledAt` DATETIME(3) NULL,
    `installCount` INTEGER NOT NULL DEFAULT 0,
    `subscribeCount` INTEGER NOT NULL DEFAULT 0,
    `showOnboarding` BOOLEAN NOT NULL DEFAULT true,
    `test` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Shop_shop_key`(`shop`),
    INDEX `Shop_shop_idx`(`shop`),
    PRIMARY KEY (`shop`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `shop` VARCHAR(191) NOT NULL,
    `plan` ENUM('TRIAL', 'PAID') NOT NULL DEFAULT 'TRIAL',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `test` BOOLEAN NOT NULL DEFAULT false,
    `trialDays` INTEGER NOT NULL DEFAULT 14,
    `currentPeriodEnd` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `upgradedAt` DATETIME(3) NULL,
    `chargeId` VARCHAR(191) NULL,

    UNIQUE INDEX `Subscription_shop_key`(`shop`),
    INDEX `Subscription_shop_idx`(`shop`),
    PRIMARY KEY (`shop`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopData` (
    `shop` VARCHAR(191) NOT NULL,
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ianaTimezone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `currencyCode` VARCHAR(191) NOT NULL,
    `primaryDomain` JSON NOT NULL,
    `plan` JSON NOT NULL,
    `billingAddress` JSON NOT NULL,

    UNIQUE INDEX `ShopData_shop_key`(`shop`),
    UNIQUE INDEX `ShopData_id_key`(`id`),
    INDEX `ShopData_shop_idx`(`shop`),
    PRIMARY KEY (`shop`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `session` TEXT NOT NULL,

    UNIQUE INDEX `Session_id_key`(`id`),
    INDEX `Session_id_idx`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_shop_fkey` FOREIGN KEY (`shop`) REFERENCES `Shop`(`shop`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShopData` ADD CONSTRAINT `ShopData_shop_fkey` FOREIGN KEY (`shop`) REFERENCES `Shop`(`shop`) ON DELETE CASCADE ON UPDATE CASCADE;
