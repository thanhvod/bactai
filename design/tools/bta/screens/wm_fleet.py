"""Web Merchant — Xe (WM-VEH-01…03) và Nhà cung cấp (WM-SUP-01…03)."""
from .. import data as D
from ..core import Screen, register
from ..shells import wm_shell
from ..ui import *  # noqa: F401,F403

VEH_TABS = ["Tổng quan", "Lịch sử chạy", "Chi phí", "Chứng từ", "Timeline"]
SUP_TABS = ["Tổng quan", "Khoản chi", "Công nợ", "Thuê xe ngoài", "Chứng từ", "Timeline"]
VEH_STATUS = {"Đang chạy": "accent", "Sẵn sàng": "success", "Bảo dưỡng": "warning", "Ngừng sử dụng": "neutral"}


def _num_dot(n):
    return (f'<span style="display: inline-flex; width: 22px; height: 22px; border-radius: 50%; background: {T["primary-soft"]}; '
            f'color: {T["primary"]}; font-size: 12px; font-weight: 700; align-items: center; justify-content: center; flex-shrink: 0;">{n}</span>')


def _fsec(n, title, body):
    return col(row(_num_dot(n), h("sm", title), gap=8), body, gap=12)


def _veh_status(s):
    return badge(s, VEH_STATUS.get(s, "neutral"))


# ---------------------------------------------------------------- WM-VEH-01
EXTRA_VEH = [
    {"id": "VEH-A-005", "plate": "50H-234.56", "type": "Đầu kéo", "cap": "30 tấn", "status": "Ngừng sử dụng", "trip": "—", "cost": 0, "extra": True},
]


def _veh_list_content():
    cols = [("Biển số", "left", "150px"), ("Loại xe · Tải trọng", "left"), ("Trạng thái", "left"), ("Chuyến hiện tại", "left"),
            ("Chi phí tháng 9", "right"), ("Đăng kiểm đến", "left"), ("", "right", "44px")]
    reg = {"VEH-A-001": ("15/03/2027", None), "VEH-A-002": ("08/10/2026", "Còn 15 ngày"), "VEH-A-003": ("20/01/2027", None),
           "VEH-A-004": ("11/06/2027", None), "VEH-A-005": ("02/09/2026", "Hết hạn")}
    rows = []
    for v in D.VEHICLES + EXTRA_VEH:
        trip = code(v["trip"], to="WM-TRIP-01", trigger="Mở chuyến hiện tại") if v["trip"] != "—" else muted("—")
        rd, w = reg[v["id"]]
        regc = row(num(rd), badge(w, "danger" if w == "Hết hạn" else "warning") if w else "", gap=6)
        rows.append([col(code(v["plate"], 13, to="WM-VEH-02", trigger="Mở chi tiết xe"), subtle(v["id"], 11), gap=0),
                     col(text(v["type"], 13, 500), muted(v["cap"], 12), gap=0), _veh_status(v["status"]), trip,
                     num(money(v["cost"]) if v["cost"] else "—", color=None if v["cost"] else T["text-muted"]), regc, row_menu()])
    return col(
        page_header("Xe", "Đội xe của nhà xe; xe bảo dưỡng/ngừng sử dụng không chọn được khi tạo chuyến",
                    row(btn("Import", "secondary", "upload", to="WM-SHELL-04", trigger="Import xe từ Excel"),
                        btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất danh sách xe"),
                        btn("Thêm xe", "primary", "plus", to="WM-VEH-03", trigger="Thêm xe"), gap=8)),
        row(kpi("Tổng số xe", "5", "4 đang dùng"), kpi("Đang chạy", "2", "CX-202609-0001, CX-202609-0003", "accent", "route"),
            kpi("Sẵn sàng", "1", "51C-456.78", "success", "circle-check"), kpi("Bảo dưỡng", "1", "51H-111.22 · Gara Đại Lộc", "warning", "wrench"),
            kpi("Chi phí xe tháng 9", money(10_000_000), "Nhiên liệu, cầu đường, sửa chữa", None, "fuel", "WM-EXP-01", "Mở phiếu chi xe"),
            gap=12, extra="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr));"),
        filter_bar("Tìm biển số, loại xe…", ["Tất cả", "Đang chạy", "Sẵn sàng", "Bảo dưỡng", "Ngừng sử dụng", "Sắp hết đăng kiểm"],
                   selects=("Loại xe: Tất cả",)),
        table(cols, rows, footer=pagination("1–5", 5), checkbox_col=True),
        gap=16)


