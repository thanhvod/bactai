# PRD — Danh sách màn hình theo platform

> Nguồn phân tích: toàn bộ tài liệu trong `doc/1-BRD` từ `00` đến `09`.
> Ngày lập: 2026-09-23
> Trạng thái: Bản phân tích màn hình từ BRD, dùng làm đầu vào cho UI/UX, backlog, route map và test case.

## 1. Phạm vi platform

Theo quyết định dự án:

- **Phase 1:** Web Merchant + App Tài xế.
- **Phase 2:** App Merchant, là bản rút gọn từ Web Merchant.
- **Phase 3:** Web Khách hàng, gồm tìm kiếm/booking online và lịch sử đơn.

Tài liệu này liệt kê màn hình cho cả 3 nhóm platform trên. API/backend không có màn hình, nhưng các màn hình dưới đây đều cần API tương ứng.

## 2. Quy ước điều hướng

- **List → Detail → Action modal/drawer:** hầu hết module dùng pattern danh sách, chi tiết, rồi thao tác trong modal/drawer.
- **Entity detail có tab:** order, trip, customer, driver, vehicle, supplier nên dùng tab để tránh màn hình quá dài.
- **Timeline/Audit chung:** các màn hình nghiệp vụ quan trọng đều có tab hoặc drawer "Timeline".
- **Attachment chung:** các entity chính đều có tab hoặc panel "Chứng từ".
- **Sensitive action modal:** thao tác nhạy cảm phải mở modal nhập lý do và kiểm tra quyền.

## 3. Web Merchant

Web Merchant là platform đầy đủ nhất, phục vụ admin/giám đốc, operation và kế toán.

### 3.1. Auth, onboarding và shell

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| WM-AUTH-01 | Đăng nhập Google | Logo/sản phẩm, nút Google login, trạng thái loading/error | Đăng nhập bằng Firebase Google; không có form email/mật khẩu theo D-006 | Sau login → `WM-AUTH-02` hoặc `WM-DASH-01` |
| WM-AUTH-02 | Tạo/hoàn tất merchant | Thông tin doanh nghiệp, tên nhà xe, MST nếu có, địa chỉ, người liên hệ | Tạo merchant self-service sau lần đăng nhập đầu; seed catalog mặc định | Hoàn tất → `WM-DASH-01`; hủy → logout |
| WM-AUTH-03 | Chọn merchant | Danh sách merchant mà user thuộc về, vai trò tương ứng | Chọn tenant làm việc khi một user có nhiều merchant | Chọn merchant → `WM-DASH-01` |
| WM-AUTH-04 | Không có quyền / chờ mời | Thông báo tài khoản Google chưa thuộc merchant nào | Yêu cầu admin mời hoặc tạo merchant mới nếu được phép | Tạo merchant → `WM-AUTH-02`; logout |
| WM-SHELL-01 | Layout chính | Sidebar module, topbar, chọn merchant, notification bell, user menu | Điều hướng toàn app; hiển thị badge cảnh báo | Link tới mọi module |
| WM-SHELL-02 | Trung tâm thông báo | Notification công việc mới, nợ quá hạn, COD chưa nộp, bảng lương chờ duyệt, sự cố | Xem, đánh dấu đã đọc, mở entity liên quan | Mở order/trip/payroll/customer tương ứng |
| WM-SHELL-03 | Tìm kiếm nhanh | Search theo mã đơn, mã chuyến, khách, tài xế, xe, phiếu thu/chi | Tìm và nhảy nhanh tới detail | Kết quả → detail entity |
| WM-SHELL-04 | Import wizard | Upload Excel, map cột, preview lỗi, xác nhận import | Import khách hàng, xe, tài xế | Từ list customer/vehicle/driver |
| WM-SHELL-05 | Export/print preview | Preview PDF/Excel, chọn mẫu, tải file | Xuất bảng kê, phiếu giao hàng, phiếu điều xe, bảng chi phí, bảng lương | Từ report/order/payroll/debt statement |
| WM-SHELL-06 | Attachment viewer | Xem ảnh/PDF, metadata, tải xuống | Xem POD/chứng từ/hóa đơn/ảnh sự cố | Từ attachment tab của các entity |
| WM-SHELL-07 | Timeline drawer | Danh sách activity/audit theo thời gian | Xem ai làm gì, trước/sau, lý do sửa | Từ detail entity |
| WM-SHELL-08 | Sensitive action modal | Nội dung thao tác, cảnh báo, ô nhập lý do | Xác nhận sửa/hủy/xóa/đổi trạng thái ngược/sửa tiền | Mở từ các action nhạy cảm |

