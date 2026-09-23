-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('CUSTOMER_LOGIN');

-- DropForeignKey
ALTER TABLE "customer_password_resets" DROP CONSTRAINT "customer_password_resets_accountId_fkey";

-- AlterTable
-- Backfill tài khoản khách cũ (email+mật khẩu) chưa có SĐT — giữ dữ liệu, đánh dấu legacy
UPDATE "customer_accounts" SET "phone" = 'legacy-' || "id" WHERE "phone" IS NULL;

ALTER TABLE "customer_accounts" DROP COLUMN "passwordHash",
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "user_accounts" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "passwordUpdatedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "customer_password_resets";

-- CreateTable
CREATE TABLE "user_refresh_tokens" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_refresh_tokens_tokenHash_key" ON "user_refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "user_refresh_tokens_accountId_idx" ON "user_refresh_tokens"("accountId");

-- CreateIndex
CREATE INDEX "otp_codes_phone_purpose_createdAt_idx" ON "otp_codes"("phone", "purpose", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_phone_key" ON "user_accounts"("phone");

-- AddForeignKey
ALTER TABLE "user_refresh_tokens" ADD CONSTRAINT "user_refresh_tokens_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

