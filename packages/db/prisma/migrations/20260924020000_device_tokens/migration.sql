-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- CreateEnum
CREATE TYPE "DeviceApp" AS ENUM ('DRIVER', 'MERCHANT');

-- AlterTable
ALTER TABLE "driver_accounts" DROP COLUMN "fcmToken";

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "app" "DeviceApp" NOT NULL,
    "platform" "DevicePlatform" NOT NULL,
    "driverId" TEXT,
    "userAccountId" TEXT,
    "merchantId" TEXT,
    "deviceInfo" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_driverId_idx" ON "device_tokens"("driverId");

-- CreateIndex
CREATE INDEX "device_tokens_userAccountId_idx" ON "device_tokens"("userAccountId");