### 3.2. Dashboard

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| WM-DASH-01 | Dashboard tổng quan | KPI hôm nay, chuyến đang chạy, đơn mới, công nợ quá hạn, COD tài xế giữ, sự cố mở, bảng lương chờ duyệt | Xem nhanh tình trạng vận hành và cảnh báo | Click card → màn hình chi tiết tương ứng |
| WM-DASH-02 | Dashboard vận hành | Danh sách chuyến theo trạng thái, xe/tài xế đang chạy, warning lịch | Theo dõi điều phối realtime bằng polling | Chuyến → `WM-TRIP-01`; bản đồ → `WM-DISPATCH-04` |
| WM-DASH-03 | Dashboard tài chính | Doanh thu tạm tính, chi phí, công nợ khách, công nợ NCC, COD chưa nộp | Tổng hợp cho giám đốc/kế toán | Link sang finance/report |

### 3.3. Tài khoản, tổ chức và cài đặt

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| WM-ORG-01 | Hồ sơ nhà xe | Thông tin doanh nghiệp, liên hệ, logo, địa chỉ | Xem/sửa thông tin merchant | Từ sidebar Settings |
| WM-USER-01 | Danh sách nhân viên | Tên, email, role, trạng thái, ngày tham gia | Tìm/lọc, mời nhân viên, khóa/mở tài khoản | Detail → `WM-USER-02` |
| WM-USER-02 | Chi tiết nhân viên | Hồ sơ, role, lịch sử hoạt động, merchant access | Sửa thông tin, đổi role, xem audit | Role → `WM-RBAC-01` |
| WM-USER-03 | Mời/tạo nhân viên | Email, role, quyền, ghi chú | Gửi lời mời hoặc tạo user nội bộ | Quay lại list |
| WM-RBAC-01 | Vai trò & phân quyền | Role admin/operation/kế toán, ma trận quyền | Cấu hình quyền thao tác nhạy cảm | Action nhạy cảm dùng quyền này |
| WM-SET-01 | Cài đặt vận hành | Kỳ lương, ngưỡng gần trùng lịch, ngưỡng COD, hạn mức mặc định | Cấu hình merchant settings | Ảnh hưởng payroll/dispatch/finance |
| WM-SET-02 | Cấu hình mã tự động | Format mã order/trip/phiếu thu/phiếu chi/bảng lương/bảng kê | Xem counter, sửa prefix/format nếu được phép | Tạo chứng từ dùng format này |
| WM-CAT-01 | Danh mục dùng chung | Loại chi phí, add-on, loại hàng, lý do tạm dừng, lý do giảm trừ, loại chứng từ, loại sự cố | CRUD danh mục theo merchant | Được dùng ở order/trip/finance/payroll |

### 3.4. Khách hàng

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| WM-CUS-01 | Danh sách khách hàng | Tên, SĐT, công nợ, số dư, hạn mức, số order, trạng thái cảnh báo | Tìm/lọc, tạo khách, import/export | Detail → `WM-CUS-02`; tạo order → `WM-ORD-03` |
| WM-CUS-02 | Chi tiết khách hàng | Overview + tab đơn hàng, công nợ, số dư, địa chỉ, liên hệ, bảng kê, chứng từ, timeline | Xem toàn bộ quan hệ với khách | Tabs bên dưới |
| WM-CUS-03 | Form khách hàng | Thông tin pháp lý/liên hệ, hạn mức nợ, số ngày công nợ mặc định | Tạo/sửa khách hàng | Lưu → detail/list |
| WM-CUS-04 | Sổ địa chỉ/liên hệ | Kho/địa chỉ thường dùng, người gửi/nhận, SĐT, ghi chú, tọa độ | Thêm/sửa/xóa địa chỉ; chọn nhanh khi tạo order | Dùng ở `WM-ORD-03` |
| WM-CUS-05 | Công nợ khách | Tổng nợ, quá hạn, số dư, danh sách order còn nợ, lịch sử payment/allocation | Ghi nhận thanh toán, phân bổ tiền, tạo bảng kê | Payment → `WM-PAY-03`; Statement → `WM-DEBT-03` |
| WM-CUS-06 | Lịch sử đơn khách | Danh sách order theo khách, tổng tiền/đã thu/còn lại | Lọc theo thời gian/trạng thái | Order detail → `WM-ORD-02` |

