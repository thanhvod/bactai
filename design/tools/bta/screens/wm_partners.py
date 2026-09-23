"""Web Merchant — Khách hàng (WM-CUS-01 … 06) và Tài xế (WM-DRV-01 … 06)."""
from .. import data as D
from ..core import Screen, register
from ..shells import wm_shell
from ..ui import *  # noqa: F401,F403

ROLES_ALL = ["admin", "operation", "accountant"]
CUS = D.CUSTOMERS[0]  # CUS-A-001 Công ty Gạo Miền Tây
DRV_TAI = D.DRIVERS[0]  # DRV-A-001 Nguyễn Văn Tài
DRV_LAI = D.DRIVERS[1]  # DRV-A-002 Trần Minh Lái

CUS_TABS = ["Tổng quan", "Đơn hàng", "Công nợ", "Số dư", "Địa chỉ/liên hệ", "Bảng kê", "Chứng từ", "Timeline"]
CUS_TAB_LINKS = {"Tổng quan": "WM-CUS-02", "Đơn hàng": "WM-CUS-06", "Công nợ": "WM-CUS-05", "Địa chỉ/liên hệ": "WM-CUS-04"}
DRV_TABS = ["Tổng quan", "Lịch sử lái", "Công nợ", "Lương/ứng", "Chứng từ", "Timeline"]
DRV_TAB_LINKS = {"Tổng quan": "WM-DRV-02", "Công nợ": "WM-DRV-05", "Lương/ứng": "WM-DRV-04"}


# ---------------------------------------------------------------- private helpers
def _section(n, title, body, right="", sub=None):
    """Numbered form section (same look as WM-ORD-03)."""
    return panel(None, col(row(f'<span style="display: inline-flex; width: 22px; height: 22px; border-radius: 50%; background: {T["primary-soft"]}; '
                               f'color: {T["primary"]}; font-size: 12px; font-weight: 700; align-items: center; justify-content: center;">{n}</span>',
                               col(h("sm", title), muted(sub, 12) if sub else "", gap=0), spacer(), right, gap=8), body, gap=14))


def _usage(used, limit, w="120px"):
    """Hạn mức: tỉ lệ đã dùng + thanh tiến độ."""
    pct = round(used * 100 / limit) if limit else 0
    tone = "danger" if pct > 100 else ("warning" if pct >= 80 else "primary")
    return col(row(num(money(limit)), spacer(), num(f"{pct}%", 12, 600, TONES[tone][1] if pct >= 80 else T["text-muted"]), gap=6),
               f'<div style="width: {w};">{progress(min(pct, 100), tone, 4)}</div>', gap=3, extra=f"width: {w};")


def _dim(html):
    """Greyed cell content for inactive records."""
    return f'<span style="opacity: 0.55;">{html}</span>'


def _open_menu(items, width=210):
    """Row menu drawn open (popover anchored under the ellipsis button)."""
    return (f'<div style="position: relative; display: inline-block;">{icon_btn("ellipsis", "Thao tác")}'
            f'<div style="position: absolute; right: 0; top: 36px; z-index: 5; text-align: left;">{menu(items, width)}</div></div>')


def _two(top, bottom, top_size=13, top_w=500):
    return col(text(top, top_size, top_w), muted(bottom, 12), gap=0)


# ---------------------------------------------------------------- shared customer detail frame
def customer_header():
    """EntityHeader for CUS-A-001 Công ty Gạo Miền Tây."""
    use("EntityHeader")
    actions = row(
        btn("Timeline", "secondary", "history", to="WM-SHELL-07", trigger="Mở Timeline drawer"),
        btn("Sửa", "secondary", "pencil", to="WM-CUS-03", trigger="Sửa khách hàng"),
        btn("Ghi nhận thanh toán", "secondary", "receipt", to="WM-PAY-03", trigger="Tạo phiếu thu cho khách"),
        btn("Tạo đơn", "primary", "plus", to="WM-ORD-03", trigger="Tạo đơn cho khách"),
        icon_btn("ellipsis", "Thao tác khác", to="WM-SHELL-08", trigger="Menu: Ngừng hoạt động khách (sensitive)"),
        gap=8)
    head = row(
        avatar("MT", 44, "primary"),
        col(row(f'<div style="white-space: nowrap;">{h("display", CUS["name"])}</div>', badge("Đang hoạt động", "success"),
                badge("Quá hạn 10 ngày", "danger", "alarm-clock"), gap=10),
            row(num(CUS["id"], 13, 500), muted("·"), num("Doanh nghiệp · MST 1801234567", 13, 400, T["text-muted"]), muted("·"),
                num(CUS["phone"], 13), gap=8),
            subtle("Tạo 12/02/2025 bởi Lê Thu Vân · Cập nhật 18/09/2026 09:12 bởi Phan Ngọc Mai", 12), gap=4),
        spacer(), actions, align="flex-start", gap=14)
    strip = summary_strip([("Tổng nợ", money(CUS["debt"]), "warning"), ("Quá hạn", money(CUS["overdue"]), "danger"),
                           ("Số dư (chưa phân bổ)", money(CUS["credit"])), ("Hạn mức nợ", money(CUS["limit"])),
                           ("Đã dùng hạn mức", "27,5%"), ("Công nợ mặc định", f'{CUS["days"]} ngày')])
    return col(breadcrumb([("Khách hàng", "WM-CUS-01"), (CUS["name"], None)]), head, strip, gap=12)


def customer_detail(active_tab, body, h_=1080, overlay=None):
    content = col(customer_header(),
                  tabs(CUS_TABS, CUS_TABS.index(active_tab), CUS_TAB_LINKS,
                       counts={"Đơn hàng": 18, "Công nợ": 2, "Địa chỉ/liên hệ": 3, "Bảng kê": 4, "Chứng từ": 6}),
                  body, gap=16)
    return wm_shell("customers", content, h=h_, overlay=overlay)


# ---------------------------------------------------------------- WM-CUS-01
def cus_01():
    cols = [("Khách hàng", "left"), ("Còn nợ · Quá hạn", "right"), ("Số dư", "right"), ("Hạn mức · đã dùng", "left", "150px"),
            ("Công nợ", "right"), ("Số đơn", "right"), ("Cảnh báo", "left"), ("", "right", "44px")]
    rows = []
    for i, c in enumerate(D.CUSTOMERS):
        name = col(a(c["name"], "WM-CUS-02", "Click tên khách → chi tiết", 13, 600) if i == 0 else a(c["name"], "WM-CUS-02", "Click tên khách → chi tiết", 13, 600),
                   row(num(c["id"], 12, 400, T["text-muted"]), subtle("·"), num(c["phone"], 12, 400, T["text-muted"]), gap=4), gap=0)
        debt = col(num(money(c["debt"]), 13, 600 if c["debt"] else 400, T["text"] if c["debt"] else T["text-muted"]),
                   num(f'Quá hạn {money(c["overdue"])}', 12, 500, T["danger"]) if c["overdue"] else subtle("Không quá hạn", 12),
                   gap=0, extra="align-items: flex-end;")
        credit = num(money(c["credit"]), 13, 600, T["info"]) if c["credit"] else num(money(0), 13, 400, T["text-muted"])
        warns = []
        if c["id"] == "CUS-A-001":
            warns.append(badge("Quá hạn 10 ngày", "danger", "alarm-clock"))
        if c["id"] == "CUS-A-005":
            warns += [badge("Vượt hạn mức", "danger", "gauge"), badge("Quá hạn 8 ngày", "danger", "alarm-clock")]
        if c["credit"]:
            warns.append(badge("Có số dư", "info"))
        menu_cell = _open_menu([("Xem chi tiết", "eye", "WM-CUS-02"), ("Tạo đơn", "plus", "WM-ORD-03"),
                                ("Ghi nhận thanh toán", "receipt", "WM-PAY-03"), ("Sửa", "pencil", "WM-CUS-03"), "-",
                                ("Ngừng hoạt động", "circle-x", "WM-SHELL-08", True)]) if i == 0 else row_menu()
        rows.append([name, debt, credit, _usage(c["debt"], c["limit"]), num(f'{c["days"]} ngày'), num(str(c["orders"])),
                     row(*warns, gap=4) if warns else muted("—"), menu_cell])
    # inactive record
    rows.append([_dim(col(a("Cơ khí Tân Tiến", "WM-CUS-02", "Click tên khách → chi tiết", 13, 600),
                          row(num("CUS-A-006", 12, 400, T["text-muted"]), subtle("·"), num("0251 3822 017", 12, 400, T["text-muted"]), gap=4), gap=0)),
                 _dim(num(money(0), 13, 400, T["text-muted"])), _dim(num(money(0), 13, 400, T["text-muted"])),
                 _dim(_usage(0, 30_000_000)), _dim(num("15 ngày")), _dim(num("2")), badge("Ngừng hoạt động", "neutral"), row_menu()])
    kpis = grid([kpi("Khách đang hoạt động", "42", "1 khách ngừng hoạt động", ic="building-2"),
                 kpi("Tổng còn nợ", money(135_200_000), "4 khách còn nợ", "warning", "scale", to="WM-DEBT-01", trigger="Click KPI Tổng còn nợ → công nợ khách"),
                 kpi("Quá hạn", money(27_000_000), "2 khách · cần thu hồi", "danger", "alarm-clock", to="WM-DEBT-01", trigger="Click KPI Quá hạn → công nợ khách"),
                 kpi("Số dư chưa phân bổ", money(3_000_000), "1 khách có tiền dư", "info", "wallet")], 4, 12)
    content = col(
        page_header("Khách hàng", "Theo dõi công nợ, hạn mức và lịch sử đơn của từng khách",
                    row(btn("Import", "secondary", "upload", to="WM-SHELL-04", trigger="Import khách hàng từ Excel"),
                        btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất danh sách khách"),
                        btn("Tạo khách hàng", "primary", "plus", to="WM-CUS-03", trigger="Tạo khách hàng"), gap=8)),
        kpis,
        filter_bar("Tìm tên, SĐT, MST, mã khách…", ["Tất cả", "Còn nợ", "Quá hạn", "Vượt hạn mức", "Có số dư", "Ngừng hoạt động"],
                   right=btn("Bộ lọc", "secondary", "sliders-horizontal", size="sm")),
        table(cols, rows, footer=pagination("1–6", 43)),
        gap=16)
    return wm_shell("customers", content, h=960)


