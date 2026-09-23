/** Danh mục mặc định seed khi tạo merchant. Ref: doc/1-BRD/02 §4.2, §6, §7; 09 §2.3, §2.8. */
import type { CatalogType } from './status';

export interface CatalogDefault {
  code: string;
  name: string;
  appliesTo?: string;
}

export const CATALOG_DEFAULTS: Record<CatalogType, CatalogDefault[]> = {
  EXPENSE_CATEGORY: [
    { code: 'TOLL', name: 'Cầu đường', appliesTo: 'TRIP_COST' },
    { code: 'LOADING', name: 'Bốc xếp', appliesTo: 'TRIP_COST' },
    { code: 'HANDLING_FEE', name: 'Phí chành', appliesTo: 'TRIP_COST' },
    { code: 'ALLOWANCE', name: 'Bồi dưỡng / lót tay', appliesTo: 'TRIP_COST' },
    { code: 'PARKING', name: 'Bến bãi / gửi xe', appliesTo: 'TRIP_COST' },
    { code: 'FUEL', name: 'Xăng dầu', appliesTo: 'VEHICLE_SUPPLY' },
    { code: 'TIRE', name: 'Lốp xe', appliesTo: 'VEHICLE_SUPPLY' },
    { code: 'REPAIR', name: 'Sửa chữa / bảo dưỡng', appliesTo: 'VEHICLE_SUPPLY' },
    { code: 'BATTERY', name: 'Ắc quy', appliesTo: 'VEHICLE_SUPPLY' },
    { code: 'OUTSOURCE', name: 'Thuê xe ngoài / chành', appliesTo: 'EXTERNAL_TRANSPORT' },
    { code: 'OTHER', name: 'Chi khác', appliesTo: 'OTHER_COST' },
  ],
  ADDON_SERVICE: [
    { code: 'LOADING', name: 'Bốc xếp' },
    { code: 'LIFTING', name: 'Nâng hạ' },
    { code: 'NIGHT', name: 'Giao đêm' },
    { code: 'WAITING', name: 'Phí chờ / lưu ca' },
    { code: 'EXTRA_STOP', name: 'Thêm điểm' },
    { code: 'PACKING', name: 'Đóng kiện' },
  ],
  CARGO_TYPE: [
    { code: 'AGRI', name: 'Nông sản' },
    { code: 'STEEL', name: 'Sắt thép' },
    { code: 'PACKAGING', name: 'Bao bì' },
    { code: 'CONSUMER', name: 'Hàng tiêu dùng' },
    { code: 'CONSTRUCTION', name: 'Vật liệu xây dựng' },
    { code: 'OTHER', name: 'Khác' },
  ],
  PACKAGING_UNIT: [
    { code: 'PACKAGE', name: 'Kiện' },
    { code: 'PALLET', name: 'Pallet' },
    { code: 'BOX', name: 'Thùng' },
    { code: 'BAG', name: 'Bao' },
    { code: 'PIECE', name: 'Cây' },
    { code: 'ROLL', name: 'Cuộn' },
  ],
  PAUSE_REASON: [
    { code: 'NO_LOAD_HOURS', name: 'Giờ cấm tải' },
    { code: 'REST', name: 'Nghỉ đêm / nghỉ luật lái xe' },
    { code: 'FERRY', name: 'Chờ phà / chờ cầu' },
    { code: 'BREAKDOWN', name: 'Sự cố xe' },
    { code: 'TRAFFIC', name: 'Kẹt xe' },
    { code: 'WAIT_LOADING', name: 'Chờ bốc xếp' },
  ],
  DEDUCTION_REASON: [
    { code: 'DAMAGE', name: 'Đền hàng hư hỏng' },
    { code: 'VIOLATION', name: 'Vi phạm' },
    { code: 'ABSENCE', name: 'Nghỉ / vắng' },
    { code: 'OTHER', name: 'Khác' },
  ],
  DOCUMENT_TYPE: [
    { code: 'POD', name: 'POD (xác nhận giao hàng)' },
    { code: 'WAREHOUSE_SLIP', name: 'Phiếu xuất kho' },
    { code: 'INVOICE', name: 'Hóa đơn' },
    { code: 'LOADING_RECEIPT', name: 'Biên nhận bốc xếp' },
    { code: 'EXPENSE_RECEIPT', name: 'Chứng từ chi phí' },
    { code: 'INCIDENT_PHOTO', name: 'Ảnh sự cố' },
    { code: 'CONTRACT', name: 'Hợp đồng / thỏa thuận' },
    { code: 'PAYMENT_PROOF', name: 'Chứng từ thanh toán' },
  ],
  INCIDENT_TYPE: [
    { code: 'BREAKDOWN', name: 'Hư xe' },
    { code: 'LATE', name: 'Trễ giờ' },
    { code: 'CARGO_DAMAGE', name: 'Hàng hư / thiếu' },
    { code: 'ADDRESS_CHANGE', name: 'Khách đổi điểm' },
    { code: 'UNDELIVERABLE', name: 'Không giao được hàng' },
    { code: 'COD_MISMATCH', name: 'Sai COD' },
    { code: 'UNEXPECTED_COST', name: 'Chi phí bất thường' },
  ],
  VEHICLE_TYPE: [
    { code: 'BOX', name: 'Tải thùng' },
    { code: 'TARPAULIN', name: 'Mui bạt' },
    { code: 'REEFER', name: 'Xe lạnh' },
    { code: 'CONT20', name: 'Đầu kéo cont 20' },
    { code: 'CONT40', name: 'Đầu kéo cont 40' },
    { code: 'PICKUP', name: 'Bán tải' },
  ],
  SUPPLIER_TYPE: [
    { code: 'TRANSPORT', name: 'Vận tải thuê ngoài / chành' },
    { code: 'FUEL', name: 'Xăng dầu' },
    { code: 'REPAIR', name: 'Gara / sửa chữa' },
    { code: 'PARTS', name: 'Phụ tùng / lốp / ắc quy' },
    { code: 'OTHER', name: 'Khác' },
  ],
  CUSTOMER_GROUP: [
    { code: 'REGULAR', name: 'Khách thường xuyên' },
    { code: 'OCCASIONAL', name: 'Khách vãng lai' },
  ],
};