### 3.5. Tài xế

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| WM-DRV-01 | Danh sách tài xế | Tên, SĐT, trạng thái, xe/chuyến hiện tại, COD đang giữ, công nợ 2 chiều | Tìm/lọc, tạo tài xế, import/export | Detail → `WM-DRV-02` |
| WM-DRV-02 | Chi tiết tài xế | Hồ sơ, tài khoản app, lương cố định, lịch sử lái, công nợ, ứng lương, bảng lương, chứng từ | Quản lý tài xế end-to-end | Trip → `WM-TRIP-01`; payroll → `WM-PAYROLL-02` |
| WM-DRV-03 | Form tài xế | Thông tin cá nhân, GPLX nếu có, lương cố định, trạng thái, tài khoản app | Tạo/sửa tài xế, reset/mời app account | Quay lại detail/list |
| WM-DRV-04 | Lịch sử lương cố định | Các mốc thay đổi lương, ngày hiệu lực, người sửa | Thêm mốc lương, đảm bảo kỳ cũ tính đúng | Dùng khi tạo payroll |
| WM-DRV-05 | Sổ công nợ tài xế | Công ty nợ tài xế, tài xế giữ COD, ứng lương, tạm ứng chuyến, lịch sử đối soát | Tạo phiếu chi hoàn ứng, ghi nhận tài xế nộp COD | Finance payment/expense |
| WM-DRV-06 | COD tài xế đang giữ | Danh sách COD theo stop/order/trip, tuổi nợ, cảnh báo | Lọc theo tài xế, tạo phiếu thu COD nộp lại | Payment in → `WM-PAY-03` |

### 3.6. Xe

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| WM-VEH-01 | Danh sách xe | Biển số, loại xe, tải trọng, trạng thái, chuyến hiện tại, chi phí gần đây | Tìm/lọc, tạo xe, import/export | Detail → `WM-VEH-02` |
| WM-VEH-02 | Chi tiết xe | Hồ sơ xe, lịch sử chạy, chi phí vật tư, chứng từ, timeline | Xem hiệu quả và lịch sử vận hành xe | Trip → `WM-TRIP-01`; expense → `WM-EXP-02` |
| WM-VEH-03 | Form xe | Biển số, loại xe, tải trọng, thông tin kỹ thuật, trạng thái | Tạo/sửa xe | Quay lại list/detail |

### 3.7. Nhà cung cấp

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| WM-SUP-01 | Danh sách NCC | Tên, loại NCC, công nợ phải trả, số chi phí, liên hệ | Tìm/lọc, tạo NCC | Detail → `WM-SUP-02` |
| WM-SUP-02 | Chi tiết NCC | Hồ sơ, liên hệ, khoản chi, công nợ, thuê xe ngoài, chứng từ | Xem/sửa NCC, tạo phiếu chi | Expense → `WM-EXP-03` |
| WM-SUP-03 | Form NCC | Tên, loại, MST nếu có, liên hệ, ghi chú | Tạo/sửa NCC | Quay lại list/detail |

### 3.8. Đơn hàng

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| WM-ORD-01 | Danh sách đơn hàng | Mã đơn, khách, tuyến, trạng thái, tổng tiền, đã thu, còn nợ, hạn thanh toán, cảnh báo | Tìm/lọc, tạo đơn, export, bulk action nhẹ | Detail → `WM-ORD-02` |
| WM-ORD-02 | Chi tiết đơn hàng | Header mã/trạng thái/khách/tổng tiền; tab tổng quan, điểm dừng, hàng hóa, chuyến, tài chính, sự cố, chứng từ, timeline | Trung tâm xử lý một order | Liên kết tới customer/trip/payment/expense |
| WM-ORD-03 | Tạo/sửa đơn | Khách hàng, điểm lấy/trả, COD dự kiến, hàng hóa, giá cước, add-on, hạn thanh toán, ghi chú | Tạo order nháp/xác nhận; chọn địa chỉ khách; sinh mã tự động | Sau lưu → detail |
| WM-ORD-04 | Điểm lấy/trả | Danh sách stop, thứ tự, địa chỉ, liên hệ, COD, trạng thái, POD | Thêm/sửa/sắp xếp stop; xem POD; mark hoàn thành/bỏ qua | Stop detail → `WM-STOP-01` |
| WM-ORD-05 | Hàng hóa | Cargo lines: tên hàng, loại, khối lượng/thể tích/số kiện, đặc tính, ghi chú, ảnh | Thêm/sửa hàng hóa linh hoạt | Dùng trong trip/app tài xế |
| WM-ORD-06 | Add-on & giá bán | Giá cước nhập tay, add-on services, tổng thu khách | Thêm add-on; sửa giá có quyền/lý do nếu order đã xác nhận | Finance tab |
| WM-ORD-07 | Tài chính đơn | Tổng thu, đã thu, còn nợ, chi phí chuyến/order, thuê ngoài, lãi/lỗ tạm tính | Ghi nhận payment, phân bổ tiền, thêm expense, xem profit | Payment/expense/debt |
| WM-ORD-08 | Hủy/sửa nhạy cảm đơn | Modal lý do hủy/sửa giá/sửa order hoàn thành/đổi trạng thái ngược | Kiểm tra quyền, ghi audit | Quay lại detail |
| WM-ORD-09 | In/chia sẻ đơn | Phiếu giao hàng, phiếu điều xe, bảng chi phí chuyến | Preview/tải PDF | Từ detail |

