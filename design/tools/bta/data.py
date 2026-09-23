"""Sample data for mockups — mirrors doc/3-TECHNICAL/SEED-SCENARIOS.md (Merchant A: BTA Demo Transport).
Rows beyond the seed are marked `extra` and follow the same code formats. Today = 23/09/2026.
"""

TODAY = "23/09/2026"
MERCHANT = {"code": "M-DEMO-A", "name": "BTA Demo Transport"}

USERS = [
    {"name": "Trần Hải", "email": "admin@bta-demo.test", "role": "Admin", "status": "Hoạt động", "joined": "01/08/2026"},
    {"name": "Lê Thu Vân", "email": "operation@bta-demo.test", "role": "Operation", "status": "Hoạt động", "joined": "03/08/2026"},
    {"name": "Phan Ngọc Mai", "email": "accountant@bta-demo.test", "role": "Kế toán", "status": "Hoạt động", "joined": "03/08/2026"},
    {"name": "Đỗ Quang Huy", "email": "huy.do@bta-demo.test", "role": "Operation", "status": "Chờ chấp nhận", "joined": "20/09/2026"},
]

CUSTOMERS = [
    {"id": "CUS-A-001", "name": "Công ty Gạo Miền Tây", "phone": "0292 3812 456", "limit": 100_000_000, "days": 15,
     "debt": 27_500_000, "overdue": 15_000_000, "credit": 0, "orders": 18, "warn": "Quá hạn"},
    {"id": "CUS-A-002", "name": "Kho Thép An Phát", "phone": "0272 3826 118", "limit": 200_000_000, "days": 20,
     "debt": 35_000_000, "overdue": 0, "credit": 0, "orders": 9, "warn": None},
    {"id": "CUS-A-003", "name": "Bao bì Hưng Lợi", "phone": "0274 3755 902", "limit": 50_000_000, "days": 7,
     "debt": 0, "overdue": 0, "credit": 3_000_000, "orders": 6, "warn": None},
    {"id": "CUS-A-004", "name": "Nông sản Đồng Tháp Xanh", "phone": "0277 3851 220", "limit": 80_000_000, "days": 15,
     "debt": 8_200_000, "overdue": 0, "credit": 0, "orders": 4, "warn": None, "extra": True},
    {"id": "CUS-A-005", "name": "Vật liệu Xây dựng Phú Mỹ", "phone": "0254 3876 441", "limit": 60_000_000, "days": 10,
     "debt": 64_500_000, "overdue": 12_000_000, "credit": 0, "orders": 11, "warn": "Vượt hạn mức", "extra": True},
]

LOCATIONS = {
    "CUS-A-001": [("Kho Cần Thơ", "KCN Trà Nóc 1, Bình Thủy, Cần Thơ", "Anh Nam", "0901 234 567"),
                  ("Kho Bình Dương", "Số 12 ĐT743, Dĩ An, Bình Dương", "Chị Hạnh", "0902 345 678")],
    "CUS-A-002": [("Nhà máy Long An", "KCN Tân Đức, Đức Hòa, Long An", "Anh Phúc", "0903 111 222"),
                  ("Công trình Quận 7", "Số 8 Nguyễn Hữu Thọ, Quận 7, TP.HCM", "Anh Khang", "0903 333 444"),
                  ("Công trình Thủ Đức", "Số 25 Võ Nguyên Giáp, TP. Thủ Đức", "Chị Lan", "0903 555 666")],
}

DRIVERS = [
    {"id": "DRV-A-001", "name": "Nguyễn Văn Tài", "phone": "0900 000 001", "salary": 10_000_000, "status": "Hoạt động",
     "current": "CX-202609-0001 · 51C-123.45", "cod": 0, "ledger": 800_000, "ledger_note": "Công ty nợ tài xế"},
    {"id": "DRV-A-002", "name": "Trần Minh Lái", "phone": "0900 000 002", "salary": 11_000_000, "status": "Hoạt động",
     "current": "CX-202609-0003 · 51D-678.90", "cod": 5_500_000, "ledger": -5_500_000, "ledger_note": "Tài xế giữ COD"},
    {"id": "DRV-A-003", "name": "Phạm Văn Dự", "phone": "0900 000 003", "salary": 9_500_000, "status": "Ngừng hoạt động",
     "current": "—", "cod": 0, "ledger": 0, "ledger_note": ""},
    {"id": "DRV-A-004", "name": "Lê Hoàng Phúc", "phone": "0900 000 004", "salary": 10_500_000, "status": "Hoạt động",
     "current": "Rảnh", "cod": 0, "ledger": 0, "ledger_note": "", "extra": True},
]