def veh_01():
    return wm_shell("vehicles", _veh_list_content())


# ---------------------------------------------------------------- WM-VEH-02
def veh_02():
    use("EntityHeader")
    head = row(
        col(row(h("display", "51C-123.45"), _veh_status("Đang chạy"), gap=10),
            row(text("Tải thùng · 8 tấn", 14), muted("·"), muted("VEH-A-001", 13), muted("·"), text("Đang chạy", 13),
                code("CX-202609-0001", 13, to="WM-TRIP-01", trigger="Mở chuyến hiện tại"), muted("·"), a("Nguyễn Văn Tài", "WM-DRV-02", "Mở tài xế"), gap=6),
            subtle("Tạo 01/08/2026 bởi Trần Hải · Cập nhật 15/09/2026", 12), gap=4),
        spacer(),
        row(btn("Timeline", "secondary", "history", to="WM-SHELL-07", trigger="Mở Timeline drawer"),
            btn("Sửa", "secondary", "pencil", to="WM-VEH-03", trigger="Sửa xe"),
            btn("Thêm chi phí xe", "primary", "plus", to="WM-EXP-03", trigger="Tạo phiếu chi gắn xe"),
            icon_btn("ellipsis", "Thao tác khác", to="WM-SHELL-08", trigger="Menu: Ngừng sử dụng xe (sensitive)"), gap=8), align="flex-start")
    strip = summary_strip([("Chuyến tháng 9", "7"), ("Km tháng 9 (ước tính)", "2.180 km"), ("Chi phí tháng 9", money(3_300_000)),
                           ("Doanh thu chuyến tháng 9", money(62_500_000)), ("Đăng kiểm đến", "15/03/2027"), ("Bảo hiểm đến", "30/11/2026", "warning")])
    profile = panel("Hồ sơ xe", dl([
        ("Biển số", num("51C-123.45", 14, 600)), ("Loại xe", "Tải thùng"), ("Tải trọng", "8 tấn"), ("Kích thước thùng", "6,2 × 2,35 × 2,4 m"),
        ("Hãng · Model", "Hino FG8JP7A"), ("Năm sản xuất", num("2021", 14)), ("Số khung", num("RNKFG8JP7MXX10231", 14)), ("Số máy", num("J08E-UF 45821", 14)),
        ("Nhiên liệu", "Dầu diesel"), ("Định mức", "18 lít/100 km"), ("Sở hữu", "Xe công ty"), ("Ghi chú", "Có bửng nâng hạ")], cols=4))
    trips = panel("Lịch sử chạy gần đây", table(
        [("Mã chuyến", "left"), ("Đơn · Tuyến", "left"), ("Tài xế", "left"), ("Thời gian", "left"), ("Trạng thái", "left")],
        [[code("CX-202609-0002", to="WM-TRIP-01", trigger="Mở chuyến"), col(code("DH-202609-0002", 12), muted("Long An → Quận 7", 12), gap=0),
          text("Nguyễn Văn Tài", 13), num("23/09 15:00 – 19:00", 12), row(status("Đã lên lịch", "trip"), badge("Gần trùng", "warning"), gap=4)],
         [code("CX-202609-0001", to="WM-TRIP-01", trigger="Mở chuyến"), col(code("DH-202609-0001", 12), muted("Cần Thơ → Bình Dương", 12), gap=0),
          text("Nguyễn Văn Tài", 13), num("23/09 06:00 – 14:00", 12), status("Đang vận chuyển", "trip")],
         [code("CX-202608-0031", to="WM-TRIP-01", trigger="Mở chuyến"), col(code("DH-202608-0009", 12), muted("Cần Thơ → Bình Dương", 12), gap=0),
          text("Trần Minh Lái", 13), num("28/08 05:30 – 13:10", 12), status("Hoàn thành", "trip")]], compact=True),
        a("Xem tất cả", "WM-DISPATCH-02", "Mở lịch xe"), body_pad=False)
    costs = panel("Chi phí xe tháng 9", table(
        [("Mã phiếu", "left"), ("Loại · Đối tượng", "left"), ("Số tiền", "right"), ("Trạng thái", "left")],
        [[code("PC-202609-0002", to="WM-EXP-02", trigger="Mở phiếu chi"), col(text("Nhiên liệu", 13), a("Xăng dầu Minh Phát", "WM-SUP-02", "Mở NCC", 12), gap=0),
          num(money(2_500_000)), status("Chưa trả", "fin")],
         [code("PC-202609-0001", to="WM-EXP-02", trigger="Mở phiếu chi"), col(text("Phí cầu đường", 13), muted("CX-202609-0001 · tài xế chi trước", 12), gap=0),
          num(money(800_000)), status("Chưa trả", "fin")]],
        compact=True, total_row=["Tổng", "", money(3_300_000), ""]),
        btn("Thêm chi phí", "secondary", "plus", size="sm", to="WM-EXP-03", trigger="Thêm chi phí xe"), body_pad=False)
    left = col(profile, trips, costs, gap=16, extra="flex: 2; min-width: 0;")
    docs = panel("Chứng từ", col(
        attachment_list([("Dang-kiem-51C12345.pdf", "Đăng kiểm", "hết hạn 15/03/2027"),
                         ("Bao-hiem-TNDS-2026.pdf", "Bảo hiểm", "hết hạn 30/11/2026"),
                         ("Cavet-xe.jpg", "Đăng ký xe", "01/08/2026")], to="WM-SHELL-06"),
        banner("Bảo hiểm TNDS hết hạn sau 68 ngày.", "warning"), gap=10), btn("Tải lên", "ghost", "upload", size="sm"))
    tl = panel("Timeline", timeline([
        ("23/09 06:12", "Nguyễn Văn Tài", "Bắt đầu chuyến CX-202609-0001", None, "accent"),
        ("22/09 16:30", "Lê Thu Vân", "Gán xe vào CX-202609-0001, CX-202609-0002"),
        ("15/09 09:20", "Trần Hải", "Sửa định mức nhiên liệu 17 → 18 lít/100 km", "Cập nhật theo số liệu thực tế tháng 8", "warning")]),
        a("Xem tất cả", "WM-SHELL-07", "Mở Timeline"))
    right = col(docs, tl, gap=16, extra="flex: 1; min-width: 0;")
    content = col(breadcrumb([("Xe", "WM-VEH-01"), ("51C-123.45", None)]), head, strip,
                  tabs(VEH_TABS, 0, counts={"Lịch sử chạy": 7, "Chi phí": 2, "Chứng từ": 3}),
                  row(left, right, gap=16, align="flex-start"), gap=16)
    return wm_shell("vehicles", content, h=1180)


