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
| 1 | Accountant | [WM-DEBT-01](../screens/wm/WM-DEBT-01.md) Công nợ khách tổng hợp | `/finance/customer-debt` | Mở công nợ khách |
| 2 | Accountant | API | `` | Hoặc từ tab công nợ khách |
| 3 | Accountant | [WM-PAY-03](../screens/wm/WM-PAY-03.md) Tạo phiếu thu | `/finance/payments/new` | Tạo phiếu thu loại Khách trả |
| 4 | System | [WM-PAY-02](../screens/wm/WM-PAY-02.md) Chi tiết phiếu thu | `/finance/payments/:paymentId` | Phiếu thu hiện số chưa phân bổ |
| 5 | Accountant | [WM-PAY-04](../screens/wm/WM-PAY-04.md) Phân bổ payment | `/finance/payments/:paymentId/allocate` | Phân bổ vào các đơn còn nợ; dư → số dư khách |
| 6 | System | API | `` | Cập nhật công nợ và số dư |
