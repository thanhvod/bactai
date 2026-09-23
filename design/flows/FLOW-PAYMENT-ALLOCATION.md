# FLOW-PAYMENT-ALLOCATION — Khách thanh toán & phân bổ

Nguồn: `doc/2-PRD/06-ui-flow-specs §7, 01 §7.2` · Mockup: [../mockups/FLOW-PAYMENT-ALLOCATION.html](../mockups/FLOW-PAYMENT-ALLOCATION.html)

```mermaid
flowchart LR
  S1["1. Accountant<br/>WM-DEBT-01<br/>Mở công nợ khách"]
  S2["2. Accountant<br/>WM-CUS-05<br/>Hoặc từ tab công nợ khách"]
  S1 --> S2
  S3["3. Accountant<br/>WM-PAY-03<br/>Tạo phiếu thu loại Khách trả"]
  S2 --> S3
  S4["4. System<br/>WM-PAY-02<br/>Phiếu thu hiện số chưa phân bổ"]
  S3 --> S4
  S5["5. Accountant<br/>WM-PAY-04<br/>Phân bổ vào các đơn còn nợ; dư → số dư khách"]
  S4 --> S5
  S6["6. System<br/>WM-CUS-05<br/>Cập nhật công nợ và số dư"]
  S5 --> S6
```

| # | Actor | Màn hình | Route | Hành động |
|---:|---|---|---|---|
| 1 | Accountant | API | `` | Mở công nợ khách |
| 2 | Accountant | API | `` | Hoặc từ tab công nợ khách |
| 3 | Accountant | API | `` | Tạo phiếu thu loại Khách trả |
| 4 | System | API | `` | Phiếu thu hiện số chưa phân bổ |
| 5 | Accountant | API | `` | Phân bổ vào các đơn còn nợ; dư → số dư khách |
| 6 | System | API | `` | Cập nhật công nợ và số dư |