# ---------------------------------------------------------------- WM-VEH-03 (drawer)
def veh_03():
    body = col(
        _fsec(1, "Thông tin chính", col(
            row(field("Biển số", input_("51D-902.18", mono=True), True, hint="Duy nhất trong nhà xe"), field("Mã xe", input_("Tự sinh: VEH-A-006", disabled=True)), gap=12),
            row(field("Loại xe", select("Tải thùng"), True, hint="Danh mục loại xe"), field("Tải trọng", input_("10", suffix="tấn"), True), gap=12),
            gap=12)),
        divider(),
        _fsec(2, "Thông tin kỹ thuật", col(
            row(field("Hãng · Model", input_("Isuzu FVR34QE4")), field("Năm sản xuất", input_("2022", mono=True)), gap=12),
            row(field("Số khung", input_("RLEFVR34Q2V00871", mono=True)), field("Số máy", input_("6HK1-786231", mono=True)), gap=12),
            row(field("Kích thước thùng", input_("7,2 × 2,4 × 2,5", suffix="m")), field("Định mức nhiên liệu", input_("20", suffix="lít/100 km")), gap=12),
            row(field("Đăng kiểm đến", date_input("11/06/2027")), field("Bảo hiểm đến", date_input("30/04/2027")), gap=12),
            gap=12)),
        divider(),
        _fsec(3, "Trạng thái", col(
            radio_cards([("Sẵn sàng", "Chọn được khi tạo chuyến"), ("Bảo dưỡng", "Tạm không xếp chuyến"), ("Ngừng sử dụng", "Ẩn khỏi picker")], 0),
            field("Ghi chú", textarea("", "Ví dụ: có bửng nâng hạ, chỉ chạy nội thành", h=40)), gap=12)),
        gap=16)
    foot = btn("Hủy", "secondary", to="WM-VEH-01", trigger="Hủy → danh sách xe") + btn("Lưu xe", "primary", "check", to="WM-VEH-02", trigger="Lưu → chi tiết xe")
    dr = drawer("Thêm xe", body, foot, 600, "Sửa xe dùng cùng form: /vehicles/:vehicleId/edit", close_to="WM-VEH-01")
    return wm_shell("vehicles", _veh_list_content(), h=1000, overlay=(dr, "right"))


