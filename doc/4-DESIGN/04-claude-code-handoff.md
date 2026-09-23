# Claude Code Handoff — Design System & UI

> Dùng file này như brief trực tiếp khi giao Claude Code dựng design system và UI.

## 1. Mission

Thiết kế và triển khai design system cho BTA, một nền tảng SaaS vận tải gồm:

- Web Merchant cho doanh nghiệp vận tải.
- Flutter Driver App cho tài xế.
- App Merchant phase sau.

Giao diện phải chuyên nghiệp, dễ dùng, không màu mè, không lòe loẹt, tối ưu cho vận hành thực tế và dữ liệu tài chính.

## 2. Must Read Before Design

Đọc các file:

- `doc/4-DESIGN/00-product-design-principles.md`
- `doc/4-DESIGN/01-design-system.md`
- `doc/4-DESIGN/02-web-merchant-ui.md`
- `doc/4-DESIGN/03-driver-app-ui.md`
- `doc/2-PRD/01-danh-sach-man-hinh.md`
- `doc/2-PRD/02-implementation-breakdown.md`
- `doc/3-TECHNICAL/ARCHITECTURE.md`

## 3. Non-Negotiables

- Không làm landing page.
- Không dùng gradient/orb/blob/minh họa trang trí.
- Không dùng palette sặc sỡ.
- Không card lồng card.
- Không che workflow nghiệp vụ sau UI đẹp mắt.
- Không dùng màu là tín hiệu duy nhất; badge phải có text.
- Không làm form/table quá thoáng khiến operation mất tốc độ.
- Không nhầm doanh thu với phiếu thu.
- Không bỏ timeline/audit/chứng từ khỏi entity detail.

## 4. Web Implementation Direction

Stack:

- React + Vite.
- Tailwind.
- shadcn/Radix là UI chính.
- lucide-react cho icon.
- react-hook-form + zod cho form.
- Apollo Client/hooks cho data.

Dựng theo thứ tự:

1. Theme tokens: color, radius, typography, spacing.
2. App shell: sidebar, topbar, notification, quick search.
3. Shared components:
   - PageHeader.
   - DataTable.
   - FilterBar.
   - StatusBadge.
   - MoneyCell.
   - EntityPicker.
   - TimelineDrawer.
   - AttachmentViewer/Uploader.
   - SensitiveActionModal.
   - EmptyState.
   - WarningPanel.
4. Screen templates:
   - List page.
   - Entity detail tabs.
   - Create/edit form.
   - Finance allocation.
   - Dashboard panel.
5. Core screens first:
   - Dashboard.
   - Order list/create/detail.
   - Trip/dispatch.
   - Customer/driver/vehicle/supplier list-detail.
   - Finance/payment/expense/debt.
   - Payroll.

## 5. Flutter Implementation Direction

Stack:

- Flutter.
- Clean architecture.
- Bloc/Cubit nếu bắt đầu mới.
- Token đồng bộ với web.

Dựng theo thứ tự:

1. Theme tokens.
2. App shell/bottom navigation.
3. Shared widgets:
   - StatusBadge.
   - TripCard.
   - StopCard.
   - MoneyText.
   - OfflineBanner.
   - SyncStatusChip.
   - PrimaryBottomAction.
   - ReasonBottomSheet.
   - AttachmentCapture.
4. Core screens:
   - Login.
   - Home hôm nay.
   - Job list.
   - Trip detail.
   - Stop detail.
   - Status update.
   - POD capture.
   - COD input.
   - Incident report.
   - Offline sync.

## 6. Screen Priority

### Go-live design priority

Web:

- Login.
- Dashboard.
- Customer/driver/vehicle/supplier list-detail.
- Order list/create/detail.
- Trip detail.
- Dispatch board.
- Attachment/timeline/sensitive action shared patterns.

Driver App:

- Login.
- Home hôm nay.
- Job list.
- Trip detail.
- Stop detail.
- Status update.
- POD.
- COD.
- Offline sync.

### Next priority

Web:

- Payment.
- Allocation.
- Expense.
- Customer debt.
- COD driver debt.
- Supplier debt.
- Payroll create/approve.
- Debt statement PDF.

## 7. Acceptance Checklist

Một UI được xem là đạt khi:

- Operation tạo order 1 xe nhanh, không bị ép qua flow phức tạp.
- Detail order nhìn được trạng thái, tiền, chuyến, chứng từ, timeline.
- Finance phân biệt rõ doanh thu, phiếu thu, phân bổ, COD tài xế.
- Driver app có nút lớn, flow POD/COD/status rõ.
- Warning mềm hiển thị đủ rõ nhưng không chặn nếu user có quyền.
- Sensitive action luôn có modal lý do.
- Table tiền align right và dùng tabular numbers.
- Mọi màn hình chính có loading/empty/error state.
- Responsive không vỡ ở tablet/mobile web.
- Không có visual trang trí làm mất cảm giác phần mềm doanh nghiệp.

## 8. Suggested First Deliverable

Deliverable đầu tiên nên là:

1. A design-system foundation in code.
2. Web shell.
3. Three representative Web screens:
   - Dashboard.
   - Order list.
   - Order detail.
4. Three representative Driver App screens:
   - Home hôm nay.
   - Trip detail.
   - Stop detail with POD/COD actions.

Sau khi pattern ổn, mở rộng sang các màn hình còn lại trong `doc/2-PRD/01-danh-sach-man-hinh.md` và chia task theo `doc/2-PRD/02-implementation-breakdown.md`.
