# WM-AUTH-02 — Tạo/hoàn tất merchant

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Auth & onboarding |
| Route | `/onboarding/merchant` |
| Pattern | `auth` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-AUTH-02.html](../../mockups/WM-AUTH-02.html) · canvas artboard `WM-AUTH-02.dc.html` |

## Mục đích

Self-service tạo nhà xe sau lần đăng nhập đầu; user trở thành Admin, seed danh mục mặc định.

## Dữ liệu hiển thị

- `name`
- `legalName`
- `taxCode?`
- `address`
- `contactName`
- `phone`
- `email`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tạo nhà xe | user đã đăng nhập, chưa bị chặn tạo merchant → admin membership |
| Hủy và đăng xuất | logout |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Đăng xuất | [WM-AUTH-01](../wm/WM-AUTH-01.md) Đăng nhập Google | `/login` | action |
| Hủy → logout | [WM-AUTH-01](../wm/WM-AUTH-01.md) Đăng nhập Google | `/login` | action |
| Tạo merchant → Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-AUTH-03](../wm/WM-AUTH-03.md) Chọn merchant | Tạo merchant mới |
| [WM-AUTH-04](../wm/WM-AUTH-04.md) Không có quyền / chờ mời | Tạo merchant |

## Components (design system)

`TextField`, `FormField`, `Banner`, `Button`, `AuthScreen`, `Logo`

## API (GraphQL)

- `createMerchant(input: {name, legalName, taxCode, address, contactName, phone, email})`
- `selectMerchant(merchantId)`

## Trạng thái UI

- **validation**: Lỗi inline: tên nhà xe, địa chỉ, người liên hệ, SĐT bắt buộc; MST 10/13 số nếu nhập
- **submitting**: Nút 'Tạo nhà xe' loading, khóa form
- **error**: Banner danger nếu createMerchant fail
- **loading**: Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Seed catalog mặc định (loại chi phí, add-on, loại hàng, lý do tạm dừng, loại chứng từ, loại sự cố) và number sequences.
- Mã nhà xe sinh tự động, không cho sửa.