# ---------------------------------------------------------------- WM-SUP-01
EXTRA_SUP = [
    {"id": "SUP-A-004", "name": "Lốp xe Thành Công", "type": "Vật tư", "debt": 0, "count": 2, "contact": "Anh Công · 0908 444 666", "extra": True},
    {"id": "SUP-A-005", "name": "Vận tải Hòa Bình Xanh", "type": "Vận tải thuê ngoài", "debt": 0, "count": 0, "contact": "Chị Hòa · 0909 555 777",
     "extra": True, "inactive": True},
]


def _sup_list_content():
    cols = [("Nhà cung cấp", "left"), ("Loại NCC", "left"), ("Liên hệ", "left"), ("Số khoản chi", "right"),
            ("Công nợ phải trả", "right"), ("Trạng thái", "left"), ("", "right", "44px")]
    rows = []
    for sp in D.SUPPLIERS + EXTRA_SUP:
        rows.append([col(a(sp["name"], "WM-SUP-02", "Mở chi tiết NCC", 13, 600), subtle(sp["id"], 11), gap=0), badge(sp["type"], "neutral"),
                     muted(sp["contact"]), num(str(sp["count"])),
                     num(money(sp["debt"]), weight=600 if sp["debt"] else 400, color=T["warning"] if sp["debt"] else T["text-muted"]),
                     badge("Ngừng giao dịch", "neutral") if sp.get("inactive") else badge("Hoạt động", "success"), row_menu()])
    return col(
        page_header("Nhà cung cấp", "Đối tác chi phí: thuê xe ngoài, nhiên liệu, sửa chữa, vật tư. Công nợ = phiếu chi chưa trả.",
                    row(btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất danh sách NCC"),
                        btn("Thêm NCC", "primary", "plus", to="WM-SUP-03", trigger="Thêm NCC"), gap=8)),
        row(kpi("Nhà cung cấp", "5", "4 đang giao dịch", None, "store"),
            kpi("Công nợ phải trả", money(10_500_000), "2 NCC còn nợ", "warning", "scale", "WM-DEBT-02", "Mở công nợ NCC"),
            kpi("Chi tháng 9", money(14_700_000), "3 phiếu chi gắn NCC", None, "receipt-text", "WM-EXP-01", "Mở phiếu chi"),
            kpi("Thuê xe ngoài tháng 9", money(8_000_000), "Chành Xe Miền Trung", None, "truck"),
            gap=12, extra="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));"),
        filter_bar("Tìm tên NCC, SĐT, MST…", ["Tất cả", "Còn nợ", "Vận tải thuê ngoài", "Nhiên liệu", "Sửa chữa", "Vật tư"],
                   selects=("Trạng thái: Hoạt động",)),
        table(cols, rows, footer=pagination("1–5", 5)),
        gap=16)


