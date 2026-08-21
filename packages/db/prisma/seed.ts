import { PrismaClient, CatalogKind, UserRole } from "@prisma/client";
import { CATALOG_DEFAULTS } from "@bta/shared";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

// Format "scrypt:<salt>:<hash>" — API auth phải dùng cùng format này để verify
function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

async function main() {
  // Merchant demo cho dev — chạy nhiều lần không tạo trùng
  const existing = await prisma.merchant.findFirst({
    where: { name: "Nhà xe Demo" },
  });
  if (existing) {
    console.log("Seed đã chạy trước đó, bỏ qua.");
    return;
  }

  const merchant = await prisma.merchant.create({
    data: {
      name: "Nhà xe Demo",
      phone: "0900000000",
      address: "TP.HCM",
    },
  });

  // Danh mục mặc định
  for (const [kind, names] of Object.entries(CATALOG_DEFAULTS)) {
    await prisma.catalogItem.createMany({
      data: names.map((name, i) => ({
        merchantId: merchant.id,
        kind: kind as CatalogKind,
        name,
        sortOrder: i,
      })),
    });
  }

  // Tài khoản demo: admin / operation / kế toán — mật khẩu đều là "123456" (dev only)
  const accounts: Array<[string, string, UserRole]> = [
    ["admin@demo.bta", "Giám đốc Demo", UserRole.ADMIN],
    ["op@demo.bta", "Điều hành Demo", UserRole.OPERATION],
    ["ketoan@demo.bta", "Kế toán Demo", UserRole.ACCOUNTANT],
  ];
  for (const [email, fullName, role] of accounts) {
    await prisma.user.create({
      data: {
        merchantId: merchant.id,
        email,
        fullName,
        role,
        passwordHash: hashPassword("123456"),
      },
    });
  }

  // Tài xế + xe demo
  await prisma.driver.create({
    data: {
      merchantId: merchant.id,
      fullName: "Tài xế Demo",
      phone: "0911111111",
      passwordHash: hashPassword("123456"),
      baseSalary: 8_000_000n,
    },
  });
  await prisma.vehicle.create({
    data: {
      merchantId: merchant.id,
      plateNumber: "51C-123.45",
      type: "Tải thùng",
      loadCapacityKg: 8000,
    },
  });
  await prisma.customer.create({
    data: {
      merchantId: merchant.id,
      name: "Khách hàng Demo",
      phone: "0922222222",
    },
  });

  console.log(`Seed xong: merchant ${merchant.id} (Nhà xe Demo)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
