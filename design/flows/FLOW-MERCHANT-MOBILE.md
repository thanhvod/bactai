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
| 1 | Admin | [MA-HOME-01](../screens/ma/MA-HOME-01.md) Tổng quan mobile | `MerchantHomeRoute` | Mở tổng quan mobile |
| 2 | Admin | [MA-TRIP-02](../screens/ma/MA-TRIP-02.md) Chi tiết chuyến | `MerchantTripDetailRoute(tripId)` | Xem chuyến, gọi tài xế |
| 3 | Admin | [MA-COD-01](../screens/ma/MA-COD-01.md) COD tài xế | `MerchantCodRoute` | Xem COD tài xế đang giữ |
| 4 | Admin | [MA-PAYROLL-01](../screens/ma/MA-PAYROLL-01.md) Duyệt bảng lương | `MerchantPayrollApprovalRoute` | Duyệt bảng lương |
| 5 | Operation | [MA-ORD-03](../screens/ma/MA-ORD-03.md) Tạo nhanh đơn | `MerchantQuickOrderCreateRoute` | Tạo nhanh đơn, chi tiết chỉnh trên web |
