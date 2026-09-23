# Driver App UI Guidelines

> App Tài xế dùng Flutter. Mục tiêu: tài xế nhìn nhanh, thao tác ít, cập nhật đúng trạng thái/POD/COD/GPS ngoài hiện trường.

## 1. Product Posture

App tài xế không phải bản thu nhỏ của Web Merchant. Nó chỉ tập trung vào:

- Việc được giao.
- Chi tiết chuyến.
- Điểm lấy/trả.
- Trạng thái.
- POD/chứng từ.
- COD.
- Sự cố.
- Đồng bộ offline.
- Hồ sơ/thông báo.

Phase 1 không có nút "nhận việc"; operation giao là tài xế nhận.

## 2. Navigation

Bottom tabs đề xuất:

```text
Hôm nay | Chuyến | Thông báo | Tài khoản
```

Các màn hình chính:

- Splash/session check.
- Login.
- Home hôm nay.
- Danh sách chuyến.
- Chi tiết chuyến.
- Danh sách điểm dừng.
- Chi tiết điểm dừng.
- Cập nhật trạng thái.
- Chụp POD.
- Nhập COD.
- Báo sự cố.
- Đồng bộ offline.
- Thưởng & khoản ứng của tôi.
- Lịch sử chuyến.
- Hồ sơ.

## 3. Mobile Visual Rules

### 3.1. Touch target

- Minimum tap target: `48dp`.
- Primary action full width ở cuối màn hình khi là hành động chính.
- Hạn chế icon-only nếu action quan trọng.

### 3.2. Text

- Body mobile tối thiểu `14sp`.
- Thông tin quan trọng như địa chỉ, liên hệ, COD, trạng thái nên lớn hơn.
- Không dùng text nhạt cho dữ liệu cần đọc ngoài trời.

### 3.3. Color

Giữ cùng token với web, nhưng tăng tương phản:

- Primary teal cho action chính.
- Success cho hoàn thành.
- Warning cho tạm dừng/COD cần chú ý.
- Danger cho hủy/lỗi/sự cố nghiêm trọng.

Không dùng nền màu đậm toàn app; nền sáng dễ đọc.

## 4. Home Today

Mục tiêu: tài xế mở app là biết ngay nên làm gì.

Nội dung:

- Chuyến đang chạy hoặc chuyến tiếp theo.
- Status sync/offline.
- Cảnh báo COD đang giữ nếu có.
- Danh sách chuyến hôm nay.
- Notification mới.

Primary action:

- Nếu có chuyến đang chạy: "Mở chuyến đang chạy".
- Nếu có chuyến sắp tới: "Xem chuyến".

## 5. Job List

List item chuyến:

- Mã chuyến.
- Tuyến ngắn.
- Giờ dự kiến.
- Trạng thái.
- Xe.
- COD nếu cần thu.
- Badge sync nếu có dữ liệu pending.

Filter đơn giản:

- Hôm nay.
- Sắp tới.
- Đang chạy.
- Hoàn thành.

Không làm filter phức tạp như Web Merchant.

## 6. Trip Detail

Header:

- Mã chuyến.
- Trạng thái.
- Tuyến.
- Xe.
- Giờ dự kiến.

Sections:

1. Điểm lấy/trả.
2. Hàng hóa/ghi chú.
3. COD cần thu.
4. Chứng từ/POD.
5. Sự cố.

Primary action thay đổi theo trạng thái:

- Đã lên lịch -> Bắt đầu đi lấy.
- Đang đến điểm lấy -> Đã đến điểm lấy.
- Đang lấy hàng -> Bắt đầu vận chuyển.
- Đang vận chuyển -> Đến điểm trả.
- Đang trả hàng -> Hoàn thành điểm/chuyến.
- Tạm dừng -> Tiếp tục chuyến.

Nếu action có thể gây tranh cãi, mở bottom sheet xác nhận ngắn.

## 7. Stop Detail

Thông tin cần nổi:

- Loại điểm: lấy/trả.
- Địa chỉ.
- Người liên hệ.
- Số điện thoại.
- COD dự kiến/thực thu.
- Ghi chú bốc/trả hàng.
- POD nếu là điểm trả.

Actions:

- Gọi điện.
- Mở bản đồ.
- Đã đến.
- Hoàn thành.
- Chụp POD.
- Nhập COD.
- Báo sự cố.

## 8. POD Capture

Flow:

1. Chọn/chụp ảnh.
2. Preview.
3. Chọn loại chứng từ nếu không mặc định.
4. Gắn vào stop/trip.
5. Upload hoặc lưu queue nếu offline.

UI cần hiển thị:

- Ảnh đã chụp.
- Trạng thái upload.
- Có thể chụp nhiều ảnh.
- Retry khi lỗi.

## 9. COD Input

COD là thao tác nhạy cảm.

Màn nhập COD cần:

- Số dự kiến.
- Số thực thu.
- Ghi chú.
- Ảnh/chứng từ optional.
- Confirm trước khi lưu nếu số thực thu khác dự kiến.

Nếu sửa COD sau khi đã lưu:

- Bắt buộc lý do.
- Hiển thị số cũ/số mới.
- Gửi audit.

## 10. Pause and Incident

Tạm dừng chuyến:

- Lý do từ danh mục: giờ cấm tải, nghỉ đêm, chờ phà, hư xe, kẹt xe, chờ bốc xếp.
- Ghi chú.
- Ảnh optional.

Sự cố:

- Loại sự cố.
- Mức độ.
- Mô tả.
- Ảnh/chứng từ.
- Gửi cho operation.
- Lưu offline nếu mất mạng.

Tạm dừng là trạng thái trip; sự cố là bản ghi riêng. UI không được nhập nhằng hai khái niệm này.

## 11. Offline Sync

App cần đối xử offline như một phần chính thức của UX.

Các hành động có thể queue:

- Update status trip.
- Update status stop.
- Nhập COD.
- Upload POD/chứng từ.
- Gửi GPS batch.
- Báo sự cố.

UI sync cần:

- Banner nhỏ khi offline.
- Số lượng mục chờ đồng bộ.
- Màn chi tiết queue để retry/xem lỗi.
- Không làm tài xế mất dữ liệu đã nhập.

## 12. GPS Permission

GPS chỉ tracking khi có chuyến đang chạy.

UI cần:

- Xin quyền vị trí rõ ràng.
- Cho biết trạng thái tracking.
- Cảnh báo nếu permission tắt làm chuyến không gửi được vị trí.

Không cần màn GPS riêng quá lớn; có thể đặt trong profile/sync/trip status.

## 13. Driver Money Screen

Màn "Thưởng & khoản ứng của tôi" giúp minh bạch, tránh tranh cãi.

Nội dung:

- Thưởng theo chuyến/order.
- Ứng lương.
- Tạm ứng chuyến.
- COD đang giữ.
- Lịch sử nộp COD nếu có.

Không hiển thị báo cáo tài chính công ty.

## 14. App Merchant Future Notes

App Merchant phase 2 nên dùng cùng visual language với Driver App nhưng vai trò khác:

- Dashboard mobile cho chủ/operation.
- Trip/order detail read-heavy.
- COD và công nợ warning.
- Duyệt bảng lương.
- Gọi tài xế/khách nhanh.

Không cố mang toàn bộ Web Merchant lên mobile.