def sup_01():
    return wm_shell("suppliers", _sup_list_content())


# ---------------------------------------------------------------- WM-SUP-02
def sup_02():
    use("EntityHeader")
    head = row(
        col(row(h("display", "Chành Xe Miền Trung"), badge("Vận tải thuê ngoài", "neutral"), badge("Hoạt động", "success"), gap=10),
            row(muted("SUP-A-001", 13), muted("·"), text("MST 0401234567", 13, extra=NUM), muted("·"), text("Anh Tuấn · 0905 111 333", 13), gap=6),
            subtle("Tạo 02/08/2026 bởi Phan Ngọc Mai · Cập nhật 22/09/2026", 12), gap=4),
        spacer(),
        row(btn("Timeline", "secondary", "history", to="WM-SHELL-07", trigger="Mở Timeline drawer"),
            btn("Sửa", "secondary", "pencil", to="WM-SUP-03", trigger="Sửa NCC"),
            btn("Tạo phiếu chi", "primary", "plus", to="WM-EXP-03", trigger="Tạo phiếu chi cho NCC"),
            icon_btn("ellipsis", "Thao tác khác", to="WM-SHELL-08", trigger="Menu: Ngừng giao dịch (sensitive)"), gap=8), align="flex-start")
    strip = summary_strip([("Công nợ phải trả", money(8_000_000), "warning"), ("Quá 30 ngày", money(0)), ("Đã trả tháng 9", money(6_500_000), "success"),
                           ("Tổng chi năm 2026", money(19_500_000)), ("Số khoản chi", "3"), ("Chuyến thuê ngoài", "2")])
    expenses = panel("Khoản chi", table(
        [("Mã phiếu", "left"), ("Loại · Gắn với", "left"), ("Ngày", "left"), ("Số tiền", "right"), ("Trạng thái", "left")],
        [[code("PC-202609-0003", to="WM-EXP-02", trigger="Mở phiếu chi"), col(text("Thuê xe ngoài", 13), code("DH-202609-0002", 12, to="WM-ORD-02", trigger="Mở đơn"), gap=0),
          num("22/09/2026"), num(money(8_000_000), weight=600), status("Chưa trả", "fin")],
         [code("PC-202608-0021", to="WM-EXP-02", trigger="Mở phiếu chi"), col(text("Thuê xe ngoài", 13), muted("DH-202608-0007", 12), gap=0),
          num("26/08/2026"), num(money(6_500_000)), status("Đã trả", "fin")],
         [code("PC-202608-0015", to="WM-EXP-02", trigger="Mở phiếu chi"), col(text("Thuê xe ngoài", 13), muted("DH-202608-0003", 12), gap=0),
          num("12/08/2026"), num(money(5_000_000)), status("Đã trả", "fin")]],
        compact=True, total_row=["Còn phải trả", "", "", money(8_000_000), ""]),
        a("Xem tất cả phiếu chi", "WM-EXP-01", "Mở danh sách phiếu chi"), body_pad=False)
    rental = panel("Thuê xe ngoài", table(
        [("Đơn", "left"), ("Xe NCC · Tài xế NCC", "left"), ("Tuyến · Ngày", "left"), ("Giá thuê", "right"), ("Phiếu chi", "left")],
        [[code("DH-202609-0002", to="WM-ORD-02", trigger="Mở đơn thuê xe ngoài"), col(num("43C-555.21", 13, 500), muted("Anh Sơn · 0905 222 111", 12), gap=0),
          col(text("Long An → Q.7", 13), muted("23/09/2026", 12), gap=0), num(money(8_000_000)), code("PC-202609-0003", 12)],
         [code("DH-202608-0007", to="WM-ORD-02", trigger="Mở đơn thuê xe ngoài"), col(num("43C-417.09", 13, 500), muted("Anh Sơn · 0905 222 111", 12), gap=0),
          col(text("Bình Dương → Đà Nẵng", 13), muted("25/08/2026", 12), gap=0), num(money(6_500_000)), code("PC-202608-0021", 12)]],
        compact=True), muted("Chi phí thuê ngoài trừ vào lãi/lỗ đơn", 12), body_pad=False)
    left = col(expenses, rental, gap=16, extra="flex: 2; min-width: 0;")
    debt = panel("Công nợ phải trả", col(
        row(text("Chưa trả", 13), spacer(), num(money(8_000_000), 16, 700, T["warning"]), gap=8),
        progress(55, "warning"),
        dl([("0–30 ngày", num(money(8_000_000), 14)), ("31–60 ngày", num(money(0), 14)), ("> 60 ngày", num(money(0), 14))], cols=3),
        subtle("Công nợ NCC = phiếu chi gắn NCC chưa trả. Đánh dấu đã trả trên phiếu chi để giảm nợ.", 12),
        gap=10), a("Công nợ NCC", "WM-DEBT-02", "Mở công nợ NCC"))
    info = panel("Hồ sơ & liên hệ", col(
        dl([("Tên", "Chành Xe Miền Trung"), ("Loại NCC", "Vận tải thuê ngoài"), ("MST", num("0401234567", 14)),
            ("Địa chỉ", "Số 88 Điện Biên Phủ, Thanh Khê, Đà Nẵng"), ("Tài khoản", num("Vietcombank · 0041 000 123 456", 14)), ("Điều khoản", "Trả sau 15 ngày")], cols=2),
        divider(),
        row(avatar("AT", 28, "accent"), col(text("Anh Tuấn", 13, 600), muted("Điều phối · 0905 111 333", 12), gap=0), gap=10),
        row(avatar("CN", 28, "accent"), col(text("Chị Ngân", 13, 600), muted("Kế toán · 0905 666 888", 12), gap=0), gap=10), gap=10))
    tl = panel("Timeline", timeline([
        ("22/09 17:05", "Phan Ngọc Mai", "Tạo phiếu chi PC-202609-0003 · 8.000.000 đ", None, "warning"),
        ("30/08 10:12", "Phan Ngọc Mai", "PC-202608-0021 → <b>Đã trả</b>", None, "success")]),
        a("Xem tất cả", "WM-SHELL-07", "Mở Timeline"))
    right = col(debt, info, tl, gap=16, extra="flex: 1; min-width: 0;")
    content = col(breadcrumb([("Nhà cung cấp", "WM-SUP-01"), ("Chành Xe Miền Trung", None)]), head, strip,
                  tabs(SUP_TABS, 0, counts={"Khoản chi": 3, "Thuê xe ngoài": 2, "Chứng từ": 2}),
                  row(left, right, gap=16, align="flex-start"), gap=16)
    return wm_shell("suppliers", content, h=1200)


