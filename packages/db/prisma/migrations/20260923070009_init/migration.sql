-- CreateEnum
CREATE TYPE "MerchantRole" AS ENUM ('ADMIN', 'OPERATION', 'ACCOUNTANT');

-- CreateEnum
CREATE TYPE "PermissionGrant" AS ENUM ('ALLOWED', 'GRANTABLE', 'DENIED');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('INVITED', 'ACTIVE', 'LOCKED');

-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('COMPANY', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "LocationUsage" AS ENUM ('PICKUP', 'DROPOFF', 'BOTH', 'DOCUMENTS');

-- CreateEnum
CREATE TYPE "DriverAccountStatus" AS ENUM ('NONE', 'ACTIVE', 'MUST_CHANGE_PASSWORD', 'DISABLED');

-- CreateEnum
CREATE TYPE "CatalogType" AS ENUM ('EXPENSE_CATEGORY', 'ADDON_SERVICE', 'CARGO_TYPE', 'PACKAGING_UNIT', 'PAUSE_REASON', 'DEDUCTION_REASON', 'DOCUMENT_TYPE', 'INCIDENT_TYPE', 'VEHICLE_TYPE', 'SUPPLIER_TYPE', 'CUSTOMER_GROUP');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('SCHEDULED', 'TO_PICKUP', 'PICKING_UP', 'IN_TRANSIT', 'PAUSED', 'DELIVERING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StopStatus" AS ENUM ('NOT_ARRIVED', 'ARRIVED', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "StopType" AS ENUM ('PICKUP', 'DROPOFF');

-- CreateEnum
CREATE TYPE "CargoProperty" AS ENUM ('FRAGILE', 'COLD', 'OVERSIZE', 'HAZARDOUS');

-- CreateEnum
CREATE TYPE "ScheduleWarningType" AS ENUM ('OVERLAP', 'NEAR_OVERLAP');

-- CreateEnum
CREATE TYPE "ScheduleSubject" AS ENUM ('VEHICLE', 'DRIVER');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExpenseKind" AS ENUM ('TRIP_COST', 'EXTERNAL_TRANSPORT', 'VEHICLE_SUPPLY', 'OTHER_COST', 'DRIVER_REIMBURSEMENT', 'SALARY_ADVANCE', 'TRIP_ADVANCE', 'SALARY_PAYMENT');

-- CreateEnum
CREATE TYPE "ExpensePaidBy" AS ENUM ('COMPANY', 'DRIVER', 'DRIVER_ADVANCE');

-- CreateEnum
CREATE TYPE "PaidStatus" AS ENUM ('UNPAID', 'PAID');

-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentInType" AS ENUM ('CUSTOMER_PAYMENT', 'DRIVER_COD_REMITTANCE', 'DRIVER_ADVANCE_RETURN', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "TripAdvanceStatus" AS ENUM ('OPEN', 'RECONCILED');

-- CreateEnum
CREATE TYPE "DebtStatementStatus" AS ENUM ('DRAFT', 'FINALIZED', 'SENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DebtStatementScope" AS ENUM ('UNPAID_ONLY', 'ALL_IN_PERIOD');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RETURNED', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollItemType" AS ENUM ('BASE', 'BONUS', 'ADVANCE', 'DEDUCTION', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "PayrollPeriodType" AS ENUM ('MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'CONVERTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'DRIVER', 'CUSTOMER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('USER', 'DRIVER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('MERCHANT', 'MERCHANT_USER', 'CUSTOMER', 'CUSTOMER_LOCATION', 'DRIVER', 'VEHICLE', 'SUPPLIER', 'CATALOG_ITEM', 'ORDER', 'ORDER_STOP', 'TRIP', 'EXPENSE', 'PAYMENT_IN', 'DEBT_STATEMENT', 'PAYROLL', 'PAYROLL_LINE', 'INCIDENT', 'BOOKING', 'TRIP_ADVANCE', 'SETTINGS');

-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('CREATE', 'UPDATE', 'STATUS', 'MONEY', 'ATTACHMENT', 'NOTE', 'SENSITIVE', 'ASSIGNMENT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TRIP_ASSIGNED', 'TRIP_CHANGED', 'ORDER_OVERDUE', 'CUSTOMER_OVER_LIMIT', 'COD_HELD_WARNING', 'PAYROLL_SUBMITTED', 'PAYROLL_APPROVED', 'PAYROLL_RETURNED', 'SCHEDULE_CONFLICT', 'INCIDENT_NEW', 'INCIDENT_ASSIGNED', 'BOOKING_NEW', 'BOOKING_UPDATED', 'ORDER_UPDATED', 'DEBT_STATEMENT_SENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('ORDER', 'TRIP', 'PAYMENT_IN', 'EXPENSE', 'PAYROLL', 'DEBT_STATEMENT', 'INCIDENT', 'BOOKING', 'CUSTOMER', 'DRIVER', 'VEHICLE', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "ResetPeriod" AS ENUM ('MONTHLY', 'YEARLY', 'NEVER');

-- CreateEnum
CREATE TYPE "AttachmentCategory" AS ENUM ('POD', 'WAREHOUSE_SLIP', 'INVOICE', 'LOADING_RECEIPT', 'EXPENSE_RECEIPT', 'INCIDENT_PHOTO', 'CONTRACT', 'PAYMENT_PROOF', 'DEBT_STATEMENT_PDF', 'PRINT_DOCUMENT', 'LICENSE', 'LOGO', 'OTHER');

-- CreateEnum
CREATE TYPE "AttachmentStatus" AS ENUM ('PENDING', 'READY', 'DELETED');

-- CreateEnum
CREATE TYPE "ImportEntityType" AS ENUM ('CUSTOMER', 'VEHICLE', 'DRIVER');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PREVIEW', 'COMMITTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "user_accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firebaseUid" TEXT,
    "name" TEXT,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "taxCode" TEXT,
    "businessType" TEXT,
    "address" TEXT,
    "province" TEXT,
    "district" TEXT,
    "yardName" TEXT,
    "representativeName" TEXT,
    "representativeTitle" TEXT,
    "contactName" TEXT,
    "phone" TEXT,
    "dispatchHotline" TEXT,
    "email" TEXT,
    "intro" TEXT,
    "logoAttachmentId" TEXT,
    "publicProfile" BOOLEAN NOT NULL DEFAULT false,
    "serviceAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_settings" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "payrollPeriodType" "PayrollPeriodType" NOT NULL DEFAULT 'MONTHLY',
    "payrollStartDay" INTEGER NOT NULL DEFAULT 1,
    "nearOverlapMinutes" INTEGER NOT NULL DEFAULT 120,
    "defaultTripHours" INTEGER NOT NULL DEFAULT 8,
    "overlapWarnVehicle" BOOLEAN NOT NULL DEFAULT true,
    "overlapWarnDriver" BOOLEAN NOT NULL DEFAULT true,
    "codWarningAmount" BIGINT NOT NULL DEFAULT 5000000,
    "codWarningDays" INTEGER NOT NULL DEFAULT 2,
    "codDashboardAlert" BOOLEAN NOT NULL DEFAULT true,
    "defaultDebtDays" INTEGER NOT NULL DEFAULT 15,
    "defaultCreditLimit" BIGINT,
    "warnOverLimit" BOOLEAN NOT NULL DEFAULT true,
    "warnOverdue" BOOLEAN NOT NULL DEFAULT true,
    "gpsRetentionDays" INTEGER NOT NULL DEFAULT 180,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_users" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "accountId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "title" TEXT,
    "role" "MerchantRole" NOT NULL,
    "extraPermissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "MemberStatus" NOT NULL DEFAULT 'INVITED',
    "note" TEXT,
    "invitedByUserId" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "lastAccessAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_role_permissions" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "role" "MerchantRole" NOT NULL,
    "permission" TEXT NOT NULL,
    "grant" "PermissionGrant" NOT NULL,

    CONSTRAINT "merchant_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_accounts" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" "DriverAccountStatus" NOT NULL DEFAULT 'MUST_CHANGE_PASSWORD',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "deviceInfo" TEXT,
    "fcmToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_refresh_tokens" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "companyName" TEXT,
    "taxCode" TEXT,
    "billingAddress" TEXT,
    "contactTitle" TEXT,
    "notificationPrefs" JSONB,
    "status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "usage" "LocationUsage" NOT NULL DEFAULT 'BOTH',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "note" TEXT,
    "isDefaultPickup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_refresh_tokens" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_password_resets" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "number_formats" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "docType" "DocType" NOT NULL,
    "prefix" TEXT NOT NULL,
    "separator" TEXT NOT NULL DEFAULT '-',
    "datePart" TEXT NOT NULL DEFAULT 'YYYYMM',
    "digits" INTEGER NOT NULL DEFAULT 4,
    "resetPeriod" "ResetPeriod" NOT NULL DEFAULT 'MONTHLY',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "number_formats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "number_sequences" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "docType" "DocType" NOT NULL,
    "period" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "number_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "type" "CatalogType" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "appliesTo" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT,
    "actorType" "ActorType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CustomerType" NOT NULL DEFAULT 'COMPANY',
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "taxCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "invoiceEmail" TEXT,
    "billingAddress" TEXT,
    "groupId" TEXT,
    "primaryContact" JSONB,
    "creditLimit" BIGINT,
    "defaultDebtDays" INTEGER,
    "note" TEXT,
    "status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "deactivateReason" TEXT,
    "portalAccountId" TEXT,
    "shareOrderHistory" BOOLEAN NOT NULL DEFAULT true,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_locations" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "usage" "LocationUsage" NOT NULL DEFAULT 'BOTH',
    "address" TEXT NOT NULL,
    "province" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "note" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dob" DATE,
    "idNumber" TEXT,
    "address" TEXT,
    "emergencyContact" TEXT,
    "licenseClass" TEXT,
    "licenseNumber" TEXT,
    "licenseExpiresAt" DATE,
    "status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_salary_histories" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "reason" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_salary_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "typeId" TEXT,
    "capacityTons" DOUBLE PRECISION,
    "brandModel" TEXT,
    "year" INTEGER,
    "chassisNo" TEXT,
    "engineNo" TEXT,
    "boxSize" TEXT,
    "fuelNorm" TEXT,
    "registrationExpiresAt" DATE,
    "insuranceExpiresAt" DATE,
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" TEXT,
    "taxCode" TEXT,
    "address" TEXT,
    "bankName" TEXT,
    "bankAccountNo" TEXT,
    "paymentTerms" TEXT,
    "contacts" JSONB,
    "note" TEXT,
    "status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "deactivateReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "bookingId" TEXT,
    "orderDate" DATE NOT NULL,
    "freightAmount" BIGINT NOT NULL DEFAULT 0,
    "dueDate" DATE,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "requiredVehicleTypeId" TEXT,
    "requiredCapacityTons" DOUBLE PRECISION,
    "routeSummary" TEXT,
    "note" TEXT,
    "internalNote" TEXT,
    "createdByUserId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_stops" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "StopType" NOT NULL,
    "sequence" INTEGER NOT NULL,
    "locationId" TEXT,
    "locationName" TEXT,
    "address" TEXT NOT NULL,
    "province" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "plannedAt" TIMESTAMP(3),
    "codExpected" BIGINT,
    "codActual" BIGINT,
    "codCollectedAt" TIMESTAMP(3),
    "codNote" TEXT,
    "status" "StopStatus" NOT NULL DEFAULT 'NOT_ARRIVED',
    "arrivedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "skipReason" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo_lines" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cargoTypeId" TEXT,
    "weightKg" DOUBLE PRECISION,
    "volumeM3" DOUBLE PRECISION,
    "quantity" DOUBLE PRECISION,
    "packagingUnitId" TEXT,
    "packagingUnit" TEXT,
    "properties" "CargoProperty"[] DEFAULT ARRAY[]::"CargoProperty"[],
    "declaredValue" BIGINT,
    "pickupStopId" TEXT,
    "dropoffStopId" TEXT,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cargo_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_addons" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "serviceId" TEXT,
    "name" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "plannedStartAt" TIMESTAMP(3) NOT NULL,
    "plannedEndAt" TIMESTAMP(3),
    "actualStartAt" TIMESTAMP(3),
    "actualEndAt" TIMESTAMP(3),
    "status" "TripStatus" NOT NULL DEFAULT 'SCHEDULED',
    "pausedReasonId" TEXT,
    "pauseNote" TEXT,
    "previousStatusBeforePause" "TripStatus",
    "pausedAt" TIMESTAMP(3),
    "resumedAt" TIMESTAMP(3),
    "driverBonusAmount" BIGINT NOT NULL DEFAULT 0,
    "routeSummary" TEXT,
    "note" TEXT,
    "cancelReason" TEXT,
    "lastLat" DOUBLE PRECISION,
    "lastLng" DOUBLE PRECISION,
    "lastLocationAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_stop_assignments" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "stopId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "arrivedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_stop_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_transport_infos" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "tripId" TEXT,
    "supplierId" TEXT,
    "vehiclePlate" TEXT,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "agreedAmount" BIGINT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_transport_infos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_locations" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "driverId" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "batteryLevel" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_warnings" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "type" "ScheduleWarningType" NOT NULL,
    "subject" "ScheduleSubject" NOT NULL,
    "subjectId" TEXT NOT NULL,
    "conflictTripId" TEXT,
    "gapMinutes" INTEGER NOT NULL,
    "thresholdMinutes" INTEGER NOT NULL,
    "overriddenByUserId" TEXT,
    "overrideReason" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_warnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "typeId" TEXT,
    "title" TEXT NOT NULL,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT,
    "orderId" TEXT,
    "tripId" TEXT,
    "stopId" TEXT,
    "driverId" TEXT,
    "vehicleId" TEXT,
    "location" TEXT,
    "reportedByType" "ActorType" NOT NULL,
    "reportedById" TEXT,
    "reportedByName" TEXT,
    "assigneeUserId" TEXT,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedNote" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "kind" "ExpenseKind" NOT NULL,
    "categoryId" TEXT,
    "amount" BIGINT NOT NULL,
    "expenseDate" DATE NOT NULL,
    "paidBy" "ExpensePaidBy" NOT NULL DEFAULT 'COMPANY',
    "reimbursable" BOOLEAN NOT NULL DEFAULT false,
    "paidStatus" "PaidStatus" NOT NULL DEFAULT 'PAID',
    "paidAt" TIMESTAMP(3),
    "paidMethod" "PaymentMethod",
    "supplierId" TEXT,
    "orderId" TEXT,
    "tripId" TEXT,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "description" TEXT,
    "note" TEXT,
    "status" "DocStatus" NOT NULL DEFAULT 'ACTIVE',
    "cancelReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_ins" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "PaymentInType" NOT NULL,
    "customerId" TEXT,
    "driverId" TEXT,
    "tripId" TEXT,
    "payerName" TEXT,
    "amount" BIGINT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "bankAccount" TEXT,
    "transferNote" TEXT,
    "receivedBy" TEXT,
    "note" TEXT,
    "status" "DocStatus" NOT NULL DEFAULT 'ACTIVE',
    "cancelReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cod_remittance_items" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "stopId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,

    CONSTRAINT "cod_remittance_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_advance_reconciliations" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "status" "TripAdvanceStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "advanceAmount" BIGINT NOT NULL DEFAULT 0,
    "actualCost" BIGINT NOT NULL DEFAULT 0,
    "differenceAmount" BIGINT NOT NULL DEFAULT 0,
    "resolvedByUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "reason" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_advance_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_statements" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "periodFrom" DATE NOT NULL,
    "periodTo" DATE NOT NULL,
    "scope" "DebtStatementScope" NOT NULL DEFAULT 'UNPAID_ONLY',
    "status" "DebtStatementStatus" NOT NULL DEFAULT 'DRAFT',
    "lineCount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" BIGINT NOT NULL DEFAULT 0,
    "paidAmount" BIGINT NOT NULL DEFAULT 0,
    "remainingAmount" BIGINT NOT NULL DEFAULT 0,
    "note" TEXT,
    "pdfAttachmentId" TEXT,
    "sharedWithCustomer" BOOLEAN NOT NULL DEFAULT false,
    "finalizedAt" TIMESTAMP(3),
    "finalizedByUserId" TEXT,
    "sentAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_statement_lines" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "statementId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "orderDate" DATE NOT NULL,
    "orderCode" TEXT NOT NULL,
    "route" TEXT,
    "totalAmount" BIGINT NOT NULL,
    "paidAmount" BIGINT NOT NULL,
    "remainingAmount" BIGINT NOT NULL,
    "dueDate" DATE,
    "overdueDays" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "debt_statement_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "periodFrom" DATE NOT NULL,
    "periodTo" DATE NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "note" TEXT,
    "salaryTotal" BIGINT NOT NULL DEFAULT 0,
    "bonusTotal" BIGINT NOT NULL DEFAULT 0,
    "advanceTotal" BIGINT NOT NULL DEFAULT 0,
    "deductionTotal" BIGINT NOT NULL DEFAULT 0,
    "adjustmentTotal" BIGINT NOT NULL DEFAULT 0,
    "netTotal" BIGINT NOT NULL DEFAULT 0,
    "createdByUserId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "submittedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedByUserId" TEXT,
    "approvalNote" TEXT,
    "returnedAt" TIMESTAMP(3),
    "returnedByUserId" TEXT,
    "returnReason" TEXT,
    "paidAt" TIMESTAMP(3),
    "paidByUserId" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_lines" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "baseSalary" BIGINT NOT NULL DEFAULT 0,
    "salaryEffectiveFrom" DATE,
    "bonusTotal" BIGINT NOT NULL DEFAULT 0,
    "advanceTotal" BIGINT NOT NULL DEFAULT 0,
    "deductionTotal" BIGINT NOT NULL DEFAULT 0,
    "adjustmentTotal" BIGINT NOT NULL DEFAULT 0,
    "netAmount" BIGINT NOT NULL DEFAULT 0,
    "anomalies" JSONB,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_line_items" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "type" "PayrollItemType" NOT NULL,
    "amount" BIGINT NOT NULL,
    "description" TEXT NOT NULL,
    "reasonId" TEXT,
    "tripId" TEXT,
    "expenseId" TEXT,
    "itemDate" DATE,
    "note" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "customerId" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'SUBMITTED',
    "stops" JSONB NOT NULL,
    "cargoName" TEXT NOT NULL,
    "weightTon" DOUBLE PRECISION,
    "packages" INTEGER,
    "vehicleTypeHint" TEXT,
    "fragile" BOOLEAN NOT NULL DEFAULT false,
    "loadingAtPickup" BOOLEAN NOT NULL DEFAULT false,
    "loadingAtDrop" BOOLEAN NOT NULL DEFAULT false,
    "pickupFrom" TIMESTAMP(3),
    "deliverBefore" TIMESTAMP(3),
    "flexibility" TEXT,
    "note" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "acceptedByUserId" TEXT,
    "rejectReason" TEXT,
    "cancelReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_notes" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "authorType" "ActorType" NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "category" "AttachmentCategory" NOT NULL DEFAULT 'OTHER',
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "checksum" TEXT,
    "status" "AttachmentStatus" NOT NULL DEFAULT 'PENDING',
    "uploadedByType" "ActorType" NOT NULL,
    "uploadedById" TEXT,
    "uploadedByName" TEXT,
    "capturedAt" TIMESTAMP(3),
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "note" TEXT,
    "sharedWithCustomer" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deleteReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "parentEntityType" "EntityType",
    "parentEntityId" TEXT,
    "category" "ActivityCategory" NOT NULL,
    "action" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "reason" TEXT,
    "before" JSONB,
    "after" JSONB,
    "sensitive" BOOLEAN NOT NULL DEFAULT false,
    "clientRequestId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_histories" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "reason" TEXT,
    "note" TEXT,
    "actorType" "ActorType" NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT,
    "recipientType" "RecipientType" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "entityType" "EntityType",
    "entityId" TEXT,
    "severity" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_jobs" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "entityType" "ImportEntityType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "mapping" JSONB,
    "status" "ImportStatus" NOT NULL DEFAULT 'PREVIEW',
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "validRows" INTEGER NOT NULL DEFAULT 0,
    "warningRows" INTEGER NOT NULL DEFAULT 0,
    "errorRows" INTEGER NOT NULL DEFAULT 0,
    "rows" JSONB NOT NULL,
    "result" JSONB,
    "createdByUserId" TEXT,
    "committedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_email_key" ON "user_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_firebaseUid_key" ON "user_accounts"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_code_key" ON "merchants"("code");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_settings_merchantId_key" ON "merchant_settings"("merchantId");

-- CreateIndex
CREATE INDEX "merchant_users_accountId_idx" ON "merchant_users"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_users_merchantId_email_key" ON "merchant_users"("merchantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_role_permissions_merchantId_role_permission_key" ON "merchant_role_permissions"("merchantId", "role", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "driver_accounts_driverId_key" ON "driver_accounts"("driverId");

-- CreateIndex
CREATE INDEX "driver_accounts_merchantId_idx" ON "driver_accounts"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "driver_refresh_tokens_tokenHash_key" ON "driver_refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "driver_refresh_tokens_accountId_idx" ON "driver_refresh_tokens"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_accounts_email_key" ON "customer_accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customer_accounts_phone_key" ON "customer_accounts"("phone");

-- CreateIndex
CREATE INDEX "customer_addresses_accountId_idx" ON "customer_addresses"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_refresh_tokens_tokenHash_key" ON "customer_refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "customer_refresh_tokens_accountId_idx" ON "customer_refresh_tokens"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_password_resets_tokenHash_key" ON "customer_password_resets"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "number_formats_merchantId_docType_key" ON "number_formats"("merchantId", "docType");

-- CreateIndex
CREATE UNIQUE INDEX "number_sequences_merchantId_docType_period_key" ON "number_sequences"("merchantId", "docType", "period");

-- CreateIndex
CREATE INDEX "catalog_items_merchantId_type_active_idx" ON "catalog_items"("merchantId", "type", "active");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_items_merchantId_type_code_key" ON "catalog_items"("merchantId", "type", "code");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_actorType_actorId_key_key" ON "idempotency_keys"("actorType", "actorId", "key");

-- CreateIndex
CREATE INDEX "customers_merchantId_status_name_idx" ON "customers"("merchantId", "status", "name");

-- CreateIndex
CREATE INDEX "customers_merchantId_phone_idx" ON "customers"("merchantId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "customers_merchantId_code_key" ON "customers"("merchantId", "code");

-- CreateIndex
CREATE INDEX "customer_locations_merchantId_customerId_active_idx" ON "customer_locations"("merchantId", "customerId", "active");

-- CreateIndex
CREATE INDEX "drivers_merchantId_status_idx" ON "drivers"("merchantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_merchantId_code_key" ON "drivers"("merchantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_merchantId_phone_key" ON "drivers"("merchantId", "phone");

-- CreateIndex
CREATE INDEX "driver_salary_histories_merchantId_driverId_effectiveFrom_idx" ON "driver_salary_histories"("merchantId", "driverId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "vehicles_merchantId_status_idx" ON "vehicles"("merchantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_merchantId_code_key" ON "vehicles"("merchantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_merchantId_plate_key" ON "vehicles"("merchantId", "plate");

-- CreateIndex
CREATE INDEX "suppliers_merchantId_status_name_idx" ON "suppliers"("merchantId", "status", "name");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_merchantId_code_key" ON "suppliers"("merchantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "orders_bookingId_key" ON "orders"("bookingId");

-- CreateIndex
CREATE INDEX "orders_merchantId_status_orderDate_idx" ON "orders"("merchantId", "status", "orderDate");

-- CreateIndex
CREATE INDEX "orders_merchantId_customerId_orderDate_idx" ON "orders"("merchantId", "customerId", "orderDate");

-- CreateIndex
CREATE INDEX "orders_merchantId_dueDate_idx" ON "orders"("merchantId", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "orders_merchantId_code_key" ON "orders"("merchantId", "code");

-- CreateIndex
CREATE INDEX "order_stops_merchantId_orderId_sequence_idx" ON "order_stops"("merchantId", "orderId", "sequence");

-- CreateIndex
CREATE INDEX "order_stops_merchantId_status_idx" ON "order_stops"("merchantId", "status");

-- CreateIndex
CREATE INDEX "cargo_lines_merchantId_orderId_idx" ON "cargo_lines"("merchantId", "orderId");

-- CreateIndex
CREATE INDEX "order_addons_merchantId_orderId_idx" ON "order_addons"("merchantId", "orderId");

-- CreateIndex
CREATE INDEX "trips_merchantId_status_plannedStartAt_idx" ON "trips"("merchantId", "status", "plannedStartAt");

-- CreateIndex
CREATE INDEX "trips_merchantId_driverId_plannedStartAt_idx" ON "trips"("merchantId", "driverId", "plannedStartAt");

-- CreateIndex
CREATE INDEX "trips_merchantId_vehicleId_plannedStartAt_idx" ON "trips"("merchantId", "vehicleId", "plannedStartAt");

-- CreateIndex
CREATE INDEX "trips_merchantId_orderId_idx" ON "trips"("merchantId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "trips_merchantId_code_key" ON "trips"("merchantId", "code");

-- CreateIndex
CREATE INDEX "trip_stop_assignments_merchantId_stopId_idx" ON "trip_stop_assignments"("merchantId", "stopId");

-- CreateIndex
CREATE UNIQUE INDEX "trip_stop_assignments_tripId_stopId_key" ON "trip_stop_assignments"("tripId", "stopId");

-- CreateIndex
CREATE UNIQUE INDEX "external_transport_infos_tripId_key" ON "external_transport_infos"("tripId");

-- CreateIndex
CREATE INDEX "external_transport_infos_merchantId_orderId_idx" ON "external_transport_infos"("merchantId", "orderId");

-- CreateIndex
CREATE INDEX "external_transport_infos_merchantId_supplierId_idx" ON "external_transport_infos"("merchantId", "supplierId");

-- CreateIndex
CREATE INDEX "trip_locations_merchantId_tripId_recordedAt_idx" ON "trip_locations"("merchantId", "tripId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "trip_locations_tripId_recordedAt_key" ON "trip_locations"("tripId", "recordedAt");

-- CreateIndex
CREATE INDEX "schedule_warnings_merchantId_resolvedAt_createdAt_idx" ON "schedule_warnings"("merchantId", "resolvedAt", "createdAt");

-- CreateIndex
CREATE INDEX "schedule_warnings_merchantId_tripId_idx" ON "schedule_warnings"("merchantId", "tripId");

-- CreateIndex
CREATE INDEX "incidents_merchantId_status_severity_createdAt_idx" ON "incidents"("merchantId", "status", "severity", "createdAt");

-- CreateIndex
CREATE INDEX "incidents_merchantId_tripId_idx" ON "incidents"("merchantId", "tripId");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_merchantId_code_key" ON "incidents"("merchantId", "code");

-- CreateIndex
CREATE INDEX "expenses_merchantId_expenseDate_idx" ON "expenses"("merchantId", "expenseDate");

-- CreateIndex
CREATE INDEX "expenses_merchantId_kind_status_idx" ON "expenses"("merchantId", "kind", "status");

-- CreateIndex
CREATE INDEX "expenses_merchantId_supplierId_paidStatus_idx" ON "expenses"("merchantId", "supplierId", "paidStatus");

-- CreateIndex
CREATE INDEX "expenses_merchantId_driverId_idx" ON "expenses"("merchantId", "driverId");

-- CreateIndex
CREATE INDEX "expenses_merchantId_orderId_idx" ON "expenses"("merchantId", "orderId");

-- CreateIndex
CREATE INDEX "expenses_merchantId_tripId_idx" ON "expenses"("merchantId", "tripId");

-- CreateIndex
CREATE INDEX "expenses_merchantId_vehicleId_idx" ON "expenses"("merchantId", "vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_merchantId_code_key" ON "expenses"("merchantId", "code");

-- CreateIndex
CREATE INDEX "payment_ins_merchantId_receivedAt_idx" ON "payment_ins"("merchantId", "receivedAt");

-- CreateIndex
CREATE INDEX "payment_ins_merchantId_customerId_status_idx" ON "payment_ins"("merchantId", "customerId", "status");

-- CreateIndex
CREATE INDEX "payment_ins_merchantId_driverId_type_status_idx" ON "payment_ins"("merchantId", "driverId", "type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_ins_merchantId_code_key" ON "payment_ins"("merchantId", "code");

-- CreateIndex
CREATE INDEX "payment_allocations_merchantId_orderId_idx" ON "payment_allocations"("merchantId", "orderId");

-- CreateIndex
CREATE INDEX "payment_allocations_merchantId_paymentId_idx" ON "payment_allocations"("merchantId", "paymentId");

-- CreateIndex
CREATE INDEX "cod_remittance_items_merchantId_stopId_idx" ON "cod_remittance_items"("merchantId", "stopId");

-- CreateIndex
CREATE UNIQUE INDEX "trip_advance_reconciliations_tripId_key" ON "trip_advance_reconciliations"("tripId");

-- CreateIndex
CREATE INDEX "trip_advance_reconciliations_merchantId_status_idx" ON "trip_advance_reconciliations"("merchantId", "status");

-- CreateIndex
CREATE INDEX "debt_statements_merchantId_customerId_status_idx" ON "debt_statements"("merchantId", "customerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "debt_statements_merchantId_code_key" ON "debt_statements"("merchantId", "code");

-- CreateIndex
CREATE INDEX "debt_statement_lines_merchantId_statementId_idx" ON "debt_statement_lines"("merchantId", "statementId");

-- CreateIndex
CREATE INDEX "payrolls_merchantId_status_periodFrom_idx" ON "payrolls"("merchantId", "status", "periodFrom");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_merchantId_code_key" ON "payrolls"("merchantId", "code");

-- CreateIndex
CREATE INDEX "payroll_lines_merchantId_driverId_idx" ON "payroll_lines"("merchantId", "driverId");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_lines_payrollId_driverId_key" ON "payroll_lines"("payrollId", "driverId");

-- CreateIndex
CREATE INDEX "payroll_line_items_merchantId_lineId_idx" ON "payroll_line_items"("merchantId", "lineId");

-- CreateIndex
CREATE INDEX "payroll_line_items_expenseId_idx" ON "payroll_line_items"("expenseId");

-- CreateIndex
CREATE INDEX "bookings_merchantId_status_createdAt_idx" ON "bookings"("merchantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "bookings_accountId_createdAt_idx" ON "bookings"("accountId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_merchantId_code_key" ON "bookings"("merchantId", "code");

-- CreateIndex
CREATE INDEX "booking_notes_bookingId_createdAt_idx" ON "booking_notes"("bookingId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "attachments_storageKey_key" ON "attachments"("storageKey");

-- CreateIndex
CREATE INDEX "attachments_merchantId_entityType_entityId_status_idx" ON "attachments"("merchantId", "entityType", "entityId", "status");

-- CreateIndex
CREATE INDEX "activity_logs_merchantId_entityType_entityId_createdAt_idx" ON "activity_logs"("merchantId", "entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_logs_merchantId_parentEntityType_parentEntityId_cr_idx" ON "activity_logs"("merchantId", "parentEntityType", "parentEntityId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_logs_merchantId_actorType_actorId_createdAt_idx" ON "activity_logs"("merchantId", "actorType", "actorId", "createdAt");

-- CreateIndex
CREATE INDEX "status_histories_merchantId_entityType_entityId_changedAt_idx" ON "status_histories"("merchantId", "entityType", "entityId", "changedAt");

-- CreateIndex
CREATE INDEX "notifications_recipientType_recipientId_readAt_createdAt_idx" ON "notifications"("recipientType", "recipientId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_merchantId_createdAt_idx" ON "notifications"("merchantId", "createdAt");

-- CreateIndex
CREATE INDEX "import_jobs_merchantId_createdAt_idx" ON "import_jobs"("merchantId", "createdAt");

-- AddForeignKey
ALTER TABLE "merchant_settings" ADD CONSTRAINT "merchant_settings_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_users" ADD CONSTRAINT "merchant_users_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_users" ADD CONSTRAINT "merchant_users_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_role_permissions" ADD CONSTRAINT "merchant_role_permissions_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_accounts" ADD CONSTRAINT "driver_accounts_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_refresh_tokens" ADD CONSTRAINT "driver_refresh_tokens_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "driver_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "customer_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_refresh_tokens" ADD CONSTRAINT "customer_refresh_tokens_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "customer_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_password_resets" ADD CONSTRAINT "customer_password_resets_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "customer_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_formats" ADD CONSTRAINT "number_formats_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_sequences" ADD CONSTRAINT "number_sequences_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_portalAccountId_fkey" FOREIGN KEY ("portalAccountId") REFERENCES "customer_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_locations" ADD CONSTRAINT "customer_locations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_salary_histories" ADD CONSTRAINT "driver_salary_histories_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_stops" ADD CONSTRAINT "order_stops_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_stops" ADD CONSTRAINT "order_stops_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "customer_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_lines" ADD CONSTRAINT "cargo_lines_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_lines" ADD CONSTRAINT "cargo_lines_pickupStopId_fkey" FOREIGN KEY ("pickupStopId") REFERENCES "order_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_lines" ADD CONSTRAINT "cargo_lines_dropoffStopId_fkey" FOREIGN KEY ("dropoffStopId") REFERENCES "order_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_addons" ADD CONSTRAINT "order_addons_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_stop_assignments" ADD CONSTRAINT "trip_stop_assignments_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_stop_assignments" ADD CONSTRAINT "trip_stop_assignments_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "order_stops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_transport_infos" ADD CONSTRAINT "external_transport_infos_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_transport_infos" ADD CONSTRAINT "external_transport_infos_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_transport_infos" ADD CONSTRAINT "external_transport_infos_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_locations" ADD CONSTRAINT "trip_locations_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_locations" ADD CONSTRAINT "trip_locations_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_warnings" ADD CONSTRAINT "schedule_warnings_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_warnings" ADD CONSTRAINT "schedule_warnings_conflictTripId_fkey" FOREIGN KEY ("conflictTripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "order_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "merchant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_ins" ADD CONSTRAINT "payment_ins_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_ins" ADD CONSTRAINT "payment_ins_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_ins" ADD CONSTRAINT "payment_ins_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_ins" ADD CONSTRAINT "payment_ins_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment_ins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cod_remittance_items" ADD CONSTRAINT "cod_remittance_items_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment_ins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cod_remittance_items" ADD CONSTRAINT "cod_remittance_items_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "order_stops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_advance_reconciliations" ADD CONSTRAINT "trip_advance_reconciliations_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_statements" ADD CONSTRAINT "debt_statements_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_statements" ADD CONSTRAINT "debt_statements_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_statement_lines" ADD CONSTRAINT "debt_statement_lines_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "debt_statements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_statement_lines" ADD CONSTRAINT "debt_statement_lines_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_lines" ADD CONSTRAINT "payroll_lines_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_line_items" ADD CONSTRAINT "payroll_line_items_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "payroll_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_line_items" ADD CONSTRAINT "payroll_line_items_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_line_items" ADD CONSTRAINT "payroll_line_items_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "customer_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_notes" ADD CONSTRAINT "booking_notes_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_histories" ADD CONSTRAINT "status_histories_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
