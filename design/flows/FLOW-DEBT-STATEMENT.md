# FLOW-DEBT-STATEMENT — Chốt bảng kê công nợ

Nguồn: `doc/2-PRD/06-ui-flow-specs §9` · Mockup: [../mockups/FLOW-DEBT-STATEMENT.html](../mockups/FLOW-DEBT-STATEMENT.html)

```mermaid
flowchart LR
  S1["1. Accountant<br/>WM-DEBT-01<br/>Lọc khách/kỳ"]
  S2["2. Accountant<br/>WM-DEBT-03<br/>Tạo bảng kê"]
  S1 --> S2
  S3["3. System<br/>WM-DEBT-04<br/>Xem trước dòng bảng kê"]
  S2 --> S3
  S4["4. Accountant<br/>WM-DEBT-04<br/>Chốt → snapshot + PDF"]
  S3 --> S4
  S5["5. Accountant<br/>WM-SHELL-05<br/>Tải/chia sẻ PDF"]
  S4 --> S5
  S6["6. Customer<br/>CW-DEBT-01<br/>Khách tải bảng kê đã gửi (phase 3)"]
  S5 --> S6
```

| # | Actor | Màn hình | Route | Hành động |
|---:|---|---|---|---|
| 1 | Accountant | API | `` | Lọc khách/kỳ |
| 2 | Accountant | API | `` | Tạo bảng kê |
| 3 | System | API | `` | Xem trước dòng bảng kê |
| 4 | Accountant | API | `` | Chốt → snapshot + PDF |
| 5 | Accountant | API | `` | Tải/chia sẻ PDF |
| 6 | Customer | API | `` | Khách tải bảng kê đã gửi (phase 3) |