# ---------------------------------------------------------------- WM-SUP-03 (drawer)
def sup_03():
    body = col(
        _fsec(1, "Thông tin NCC", col(
            field("Tên nhà cung cấp", input_("Gara Đại Lộc"), True),
            row(field("Loại NCC", select("Sửa chữa"), True, hint="Danh mục loại NCC"), field("Mã số thuế", input_("0312 456 789", mono=True), hint="Không bắt buộc"), gap=12),
            field("Địa chỉ", input_("Số 45 Quốc lộ 1A, Bình Tân, TP.HCM")),
            row(field("Ngân hàng", select("Techcombank")), field("Số tài khoản", input_("1903 5566 7788 99", mono=True)), gap=12),
            field("Điều khoản thanh toán", select("Trả sau 30 ngày")), gap=12)),
        divider(),
        _fsec(2, "Liên hệ", col(
            row(field("Người liên hệ", input_("Anh Lộc"), True), field("Số điện thoại", input_("0907 333 555", mono=True), True), gap=12),
            row(field("Chức vụ", input_("Chủ gara")), field("Email", input_("", "email@ncc.vn")), gap=12),
            btn("Thêm người liên hệ", "ghost", "plus", size="sm"), gap=12)),
        divider(),
        _fsec(3, "Ghi chú & trạng thái", col(
            field("Ghi chú", textarea("Bảo dưỡng định kỳ xe lạnh 51H-111.22; báo giá trước khi sửa trên 3 triệu.", h=56)),
            switch(True, "Đang giao dịch", "Tắt để ẩn khỏi picker khi tạo phiếu chi mới"), gap=12)),
        gap=16)
    foot = btn("Hủy", "secondary", to="WM-SUP-01", trigger="Hủy → danh sách NCC") + btn("Lưu NCC", "primary", "check", to="WM-SUP-02", trigger="Lưu → chi tiết NCC")
    dr = drawer("Sửa nhà cung cấp", body, foot, 600, "SUP-A-003 · Sửa có ghi audit", close_to="WM-SUP-01")
    return wm_shell("suppliers", _sup_list_content(), h=1060, overlay=(dr, "right"))


