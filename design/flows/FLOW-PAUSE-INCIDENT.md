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
| 1 | Driver | API | `` | Mở chuyến |
| 2 | Driver | API | `` | Tạm dừng: chọn lý do (giờ cấm tải, nghỉ đêm…) |
| 3 | Driver | API | `` | Báo sự cố: loại, mức độ, mô tả, ảnh (lưu offline được) |
| 4 | Operation | [WM-DISPATCH-05](../screens/wm/WM-DISPATCH-05.md) Sự cố vận hành | `/dispatch/incidents` | Sự cố xuất hiện trong danh sách |
| 5 | Operation | [WM-INC-01](../screens/wm/WM-INC-01.md) Chi tiết sự cố | `/dispatch/incidents/:incidentId` | Gán người xử lý, cập nhật, đóng sự cố |
