# WM-AUTH-03 — Chọn merchant

| Thuộc tính | Giá trị |
|---|---|
| Platform | Web Merchant (phase 1) — React + Vite + Tailwind + shadcn/Radix (apps/web) |
| Module | Auth & onboarding |
| Route | `/select-merchant` |
| Pattern | `auth` |
| Roles | admin, operation, accountant |
| Kích thước mockup | 1440×960 |
| Mockup | [../../mockups/WM-AUTH-03.html](../../mockups/WM-AUTH-03.html) · canvas artboard `WM-AUTH-03.dc.html` |

## Mục đích

User thuộc nhiều nhà xe chọn tenant làm việc; cũng mở từ merchant switcher.

## Dữ liệu hiển thị

- `merchant.name`
- `merchant.code`
- `role`
- `status`
- `lastAccessAt`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Chọn nhà xe | membership active → WM-DASH-01 |
| Tạo nhà xe mới | → WM-AUTH-02 |
| Đăng xuất | logout |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Chọn BTA Demo Transport → Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | action |
| Chọn Vận tải Hòa Bình Logistics → Dashboard | [WM-DASH-01](../wm/WM-DASH-01.md) Dashboard tổng quan | `/` | action |
| Đăng xuất | [WM-AUTH-01](../wm/WM-AUTH-01.md) Đăng nhập Google | `/login` | action |
| Tạo merchant mới | [WM-AUTH-02](../wm/WM-AUTH-02.md) Tạo/hoàn tất merchant | `/onboarding/merchant` | action |

## Điều hướng đến (incoming)

| Từ | Trigger |
|---|---|
| [WM-AUTH-01](../wm/WM-AUTH-01.md) Đăng nhập Google | Sau đăng nhập: nhiều merchant |
| [WM-AUTH-04](../wm/WM-AUTH-04.md) Không có quyền / chờ mời | Đã có lời mời → chọn merchant |
| [WM-SHELL-01](../wm/WM-SHELL-01.md) Layout chính | Đổi nhà xe |

## Components (design system)

`StatusBadge`, `MerchantList`, `AuthScreen`, `Logo`

## API (GraphQL)

- `me{memberships{merchant{id, code, name}, role, status, lastAccessAt}}`
- `selectMerchant(merchantId)`

## Trạng thái UI

- **locked**: Membership bị khóa: dòng mờ + badge 'Tạm khóa', không click được
- **loading**: Skeleton 3 dòng
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.
- **error**: Nói rõ lỗi gì, có thử lại được không.

## Ghi chú implement

- Đổi merchant phải reset toàn bộ cache (Apollo/React Query) để không lộ dữ liệu tenant cũ.
