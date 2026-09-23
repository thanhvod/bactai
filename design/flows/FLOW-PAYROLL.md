# FLOW-PAYROLL — Tạo & duyệt bảng lương

Nguồn: `doc/2-PRD/06-ui-flow-specs §10, 01 §7.5` · Mockup: [../mockups/FLOW-PAYROLL.html](../mockups/FLOW-PAYROLL.html)

```mermaid
flowchart LR
  S1["1. Operation<br/>WM-PAYROLL-03<br/>Chọn kỳ lương → sinh dòng lương"]
  S2["2. Operation<br/>WM-PAYROLL-02<br/>Kiểm tra bảng lương"]
  S1 --> S2
  S3["3. Operation<br/>WM-PAYROLL-04<br/>Thêm giảm trừ (có lý do)"]
  S2 --> S3
  S4["4. Operation<br/>WM-PAYROLL-02<br/>Gửi duyệt"]
  S3 --> S4
  S5["5. Admin<br/>WM-PAYROLL-05<br/>Giám đốc duyệt / trả về"]
  S4 --> S5
  S6["6. Admin<br/>MA-PAYROLL-01<br/>Hoặc duyệt trên App Merchant"]
  S5 --> S6
  S7["7. Accountant<br/>WM-SHELL-05<br/>Xuất bảng lương"]
  S6 --> S7
  S8["8. Driver<br/>DA-MONEY-01<br/>Tài xế xem thưởng/ứng"]
  S7 --> S8
```

| # | Actor | Màn hình | Route | Hành động |
|---:|---|---|---|---|
| 1 | Operation | API | `` | Chọn kỳ lương → sinh dòng lương |
| 2 | Operation | API | `` | Kiểm tra bảng lương |
| 3 | Operation | API | `` | Thêm giảm trừ (có lý do) |
| 4 | Operation | API | `` | Gửi duyệt |
| 5 | Admin | API | `` | Giám đốc duyệt / trả về |
| 6 | Admin | API | `` | Hoặc duyệt trên App Merchant |
| 7 | Accountant | API | `` | Xuất bảng lương |
| 8 | Driver | API | `` | Tài xế xem thưởng/ứng |
