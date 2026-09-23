# FLOW-MERCHANT-MOBILE — App Merchant: theo dõi & duyệt nhanh (phase 2)

Nguồn: `doc/2-PRD/01 §5` · Mockup: [../mockups/FLOW-MERCHANT-MOBILE.html](../mockups/FLOW-MERCHANT-MOBILE.html)

```mermaid
flowchart LR
  S1["1. Admin<br/>MA-HOME-01<br/>Mở tổng quan mobile"]
  S2["2. Admin<br/>MA-TRIP-02<br/>Xem chuyến, gọi tài xế"]
  S1 --> S2
  S3["3. Admin<br/>MA-COD-01<br/>Xem COD tài xế đang giữ"]
  S2 --> S3
  S4["4. Admin<br/>MA-PAYROLL-01<br/>Duyệt bảng lương"]
  S3 --> S4
  S5["5. Operation<br/>MA-ORD-03<br/>Tạo nhanh đơn, chi tiết chỉnh trên web"]
  S4 --> S5
```

| # | Actor | Màn hình | Route | Hành động |
|---:|---|---|---|---|
| 1 | Admin | API | `` | Mở tổng quan mobile |
| 2 | Admin | API | `` | Xem chuyến, gọi tài xế |
| 3 | Admin | API | `` | Xem COD tài xế đang giữ |
| 4 | Admin | API | `` | Duyệt bảng lương |
| 5 | Operation | API | `` | Tạo nhanh đơn, chi tiết chỉnh trên web |
