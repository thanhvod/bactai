# FLOW-ORDER-MULTI-TRUCK — Đơn nhiều xe

Nguồn: `doc/2-PRD/06-ui-flow-specs §5` · Mockup: [../mockups/FLOW-ORDER-MULTI-TRUCK.html](../mockups/FLOW-ORDER-MULTI-TRUCK.html)

```mermaid
flowchart LR
  S1["1. Operation<br/>WM-ORD-03<br/>Tạo đơn với toàn bộ điểm, hàng, giá cước tổng"]
  S2["2. Operation<br/>WM-ORD-02<br/>Mở tab Chuyến"]
  S1 --> S2
  S3["3. Operation<br/>WM-TRIP-02<br/>Tạo chuyến A: chọn tập điểm"]
  S2 --> S3
  S4["4. Operation<br/>WM-TRIP-02<br/>Tạo chuyến B: điểm còn lại"]
  S3 --> S4
  S5["5. System<br/>WM-ORD-04<br/>Tab Điểm dừng cho thấy điểm nào thuộc chuyến nào"]
  S4 --> S5
  S6["6. Operation<br/>WM-DISPATCH-02<br/>Kiểm tra lịch xe/tài xế"]
  S5 --> S6
```

| # | Actor | Màn hình | Route | Hành động |
|---:|---|---|---|---|
| 1 | Operation | API | `` | Tạo đơn với toàn bộ điểm, hàng, giá cước tổng |
| 2 | Operation | API | `` | Mở tab Chuyến |
| 3 | Operation | [WM-TRIP-02](../screens/wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | Tạo chuyến A: chọn tập điểm |
| 4 | Operation | [WM-TRIP-02](../screens/wm/WM-TRIP-02.md) Tạo/sửa chuyến | `/orders/:orderId/trips/new · /trips/:tripId/edit` | Tạo chuyến B: điểm còn lại |
| 5 | System | API | `` | Tab Điểm dừng cho thấy điểm nào thuộc chuyến nào |
| 6 | Operation | [WM-DISPATCH-02](../screens/wm/WM-DISPATCH-02.md) Lịch xe/tài xế | `/dispatch/calendar` | Kiểm tra lịch xe/tài xế |