# ---------------------------------------------------------------- WM-CUS-02
def cus_02():
    info = panel("Thông tin khách hàng", dl([
        ("Tên pháp lý", "Công ty TNHH Gạo Miền Tây"), ("Loại khách", "Doanh nghiệp"), ("Mã số thuế", num("1801234567")),
        ("Điện thoại", num(CUS["phone"])), ("Email nhận hóa đơn", "ketoan@gaomientay.vn"), ("Người liên hệ chính", "Anh Nam · Thủ kho"),
        ("Địa chỉ xuất hóa đơn", "Lô 12 KCN Trà Nóc 1, Bình Thủy, Cần Thơ"), ("Hạn mức nợ", num(money(CUS["limit"]))),
        ("Số ngày công nợ mặc định", "15 ngày (gợi ý hạn thanh toán khi tạo đơn)")], cols=3),
        a("Sửa thông tin", "WM-CUS-03", "Sửa khách hàng"))
    ord_rows = []
    for c, _cus, route, stt, tot, paid, due_, od, _w in [o for o in D.ORDERS if o[1] == CUS["name"]]:
        ord_rows.append([col(code(c, to="WM-ORD-02", trigger="Mở đơn"), muted(route, 12), gap=0), status(stt), num(money(tot)),
                         num(money(tot - paid), weight=600 if tot - paid else 400, color=T["warning"] if tot - paid else T["text-muted"]),
                         due(od, due_, paid=(tot == paid))])
    orders = panel("Đơn gần đây", table([("Mã đơn · tuyến", "left"), ("Trạng thái", "left"), ("Tổng thu", "right"),
                                         ("Còn nợ", "right"), ("Hạn thanh toán", "left")], ord_rows, compact=True),
                   a("Xem tất cả 18 đơn", "WM-CUS-06", "Mở lịch sử đơn khách"), body_pad=False)
    locs = panel("Địa chỉ thường dùng", table(
        [("Địa điểm", "left"), ("Liên hệ", "left"), ("Dùng trong", "right")],
        [[_two(n, addr), muted(f"{p} · {ph}"), num(f"{k} đơn")] for (n, addr, p, ph), k in zip(D.LOCATIONS["CUS-A-001"], (18, 17))],
        compact=True), a("Quản lý sổ địa chỉ", "WM-CUS-04", "Mở sổ địa chỉ/liên hệ"), body_pad=False)
    left = col(info, orders, locs, gap=16, extra="flex: 2; min-width: 0;")

    debt = panel("Công nợ", col(
        warning_panel("Có công nợ quá hạn", ["DH-202608-0009 quá hạn 10 ngày · còn nợ 15.000.000 đ"],
                      a("Xem công nợ khách", "WM-CUS-05", "Mở tab Công nợ"), "danger"),
        row(muted("Đã dùng hạn mức"), spacer(), num(f"{money(CUS['debt'])} / {money(CUS['limit'])}", 13, 500), gap=8),
        progress(27.5, "primary", 6),
        row(muted("Còn nợ trong hạn"), spacer(), num(money(12_500_000), 13), gap=8),
        row(muted("Số dư chưa phân bổ"), spacer(), num(money(0), 13), gap=8),
        divider(),
        row(btn("Ghi nhận thanh toán", "secondary", "receipt", size="sm", to="WM-PAY-03", trigger="Tạo phiếu thu"),
            btn("Tạo bảng kê", "secondary", "file-text", size="sm", to="WM-DEBT-03", trigger="Tạo bảng kê công nợ"), gap=8),
        gap=10))
    stmts = panel("Bảng kê gần nhất", col(
        row(code("BK-202609-0002", to="WM-DEBT-04", trigger="Mở bảng kê"), status("Đã gửi", "fin"), spacer(), num(money(27_500_000), 13, 600), gap=8),
        subtle("Kỳ 01/08 – 15/09/2026 · gửi 16/09/2026 qua email", 12),
        row(code("BK-202608-0003", to="WM-DEBT-04", trigger="Mở bảng kê"), status("Đã chốt", "fin"), spacer(), num(money(31_200_000), 13, 600), gap=8),
        subtle("Kỳ 01/07 – 31/07/2026", 12), gap=4),
        a("Tất cả bảng kê", "WM-DEBT-03", "Mở danh sách bảng kê"))
    act = panel("Hoạt động gần đây", timeline([
        ("16/09 15:40", "Phan Ngọc Mai", "Gửi bảng kê <b>BK-202609-0002</b>", None, "accent"),
        ("15/09 10:05", "Phan Ngọc Mai", "Phân bổ 5.000.000 đ từ PT-202609-0001 vào DH-202608-0009", None, "success"),
        ("01/09 08:30", "Trần Hải", "Hạn mức nợ 80.000.000 đ → 100.000.000 đ", "Khách tăng sản lượng vụ thu hoạch", "warning")]),
        a("Xem tất cả", "WM-SHELL-07", "Mở Timeline"))
    right = col(debt, stmts, act, gap=16, extra="flex: 1; min-width: 0;")
    return customer_detail("Tổng quan", row(left, right, gap=16, align="flex-start"), 1280)


# ---------------------------------------------------------------- WM-CUS-03
def cus_03():
    general = _section(1, "Thông tin chung", col(
        field("Loại khách", radio_cards([("Doanh nghiệp", "Có MST, xuất hóa đơn công ty"), ("Cá nhân", "Chủ hàng lẻ, hộ kinh doanh")], 0), True, width="60%"),
        row(field("Tên khách hàng", input_(CUS["name"]), True, width="50%"),
            field("Mã khách", input_(CUS["id"], disabled=True, mono=True), hint="Tự sinh, không sửa được", width="25%"),
            field("Mã số thuế", input_("1801234567", mono=True), width="25%"), gap=12, align="flex-start"),
        row(field("Điện thoại", input_(CUS["phone"], prefix_ic="phone", mono=True), True, hint="Dùng để kiểm tra trùng khách", width="33%"),
            field("Email", input_("lienhe@gaomientay.vn", prefix_ic="mail"), width="33%"),
            field("Nhóm khách", select("Khách thường xuyên"), width="34%"), gap=12, align="flex-start"), gap=14))
    legal = _section(2, "Thông tin xuất hóa đơn", row(
        field("Tên pháp lý", input_("Công ty TNHH Gạo Miền Tây"), width="40%"),
        field("Địa chỉ xuất hóa đơn", input_("Lô 12 KCN Trà Nóc 1, Bình Thủy, Cần Thơ"), width="40%"),
        field("Email nhận hóa đơn", input_("ketoan@gaomientay.vn"), width="20%"), gap=12, align="flex-start"))
    contact = _section(3, "Người liên hệ chính", row(
        field("Họ tên", input_("Anh Nam"), True, width="30%"), field("Chức vụ", input_("Thủ kho"), width="25%"),
        field("Điện thoại", input_("0901 234 567", mono=True), True, width="25%"), field("Zalo", input_("0901 234 567", mono=True), width="20%"),
        gap=12, align="flex-start"),
        right=a("Thêm địa chỉ/liên hệ kho", "WM-CUS-04", "Mở sổ địa chỉ/liên hệ"),
        sub="Liên hệ theo từng kho/địa chỉ quản lý trong Sổ địa chỉ")
    debt = _section(4, "Công nợ", col(
        row(field("Hạn mức nợ", money_input(CUS["limit"]), hint="Để trống = không giới hạn", width="30%"),
            field("Số ngày công nợ mặc định", input_("15", suffix="ngày", mono=True), True, hint="Mặc định nhà xe: 15 ngày", width="25%"),
            field("Nợ hiện tại", input_(money(CUS["debt"]), disabled=True, mono=True), hint="Tính từ đơn và phân bổ, không nhập tay", width="25%"),
            gap=12, align="flex-start"),
        banner("Vượt hạn mức hoặc có nợ quá hạn chỉ hiện cảnh báo khi tạo đơn, không chặn. Hạn thanh toán của đơn = ngày tạo đơn + số ngày công nợ, sửa được trên từng đơn.", "info"),
        gap=12))
    status_ = _section(5, "Trạng thái & ghi chú", row(
        field("Trạng thái", radio_cards([("Đang hoạt động", "Chọn được khi tạo đơn"), ("Ngừng hoạt động", "Không chọn được cho đơn mới")], 0), width="55%"),
        field("Ghi chú nội bộ", textarea("Ưu tiên xe có bạt che mưa. Thanh toán chuyển khoản cuối mỗi tuần.", h=58), width="45%"),
        gap=12, align="flex-start"))
    content = col(
        page_header("Sửa khách hàng", "Thông tin pháp lý, liên hệ và điều kiện công nợ",
                    row(btn("Hủy", "secondary", to="WM-CUS-02", trigger="Hủy → chi tiết khách"),
                        btn("Lưu khách hàng", "primary", "check", to="WM-CUS-02", trigger="Lưu → chi tiết khách"), gap=8),
                    crumbs=[("Khách hàng", "WM-CUS-01"), (CUS["name"], "WM-CUS-02"), ("Sửa", None)]),
        general, legal, contact, debt, status_, gap=14)
    return wm_shell("customers", content, h=1300)


# ---------------------------------------------------------------- WM-CUS-04 Sổ địa chỉ/liên hệ (tab) + drawer
def _cus_04_body():
    locs = [
        ("Kho Cần Thơ", ["Điểm lấy"], "KCN Trà Nóc 1, Bình Thủy, Cần Thơ", [("Anh Nam", "Thủ kho", "0901 234 567"), ("Chị Thu", "Kế toán kho", "0907 118 225")],
         "10.0891, 105.7324", 18, "Có xe nâng, nhận 7:00–17:00"),
        ("Kho Bình Dương", ["Điểm trả"], "Số 12 ĐT743, Dĩ An, Bình Dương", [("Chị Hạnh", "Quản lý kho", "0902 345 678")],
         "10.9044, 106.7651", 17, "Xe trên 10 tấn vào sau 21:00"),
        ("Văn phòng Cần Thơ", ["Nhận chứng từ"], "88 Trần Hưng Đạo, Ninh Kiều, Cần Thơ", [("Chị Ngọc", "Kế toán", "0292 3812 457")],
         "—", 0, "Gửi bảng kê, hóa đơn giấy"),
    ]
    rows = []
    for i, (n, kinds, addr, contacts, coord, used, note) in enumerate(locs):
        rows.append([
            col(text(n, 13, 600), row(*[badge(k, "info" if k == "Điểm lấy" else ("primary" if k == "Điểm trả" else "neutral")) for k in kinds], gap=4), gap=2),
            col(text(addr, 13), num(coord, 12, 400, T["text-muted"]) if coord != "—" else subtle("Chưa có tọa độ", 12), gap=0),
            col(*[row(text(p, 13, 500), muted(f"{r} · {ph}", 12), gap=6) for p, r, ph in contacts], gap=0),
            num(f"{used} đơn") if used else muted("—"), muted(note, 12), row_menu()])
    return col(row(muted("Kho/địa chỉ thường dùng và người liên hệ. Chọn nhanh khi tạo đơn; sửa ở đây không đổi đơn cũ (đơn lưu snapshot địa chỉ).", 13),
                   spacer(), btn("Thêm địa chỉ", "secondary", "plus", size="sm"), gap=8),
               table([("Địa điểm · công dụng", "left"), ("Địa chỉ · tọa độ", "left"), ("Người liên hệ", "left"),
                      ("Dùng trong", "right"), ("Ghi chú", "left"), ("", "right", "44px")], rows, selected=0),
               gap=12)


