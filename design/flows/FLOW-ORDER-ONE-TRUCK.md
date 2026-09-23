# FLOW-ORDER-ONE-TRUCK — Tạo đơn 1 xe nhanh → điều phối → tài xế

Nguồn: `doc/2-PRD/06-ui-flow-specs §4, 01 §7.1` · Mockup: [../mockups/FLOW-ORDER-ONE-TRUCK.html](../mockups/FLOW-ORDER-ONE-TRUCK.html)

```mermaid
flowchart LR
  S1["1. Operation<br/>WM-ORD-01<br/>Bấm Tạo đơn"]
  S2["2. Operation<br/>WM-ORD-03<br/>Chọn khách, điểm lấy/trả từ sổ địa chỉ, hàng, giá cước, add-on, hạn TT"]
  S1 --> S2
  S3["3. System<br/>WM-ORD-02<br/>Tạo mã DH, mở chi tiết đơn"]
  S2 --> S3
  S4["4. Operation<br/>WM-TRIP-02<br/>Tạo chuyến: chọn xe, tài xế, giờ; mặc định gán mọi điểm"]
  S3 --> S4
  S5["5. System<br/>WM-DISPATCH-03<br/>Cảnh báo trùng/gần trùng lịch (mềm) → override kèm lý do"]
  S4 --> S5
  S6["6. System<br/>WM-DISPATCH-01<br/>Chuyến xuất hiện trên bảng điều phối"]
  S5 --> S6
  S7["7. Driver<br/>DA-HOME-01<br/>Tài xế thấy chuyến được giao"]
  S6 --> S7
```

| # | Actor | Màn hình | Route | Hành động |
|---:|---|---|---|---|
| 1 | Operation | [WM-ORD-01](../screens/wm/WM-ORD-01.md) Danh sách đơn hàng | `/orders` | Bấm Tạo đơn |
| 2 | Operation | [WM-ORD-03](../screens/wm/WM-ORD-03.md) Tạo/sửa đơn | `/orders/new · /orders/:orderId/edit` | Chọn khách, điểm lấy/trả từ sổ địa chỉ, hàng, giá cước, add-on, hạn TT |
| 3 | System | [WM-ORD-02](../screens/wm/WM-ORD-02.md) Chi tiết đơn hàng | `/orders/:orderId` | Tạo mã DH, mở chi tiết đơn |
| 4 | Operation | [WM-TRIP-02](../screens/wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | Tạo chuyến: chọn xe, tài xế, giờ; mặc định gán mọi điểm |
| 5 | System | [WM-DISPATCH-03](../screens/wm/WM-DISPATCH-03.md) Cảnh báo lịch | `/dispatch/conflicts` | Cảnh báo trùng/gần trùng lịch (mềm) → override kèm lý do |
| 6 | System | [WM-DISPATCH-01](../screens/wm/WM-DISPATCH-01.md) Bảng điều phối | `/dispatch` | Chuyến xuất hiện trên bảng điều phối |
| 7 | Driver | [DA-HOME-01](../screens/da/DA-HOME-01.md) Trang chủ công việc | `DriverHomeRoute` | Tài xế thấy chuyến được giao |
