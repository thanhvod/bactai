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
| 1 | User | [WM-AUTH-01](../screens/wm/WM-AUTH-01.md) Đăng nhập Google | `/login` | Bấm Đăng nhập bằng Google |
| 2 | System | API | `` | Firebase ID token → verify, tra membership |
| 3 | System | [WM-DASH-01](../screens/wm/WM-DASH-01.md) Dashboard tổng quan | `/` | 4a. Đúng 1 merchant → vào Dashboard |
| 4 | System | [WM-AUTH-03](../screens/wm/WM-AUTH-03.md) Chọn merchant | `/select-merchant` | 4b. Nhiều merchant → chọn nhà xe |
| 5 | System | [WM-AUTH-04](../screens/wm/WM-AUTH-04.md) Không có quyền / chờ mời | `/access-pending` | 4c. Chưa thuộc merchant → chờ mời / tạo mới |
| 6 | User | [WM-AUTH-02](../screens/wm/WM-AUTH-02.md) Tạo/hoàn tất merchant | `/onboarding/merchant` | Nhập thông tin doanh nghiệp → tạo merchant, seed danh mục |
| 7 | System | [WM-DASH-01](../screens/wm/WM-DASH-01.md) Dashboard tổng quan | `/` | Mở Dashboard |