def cus_04():
    contact_row = lambda name, role, ph, main=False: row(
        field("Họ tên", input_(name, h=34), width="34%"), field("Vai trò", input_(role, h=34), width="28%"),
        field("Điện thoại", input_(ph, mono=True, h=34), width="30%"),
        icon_btn("trash-2", "Xóa liên hệ"), gap=8, align="flex-end")
    body = col(
        field("Tên địa điểm", input_("Kho Cần Thơ"), True),
        field("Công dụng", row(checkbox("Điểm lấy hàng", True), checkbox("Điểm trả hàng"), checkbox("Nhận chứng từ"), gap=16)),
        field("Địa chỉ", input_("KCN Trà Nóc 1, Bình Thủy, Cần Thơ", prefix_ic="map-pin"), True),
        row(field("Vĩ độ", input_("10.0891", mono=True), width="50%"), field("Kinh độ", input_("105.7324", mono=True), width="50%"), gap=12),
        map_placeholder(h=150, pins=[(46, 62, "Kho Cần Thơ", "info")], label="Kéo ghim để chỉnh tọa độ (không bắt buộc)"),
        divider(),
        row(text("Người liên hệ", 14, 600), spacer(), btn("Thêm liên hệ", "ghost", "plus", size="sm"), gap=8),
        contact_row("Anh Nam", "Thủ kho", "0901 234 567"),
        contact_row("Chị Thu", "Kế toán kho", "0907 118 225"),
        field("Ghi chú cho tài xế", textarea("Có xe nâng, nhận 7:00–17:00", h=44)),
        gap=12)
    foot = (btn("Xóa địa chỉ", "danger-outline", "trash-2", to="WM-SHELL-08", trigger="Xóa địa chỉ (sensitive nếu đã dùng)")
            + spacer() + btn("Hủy", "secondary") + btn("Lưu địa chỉ", "primary", "check"))
    return customer_detail("Địa chỉ/liên hệ", _cus_04_body(), 1000,
                           overlay=(drawer("Sửa địa chỉ", body, foot, 520, "Công ty Gạo Miền Tây · dùng trong 18 đơn"), "right"))


# ---------------------------------------------------------------- WM-CUS-05 Công nợ khách (tab)
def cus_05():
    actions = row(
        muted("Còn nợ = tổng thu khách của đơn − đã phân bổ. Phiếu thu chưa phân bổ là số dư của khách, không trừ tự động.", 13), spacer(),
        btn("Xuất Excel", "secondary", "download", size="sm", to="WM-SHELL-05", trigger="Xuất công nợ khách"),
        btn("Tạo bảng kê", "secondary", "file-text", size="sm", to="WM-DEBT-03", trigger="Tạo bảng kê công nợ"),
        btn("Phân bổ", "secondary", "layers", size="sm", to="WM-PAY-04", trigger="Phân bổ phiếu thu vào đơn"),
        btn("Ghi nhận thanh toán", "primary", "plus", size="sm", to="WM-PAY-03", trigger="Tạo phiếu thu khách trả"), gap=8)
    aging = summary_strip([("Trong hạn", money(12_500_000)), ("Quá hạn 1–15 ngày", money(15_000_000), "danger"),
                           ("Quá hạn 16–30 ngày", money(0)), ("Quá hạn trên 30 ngày", money(0)),
                           ("Hạn mức còn lại", money(72_500_000)), ("Số dư khách", money(0))])
    open_rows = [
        [col(code("DH-202608-0009", to="WM-ORD-02", trigger="Mở đơn còn nợ"), muted("29/08/2026 · Cần Thơ → Bình Dương", 12), gap=0),
         num(money(20_000_000)), num(money(5_000_000), color=T["success"]), num(money(15_000_000), weight=600, color=T["danger"]),
         due(10, "13/09/2026"), code("BK-202609-0002", to="WM-DEBT-04", trigger="Mở bảng kê")],
        [col(code("DH-202609-0001", to="WM-ORD-02", trigger="Mở đơn còn nợ"), muted("20/09/2026 · Cần Thơ → Bình Dương", 12), gap=0),
         num(money(12_500_000)), num(money(0), color=T["text-muted"]), num(money(12_500_000), weight=600, color=T["warning"]),
         due(0, "08/10/2026"), muted("Chưa lên bảng kê")],
    ]
    open_tbl = panel("Đơn còn nợ", table(
        [("Mã đơn · ngày · tuyến", "left"), ("Tổng thu", "right"), ("Đã thu", "right"),
         ("Còn lại", "right"), ("Hạn thanh toán", "left"), ("Bảng kê", "left")],
        open_rows, checkbox_col=True, selected=0, compact=True,
        total_row=["Tổng 2 đơn", money(32_500_000), money(5_000_000), money(27_500_000), "", ""]),
        muted("Chọn đơn để tạo bảng kê hoặc phân bổ", 12), body_pad=False)
    top = col(aging, open_tbl, gap=12)
    pay_rows = [
        [num("19/09/2026"), code("PT-202609-0007", to="WM-PAY-02", trigger="Mở phiếu thu"), muted("Chuyển khoản · VCB"), num(money(15_000_000)),
         col(row(code("DH-202609-0009", to="WM-ORD-02", trigger="Mở đơn được phân bổ"), num(money(15_000_000), 12), gap=6), gap=0),
         num(money(0), color=T["text-muted"]), status("Đã phân bổ", "fin"), muted("Phan Ngọc Mai")],
        [num("15/09/2026"), code("PT-202609-0001", to="WM-PAY-02", trigger="Mở phiếu thu"), muted("Chuyển khoản · VCB"), num(money(5_000_000)),
         col(row(code("DH-202608-0009", to="WM-ORD-02", trigger="Mở đơn được phân bổ"), num(money(5_000_000), 12), gap=6), gap=0),
         num(money(0), color=T["text-muted"]), status("Đã phân bổ", "fin"), muted("Phan Ngọc Mai")],
        [num("28/08/2026"), code("PT-202608-0018", to="WM-PAY-02", trigger="Mở phiếu thu"), muted("Chuyển khoản · VCB"), num(money(31_200_000)),
         col(row(code("BK-202608-0003", to="WM-DEBT-04", trigger="Mở bảng kê"), subtle("4 đơn trong bảng kê", 12), gap=6), gap=0),
         num(money(0), color=T["text-muted"]), status("Đã phân bổ", "fin"), muted("Phan Ngọc Mai")],
    ]
    history = panel("Lịch sử thanh toán & phân bổ", table(
        [("Ngày thu", "left"), ("Phiếu thu", "left"), ("Hình thức", "left"), ("Số tiền", "right"), ("Phân bổ vào", "left"),
         ("Chưa phân bổ", "right"), ("Trạng thái", "left"), ("Người ghi nhận", "left")], pay_rows, compact=True),
        row(muted("Số dư khách hiện tại", 13), num(money(0), 13, 600), gap=6), body_pad=False,
        sub="Phiếu thu khách trả → phân bổ thủ công vào từng đơn; phần chưa phân bổ thành số dư khách")
    body = col(actions,
               warning_panel("Khách có công nợ quá hạn", ["DH-202608-0009 quá hạn 10 ngày (hạn 13/09/2026) · còn nợ 15.000.000 đ",
                                                           "Đã gửi bảng kê BK-202609-0002 ngày 16/09/2026, chưa nhận thanh toán"], tone="danger"),
               top, history, gap=16)
    return customer_detail("Công nợ", body, 1120)


# ---------------------------------------------------------------- WM-CUS-06 Lịch sử đơn khách (tab)
def cus_06():
    hist = [
        ("DH-202609-0001", "20/09/2026", "Cần Thơ → Bình Dương", "Đang thực hiện", 12_500_000, 0, 0, "08/10/2026"),
        ("DH-202609-0009", "05/09/2026", "Cần Thơ → Q. Bình Tân", "Hoàn thành", 15_000_000, 15_000_000, 0, "20/09/2026"),
        ("DH-202608-0009", "29/08/2026", "Cần Thơ → Bình Dương", "Hoàn thành", 20_000_000, 5_000_000, 10, "13/09/2026"),
        ("DH-202608-0005", "14/08/2026", "Cần Thơ → Q. Bình Tân", "Hoàn thành", 9_800_000, 9_800_000, 0, "29/08/2026"),
        ("DH-202608-0002", "06/08/2026", "Cần Thơ → Bình Dương", "Hoàn thành", 12_000_000, 12_000_000, 0, "21/08/2026"),
        ("DH-202607-0019", "28/07/2026", "Cần Thơ → Long An", "Hoàn thành", 7_200_000, 7_200_000, 0, "12/08/2026"),
        ("DH-202607-0011", "15/07/2026", "Cần Thơ → Bình Dương", "Đã hủy", 0, 0, 0, "—"),
        ("DH-202607-0004", "04/07/2026", "Cần Thơ → Q. Bình Tân", "Hoàn thành", 11_500_000, 11_500_000, 0, "19/07/2026"),
    ]
    rows = []
    for c, d, route, stt, tot, paid, od, due_ in hist:
        rem = tot - paid
        rows.append([code(c, to="WM-ORD-02", trigger="Mở chi tiết đơn"), num(d), muted(route), status(stt), num(money(tot)),
                     num(money(paid), color=T["success"] if paid else T["text-muted"]),
                     num(money(rem), weight=600 if rem else 400, color=(T["danger"] if od else T["warning"]) if rem else T["text-muted"]),
                     muted("—") if stt == "Đã hủy" else due(od, due_, paid=(rem == 0 and tot > 0))])
    body = col(
        row(filter_bar("Tìm mã đơn, tuyến…", ["Tất cả", "Đang thực hiện", "Hoàn thành", "Còn nợ", "Quá hạn", "Đã hủy"], date="01/01 – 30/09/2026"),
            gap=0, extra="flex-direction: column; align-items: stretch;"),
        grid([kpi("Số đơn", "18", "17 hoàn thành/đang chạy · 1 đã hủy", ic="package"),
              kpi("Tổng thu khách", money(236_400_000), "Doanh thu theo đơn", ic="receipt-text"),
              kpi("Đã thu (phân bổ)", money(208_900_000), "Từ 11 phiếu thu", "success", "circle-check"),
              kpi("Còn lại", money(27_500_000), "Quá hạn 15.000.000 đ", "warning", "scale", to="WM-CUS-05", trigger="Click KPI Còn lại → công nợ khách")], 4, 12),
        table([("Mã đơn", "left"), ("Ngày đơn", "left"), ("Tuyến", "left"), ("Trạng thái", "left"), ("Tổng thu", "right"),
               ("Đã thu", "right"), ("Còn lại", "right"), ("Hạn thanh toán", "left")], rows,
              total_row=["Tổng 18 đơn", "", "", "", money(236_400_000), money(208_900_000), money(27_500_000), ""],
              footer=row(pagination("1–8", 18), gap=0, extra="width: 100%;")),
        row(muted("Tổng tính trên toàn bộ kết quả lọc, không chỉ trang hiện tại.", 12), spacer(),
            btn("Xuất Excel", "secondary", "download", size="sm", to="WM-SHELL-05", trigger="Xuất lịch sử đơn"),
            btn("Tạo đơn", "primary", "plus", size="sm", to="WM-ORD-03", trigger="Tạo đơn cho khách"), gap=8),
        gap=14)
    return customer_detail("Đơn hàng", body, 1180)