### 3.9. Chuyến, điểm dừng và điều phối

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| WM-TRIP-01 | Chi tiết chuyến | Mã chuyến, order, xe, tài xế, thời gian, trạng thái, stops được giao, chi phí, thưởng, GPS, POD/COD | Cập nhật trạng thái thay tài xế, sửa gán xe/tài xế, thêm chi phí/sự cố | Order/customer/driver/vehicle |
| WM-TRIP-02 | Tạo/sửa chuyến | Chọn order, xe, tài xế, thời gian dự kiến, stops phụ trách, thưởng tài xế | Tạo trip; check overlap/gần overlap mềm | Warning → `WM-DISPATCH-03` |
| WM-STOP-01 | Chi tiết điểm dừng | Địa chỉ, liên hệ, loại lấy/trả, trạng thái, COD dự kiến/thực thu, POD, giờ thực tế | Sửa stop, xem POD, sửa COD có lý do, mark trạng thái | Order/trip/app tài xế |
| WM-DISPATCH-01 | Bảng điều phối | Danh sách/chia cột chuyến theo trạng thái và ngày | Gán xe/tài xế, lọc theo ngày/xe/tài xế, mở trip | Trip detail |
| WM-DISPATCH-02 | Lịch xe/tài xế | Timeline xe và tài xế, chuyến đã lên lịch | Phát hiện overlap/gần overlap | Trip/order detail |
| WM-DISPATCH-03 | Cảnh báo lịch | Chuyến trùng/gần trùng, lý do cảnh báo, khoảng cách thời gian | Cho phép override nếu có quyền; ghi audit | Quay lại form trip |
| WM-DISPATCH-04 | Theo dõi vị trí | Bản đồ hoặc danh sách last known location, trạng thái chuyến đang chạy | Xem xe/tài xế đang ở đâu, mở lịch sử GPS | Trip location tab |
| WM-DISPATCH-05 | Sự cố vận hành | Danh sách incident theo trạng thái/mức độ | Tạo/gán người xử lý/đóng sự cố | Incident detail → `WM-INC-01` |
| WM-INC-01 | Chi tiết sự cố | Loại, mức độ, mô tả, ảnh/chứng từ, order/trip liên quan, trạng thái xử lý | Cập nhật xử lý, upload ảnh, ghi timeline | Order/trip detail |

### 3.10. Thu chi và công nợ

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| WM-FIN-01 | Sổ thu chi | Danh sách phiếu thu/phiếu chi, loại, đối tượng, trạng thái, số tiền | Tìm/lọc, tạo phiếu thu/chi, export | Payment/expense detail |
| WM-PAY-01 | Danh sách phiếu thu | Mã phiếu, loại khách trả/tài xế nộp COD/thu khác, số tiền, đã phân bổ, còn treo | Tạo phiếu thu, phân bổ, xem số dư | Detail → `WM-PAY-02` |
| WM-PAY-02 | Chi tiết phiếu thu | Thông tin thu, nguồn tiền, customer/driver, allocations, chứng từ, audit | Sửa/hủy có quyền, phân bổ vào order | Allocation → `WM-PAY-04` |
| WM-PAY-03 | Tạo phiếu thu | Loại thu, người nộp, số tiền, ngày, hình thức, chứng từ | Ghi nhận khách trả hoặc tài xế nộp COD | Sau lưu → detail |
| WM-PAY-04 | Phân bổ payment | Danh sách order còn nợ, số tiền phân bổ, số dư còn lại | Operation phân bổ thủ công; tạo số dư khách nếu còn dư | Customer debt/order finance |
| WM-EXP-01 | Danh sách phiếu chi/expense | Mã phiếu, loại chi, NCC/order/trip/xe/tài xế, đã trả/chưa trả | Tạo chi phí, lọc công nợ NCC/tài xế | Detail → `WM-EXP-02` |
| WM-EXP-02 | Chi tiết phiếu chi | Thông tin chi, đối tượng gắn, ai chi trước, hoàn tài xế, chứng từ, audit | Sửa/hủy có quyền, đánh dấu đã trả | Supplier/driver/order/trip |
| WM-EXP-03 | Tạo phiếu chi | Loại chi, số tiền, ngày, NCC/order/trip/vehicle/driver, chứng từ | Ghi chi phí chuyến, thuê xe ngoài, vật tư, hoàn ứng, ứng lương, tạm ứng chuyến | Sau lưu → detail |
| WM-DEBT-01 | Công nợ khách tổng hợp | Khách, tổng phải thu, đã thu, còn nợ, quá hạn, số dư, hạn mức | Lọc/quét cảnh báo, mở khách, tạo bảng kê | Customer detail/statement |
| WM-DEBT-02 | Công nợ NCC | NCC, tổng chưa trả, khoản chi liên quan, tuổi nợ | Tạo phiếu chi/trả NCC | Supplier/expense |
| WM-DEBT-03 | Danh sách bảng kê công nợ | Mã bảng kê, khách, kỳ, tổng nợ snapshot, trạng thái nháp/chốt/gửi/hủy | Tạo/chốt/xuất PDF bảng kê | Detail → `WM-DEBT-04` |
| WM-DEBT-04 | Chi tiết bảng kê công nợ | Snapshot các order, tổng tiền, đã thu, còn lại, hạn thanh toán, quá hạn | Chốt, hủy, tải PDF, xem bản đã gửi | Customer debt |
| WM-COD-01 | COD tài xế đang giữ | Theo tài xế/order/trip/stop, số tiền, ngày thu, số ngày giữ, cảnh báo | Tạo phiếu thu COD nộp lại, export | Driver ledger/payment |
| WM-ADV-01 | Tạm ứng chuyến & đối soát | Trip/order, số tạm ứng, chi phí thực tế, tài xế còn nộp/được hoàn | Tạo tạm ứng, đối soát sau chuyến | Expense/payment/driver ledger |

