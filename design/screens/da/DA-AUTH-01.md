# DA-AUTH-01 — Splash/kiểm tra phiên

| Thuộc tính | Giá trị |
|---|---|
| Platform | App Tài xế (phase 1) — Flutter + Bloc/Cubit (apps/driver-app) |
| Module | Đăng nhập |
| Route | `DriverSplashRoute` |
| Pattern | `auth` |
| Roles | driver |
| Kích thước mockup | 390×844 |
| Mockup | [../../mockups/DA-AUTH-01.html](../../mockups/DA-AUTH-01.html) · canvas artboard `DA-AUTH-01.dc.html` |

## Mục đích

Khởi động app: kiểm tra phiên đăng nhập, số mục offline chờ đồng bộ; tự chuyển Home hoặc Login.

## Dữ liệu hiển thị

- `session.token`
- `driver.name`
- `merchant.name`
- `syncQueue.pendingCount`

## Hành động & quyền

| Hành động | Permission / guard |
|---|---|
| Tự động → DA-HOME-01 | phiên hợp lệ, driver active |
| Tự động → DA-AUTH-02 | chưa đăng nhập / hết hạn / driver inactive |

## Điều hướng đi (outgoing)

| Trigger | Đích | Route đích | Loại |
|---|---|---|---|
| Tự động: có phiên hợp lệ → Trang chủ | [DA-HOME-01](../da/DA-HOME-01.md) Trang chủ công việc | `DriverHomeRoute` | action |
| Tự động: chưa đăng nhập / phiên hết hạn → Đăng nhập | [DA-AUTH-02](../da/DA-AUTH-02.md) Đăng nhập tài xế | `DriverLoginRoute` | action |

## Điều hướng đến (incoming)

- Chỉ vào qua điều hướng chính (sidebar / bottom nav) hoặc deep link.

## Components (design system)

`Logo`

## API (GraphQL)

- `driverMe`

## Trạng thái UI

- **loading**: Logo + progress, tối đa ~3 giây rồi điều hướng
- **offline**: Có token cache → vào Home với dữ liệu cache; không token → Login
- **error**: Token bị thu hồi → Login với thông báo 'Phiên đã hết hạn'
- **empty**: EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.

## Ghi chú implement

- Không hiện status bar giả; Flutter splash native + màn Flutter kiểm tra phiên.
- Nếu còn mục chờ đồng bộ thì giữ nguyên hàng đợi, không xóa khi phiên hết hạn.
