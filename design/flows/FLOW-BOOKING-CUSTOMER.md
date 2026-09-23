# FLOW-BOOKING-CUSTOMER — Booking khách hàng → đơn (phase 3)

Nguồn: `doc/2-PRD/06-ui-flow-specs §11, 01 §7.6` · Mockup: [../mockups/FLOW-BOOKING-CUSTOMER.html](../mockups/FLOW-BOOKING-CUSTOMER.html)

```mermaid
flowchart LR
  S1["1. Customer<br/>CW-HOME-01<br/>Tìm nhà xe"]
  S2["2. Customer<br/>CW-MER-01<br/>Xem hồ sơ nhà xe"]
  S1 --> S2
  S3["3. Customer<br/>CW-BOOK-01<br/>Gửi yêu cầu vận chuyển"]
  S2 --> S3
  S4["4. System<br/>CW-BOOK-03<br/>Booking chờ tiếp nhận"]
  S3 --> S4
  S5["5. Operation<br/>WM-ORD-03<br/>Tiếp nhận, chỉnh giá/điểm/hàng → tạo đơn"]
  S4 --> S5
  S6["6. Customer<br/>CW-ORD-02<br/>Khách theo dõi đơn đã tạo"]
  S5 --> S6
```

| # | Actor | Màn hình | Route | Hành động |
|---:|---|---|---|---|
| 1 | Customer | API | `` | Tìm nhà xe |
| 2 | Customer | API | `` | Xem hồ sơ nhà xe |
| 3 | Customer | API | `` | Gửi yêu cầu vận chuyển |
| 4 | System | API | `` | Booking chờ tiếp nhận |
| 5 | Operation | API | `` | Tiếp nhận, chỉnh giá/điểm/hàng → tạo đơn |
| 6 | Customer | API | `` | Khách theo dõi đơn đã tạo |