VEHICLES = [
    {"id": "VEH-A-001", "plate": "51C-123.45", "type": "Tải thùng", "cap": "8 tấn", "status": "Đang chạy", "trip": "CX-202609-0001", "cost": 3_300_000},
    {"id": "VEH-A-002", "plate": "51D-678.90", "type": "Mui bạt", "cap": "15 tấn", "status": "Đang chạy", "trip": "CX-202609-0003", "cost": 2_500_000},
    {"id": "VEH-A-003", "plate": "51H-111.22", "type": "Xe lạnh", "cap": "5 tấn", "status": "Bảo dưỡng", "trip": "—", "cost": 4_200_000},
    {"id": "VEH-A-004", "plate": "51C-456.78", "type": "Tải thùng", "cap": "10 tấn", "status": "Sẵn sàng", "trip": "—", "cost": 0, "extra": True},
]

SUPPLIERS = [
    {"id": "SUP-A-001", "name": "Chành Xe Miền Trung", "type": "Vận tải thuê ngoài", "debt": 8_000_000, "count": 3, "contact": "Anh Tuấn · 0905 111 333"},
    {"id": "SUP-A-002", "name": "Xăng dầu Minh Phát", "type": "Nhiên liệu", "debt": 2_500_000, "count": 12, "contact": "Chị Thảo · 0906 222 444"},
    {"id": "SUP-A-003", "name": "Gara Đại Lộc", "type": "Sửa chữa", "debt": 0, "count": 4, "contact": "Anh Lộc · 0907 333 555"},
]

# code, customer, route, status, total, paid, due, overdue_days, warn
ORDERS = [
    ("DH-202609-0001", "Công ty Gạo Miền Tây", "Cần Thơ → Bình Dương", "Đang thực hiện", 12_500_000, 0, "08/10/2026", 0, "Có sự cố"),
    ("DH-202609-0002", "Kho Thép An Phát", "Long An → Q.7, Thủ Đức", "Đã xếp xe", 35_000_000, 0, "13/10/2026", 0, None),
    ("DH-202609-0012", "Bao bì Hưng Lợi", "Bình Dương → Q. Tân Phú", "Chờ xác nhận", 4_800_000, 0, "30/09/2026", 0, "Chưa xếp xe"),
    ("DH-202609-0011", "Nông sản Đồng Tháp Xanh", "Đồng Tháp → Thủ Đức", "Đã xác nhận", 8_200_000, 0, "07/10/2026", 0, "Chưa xếp xe"),
    ("DH-202609-0010", "Vật liệu Xây dựng Phú Mỹ", "Phú Mỹ → Biên Hòa", "Hoàn thành", 6_500_000, 6_500_000, "25/09/2026", 0, None),
    ("DH-202609-0009", "Công ty Gạo Miền Tây", "Cần Thơ → Q. Bình Tân", "Hoàn thành", 15_000_000, 15_000_000, "20/09/2026", 0, None),
    ("DH-202609-0005", "Vật liệu Xây dựng Phú Mỹ", "Phú Mỹ → Long Thành", "Hoàn thành", 12_000_000, 0, "15/09/2026", 8, "Quá hạn"),
    ("DH-202609-0004", "Kho Thép An Phát", "Long An → Q.9", "Đã hủy", 0, 0, "—", 0, "Có chi phí"),
    ("DH-202609-0003", "Bao bì Hưng Lợi", "Bình Dương → Q.12", "Nháp", 3_600_000, 0, "—", 0, None),
    ("DH-202608-0009", "Công ty Gạo Miền Tây", "Cần Thơ → Bình Dương", "Hoàn thành", 20_000_000, 5_000_000, "13/09/2026", 10, "Quá hạn"),
]

