# FLOW-AUTH-MERCHANT — Đăng nhập & onboarding merchant

Nguồn: `doc/2-PRD/06-ui-flow-specs §2` · Mockup: [../mockups/FLOW-AUTH-MERCHANT.html](../mockups/FLOW-AUTH-MERCHANT.html)

```mermaid
flowchart LR
  S1["1. User<br/>WM-AUTH-01<br/>Bấm Đăng nhập bằng Google"]
  S2["2. System<br/>API<br/>Firebase ID token → verify, tra membership"]
  S1 --> S2
  S3["3. System<br/>WM-DASH-01<br/>4a. Đúng 1 merchant → vào Dashboard"]
  S2 --> S3
  S4["4. System<br/>WM-AUTH-03<br/>4b. Nhiều merchant → chọn nhà xe"]
  S3 --> S4
  S5["5. System<br/>WM-AUTH-04<br/>4c. Chưa thuộc merchant → chờ mời / tạo mới"]
  S4 --> S5
  S6["6. User<br/>WM-AUTH-02<br/>Nhập thông tin doanh nghiệp → tạo merchant, seed danh mục"]
  S5 --> S6
  S7["7. System<br/>WM-DASH-01<br/>Mở Dashboard"]
  S6 --> S7
```

| # | Actor | Màn hình | Route | Hành động |
|---:|---|---|---|---|
| 1 | User | API | `` | Bấm Đăng nhập bằng Google |
| 2 | System | API | `` | Firebase ID token → verify, tra membership |
| 3 | System | API | `` | 4a. Đúng 1 merchant → vào Dashboard |
| 4 | System | API | `` | 4b. Nhiều merchant → chọn nhà xe |
| 5 | System | API | `` | 4c. Chưa thuộc merchant → chờ mời / tạo mới |
| 6 | User | API | `` | Nhập thông tin doanh nghiệp → tạo merchant, seed danh mục |
| 7 | System | API | `` | Mở Dashboard |