### 3.11. Lương tài xế

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| WM-PAYROLL-01 | Danh sách bảng lương | Kỳ lương, trạng thái, tổng thực lãnh, người tạo/duyệt | Tạo bảng lương, lọc, export | Detail → `WM-PAYROLL-02` |
| WM-PAYROLL-02 | Chi tiết bảng lương | Danh sách tài xế, lương cố định snapshot, thưởng order, ứng, giảm trừ, thực lãnh | Kiểm tra, gửi duyệt, duyệt, hủy duyệt, đánh dấu đã trả | Driver/payroll line |
| WM-PAYROLL-03 | Tạo bảng lương | Chọn kỳ, tài xế, dữ liệu thưởng/ứng/giảm trừ | Generate bảng lương từ dữ liệu gốc, cho phép chỉnh giảm trừ | Sau tạo → detail |
| WM-PAYROLL-04 | Chi tiết dòng lương tài xế | Các khoản cấu thành lương, link order/trip/expense, ghi chú | Thêm giảm trừ, xem tranh chấp, in phiếu lương | Driver detail/order/expense |
| WM-PAYROLL-05 | Duyệt bảng lương | Tóm tắt thay đổi, tổng chi, người duyệt, lý do nếu hủy duyệt | Admin/giám đốc duyệt hoặc trả về | Detail payroll |

### 3.12. Báo cáo

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| WM-RPT-01 | Trung tâm báo cáo | Danh sách báo cáo theo nhóm vận hành/tài chính/lương | Chọn báo cáo, khoảng thời gian | Tới các report |
| WM-RPT-02 | Doanh thu - chi phí - lãi/lỗ | Tổng giá cước, add-on, chi phí, lãi/lỗ theo thời gian | Lọc theo khách/xe/tài xế/order | Order/customer detail |
| WM-RPT-03 | Lãi/lỗ theo đơn | Order, doanh thu, chi phí trip/order, thuê ngoài, profit | Export, mở order | Order detail |
| WM-RPT-04 | Hiệu suất xe | Xe, số chuyến, doanh thu liên quan, chi phí vật tư/chuyến | So sánh xe | Vehicle detail |
| WM-RPT-05 | Hiệu suất tài xế | Tài xế, số chuyến, thưởng, COD giữ, sự cố | So sánh tài xế | Driver detail |
| WM-RPT-06 | Công nợ khách | Khách/order quá hạn, tuổi nợ, số dư, hạn mức | Export, tạo bảng kê | Debt/customer |
| WM-RPT-07 | COD tài xế | COD theo tài xế/order/tuổi nợ | Export, tạo phiếu thu COD | COD/payment |
| WM-RPT-08 | Báo cáo bảng lương | Kỳ lương, thực lãnh, ứng, giảm trừ | Export bảng lương/phiếu lương | Payroll detail |

## 4. App Tài xế