# code, order, route, vehicle, driver, planned, status, warn
TRIPS = [
    ("CX-202609-0001", "DH-202609-0001", "Cần Thơ → Bình Dương", "51C-123.45", "Nguyễn Văn Tài", "23/09 06:00 – 14:00", "Đang vận chuyển", "Sự cố mở"),
    ("CX-202609-0002", "DH-202609-0002", "Long An → Quận 7", "51C-123.45", "Nguyễn Văn Tài", "23/09 15:00 – 19:00", "Đã lên lịch", "Gần trùng lịch 1 giờ"),
    ("CX-202609-0003", "DH-202609-0002", "Long An → Thủ Đức", "51D-678.90", "Trần Minh Lái", "23/09 13:00 – 18:00", "Đang lấy hàng", None),
    ("CX-202609-0004", "DH-202609-0011", "Đồng Tháp → Thủ Đức", "—", "—", "24/09 05:00 – 11:00", "Đã lên lịch", "Chưa gán xe"),
    ("CX-202609-0005", "DH-202609-0010", "Phú Mỹ → Biên Hòa", "51D-678.90", "Trần Minh Lái", "22/09 07:00 – 10:30", "Hoàn thành", None),
    ("CX-202609-0006", "DH-202609-0009", "Cần Thơ → Q. Bình Tân", "51C-456.78", "Lê Hoàng Phúc", "21/09 05:30 – 12:00", "Hoàn thành", None),
]

PAYMENTS = [
    ("PT-202609-0003", "Tài xế nộp COD", "Trần Minh Lái", 2_000_000, 0, "21/09/2026", "Tiền mặt", "Đã phân bổ"),
    ("PT-202609-0002", "Khách trả", "Bao bì Hưng Lợi", 3_000_000, 3_000_000, "18/09/2026", "Chuyển khoản", "Chưa phân bổ"),
    ("PT-202609-0001", "Khách trả", "Công ty Gạo Miền Tây", 5_000_000, 0, "15/09/2026", "Chuyển khoản", "Đã phân bổ"),
    ("PT-202609-0004", "Khách trả", "Vật liệu Xây dựng Phú Mỹ", 6_500_000, 0, "22/09/2026", "Chuyển khoản", "Đã phân bổ"),
    ("PT-202609-0005", "Thu khác", "Thanh lý pallet", 1_200_000, 0, "22/09/2026", "Tiền mặt", "Đã thu"),
]

# code, type, target, amount, date, payer, status
EXPENSES = [
    ("PC-202609-0001", "Phí cầu đường", "CX-202609-0001 · Nguyễn Văn Tài", 800_000, "23/09/2026", "Tài xế chi trước", "Chưa trả"),
    ("PC-202609-0002", "Nhiên liệu", "Xăng dầu Minh Phát · 51C-123.45", 2_500_000, "20/09/2026", "Công ty", "Chưa trả"),
    ("PC-202609-0003", "Thuê xe ngoài", "Chành Xe Miền Trung · DH-202609-0002", 8_000_000, "22/09/2026", "Công ty", "Chưa trả"),
    ("PC-202609-0004", "Tạm ứng chuyến", "Nguyễn Văn Tài · CX-202609-0001", 2_000_000, "22/09/2026", "Công ty", "Đã trả"),
    ("PC-202609-0005", "Chi phí chuyến", "DH-202609-0004 (đã hủy)", 1_000_000, "12/09/2026", "Công ty", "Đã trả"),
    ("PC-202609-0006", "Sửa chữa", "Gara Đại Lộc · 51H-111.22", 4_200_000, "10/09/2026", "Công ty", "Đã trả"),
]

PAYROLL_LINES = [
    ("Nguyễn Văn Tài", 10_000_000, 1_500_000, 2_000_000, 0, 9_500_000, None),
    ("Trần Minh Lái", 11_000_000, 2_000_000, 0, 500_000, 12_500_000, "Có giảm trừ"),
    ("Lê Hoàng Phúc", 10_500_000, 800_000, 0, 0, 11_300_000, None),
]


def order(code):
    return next(o for o in ORDERS if o[0] == code)