# ---------------------------------------------------------------- shared driver detail frame
_DRV_EXTRA = {
    "DRV-A-001": dict(initials="NT", trip=("CX-202609-0001", "Đang vận chuyển", "51C-123.45"), since="01/02/2026",
                      license="GPLX hạng C · hết hạn 12/05/2029", owe=800_000, adv=2_000_000, trips=6,
                      primary=("Tạo phiếu chi hoàn ứng", "hand-coins", "WM-EXP-03", "Tạo phiếu chi hoàn ứng cho tài xế")),
    "DRV-A-002": dict(initials="ML", trip=("CX-202609-0003", "Đang lấy hàng", "51D-678.90"), since="15/06/2025",
                      license="GPLX hạng FC · hết hạn 03/11/2027", owe=0, adv=0, trips=9,
                      primary=("Ghi nhận nộp COD", "hand-coins", "WM-PAY-03", "Tạo phiếu thu tài xế nộp COD")),
}


def driver_header(d):
    use("EntityHeader")
    x = _DRV_EXTRA[d["id"]]
    pl, pic, pto, ptrig = x["primary"]
    actions = row(
        btn("Timeline", "secondary", "history", to="WM-SHELL-07", trigger="Mở Timeline drawer"),
        btn("Sửa", "secondary", "pencil", to="WM-DRV-03", trigger="Sửa tài xế"),
        btn(pl, "primary", pic, to=pto, trigger=ptrig),
        icon_btn("ellipsis", "Thao tác khác", to="WM-SHELL-08", trigger="Menu: Ngừng hoạt động tài xế (sensitive)"),
        gap=8)
    tcode, tstat, plate = x["trip"]
    head = row(
        avatar(x["initials"], 44, "accent"),
        col(row(f'<div style="white-space: nowrap;">{h("display", d["name"])}</div>', badge(d["status"], "success"), gap=10),
            row(num(d["id"], 13, 500), muted("·"), num(d["phone"], 13), muted("·"), num(x["license"], 13, 400, T["text-muted"]), gap=8),
            row(muted("Chuyến hiện tại"), code(tcode, to="WM-TRIP-01", trigger="Mở chuyến hiện tại"), num(plate, 13), status(tstat, "trip"), gap=8),
            subtle(f'Vào làm {x["since"]} · Cập nhật 22/09/2026 16:20 bởi Lê Thu Vân', 12), gap=4),
        spacer(), actions, align="flex-start", gap=14)
    cod = d["cod"]
    strip = summary_strip([("Lương cố định hiện hành", money(d["salary"])), ("Chuyến tháng 9", str(x["trips"])),
                           ("COD đang giữ", money(cod), "danger" if cod > 5_000_000 else None),
                           ("Công ty nợ tài xế", money(x["owe"]), "warning" if x["owe"] else None),
                           ("Tạm ứng chờ đối soát", money(x["adv"]), "info" if x["adv"] else None),
                           ("Tài khoản app", "Đã kích hoạt", "success")])
    return col(breadcrumb([("Tài xế", "WM-DRV-01"), (d["name"], None)]), head, strip, gap=12)


def driver_detail(d, active_tab, body, h_=1080, overlay=None):
    content = col(driver_header(d), tabs(DRV_TABS, DRV_TABS.index(active_tab), DRV_TAB_LINKS,
                                         counts={"Lịch sử lái": 42 if d["id"] == "DRV-A-001" else 67, "Chứng từ": 4}), body, gap=16)
    return wm_shell("drivers", content, h=h_, overlay=overlay)


def _ledger_nav(active):
    return segmented(["Sổ công nợ", "COD đang giữ"], active, ["WM-DRV-05", "WM-DRV-06"])


# ---------------------------------------------------------------- WM-DRV-01
def drv_01():
    cols = [("Tài xế", "left"), ("Trạng thái · app", "left"), ("Xe · chuyến hiện tại", "left"),
            ("Lương cố định", "right"), ("COD đang giữ", "right"), ("Công nợ 2 chiều", "left"), ("", "right", "44px")]
    app = {"DRV-A-001": badge("Đã kích hoạt", "success"), "DRV-A-002": badge("Đã kích hoạt", "success"),
           "DRV-A-003": badge("Đã khóa", "neutral"), "DRV-A-004": badge("Chờ kích hoạt", "warning")}
    rows = []
    for d in D.DRIVERS:
        inactive = d["status"] != "Hoạt động"
        name = col(a(d["name"], "WM-DRV-02", "Click tên tài xế → chi tiết", 13, 600),
                   row(num(d["id"], 12, 400, T["text-muted"]), subtle("·"), num(d["phone"], 12, 400, T["text-muted"]), gap=4), gap=0)
        st_ = col(badge(d["status"], "neutral" if inactive else "success"), row(subtle("App:", 12), app[d["id"]], gap=4), gap=2)
        if d["current"] in ("—", "Rảnh"):
            cur = muted("Rảnh" if d["current"] == "Rảnh" else "—")
        else:
            tc, plate = d["current"].split(" · ")
            trip = next(t for t in D.TRIPS if t[0] == tc)
            cur = col(row(code(tc, to="WM-TRIP-01", trigger="Mở chuyến hiện tại"), status(trip[6], "trip"), gap=6), muted(f"{plate} · {trip[2]}", 12), gap=0)
        if d["cod"]:
            cod = col(a(money(d["cod"]), "WM-DRV-06", "Mở COD tài xế đang giữ", 13, 600),
                      badge("Quá ngưỡng", "danger", "alarm-clock"), gap=2, extra="align-items: flex-end;")
        else:
            cod = num(money(0), color=T["text-muted"])
        if d["ledger"] > 0:
            led = col(text(f'Công ty nợ {money(d["ledger"])}', 13, 500, T["warning"]), muted("Chi hộ chưa hoàn", 12), gap=0)
        elif d["ledger"] < 0:
            led = col(text(f'Tài xế giữ {money(-d["ledger"])}', 13, 500, T["danger"]), muted("COD chưa nộp", 12), gap=0)
        else:
            led = muted("Đã cân bằng")
        cells = [name, st_, cur, num(money(d["salary"])), cod, led, row_menu()]
        if inactive:
            cells = [_dim(c) if i not in (1, 6) else c for i, c in enumerate(cells)]
        rows.append(cells)
    kpis = grid([kpi("Tài xế hoạt động", "3", "1 ngừng hoạt động", ic="id-card"),
                 kpi("Đang chạy chuyến", "2", "1 tài xế rảnh", "accent", "truck", to="WM-DISPATCH-02", trigger="Click KPI → lịch xe/tài xế"),
                 kpi("COD tài xế đang giữ", money(5_500_000), "Trần Minh Lái · quá ngưỡng 5.000.000 đ", "danger", "hand-coins",
                     to="WM-DRV-06", trigger="Click KPI COD → COD tài xế đang giữ"),
                 kpi("Công ty nợ tài xế", money(800_000), "Chi hộ chưa hoàn", "warning", "scale", to="WM-DRV-05", trigger="Click KPI → sổ công nợ tài xế")], 4, 12)
    content = col(
        page_header("Tài xế", "Hồ sơ, tài khoản app, chuyến hiện tại và công nợ 2 chiều với công ty",
                    row(btn("Import", "secondary", "upload", to="WM-SHELL-04", trigger="Import tài xế từ Excel"),
                        btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất danh sách tài xế"),
                        btn("Thêm tài xế", "primary", "plus", to="WM-DRV-03", trigger="Tạo tài xế"), gap=8)),
        kpis,
        filter_bar("Tìm tên, SĐT, mã tài xế…", ["Tất cả", "Đang chạy", "Rảnh", "Giữ COD", "Công ty nợ", "Ngừng hoạt động"],
                   right=btn("Bộ lọc", "secondary", "sliders-horizontal", size="sm")),
        table(cols, rows, footer=pagination("1–4", 4)),
        banner("Tài xế ngừng hoạt động không chọn được khi tạo chuyến mới; chuyến và công nợ cũ vẫn giữ nguyên.", "info"),
        gap=16)
    return wm_shell("drivers", content, h=960)