App tài xế tập trung vào nhận việc được giao, cập nhật trạng thái, POD, COD, sự cố và xem thông tin lương/ứng cơ bản.

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| DA-AUTH-01 | Splash/kiểm tra phiên | Logo, trạng thái phiên, sync pending | Kiểm tra đăng nhập, dữ liệu offline cần đẩy | Có phiên → `DA-HOME-01`; chưa → `DA-AUTH-02` |
| DA-AUTH-02 | Đăng nhập tài xế | SĐT/email hoặc phương thức đã chốt, mật khẩu/OTP nếu có | Đăng nhập app tài xế | Thành công → `DA-HOME-01` |
| DA-AUTH-03 | Quên mật khẩu | Nhập SĐT/email, xác thực | Khôi phục tài khoản | Quay lại login |
| DA-HOME-01 | Trang chủ công việc | Chuyến hôm nay, chuyến sắp tới, cảnh báo COD, sync status | Mở nhanh chuyến đang chạy, xem notification | Trip → `DA-TRIP-01` |
| DA-JOB-01 | Danh sách chuyến | Chuyến theo ngày/trạng thái, mã chuyến, tuyến, giờ, trạng thái | Lọc lịch việc; không có nút nhận việc phase 1 | Trip detail |
| DA-JOB-02 | Lịch chuyến | Calendar/list ngày có chuyến | Xem công việc theo lịch | Chọn ngày → list |
| DA-TRIP-01 | Chi tiết chuyến | Order, xe, điểm lấy/trả, hàng hóa, ghi chú, COD dự kiến, trạng thái | Bắt đầu/cập nhật trạng thái, xem route, báo sự cố | Stops/status/POD/COD |
| DA-STOP-01 | Danh sách điểm dừng | Stops theo thứ tự, loại lấy/trả, địa chỉ, liên hệ, COD, trạng thái | Mở điểm dừng, gọi liên hệ, mở bản đồ | Stop detail |
| DA-STOP-02 | Chi tiết điểm dừng | Địa chỉ, liên hệ, hàng liên quan, COD, POD, giờ thực tế | Mark đã đến/hoàn thành/bỏ qua; nhập COD; chụp POD | COD/POD/status |
| DA-STATUS-01 | Cập nhật trạng thái chuyến | Các trạng thái hợp lệ, ghi chú | Chuyển trạng thái trip; lưu giờ thực tế | Quay lại trip |
| DA-STATUS-02 | Tạm dừng chuyến | Lý do tạm dừng, ghi chú, ảnh nếu cần | Set trip tạm dừng; hết dừng quay lại trạng thái trước | Trip detail |
| DA-POD-01 | Chụp POD | Camera/gallery, ảnh đã chụp, điểm trả liên quan | Chụp/tải ảnh POD, lưu offline nếu mất mạng | Stop detail |
| DA-COD-01 | Nhập COD thực thu | Số tiền dự kiến, số thực thu, ghi chú, ảnh chứng từ | Ghi COD tại điểm; sửa COD phải có lý do/audit | Stop/trip detail |
| DA-INC-01 | Báo sự cố | Loại sự cố, mô tả, ảnh/chứng từ, mức độ | Gửi sự cố cho operation; lưu offline nếu cần | Trip/order incident web |
| DA-ATT-01 | Upload chứng từ | Loại chứng từ, ảnh/file, entity liên quan | Gửi thêm ảnh sự cố, phiếu giao, biên nhận | Trip/stop |
| DA-GPS-01 | Theo dõi vị trí nền | Không nhất thiết là màn hình chính; hiển thị permission/status | Xin quyền vị trí, gửi GPS khi chuyến đang chạy, buffer offline | Trip running |
| DA-SYNC-01 | Đồng bộ offline | Hàng đợi trạng thái/GPS/POD/COD chưa gửi | Retry, xem lỗi cần xử lý | Từ home/profile |
| DA-NOTI-01 | Thông báo | Chuyến mới, thay đổi chuyến, yêu cầu xử lý, cảnh báo COD | Đọc notification, mở chuyến | Trip/stop |
| DA-MONEY-01 | Thưởng & khoản ứng của tôi | Thưởng theo order/trip, ứng lương, tạm ứng chuyến, COD đang giữ | Xem minh bạch dữ liệu liên quan tới tài xế | Trip detail |
| DA-HIST-01 | Lịch sử chuyến | Chuyến đã hoàn thành/hủy, POD/COD, thưởng | Xem lại công việc cũ | Trip readonly |
| DA-PROFILE-01 | Hồ sơ cá nhân | Tên, SĐT, thông tin tài khoản, đổi mật khẩu nếu có | Cập nhật thông tin cá nhân, đăng xuất | Auth |

## 5. App Merchant

