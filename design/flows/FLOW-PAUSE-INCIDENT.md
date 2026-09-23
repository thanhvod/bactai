# FLOW-PAUSE-INCIDENT — Tạm dừng chuyến & báo sự cố

Nguồn: `doc/2-PRD/03-driver-app-ui §10, 01 §3.9` · Mockup: [../mockups/FLOW-PAUSE-INCIDENT.html](../mockups/FLOW-PAUSE-INCIDENT.html)

```mermaid
flowchart LR
  S1["1. Driver<br/>DA-TRIP-01<br/>Mở chuyến"]
  S2["2. Driver<br/>DA-STATUS-02<br/>Tạm dừng: chọn lý do (giờ cấm tải, nghỉ đêm…)"]
  S1 --> S2
  S3["3. Driver<br/>DA-INC-01<br/>Báo sự cố: loại, mức độ, mô tả, ảnh (lưu offline được)"]
  S2 --> S3
  S4["4. Operation<br/>WM-DISPATCH-05<br/>Sự cố xuất hiện trong danh sách"]
  S3 --> S4
  S5["5. Operation<br/>WM-INC-01<br/>Gán người xử lý, cập nhật, đóng sự cố"]
  S4 --> S5
```

| # | Actor | Màn hình | Route | Hành động |
|---:|---|---|---|---|
| 1 | Driver | [DA-TRIP-01](../screens/da/DA-TRIP-01.md) Chi tiết chuyến | `DriverTripDetailRoute(tripId)` | Mở chuyến |
| 2 | Driver | [DA-STATUS-02](../screens/da/DA-STATUS-02.md) Tạm dừng chuyến | `DriverPauseTripRoute(tripId)` | Tạm dừng: chọn lý do (giờ cấm tải, nghỉ đêm…) |
| 3 | Driver | [DA-INC-01](../screens/da/DA-INC-01.md) Báo sự cố | `DriverIncidentReportRoute(tripId)` | Báo sự cố: loại, mức độ, mô tả, ảnh (lưu offline được) |
| 4 | Operation | API | `` | Sự cố xuất hiện trong danh sách |
| 5 | Operation | API | `` | Gán người xử lý, cập nhật, đóng sự cố |