# ---------------------------------------------------------------- WM-DRV-02
def drv_02():
    d = DRV_TAI
    profile = panel("Hồ sơ", dl([
        ("Họ tên", d["name"]), ("Điện thoại", num(d["phone"])), ("CCCD", num("092 088 012 345")),
        ("Ngày sinh", num("14/03/1988")), ("Địa chỉ", "Phường An Khánh, Ninh Kiều, Cần Thơ"), ("Liên hệ khẩn cấp", "Chị Lan (vợ) · 0939 456 789"),
        ("GPLX", "Hạng C · số 920123456789"), ("Hết hạn GPLX", num("12/05/2029")), ("Xe thường chạy", num("51C-123.45"))], cols=3),
        a("Sửa hồ sơ", "WM-DRV-03", "Sửa tài xế"))
    trips = []
    for t in D.TRIPS:
        if t[4] != d["name"]:
            continue
        w = badge(t[7], "warning" if "trùng" in (t[7] or "") else "danger") if t[7] else ""
        trips.append([col(code(t[0], to="WM-TRIP-01", trigger="Mở chuyến"), code(t[1], 12, to="WM-ORD-02", trigger="Mở đơn"), gap=0),
                      _two(t[2], t[3]), num(t[5]), row(status(t[6], "trip"), w, gap=4)])
    trips.append([col(code("CX-202609-0010", to="WM-TRIP-01", trigger="Mở chuyến"), code("DH-202609-0009", 12, to="WM-ORD-02", trigger="Mở đơn"), gap=0),
                  _two("Cần Thơ → Q. Bình Tân", "51C-123.45"), num("17/09 05:00 – 11:30"), status("Hoàn thành", "trip")])
    trip_tbl = panel("Lịch sử lái gần đây", table([("Chuyến · đơn", "left"), ("Tuyến · xe", "left"),
                                                   ("Thời gian", "left"), ("Trạng thái · cảnh báo", "left")], trips),
                     a("Xem lịch xe/tài xế", "WM-DISPATCH-02", "Mở lịch xe/tài xế"), body_pad=False)
    account = panel("Tài khoản app tài xế", col(
        row(badge("Đã kích hoạt", "success", "circle-check"), spacer(), subtle("Tạo 01/02/2026", 12), gap=8),
        dl([("Đăng nhập bằng", num(d["phone"])), ("Lần cuối", num("23/09/2026 09:05")), ("Thiết bị", "Android 14 · app v1.0.3"),
            ("Đồng bộ", "Đã đồng bộ · 10:42")], cols=2, gap=10),
        row(btn("Mời/đặt lại tài khoản app", "secondary", "key", size="sm"), btn("Khóa tài khoản", "ghost", "lock", size="sm"), gap=8),
        subtle("Đặt lại gửi lại lời mời qua SMS; phiên đăng nhập cũ bị đăng xuất.", 12), gap=10))
    salary = panel("Lương cố định", col(
        row(num(money(d["salary"]), 20, 700), badge("Hiện hành", "primary"), spacer(), subtle("từ 01/08/2026", 12), gap=8),
        row(muted("Mức trước"), spacer(), num("9.000.000 đ · 01/02 – 31/07/2026", 13), gap=8),
        row(muted("Bảng lương kỳ này"), spacer(), code("BL-202609-0001", to="WM-PAYROLL-02", trigger="Mở bảng lương"), status("Chờ duyệt", "fin"), gap=6),
        gap=8), a("Lịch sử lương", "WM-DRV-04", "Mở lịch sử lương cố định"))
    ledger = panel("Công nợ 2 chiều", col(
        row(muted("Công ty nợ tài xế"), spacer(), num(money(800_000), 14, 600, T["warning"]), gap=8),
        subtle("PC-202609-0001 · phí cầu đường tài xế chi trước", 12),
        row(muted("Tài xế giữ COD"), spacer(), num(money(0), 14, 400, T["text-muted"]), gap=8),
        row(muted("Tạm ứng chuyến chờ đối soát"), spacer(), num(money(2_000_000), 14, 600, T["info"]), gap=8),
        row(a("Đối soát tạm ứng", "WM-ADV-01", "Mở tạm ứng chuyến & đối soát"), spacer(),
            btn("Tạo phiếu chi hoàn ứng", "secondary", "hand-coins", size="sm", to="WM-EXP-03", trigger="Tạo phiếu chi hoàn ứng"), gap=8),
        gap=6), a("Sổ công nợ", "WM-DRV-05", "Mở sổ công nợ tài xế"))
    act = panel("Hoạt động gần đây", timeline([
        ("23/09 10:42", d["name"], "Báo sự cố <b>Kẹt xe</b> trên CX-202609-0001", None, "danger"),
        ("23/09 09:05", d["name"], "CX-202609-0001 → <b>Đang vận chuyển</b>", None, "accent"),
        ("28/07 10:15", "Trần Hải", "Lương cố định 9.000.000 đ → 10.000.000 đ từ 01/08/2026", "Tăng lương sau 6 tháng", "warning")]),
        a("Xem tất cả", "WM-SHELL-07", "Mở Timeline"))
    left = col(profile, trip_tbl, act, gap=16, extra="flex: 2; min-width: 0;")
    right = col(account, salary, ledger, gap=16, extra="flex: 1; min-width: 0;")
    return driver_detail(d, "Tổng quan", row(left, right, gap=16, align="flex-start"), 1200)


# ---------------------------------------------------------------- WM-DRV-03
def drv_03():
    d = DRV_TAI
    personal = _section(1, "Thông tin cá nhân", col(
        row(field("Họ tên", input_(d["name"]), True, width="35%"),
            field("Mã tài xế", input_(d["id"], disabled=True, mono=True), hint="Tự sinh", width="20%"),
            field("Điện thoại", input_(d["phone"], prefix_ic="phone", mono=True), True, hint="Duy nhất trong nhà xe; dùng đăng nhập app", width="25%"),
            field("Ngày sinh", date_input("14/03/1988"), width="20%"), gap=12, align="flex-start"),
        row(field("CCCD", input_("092 088 012 345", mono=True), width="25%"),
            field("Địa chỉ", input_("Phường An Khánh, Ninh Kiều, Cần Thơ"), width="45%"),
            field("Liên hệ khẩn cấp", input_("Chị Lan (vợ) · 0939 456 789"), width="30%"), gap=12, align="flex-start"), gap=14))
    lic = _section(2, "Giấy phép lái xe", row(
        col(row(field("Hạng", select("C"), width="25%"), field("Số GPLX", input_("920123456789", mono=True), width="40%"),
                field("Ngày hết hạn", date_input("12/05/2029"), width="35%"), gap=12),
            subtle("Không bắt buộc. Hệ thống nhắc trước 30 ngày khi sắp hết hạn.", 12), gap=8, extra="flex: 3;"),
        col(upload_zone("Ảnh GPLX 2 mặt —", 88), gap=0, extra="flex: 2;"), gap=16, align="flex-start"), sub="Nếu có")
    sal = _section(3, "Lương cố định", col(
        row(field("Lương cố định hiện hành", money_input(d["salary"]), True, width="30%"),
            field("Hiệu lực từ", date_input("01/08/2026"), True, width="25%"),
            field("Lý do thay đổi", input_("", "Bắt buộc khi đổi mức lương"), width="45%"), gap=12, align="flex-start"),
        banner("Đổi mức lương sẽ tạo <b>mốc mới</b> trong lịch sử lương, không ghi đè mức cũ. Bảng lương đã tạo giữ snapshot mức cũ.", "info",
               action=a("Xem lịch sử lương", "WM-DRV-04", "Mở lịch sử lương cố định")), gap=12))
    acc = _section(4, "Trạng thái & tài khoản app", row(
        field("Trạng thái", radio_cards([("Hoạt động", "Chọn được khi tạo chuyến"), ("Ngừng hoạt động", "Không chọn cho chuyến mới")], 0), width="50%"),
        col(switch(True, "Cho phép đăng nhập app tài xế", "Đăng nhập bằng số điện thoại ở trên"),
            row(badge("Đã kích hoạt", "success"), subtle("Lần cuối 23/09/2026 09:05", 12), spacer(),
                btn("Mời/đặt lại tài khoản app", "secondary", "key", size="sm"), gap=8), gap=12, extra="width: 50%;"),
        gap=16, align="flex-start"))
    content = col(
        page_header("Sửa tài xế", "Hồ sơ cá nhân, GPLX, lương cố định và tài khoản app",
                    row(btn("Hủy", "secondary", to="WM-DRV-02", trigger="Hủy → chi tiết tài xế"),
                        btn("Lưu tài xế", "primary", "check", to="WM-DRV-02", trigger="Lưu → chi tiết tài xế"), gap=8),
                    crumbs=[("Tài xế", "WM-DRV-01"), (d["name"], "WM-DRV-02"), ("Sửa", None)]),
        personal, lic, sal, acc, gap=14)
    return wm_shell("drivers", content, h=1120)


# ---------------------------------------------------------------- WM-DRV-04 Lịch sử lương cố định (tab Lương/ứng) + dialog
def _drv_04_body():
    hist = table([("Hiệu lực", "left"), ("Lương cố định", "right"), ("Thay đổi", "right"), ("Lý do", "left", "240px"),
                  ("Người sửa", "left"), ("Bảng lương dùng mức này", "left")],
                 [[col(row(num("01/08/2026 → nay", 13, 600), badge("Hiện hành", "primary"), gap=6), gap=0),
                   num(money(10_000_000), 13, 600), num("+1.000.000 đ", 13, 500, T["success"]), muted("Tăng lương sau 6 tháng"),
                   _two("Trần Hải", "28/07/2026 10:15"),
                   row(code("BL-202609-0001", to="WM-PAYROLL-02", trigger="Mở bảng lương"), code("BL-202608-0001", to="WM-PAYROLL-02", trigger="Mở bảng lương"), gap=6)],
                  [num("01/02/2026 → 31/07/2026"), num(money(9_000_000)), muted("—"), muted("Lương khởi điểm"),
                   _two("Trần Hải", "30/01/2026 16:40"),
                   row(code("BL-202607-0001", to="WM-PAYROLL-02", trigger="Mở bảng lương"), subtle("+ 5 kỳ trước", 12), gap=6)]], compact=True)
    left = panel("Lịch sử lương cố định", col(hist, gap=0),
                 btn("Thêm mốc lương", "secondary", "plus", size="sm"), body_pad=False,
                 sub="Mỗi mốc có ngày hiệu lực; kỳ lương lấy mức đang hiệu lực tại kỳ đó và lưu snapshot")
    pay = panel("Bảng lương theo kỳ", table(
        [("Kỳ", "left"), ("Lương CĐ (snapshot)", "right"), ("Thưởng · ứng", "right"), ("Thực lãnh", "right"), ("Trạng thái", "left")],
        [[code("BL-202609-0001", to="WM-PAYROLL-04", trigger="Mở dòng lương tài xế"), num(money(10_000_000)), col(num("+" + money(1_500_000)), num("−" + money(2_000_000)), gap=0, extra="align-items: flex-end;"), num(money(9_500_000), 13, 600), status("Chờ duyệt", "fin")],
         [code("BL-202608-0001", to="WM-PAYROLL-04", trigger="Mở dòng lương tài xế"), num(money(10_000_000)), col(num("+" + money(1_200_000)), num(money(0)), gap=0, extra="align-items: flex-end;"), num(money(11_200_000), 13, 600), status("Đã trả", "fin")],
         [code("BL-202607-0001", to="WM-PAYROLL-04", trigger="Mở dòng lương tài xế"), num(money(9_000_000)), col(num("+" + money(900_000)), num("−" + money(1_000_000)), gap=0, extra="align-items: flex-end;"), num(money(8_900_000), 13, 600), status("Đã trả", "fin")]], compact=True),
        a("Tất cả bảng lương", "WM-PAYROLL-01", "Mở danh sách bảng lương"), body_pad=False)
    adv = panel("Ứng trong kỳ T9/2026", col(table(
        [("Chứng từ · ngày", "left"), ("Loại", "left"), ("Số tiền", "right"), ("Trừ vào", "left")],
        [[col(code("PC-202609-0004", to="WM-EXP-02", trigger="Mở phiếu chi tạm ứng"), subtle("22/09/2026", 12), gap=0),
          _two("Tạm ứng chuyến", "CX-202609-0001"), num(money(2_000_000)), code("BL-202609-0001")]], compact=True),
        col(muted("Lương kỳ = lương cố định + thưởng theo đơn − ứng − giảm trừ. Không chấm công; giảm trừ do operation nhập kèm lý do.", 12),
            gap=0, extra="padding: 10px 16px;"), gap=0),
        a("Đối soát tạm ứng", "WM-ADV-01", "Mở tạm ứng chuyến & đối soát"), body_pad=False)
    return col(left, row(col(pay, gap=0, extra="flex: 6; min-width: 0;"), col(adv, gap=0, extra="flex: 5; min-width: 0;"), gap=16, align="flex-start"),
               gap=16)