App Merchant phase 2 là bản mobile rút gọn cho chủ/operation/kế toán. Không thay thế toàn bộ Web Merchant.

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| MA-AUTH-01 | Đăng nhập | Google hoặc phương thức chung của merchant | Đăng nhập app merchant | Home |
| MA-HOME-01 | Tổng quan mobile | KPI ngắn, chuyến đang chạy, nợ quá hạn, COD, sự cố, bảng lương chờ duyệt | Mở nhanh việc cần xử lý | Các màn hình detail |
| MA-NOTI-01 | Thông báo | Cảnh báo và việc cần duyệt/xử lý | Đọc, mở entity | Order/trip/payroll |
| MA-ORD-01 | Danh sách đơn | Mã đơn, khách, tuyến, trạng thái, công nợ | Tìm/lọc, mở chi tiết | Detail |
| MA-ORD-02 | Chi tiết đơn | Tổng quan, điểm dừng, chuyến, tài chính tóm tắt, chứng từ | Xem/sửa nhẹ theo quyền, đổi trạng thái nếu cần | Trip/customer/finance |
| MA-ORD-03 | Tạo nhanh đơn | Khách, điểm đi/đến, giá cước, ghi chú hàng, hạn thanh toán | Tạo order nhanh, phần chi tiết chỉnh trên web | Order detail |
| MA-TRIP-01 | Danh sách chuyến | Chuyến hôm nay/đang chạy/sắp chạy | Theo dõi điều phối | Trip detail |
| MA-TRIP-02 | Chi tiết chuyến | Xe, tài xế, stops, trạng thái, POD/COD, sự cố | Gọi tài xế, xem POD, cập nhật trạng thái thay tài xế | Driver/order |
| MA-MAP-01 | Theo dõi xe | Last known location/chuyến đang chạy | Xem xe đang chạy trên mobile | Trip detail |
| MA-CUS-01 | Khách hàng | Tìm khách, công nợ, địa chỉ/liên hệ | Gọi khách, mở công nợ/order | Customer detail |
| MA-CUS-02 | Chi tiết khách | Công nợ, đơn gần đây, địa chỉ, số dư | Xem nhanh và tạo order | Order create |
| MA-FIN-01 | Tài chính nhanh | Công nợ khách, COD tài xế, phiếu thu/chi gần đây | Xem cảnh báo tiền | Detail finance |
| MA-COD-01 | COD tài xế | COD đang giữ theo tài xế | Nhắc/ghi nhận nộp COD nếu có quyền | Payment |
| MA-PAYROLL-01 | Duyệt bảng lương | Danh sách bảng lương chờ duyệt, tổng tiền | Giám đốc duyệt/trả về | Payroll detail |
| MA-RPT-01 | Báo cáo tóm tắt | Doanh thu, chi phí, lãi/lỗ, công nợ | Xem nhanh theo thời gian | Web để xem sâu |
| MA-PROFILE-01 | Tài khoản & cài đặt nhẹ | Hồ sơ, merchant, đăng xuất | Quản lý phiên | Auth |

## 6. Web Khách hàng

Web Khách hàng phase 3 phục vụ khách cuối tìm nhà xe, tạo booking/yêu cầu vận chuyển và xem lịch sử. Booking không tự động thành order; operation tiếp nhận rồi tạo/chuyển thành order.

| ID | Màn hình | Nội dung chính | Chức năng | Liên kết |
|---|---|---|---|---|
| CW-AUTH-01 | Đăng nhập/đăng ký khách | Email/SĐT/social nếu chốt sau | Đăng nhập, đăng ký, quên mật khẩu | Home |
| CW-HOME-01 | Trang khám phá | Tìm kiếm merchant/nhà xe, bộ lọc tuyến/dịch vụ nếu có | Khách tìm nhà xe phù hợp | Merchant profile/booking |
| CW-MER-01 | Hồ sơ nhà xe | Thông tin merchant, liên hệ, dịch vụ, ghi chú | Xem nhà xe trước khi booking | Tạo booking |
| CW-BOOK-01 | Tạo booking/yêu cầu vận chuyển | Điểm lấy/trả, hàng hóa, thời gian, ghi chú, thông tin liên hệ | Gửi yêu cầu; chưa phải order | Sau gửi → booking detail |
| CW-BOOK-02 | Danh sách booking | Booking đã gửi, trạng thái tiếp nhận/xử lý/hủy/chuyển thành order | Theo dõi yêu cầu | Detail |
| CW-BOOK-03 | Chi tiết booking | Nội dung yêu cầu, trao đổi/ghi chú, trạng thái, order liên quan nếu đã tạo | Hủy/sửa khi còn cho phép; xem order nếu có | Order history |
| CW-ORD-01 | Lịch sử đơn hàng | Đơn đã thực hiện, trạng thái, tuyến, tổng tiền, công nợ nếu được mở | Xem lịch sử dịch vụ | Order detail |
| CW-ORD-02 | Chi tiết đơn khách | Thông tin order khách được phép xem, chuyến/stops, POD nếu chia sẻ, tiền phải trả/đã trả | Theo dõi đơn, tải chứng từ nếu cho phép | Statement/payment info |
| CW-DEBT-01 | Bảng kê/công nợ của tôi | Bảng kê đã gửi, tổng nợ, file PDF | Tải bảng kê, đối chiếu | Statement detail |
| CW-PROFILE-01 | Hồ sơ khách hàng | Thông tin cá nhân/doanh nghiệp, liên hệ | Cập nhật thông tin | Address book |
| CW-ADDR-01 | Địa chỉ thường dùng | Kho/điểm lấy/trả, người liên hệ, SĐT | Thêm/sửa địa chỉ dùng cho booking | Booking create |
| CW-NOTI-01 | Thông báo khách | Booking được tiếp nhận, order cập nhật, bảng kê mới nếu bật | Mở booking/order/statement | Detail tương ứng |