# ---------------------------------------------------------------- register
V = dict(platform="wm", module="Xe", roles=["admin", "operation", "accountant"])
S = dict(platform="wm", module="Nhà cung cấp", roles=["admin", "operation", "accountant"])
register(
    Screen(id="WM-VEH-01", name="Danh sách xe", route="/vehicles", render=veh_01, pattern="list", **V,
           purpose="Tìm/lọc xe, xem trạng thái, chuyến hiện tại, chi phí gần đây; tạo xe, import/export.",
           api=["vehicles(filter: {search, status, type}, sort, first, after)"],
           data=["code", "plate", "type", "capacity", "status", "currentTrip{code}", "monthCost", "registrationExpiresAt"],
           actions=[("Thêm xe", "vehicle.create (Admin, Operation)"), ("Import", "vehicle.create → WM-SHELL-04"), ("Xuất Excel", "vehicle.view")],
           states={"loading": "DataTable skeleton", "empty": "EmptyState 'Chưa có xe' + 'Thêm xe đầu tiên' / Import",
                   "error": "Banner danger + Thử lại"},
           notes=["Accountant chỉ xem: ẩn Thêm xe/Import/Sửa.", "Chip 'Sắp hết đăng kiểm' = còn ≤ 30 ngày."]),
    Screen(id="WM-VEH-02", name="Chi tiết xe", route="/vehicles/:vehicleId", render=veh_02, pattern="detail", h=1180, **V,
           purpose="Hồ sơ xe, lịch sử chạy, chi phí vật tư/nhiên liệu, chứng từ, timeline.",
           api=["vehicle(id)", "trips(filter: {vehicleId}, first: 10)", "expenses(filter: {vehicleId, month})", "attachments(entityType: VEHICLE)",
                "activityLogs(entityType: VEHICLE, entityId)"],
           data=["plate", "type", "capacity", "specs{brand, model, year, chassisNo, engineNo, fuelNorm}", "status", "currentTrip", "tripHistory[]", "expenses[]",
                 "attachments[]", "registrationExpiresAt", "insuranceExpiresAt"],
           actions=[("Sửa", "vehicle.update → WM-VEH-03"), ("Thêm chi phí xe", "expense.create → WM-EXP-03"),
                    ("Ngừng sử dụng", "vehicle.deactivate — sensitive, WM-SHELL-08")],
           states={"loading": "Skeleton header + tabs", "error": "Không tìm thấy xe → EmptyState + quay lại danh sách"},
           notes=["Tabs dùng ?tab= (overview|trips|expenses|attachments|timeline).", "Lịch sử chạy/chi phí phase đầu có thể placeholder (MD-005)."]),
    Screen(id="WM-VEH-03", name="Form xe", route="/vehicles/new · /vehicles/:vehicleId/edit", render=veh_03, pattern="drawer", h=1000,
           overlay_of="WM-VEH-01", **{**V, "roles": ["admin", "operation"]},
           purpose="Tạo/sửa xe: biển số, loại, tải trọng, thông tin kỹ thuật, trạng thái.",
           api=["catalogItems(type: VEHICLE_TYPE)", "createVehicle(input)", "updateVehicle(id, input)"],
           data=["plate", "type", "capacityTons", "brandModel", "year", "chassisNo", "engineNo", "boxSize", "fuelNorm", "registrationExpiresAt",
                 "insuranceExpiresAt", "status", "note"],
           actions=[("Lưu xe", "vehicle.create / vehicle.update")],
           states={"validation": "Biển số trùng trong merchant → lỗi inline danger (CONFLICT)", "saving": "Nút Lưu loading"},
           notes=["Biển số unique theo merchant; chuẩn hóa in hoa, bỏ khoảng trắng khi so sánh.",
                  "Xe Bảo dưỡng/Ngừng sử dụng không hiện trong picker WM-TRIP-02."]),
    Screen(id="WM-SUP-01", name="Danh sách NCC", route="/suppliers", render=sup_01, pattern="list", **S,
           purpose="Tìm/lọc nhà cung cấp, xem loại, liên hệ, số khoản chi, công nợ phải trả; tạo NCC.",
           api=["suppliers(filter: {search, type, status, hasDebt}, sort, first, after)"],
           data=["code", "name", "type", "contact", "expenseCount", "payableAmount", "status"],
           actions=[("Thêm NCC", "supplier.create (Admin, Operation, Accountant)"), ("Xuất Excel", "supplier.view")],
           states={"loading": "DataTable skeleton", "empty": "EmptyState 'Chưa có nhà cung cấp' + 'Thêm NCC'", "error": "Banner danger + Thử lại"},
           notes=["Công nợ NCC = tổng phiếu chi gắn NCC chưa trả (FIN-005). Operation xem công nợ ⚠️ theo cấu hình."]),
    Screen(id="WM-SUP-02", name="Chi tiết NCC", route="/suppliers/:supplierId", render=sup_02, pattern="detail", h=1200, **S,
           purpose="Hồ sơ, liên hệ, khoản chi, công nợ phải trả, thuê xe ngoài, chứng từ, timeline; tạo phiếu chi.",
           api=["supplier(id)", "expenses(filter: {supplierId})", "supplierDebt(filter: {supplierId})", "externalTransports(filter: {supplierId})",
                "activityLogs(entityType: SUPPLIER, entityId)"],
           data=["code", "name", "type", "taxCode", "address", "bankAccount", "paymentTerms", "contacts[]", "expenses[]", "payable{total, aging}",
                 "externalTransports[]", "attachments[]"],
           actions=[("Tạo phiếu chi", "expense.create → WM-EXP-03 (prefill supplierId)"), ("Sửa", "supplier.update → WM-SUP-03"),
                    ("Ngừng giao dịch", "supplier.deactivate — sensitive")],
           states={"loading": "Skeleton", "no expenses": "EmptyState 'Chưa có khoản chi' + Tạo phiếu chi"},
           notes=["Tabs dùng ?tab= (overview|expenses|payables|external|attachments|timeline).", "Chi phí thuê ngoài không phải doanh thu; trừ vào lãi/lỗ đơn."]),
    Screen(id="WM-SUP-03", name="Form NCC", route="/suppliers/new · /suppliers/:supplierId/edit", render=sup_03, pattern="drawer", h=1060,
           overlay_of="WM-SUP-01", **S,
           purpose="Tạo/sửa NCC: tên, loại, MST (không bắt buộc), liên hệ, tài khoản, ghi chú, trạng thái.",
           api=["catalogItems(type: SUPPLIER_TYPE)", "createSupplier(input)", "updateSupplier(id, input)", "deactivateSupplier(id, reason)"],
           data=["name", "type", "taxCode", "address", "bankName", "bankAccountNo", "paymentTerms", "contacts[{name, phone, title, email}]", "note", "active"],
           actions=[("Lưu NCC", "supplier.create / supplier.update — ghi audit")],
           states={"validation": "Thiếu tên/loại/SĐT liên hệ → lỗi inline"},
           notes=["NCC ngừng giao dịch không chọn được trong phiếu chi mới, dữ liệu cũ giữ nguyên."]),
)