def drv_04():
    body = col(
        row(field("Lương cố định mới", money_input(10_500_000), True, width="50%"), field("Hiệu lực từ", date_input("01/10/2026"), True, width="50%"), gap=12),
        diff("Lương cố định", money(10_000_000), money(10_500_000)),
        field("Lý do", textarea("Chuyển sang chạy xe mui bạt 15 tấn", h=56), True),
        banner("Kỳ cũ giữ mức cũ: <b>BL-202609-0001</b> (01/09 – 30/09/2026) vẫn tính 10.000.000 đ. Mức mới áp dụng từ kỳ T10/2026.", "info"),
        subtle("Ngày hiệu lực không được trùng hoặc trước mốc đang có của kỳ lương đã duyệt.", 12),
        gap=12)
    foot = btn("Hủy", "secondary") + btn("Lưu mốc lương", "primary", "check")
    return driver_detail(DRV_TAI, "Lương/ứng", _drv_04_body(), 1060,
                         overlay=(dialog("Thêm mốc lương", body, foot, 520, "Nguyễn Văn Tài · hiện hành 10.000.000 đ"), "center"))


# ---------------------------------------------------------------- WM-DRV-05 Sổ công nợ tài xế (tab Công nợ)
def drv_05():
    owe = panel("Công ty nợ tài xế", col(
        row(num(money(800_000), 22, 700, T["warning"]), spacer(),
            btn("Tạo phiếu chi hoàn ứng", "primary", "hand-coins", size="sm", to="WM-EXP-03", trigger="Tạo phiếu chi hoàn ứng"), gap=8),
        table([("Chứng từ", "left"), ("Khoản tài xế chi trước", "left"), ("Số tiền", "right"), ("Trạng thái", "left")],
              [[code("PC-202609-0001", to="WM-EXP-02", trigger="Mở phiếu chi"), _two("Phí cầu đường", "CX-202609-0001 · 23/09/2026"),
                num(money(800_000), 13, 600), status("Chưa trả", "fin")]], compact=True),
        subtle("Hoàn bất kỳ lúc nào, không chờ kỳ lương.", 12), gap=10), sub="Chi phí chuyến tài xế ứng trả, chưa hoàn",
        extra="flex: 1; min-width: 0;")
    held = panel("Tài xế đang giữ / nợ công ty", col(
        row(num(money(2_000_000), 22, 700, T["info"]), spacer(),
            btn("Ghi nhận nộp COD", "secondary", "receipt", size="sm", to="WM-PAY-03", trigger="Tạo phiếu thu tài xế nộp COD"), gap=8),
        table([("Khoản", "left"), ("Chi tiết", "left"), ("Số tiền", "right"), ("Xử lý", "left")],
              [[text("COD chưa nộp", 13, 500), a("Không có COD đang giữ", "WM-DRV-06", "Mở COD tài xế đang giữ", 12, 500), num(money(0), color=T["text-muted"]), muted("—")],
               [text("Tạm ứng chuyến", 13, 500), row(code("PC-202609-0004", to="WM-EXP-02", trigger="Mở phiếu chi tạm ứng"), subtle("22/09", 12), gap=6),
                num(money(2_000_000), 13, 600), a("Đối soát", "WM-ADV-01", "Mở đối soát tạm ứng")],
               [text("Ứng lương", 13, 500), muted("Trừ vào BL-202609-0001", 12), num(money(0), color=T["text-muted"]), muted("—")]], compact=True),
        subtle("Tiền tài xế nộp lại là thu hồi phải thu, không phải doanh thu.", 12), gap=10), sub="COD chưa nộp, tạm ứng/ứng lương chưa trừ",
        extra="flex: 1; min-width: 0;")
    net = banner("Chênh lệch ròng (tham khảo): <b>tài xế nợ công ty 1.200.000 đ</b>. Hai chiều được tất toán riêng — hoàn ứng bằng phiếu chi, COD bằng phiếu thu, tạm ứng qua đối soát/bảng lương.", "info")
    L = [  # date, doc, doc_target, desc, company_owes(+), driver_owes(+), balance(+ = company owes), status
        ("26/08/2026", "PC-202608-0011", "WM-EXP-02", "Phí bốc xếp tài xế chi trước · CX-202608-0014", 350_000, 0, 350_000, status("Đã trả", "fin")),
        ("28/08/2026", "PC-202608-0016", "WM-EXP-02", "Hoàn ứng phí bốc xếp cho tài xế", -350_000, 0, 0, badge("Đối soát", "success")),
        ("22/09/2026", "PC-202609-0004", "WM-EXP-02", "Tạm ứng chuyến CX-202609-0001", 0, 2_000_000, -2_000_000, badge("Chờ đối soát", "info")),
        ("23/09/2026", "PC-202609-0001", "WM-EXP-02", "Phí cầu đường tài xế chi trước · CX-202609-0001", 800_000, 0, -1_200_000, status("Chưa trả", "fin")),
    ]
    rows = []
    for dt, doc, tgt, desc, co, dr, bal, stt in L:
        bal_txt = ("Cân bằng" if bal == 0 else (f"Công ty nợ {money(bal)}" if bal > 0 else f"Tài xế nợ {money(-bal)}"))
        rows.append([num(dt), code(doc, to=tgt, trigger="Mở chứng từ"), text(desc, 13),
                     num(money(co, sign=True) if co else "—", color=T["warning"] if co > 0 else (T["success"] if co < 0 else T["text-muted"])),
                     num(money(dr, sign=True) if dr else "—", color=T["info"] if dr else T["text-muted"]),
                     num(bal_txt, 13, 600), stt])
    ledger = panel("Sổ chi tiết & lịch sử đối soát", table(
        [("Ngày", "left"), ("Chứng từ", "left"), ("Diễn giải", "left"), ("Công ty nợ TX", "right"), ("TX nợ công ty", "right"),
         ("Số dư ròng", "right"), ("Trạng thái", "left")], rows, compact=True),
        row(muted("01/08 – 23/09/2026", 12), btn("Xuất Excel", "ghost", "download", size="sm", to="WM-SHELL-05", trigger="Xuất sổ công nợ tài xế"), gap=8),
        body_pad=False)
    body = col(row(_ledger_nav(0), spacer(), a("Tất cả COD tài xế", "WM-COD-01", "Mở COD tài xế (tài chính)"), gap=8),
               row(owe, held, gap=16, align="stretch"), net, ledger, gap=16)
    return driver_detail(DRV_TAI, "Công nợ", body, 1180)


# ---------------------------------------------------------------- WM-DRV-06 COD tài xế đang giữ (tab Công nợ › COD)
def drv_06():
    d = DRV_LAI
    rows = [
        [num("20/09/2026 15:10"), col(code("DH-202609-0008", to="WM-ORD-02", trigger="Mở đơn"), code("CX-202609-0008", 12, to="WM-TRIP-01", trigger="Mở chuyến"), gap=0),
         col(a("Điểm 2 · Vật tư Hòa Bình", "WM-STOP-01", "Mở điểm dừng", 13, 500), muted("Q. 12, TP.HCM", 12), gap=0),
         num(money(3_500_000)), num(money(3_500_000)), num(money(0), color=T["text-muted"]), num(money(3_500_000), 13, 600, T["danger"]),
         badge("3 ngày", "danger", "alarm-clock")],
        [num("20/09/2026 17:30"), col(code("DH-202609-0008", to="WM-ORD-02", trigger="Mở đơn"), code("CX-202609-0008", 12, to="WM-TRIP-01", trigger="Mở chuyến"), gap=0),
         col(a("Điểm 3 · Cửa hàng Tân Phát", "WM-STOP-01", "Mở điểm dừng", 13, 500), muted("Hóc Môn, TP.HCM", 12), gap=0),
         num(money(2_000_000)), num(money(2_000_000)), num(money(0), color=T["text-muted"]), num(money(2_000_000), 13, 600, T["danger"]),
         badge("3 ngày", "danger", "alarm-clock")],
        [num("19/09/2026 16:40"), col(code("DH-202609-0007", to="WM-ORD-02", trigger="Mở đơn"), code("CX-202609-0007", 12, to="WM-TRIP-01", trigger="Mở chuyến"), gap=0),
         col(a("Điểm 2 · Đại lý Minh Châu", "WM-STOP-01", "Mở điểm dừng", 13, 500), muted("Dĩ An, Bình Dương", 12), gap=0),
         num(money(2_000_000)), num(money(2_000_000)), num(money(2_000_000), color=T["success"]), num(money(0), color=T["text-muted"]),
         badge("Đã nộp", "success")],
    ]
    tbl = table([("Ngày thu", "left"), ("Đơn · Chuyến", "left"), ("Điểm dừng", "left"), ("COD dự kiến", "right"), ("COD thực thu", "right"),
                 ("Đã nộp", "right"), ("Đang giữ", "right"), ("Tuổi", "left")], rows, checkbox_col=True, selected=[0, 1],
                total_row=["", "Tổng", "", money(7_500_000), money(7_500_000), money(2_000_000), money(5_500_000), ""])
    action_bar = row(checkbox("", True), text("Đã chọn 2 mục · 5.500.000 đ", 14, 600), spacer(),
                     btn("Xuất Excel", "secondary", "download", size="sm", to="WM-SHELL-05", trigger="Xuất COD tài xế"),
                     btn("Ghi nhận nộp COD", "primary", "receipt", size="sm", to="WM-PAY-03", trigger="Tạo phiếu thu COD nộp lại (2 mục)"),
                     gap=10, extra=f"padding: 8px 12px; background: {T['accent-soft']}; border: 1px solid {T['border']}; border-radius: 6px;")
    remit = panel("Lịch sử nộp COD", table(
        [("Ngày", "left"), ("Phiếu thu", "left"), ("Hình thức", "left"), ("Số tiền", "right"), ("Cho", "left"), ("Người nhận", "left")],
        [[num("21/09/2026"), code("PT-202609-0003", to="WM-PAY-02", trigger="Mở phiếu thu COD"), muted("Tiền mặt"),
          num(money(2_000_000), 13, 600), code("DH-202609-0007"), muted("Phan Ngọc Mai")]], compact=True),
        body_pad=False, sub="Loại phiếu thu: Tài xế nộp COD — thu hồi phải thu, không phải doanh thu")
    body = col(
        row(_ledger_nav(1), spacer(), filter_bar("Tìm mã đơn, chuyến…", ["Đang giữ", "Đã nộp", "Tất cả"], date="01/09 – 23/09/2026"), gap=12,
            extra="align-items: center;"),
        warning_panel("COD đang giữ vượt ngưỡng cảnh báo",
                      ["Đang giữ 5.500.000 đ > ngưỡng 5.000.000 đ", "2 khoản giữ quá 2 ngày (thu 20/09/2026)"],
                      a("Cài đặt ngưỡng cảnh báo", "WM-SET-01", "Mở cài đặt vận hành"), "danger"),
        action_bar, tbl,
        row(col(remit, gap=0, extra="flex: 1; min-width: 0;"), panel("Cách tính", col(
            row(muted("COD thực thu"), spacer(), num(money(7_500_000), 13), gap=8),
            row(muted("Đã nộp (phiếu thu)"), spacer(), num("−" + money(2_000_000), 13), gap=8), divider(),
            row(text("Đang giữ", 14, 600), spacer(), num(money(5_500_000), 16, 700, T["danger"]), gap=8),
            a("Xem tất cả COD tài xế", "WM-COD-01", "Mở COD tài xế (tài chính)"), gap=8), extra="width: 320px; flex-shrink: 0;"),
            gap=16, align="flex-start"),
        gap=14)
    return driver_detail(d, "Công nợ", body, 1180)


