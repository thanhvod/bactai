# 4-DESIGN — Design System & UI Handoff

> Ngày lập: 2026-09-23  
> Mục tiêu: làm đầu vào cho Claude Code thiết kế design system và UI các màn hình cho BTA.

## 1. Nguồn tài liệu đã dùng

Design system này tổng hợp từ toàn bộ tài liệu hiện có:

- `doc/1-BRD/00-brd.md`
- `doc/1-BRD/01-decisions.md`
- `doc/1-BRD/02-nghiep-vu-don-hang.md`
- `doc/1-BRD/03-nghiep-vu-cong-no.md`
- `doc/1-BRD/04-nghiep-vu-luong-tai-xe.md`
- `doc/1-BRD/05-nghiep-vu-dieu-phoi.md`
- `doc/1-BRD/06-scope-phase-1.md`
- `doc/1-BRD/07-data-model.md`
- `doc/1-BRD/08-kien-truc.md`
- `doc/1-BRD/09-bo-sung-chuc-nang.md`
- `doc/2-PRD/01-danh-sach-man-hinh.md`
- `doc/2-PRD/02-implementation-breakdown.md`
- `doc/3-TECHNICAL/ARCHITECTURE.md`

## 2. Cách đọc

Đọc theo thứ tự:

1. `00-product-design-principles.md` — định hướng sản phẩm, người dùng, tone giao diện.
2. `01-design-system.md` — token màu, typography, spacing, component rules.
3. `02-web-merchant-ui.md` — layout và pattern cho Web Merchant/doanh nghiệp.
4. `03-driver-app-ui.md` — guideline Flutter cho app tài xế.
5. `04-claude-code-handoff.md` — brief ngắn, checklist và lệnh thiết kế cho Claude Code.

## 3. Tinh thần chung

BTA là phần mềm vận hành vận tải, không phải landing page hay app tiêu dùng giải trí. Giao diện phải:

- Chuyên nghiệp, rõ ràng, bền bỉ khi dùng hằng ngày.
- Ưu tiên tốc độ nhập liệu, đối chiếu, lọc, kiểm tra tiền và trạng thái.
- Không màu mè, không gradient, không minh họa trang trí, không hero marketing.
- Mềm trong vận hành: cảnh báo rõ, vẫn cho người có quyền override kèm lý do.
- Có audit/timeline/chứng từ hiện diện trong trải nghiệm, vì đây là phần mềm có dữ liệu tiền và tranh chấp thực tế.