## 7. Luồng liên kết chính

### 7.1. Tạo đơn và điều phối

1. `WM-CUS-01/02` chọn khách hoặc `WM-ORD-01`.
2. `WM-ORD-03` tạo order với stops, cargo, giá, add-on, hạn thanh toán.
3. `WM-TRIP-02` tạo trip, gán xe + tài xế, check warning lịch.
4. Tài xế thấy chuyến ở `DA-HOME-01` / `DA-JOB-01`.
5. Tài xế cập nhật trạng thái, POD, COD trên `DA-TRIP-01` / `DA-STOP-02`.
6. Operation theo dõi ở `WM-DISPATCH-01` / `WM-TRIP-01` / `WM-ORD-02`.

### 7.2. Thu tiền khách và công nợ

1. Kế toán mở `WM-DEBT-01` hoặc customer detail.
2. Tạo phiếu thu tại `WM-PAY-03`.
3. Phân bổ payment vào order tại `WM-PAY-04`.
4. Nếu cần gửi khách, tạo bảng kê tại `WM-DEBT-03/04`.
5. PDF bảng kê mở qua `WM-SHELL-05`, snapshot giữ trong `debt_statement`.

### 7.3. COD tài xế

1. Tài xế nhập COD tại `DA-COD-01`.
2. Operation/kế toán thấy cảnh báo ở `WM-COD-01` và dashboard.
3. Khi tài xế nộp lại, tạo phiếu thu loại "tài xế nộp COD" tại `WM-PAY-03`.
4. Sổ công nợ tài xế cập nhật tại `WM-DRV-05`.

### 7.4. Chi phí, tạm ứng và lãi/lỗ đơn

1. Operation/kế toán tạo expense tại `WM-EXP-03`.
2. Expense gắn order/trip/vehicle/supplier/driver tùy loại.
3. Tạm ứng chuyến theo dõi tại `WM-ADV-01`.
4. Lãi/lỗ order xem tại `WM-ORD-07` và report `WM-RPT-03`.

### 7.5. Lương tài xế

1. Operation tạo bảng lương tại `WM-PAYROLL-03`.
2. Kiểm tra chi tiết tại `WM-PAYROLL-02/04`.
3. Giám đốc duyệt ở `WM-PAYROLL-05` hoặc App Merchant `MA-PAYROLL-01`.
4. Kế toán export bảng lương/phiếu lương từ `WM-SHELL-05`.
5. Tài xế xem thưởng/ứng cơ bản ở `DA-MONEY-01`.

### 7.6. Booking khách hàng phase 3

1. Khách tìm nhà xe ở `CW-HOME-01`.
2. Gửi booking tại `CW-BOOK-01`.
3. Operation tiếp nhận booking ở Web Merchant, sau đó tạo/chuyển thành order tại `WM-ORD-03`.
4. Khách theo dõi booking/order ở `CW-BOOK-03` và `CW-ORD-02`.

## 8. Màn hình dùng chung dưới dạng component/modal

Các màn hình nhỏ này nên thiết kế dùng lại thay vì làm riêng từng module:

- Modal nhập lý do thao tác nhạy cảm.
- Drawer timeline/audit.
- Attachment uploader/viewer.
- Status update modal.
- Import Excel wizard.
- Export/print preview.
- Entity picker: chọn khách, tài xế, xe, NCC, order, trip.
- Address/contact picker từ sổ địa chỉ khách hàng.
- Money input chuẩn VND.
- Permission guard/empty state khi user không có quyền.

## 9. Gợi ý ưu tiên thiết kế màn hình

### Go-live vận hành đầu tiên

- Web: login, dashboard, customer/driver/vehicle/supplier list-detail, order list-create-detail, trip/dispatch, POD/COD view, attachment, timeline cơ bản.
- App tài xế: login, job list, trip detail, stop detail, status update, POD, COD, offline sync tối thiểu.

### Sau khi vận hành đơn/chuyến ổn

- Finance: payment, allocation, expense, customer debt, COD tài xế, supplier debt.
- Debt statement PDF snapshot.
- Payroll create/approve.

### Giai đoạn mở rộng

- App Merchant.
- Web Khách hàng + booking.
- GPS route đầy đủ, dashboard nâng cao.
- Import/export Excel sâu và bộ mẫu in đầy đủ.