# ---------------------------------------------------------------- registry
C = dict(platform="wm", roles=ROLES_ALL)
CK = dict(module="Khách hàng", **C)
DK = dict(module="Tài xế", **C)
register(
    Screen(id="WM-CUS-01", name="Danh sách khách hàng", route="/customers", render=cus_01, pattern="list", h=960, **CK,
           purpose="Tìm/lọc khách, theo dõi công nợ, số dư, hạn mức và cảnh báo; điểm vào tạo khách, import, tạo đơn nhanh.",
           api=["customers(filter, sort, first, after)"],
           data=["code", "name", "phone", "taxCode", "debtSummary{remaining, overdue, overdueDays}", "creditBalance", "creditLimit",
                 "limitUsagePct", "defaultDebtDays", "orderCount", "warnings[]", "isActive"],
           actions=[("Tạo khách hàng", "customer.create (admin/operation/accountant)"), ("Import", "customer.create → WM-SHELL-04"),
                    ("Xuất Excel", "customer.view"), ("Row menu: Tạo đơn", "order.create → WM-ORD-03 prefill customerId"),
                    ("Row menu: Ghi nhận thanh toán", "payment.create"), ("Row menu: Ngừng hoạt động", "customer.deactivate — sensitive nếu có đơn (admin; operation nếu được cấp)")],
           states={"loading": "DataTable skeleton rows", "empty": "EmptyState 'Chưa có khách hàng' + Tạo khách hàng / Import từ Excel",
                   "error": "Banner danger 'Không tải được danh sách khách' + Thử lại", "filtered-empty": "Không có khách khớp bộ lọc + Xóa bộ lọc"},
           notes=["Search theo tên/SĐT/MST/mã; chip lọc: còn nợ, quá hạn, vượt hạn mức, có số dư, ngừng hoạt động.",
                  "Cột hạn mức: số hạn mức + thanh % đã dùng (≥80% warning, >100% danger). Vượt hạn mức chỉ cảnh báo, không chặn tạo đơn.",
                  "Khách ngừng hoạt động hiển thị mờ, không chọn được khi tạo đơn mới.",
                  "KPI Tổng còn nợ/Quá hạn mở WM-DEBT-01."]),
    Screen(id="WM-CUS-02", name="Chi tiết khách hàng", route="/customers/:customerId", render=cus_02, pattern="detail", h=1280, **CK,
           purpose="Toàn bộ quan hệ với một khách: hồ sơ, đơn, công nợ, số dư, địa chỉ/liên hệ, bảng kê, chứng từ, timeline.",
           api=["customer(id){locations, debtSummary, creditBalance}", "orders(filter:{customerId}, first: 5)", "debtStatements(filter:{customerId})",
                "activityLogs(entityType: CUSTOMER, entityId)"],
           data=["name", "legalName", "type", "taxCode", "phone", "invoiceEmail", "primaryContact", "billingAddress", "creditLimit",
                 "defaultDebtDays", "debtSummary", "creditBalance", "recentOrders[]", "locations[]", "statements[]"],
           actions=[("Tạo đơn", "order.create"), ("Ghi nhận thanh toán", "payment.create (admin/accountant; operation ⚠️)"),
                    ("Sửa", "customer.update"), ("Tạo bảng kê", "debtStatement.create (admin/accountant)"),
                    ("Ngừng hoạt động", "customer.deactivate — sensitive (WM-SHELL-08)"), ("Timeline", "customer.view")],
           states={"loading": "Skeleton header + tabs", "error": "Không tìm thấy khách / không có quyền → EmptyState + về danh sách"},
           notes=["Tabs dùng ?tab= (overview|orders|debt|credit|locations|statements|attachments|timeline).",
                  "Tab Số dư: danh sách phiếu thu còn tiền chưa phân bổ (dùng lại bảng lịch sử ở WM-CUS-05, lọc unallocated>0).",
                  "Tab Bảng kê: danh sách WM-DEBT-03 lọc theo khách; Chứng từ: AttachmentList → WM-SHELL-06.",
                  "Header warning quá hạn lấy từ debtSummary.overdueDays lớn nhất."]),
    Screen(id="WM-CUS-03", name="Form khách hàng", route="/customers/new · /customers/:customerId/edit", render=cus_03, pattern="form", h=1300, **CK,
           purpose="Tạo/sửa khách: loại khách, pháp lý/xuất hóa đơn, liên hệ chính, hạn mức nợ, số ngày công nợ mặc định, trạng thái.",
           api=["createCustomer(input)", "updateCustomer(id, input)", "deactivateCustomer(id, reason)"],
           data=["type(COMPANY|INDIVIDUAL)", "name", "code(auto)", "taxCode", "phone", "email", "group", "legalName", "billingAddress",
                 "invoiceEmail", "primaryContact{name, role, phone, zalo}", "creditLimit?", "defaultDebtDays", "isActive", "note"],
           actions=[("Lưu khách hàng", "customer.create | customer.update → WM-CUS-02"), ("Hủy", "→ WM-CUS-02 (sửa) / WM-CUS-01 (tạo)")],
           states={"validation": "Tên, SĐT, số ngày công nợ bắt buộc; SĐT/MST trùng trong merchant → lỗi inline + link khách đã có",
                   "saving": "Nút Lưu loading, khóa form"},
           notes=["react-hook-form + zod; MoneyInput số nguyên VND; hạn mức để trống = không giới hạn.",
                  "Số ngày công nợ mặc định lấy từ cài đặt merchant (seed: 15) khi tạo mới.",
                  "Chuyển sang Ngừng hoạt động khi khách đã có đơn → SensitiveActionModal (lý do bắt buộc).",
                  "Tạo mới: tiêu đề 'Tạo khách hàng', breadcrumb Khách hàng › Tạo; lưu xong mở chi tiết."]),
    Screen(id="WM-CUS-04", name="Sổ địa chỉ/liên hệ", route="/customers/:customerId/locations (tab)", render=cus_04, pattern="detail", h=1000, **CK,
           purpose="Kho/địa chỉ thường dùng của khách kèm người liên hệ, tọa độ, ghi chú; chọn nhanh ở form đơn (WM-ORD-03).",
           api=["customer(id){locations{contacts}}", "createCustomerLocation(customerId, input)", "updateCustomerLocation(id, input)",
                "deleteCustomerLocation(id)"],
           data=["name", "usage[PICKUP|DROPOFF|DOCUMENTS]", "address", "province", "lat?", "lng?", "contacts[{name, role, phone}]", "note", "usedInOrders"],
           actions=[("Thêm địa chỉ", "customer.update → Drawer"), ("Sửa địa chỉ (drawer)", "customer.update"),
                    ("Xóa địa chỉ", "customer.update — nếu đã dùng trong đơn: SensitiveActionModal, chỉ ẩn khỏi picker")],
           states={"empty": "EmptyState 'Chưa có địa chỉ' + Thêm địa chỉ", "validation": "Tên + địa chỉ bắt buộc; tọa độ không bắt buộc"},
           notes=["Drawer phải 520px; map picker không bắt buộc (kéo ghim cập nhật lat/lng).",
                  "Đơn lưu snapshot địa chỉ/liên hệ: sửa sổ địa chỉ không đổi đơn cũ.",
                  "WM-ORD-03 dùng customerLocations(customerId) cho picker 'Chọn từ sổ địa chỉ'."]),
    Screen(id="WM-CUS-05", name="Công nợ khách", route="/customers/:customerId?tab=debt", render=cus_05, pattern="detail", h=1120, **CK,
           purpose="Tổng nợ, quá hạn, số dư, tuổi nợ, đơn còn nợ (DueIndicator), lịch sử phiếu thu/phân bổ; ghi nhận thanh toán, phân bổ, tạo bảng kê.",
           api=["customerDebt(filter:{customerId})", "payments(filter:{customerId})", "customer(id){creditBalance, creditLimit}"],
           data=["orderDate", "orderCode", "routeSummary", "totalAmount", "allocatedAmount", "remainingAmount", "dueDate", "overdueDays",
                 "statementCode", "aging{current, d1_15, d16_30, d30plus}", "payments[{code, date, method, amount, allocations[], unallocated, status}]"],
           actions=[("Ghi nhận thanh toán", "payment.create → WM-PAY-03 (prefill khách)"), ("Phân bổ", "payment.allocate (admin/accountant) → WM-PAY-04"),
                    ("Tạo bảng kê", "debtStatement.create (admin/accountant) → WM-DEBT-03"), ("Xuất Excel", "customer.debt.view")],
           states={"empty": "Không còn nợ → EmptyState 'Khách không còn công nợ' + lịch sử thanh toán vẫn hiện",
                   "loading": "Skeleton bảng"},
           notes=["Còn nợ = tổng thu khách − tổng phân bổ; overdueDays = hôm nay − dueDate khi còn nợ.",
                  "Số dư khách = tổng phiếu thu − tổng phân bổ; không tự trừ vào đơn.",
                  "Chọn nhiều đơn (checkbox) → Tạo bảng kê / Phân bổ với các đơn đã chọn.",
                  "Doanh thu ≠ phiếu thu: màn này chỉ hiện công nợ và dòng tiền phân bổ."]),
    Screen(id="WM-CUS-06", name="Lịch sử đơn khách", route="/customers/:customerId?tab=orders", render=cus_06, pattern="detail", h=1180, **CK,
           purpose="Danh sách đơn theo khách với tổng tiền/đã thu/còn lại; lọc thời gian/trạng thái.",
           api=["orders(filter:{customerId, dateRange, status}, sort, first, after)", "orderTotals(filter)"],
           data=["code", "orderDate", "routeSummary", "status", "totalAmount", "paidAmount", "remainingAmount", "dueDate", "overdueDays"],
           actions=[("Mở đơn", "order.view → WM-ORD-02"), ("Tạo đơn", "order.create → WM-ORD-03"), ("Xuất Excel", "order.view")],
           states={"empty": "Khách chưa có đơn → EmptyState + Tạo đơn", "filtered-empty": "Không có đơn trong khoảng thời gian"},
           notes=["Tổng (KPI + total row) tính trên toàn bộ kết quả lọc từ server, không cộng trang hiện tại.", "Đơn đã hủy tổng thu = 0."]),

    Screen(id="WM-DRV-01", name="Danh sách tài xế", route="/drivers", render=drv_01, pattern="list", h=960, **DK,
           purpose="Tìm/lọc tài xế; thấy trạng thái, xe/chuyến hiện tại, tài khoản app, COD đang giữ và công nợ 2 chiều.",
           api=["drivers(filter, sort, first, after){currentTrip, appAccount, ledgerSummary{codHeld, companyOwes, driverOwes}}"],
           data=["code", "name", "phone", "status", "currentTrip{code, status, vehiclePlate, route}", "appAccountStatus", "fixedSalary",
                 "codHeld", "codOverThreshold", "companyOwesDriver", "driverOwesCompany"],
           actions=[("Thêm tài xế", "driver.create (admin/operation)"), ("Import", "driver.create → WM-SHELL-04"), ("Xuất Excel", "driver.view")],
           states={"loading": "DataTable skeleton", "empty": "EmptyState 'Chưa có tài xế' + Thêm tài xế / Import",
                   "error": "Banner danger + Thử lại"},
           notes=["Tài xế ngừng hoạt động (DRV-A-003) hiển thị mờ; không chọn được ở WM-TRIP-02.",
                  "COD đang giữ vượt ngưỡng (merchant setting: 5.000.000 đ hoặc 2 ngày) → badge danger.",
                  "Kế toán xem được, không có nút Thêm (driver.create chỉ admin/operation)."]),
    Screen(id="WM-DRV-02", name="Chi tiết tài xế", route="/drivers/:driverId", render=drv_02, pattern="detail", h=1200, **DK,
           purpose="Quản lý tài xế end-to-end: hồ sơ, tài khoản app, lương cố định, lịch sử lái, công nợ, bảng lương, chứng từ, timeline.",
           api=["driver(id){salaryHistory, appAccount, currentTrip}", "trips(filter:{driverId}, first: 5)", "driverLedger(driverId)",
                "createOrResetDriverAccount(driverId)", "activityLogs(entityType: DRIVER, entityId)"],
           data=["profile{name, phone, idNumber, dob, address, emergencyContact}", "license{class, number, expiresAt}", "appAccount{status, lastLoginAt, device}",
                 "currentSalary", "recentTrips[]", "ledgerSummary", "currentPayroll"],
           actions=[("Sửa", "driver.update (admin/operation)"), ("Mời/đặt lại tài khoản app", "driver.account.reset (admin/operation) — confirm dialog"),
                    ("Tạo phiếu chi hoàn ứng", "expense.create → WM-EXP-03"), ("Ngừng hoạt động", "driver.update — sensitive"),
                    ("Timeline", "driver.view")],
           states={"loading": "Skeleton header + tabs", "error": "Không tìm thấy tài xế → EmptyState + về danh sách"},
           notes=["Tabs ?tab= (overview|trips|ledger|salary|attachments|timeline).",
                  "Primary action đổi theo dữ liệu: giữ COD → 'Ghi nhận nộp COD'; công ty nợ → 'Tạo phiếu chi hoàn ứng'.",
                  "Phương thức đăng nhập app phụ thuộc quyết định driver auth (P0-001); UI chỉ hiện trạng thái + mời/đặt lại."]),
    Screen(id="WM-DRV-03", name="Form tài xế", route="/drivers/new · /drivers/:driverId/edit", render=drv_03, pattern="form", h=1120, **DK,
           purpose="Tạo/sửa tài xế: thông tin cá nhân, GPLX (nếu có), lương cố định + ngày hiệu lực, trạng thái, tài khoản app.",
           api=["createDriver(input)", "updateDriver(id, input)", "addDriverSalaryHistory(driverId, input)", "createOrResetDriverAccount(driverId)"],
           data=["name", "phone", "code(auto)", "dob", "idNumber", "address", "emergencyContact", "license{class, number, expiresAt, photos[]}",
                 "fixedSalary", "salaryEffectiveFrom", "salaryReason", "status", "appLoginEnabled"],
           actions=[("Lưu tài xế", "driver.create | driver.update → WM-DRV-02"), ("Mời/đặt lại tài khoản app", "driver.account.reset")],
           states={"validation": "Họ tên, SĐT bắt buộc; SĐT trùng trong merchant → lỗi inline; đổi lương mà thiếu lý do → lỗi inline",
                   "saving": "Nút Lưu loading"},
           notes=["Đổi lương trong form = addDriverSalaryHistory (mốc mới), không update đè.",
                  "Quản lý lịch sử lương: admin; operation nếu được cấp (⚠️).",
                  "Tạo mới: lương cố định + hiệu lực từ ngày vào làm."]),
    Screen(id="WM-DRV-04", name="Lịch sử lương cố định", route="/drivers/:driverId/salary-history (tab Lương/ứng)", render=drv_04, pattern="detail",
           h=1060, **DK,
           purpose="Các mốc lương cố định theo ngày hiệu lực, người sửa, lý do; thêm mốc lương mới mà kỳ cũ vẫn tính đúng.",
           api=["driver(id){salaryHistory}", "addDriverSalaryHistory(driverId, input{amount, effectiveFrom, reason})",
                "payrolls(filter:{driverId})"],
           data=["effectiveFrom", "effectiveTo", "amount", "delta", "reason", "createdBy", "createdAt", "payrollsUsing[]",
                 "payrollLines[{payrollCode, salarySnapshot, bonus, advances, net, status}]"],
           actions=[("Thêm mốc lương (dialog)", "driver.salary.manage (admin; operation ⚠️)")],
           states={"validation": "Số tiền > 0; ngày hiệu lực bắt buộc, không trùng mốc đã có; lý do bắt buộc",
                   "empty": "Chưa có mốc lương → EmptyState + Thêm mốc lương"},
           notes=["Payroll lấy lương cố định theo mốc hiệu lực trong kỳ và lưu snapshot vào dòng lương; thêm mốc mới không tính lại bảng lương đã tạo.",
                  "Quy tắc khi mốc rơi giữa kỳ (vd ngày 15) cần chốt cùng payroll; acceptance: kỳ trước không đổi.",
                  "Dialog hiện diff trước/sau và kỳ lương bị ảnh hưởng."]),
    Screen(id="WM-DRV-05", name="Sổ công nợ tài xế", route="/drivers/:driverId?tab=ledger", render=drv_05, pattern="detail", h=1180, **DK,
           purpose="Sổ đối chiếu 2 chiều: công ty nợ tài xế (chi phí tài xế ứng trả) và tài xế giữ/nợ công ty (COD chưa nộp, tạm ứng, ứng lương) + lịch sử đối soát.",
           api=["driverLedger(driverId)", "expenses(filter:{driverId, paidBy: DRIVER})", "payments(filter:{driverId, type: DRIVER_COD_REMITTANCE})"],
           data=["companyOwesDriver", "reimbursableExpenses[]", "codHeld", "tripAdvances[]", "wageAdvances[]", "entries[{date, docCode, description, companyOwes, driverOwes, runningBalance, status}]"],
           actions=[("Tạo phiếu chi hoàn ứng", "expense.create → WM-EXP-03 (prefill tài xế + khoản chưa hoàn)"),
                    ("Ghi nhận nộp COD", "payment.create DRIVER_COD_REMITTANCE (admin/accountant) → WM-PAY-03"),
                    ("Đối soát tạm ứng", "→ WM-ADV-01"), ("Xuất Excel", "driver.ledger.view")],
           states={"empty": "Không có phát sinh → 'Công nợ tài xế đang cân bằng'"},
           notes=["Hoàn ứng không chờ kỳ lương: tạo phiếu chi bất kỳ lúc nào.",
                  "COD tài xế nộp là thu hồi phải thu, không phải doanh thu.",
                  "Số dư ròng chỉ tham khảo; hai chiều tất toán bằng chứng từ riêng."]),
    Screen(id="WM-DRV-06", name="COD tài xế đang giữ", route="/drivers/:driverId?tab=ledger&view=cod", render=drv_06, pattern="detail", h=1180, **DK,
           purpose="COD tài xế đang giữ theo điểm dừng/đơn/chuyến, tuổi nợ, cảnh báo vượt ngưỡng; chọn mục để ghi nhận tài xế nộp COD.",
           api=["driverCodHeld(filter:{driverId, status})", "payments(filter:{driverId, type: DRIVER_COD_REMITTANCE})"],
           data=["collectedAt", "orderCode", "tripCode", "stop{sequence, name, address}", "codExpected", "codActual", "remitted", "held", "ageDays",
                 "thresholds{amount: 5000000, days: 2}"],
           actions=[("Ghi nhận nộp COD", "payment.create DRIVER_COD_REMITTANCE (admin/accountant) → WM-PAY-03 prefill các mục đã chọn"),
                    ("Xuất Excel", "driver.ledger.view")],
           states={"empty": "Không giữ COD → EmptyState 'Tài xế không giữ COD'", "loading": "Skeleton bảng"},
           notes=["COD held = Σ stop.codActual − Σ phiếu thu DRIVER_COD_REMITTANCE.",
                  "Cảnh báo khi tổng giữ > ngưỡng tiền hoặc khoản giữ quá ngưỡng ngày (WM-SET-01).",
                  "Operation xem được nhưng không ghi nhận nộp COD (nút ẩn)."]),
)
