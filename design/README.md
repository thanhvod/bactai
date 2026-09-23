# BTA — Design package (UI toàn bộ platform)

Gói thiết kế đầy đủ cho **4 platform** của BTA, dựng trên **design system BTA**, dùng làm đầu vào trực tiếp cho Claude Code / Orca khi implement.

| Platform | Phase | Stack | Số màn |
|---|---|---|---|
| Web Merchant | 1 | React + Vite + Tailwind + shadcn/Radix (`apps/web`) | xem [SCREEN-INDEX.md](SCREEN-INDEX.md) |
| App Tài xế | 1 | Flutter + Bloc/Cubit (`apps/driver-app`) | |
| App Merchant | 2 | Flutter | |
| Web Khách hàng | 3 | React + Vite | |

## Đọc theo thứ tự

1. **[IMPLEMENTATION-GUIDE.md](IMPLEMENTATION-GUIDE.md)** — cách implement từ gói này (thứ tự, router, shell, component, trạng thái, quyền, checklist).
2. **[SCREEN-INDEX.md](SCREEN-INDEX.md)** — mọi màn hình theo platform/module, route, pattern, màn đích.
3. **`screens/<platform>/<ID>.md`** — spec từng màn: mục đích, dữ liệu, hành động + quyền, **điều hướng đi/đến**, component, API GraphQL, trạng thái loading/empty/error/offline, ghi chú.
4. **`mockups/<ID>.html`** — mockup hi-fi bấm được (mở `mockups/index.html` trong trình duyệt, click để đi theo luồng).
5. **`flows/<FLOW>.md`** — 13 luồng nghiệp vụ (mermaid + bảng bước) nối Web Merchant ↔ App Tài xế ↔ App Merchant ↔ Web Khách hàng.
6. **[COMPONENTS.md](COMPONENTS.md)** + [COMPONENT-USAGE.md](COMPONENT-USAGE.md) — danh mục component, props, màn nào dùng.
7. **`tokens/`** — token BTA: `tokens.json` (nguồn), `tokens.css` (CSS vars + biến shadcn), `tailwind.preset.cjs`, `bta_tokens.dart` (Flutter theme).

## Spec máy đọc được

| File | Nội dung |
|---|---|
| `spec/screens.json` | Mọi màn: id, platform, module, route, pattern, roles, api, data, actions (guard), states, notes, components, overlayOf, kích thước. |
| `spec/navigation.json` | Đồ thị điều hướng: `edges[{from, to, trigger, kind}]` (`action` nút/link, `nav` sidebar/bottom nav, `back`, `flow`, `index`) + `flows[]`. |
| `spec/routes.web.ts` | Map screen ID → route cho web. |
| `spec/routes.mobile.dart` | Map screen ID → route name cho Flutter. |

## Canvas thiết kế

Toàn bộ màn hình cũng có trên canvas Design (claude.ai): trang **Tổng quan & flows**, **Web Merchant**, **App Tài xế**, **App Merchant**,
**Web Khách hàng**. Mỗi artboard mang mã màn hình (`WM-ORD-02 · Chi tiết đơn hàng`), bấm **Play** để đi theo link giữa các màn.

## Sinh lại

Mockup, spec và index đều **sinh từ code** trong `tools/`; sửa thiết kế ở `tools/bta/screens/*.py` rồi chạy:

```bash
python3 design/tools/gen_tokens.py            # nếu tokens.json đổi
python3 design/tools/build.py                 # mockups + spec + index (fail nếu có link tới màn không tồn tại)
OUT=/tmp/shots node design/tools/check_mockups.js   # kiểm tra chữ/bảng bị cắt + ảnh PNG
```

Quy tắc viết màn mới: [tools/AUTHORING.md](tools/AUTHORING.md).

## Nguồn

`doc/1-BRD/*`, `doc/2-PRD/01-danh-sach-man-hinh.md`, `05-route-map.md`, `06-ui-flow-specs.md`, `07-api-contract-map.md`, `08-permission-matrix.md`,
`doc/3-TECHNICAL/SEED-SCENARIOS.md` (dữ liệu mẫu), `doc/4-DESIGN/*` và design system BTA.
