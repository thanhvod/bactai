"""Web Merchant — Đơn hàng (WM-ORD-01 … WM-ORD-09)."""
from .. import data as D
from ..core import Screen, register
from ..shells import wm_shell
from ..ui import *  # noqa: F401,F403

ROLES_ALL = ["admin", "operation", "accountant"]
ORDER_TABS = ["Tổng quan", "Điểm dừng", "Hàng hóa", "Chuyến", "Tài chính", "Sự cố", "Chứng từ", "Timeline"]
ORDER_TAB_LINKS = {"Tổng quan": "WM-ORD-02", "Điểm dừng": "WM-ORD-04", "Hàng hóa": "WM-ORD-05", "Tài chính": "WM-ORD-07"}


# ---------------------------------------------------------------- shared order detail frame
def order_header(code="DH-202609-0001"):
    """EntityHeader for DH-202609-0001 (seed Order 1)."""
    use("EntityHeader")
    actions = row(
        btn("Timeline", "secondary", "history", to="WM-SHELL-07", trigger="Mở Timeline drawer"),
        btn("In phiếu", "secondary", "printer", to="WM-ORD-09", trigger="In/chia sẻ đơn"),
        btn("Sửa", "secondary", "pencil", to="WM-ORD-03", trigger="Sửa đơn"),
        btn("Tạo chuyến", "primary", "plus", to="WM-TRIP-02", trigger="Tạo chuyến từ đơn"),
        icon_btn("ellipsis", "Thao tác khác", to="WM-ORD-08", trigger="Menu: Hủy đơn / sửa giá (sensitive)"),
        gap=8)
    head = row(
        col(row(h("display", code), status("Đang thực hiện"), badge("Có sự cố", "danger", "triangle-alert"), gap=10),
            row(a("Công ty Gạo Miền Tây", "WM-CUS-02", "Mở khách hàng", 14), muted("·"), text("Kho Cần Thơ → Kho Bình Dương", 14, extra="white-space: nowrap;"), gap=8),
            subtle("Tạo 20/09/2026 bởi Lê Thu Vân · Cập nhật 23/09/2026 10:42", 12), gap=4),
        spacer(), actions, align="flex-start")
    strip = summary_strip([("Tổng thu khách", money(12_500_000)), ("Đã thu (phân bổ)", money(0), "success"),
                           ("Còn nợ", money(12_500_000), "warning"), ("Hạn thanh toán", "08/10/2026"),
                           ("COD dự kiến", money(12_500_000)), ("Lãi/lỗ tạm tính", money(11_700_000), "success")])
    return col(breadcrumb([("Đơn hàng", "WM-ORD-01"), (code, None)]), head, strip, gap=12)


def order_detail(active_tab, body, h_=1080, overlay=None):
    content = col(order_header(), tabs(ORDER_TABS, ORDER_TABS.index(active_tab), ORDER_TAB_LINKS,
                                       counts={"Điểm dừng": 2, "Chuyến": 1, "Sự cố": 1, "Chứng từ": 3}), body, gap=16)
    return wm_shell("orders", content, h=h_, overlay=overlay)


# ---------------------------------------------------------------- WM-ORD-01
def ord_01():
    cols = [("Mã đơn", "left", "140px"), ("Khách hàng · Tuyến", "left"), ("Trạng thái", "left"),
            ("Tổng thu", "right"), ("Đã thu", "right"), ("Còn nợ", "right"), ("Hạn thanh toán", "left"), ("Cảnh báo", "left"), ("", "right", "44px")]
    rows = []
    for c, cus, route, stt, tot, paid, due_, od, warn in D.ORDERS:
        remain = tot - paid
        warn_b = ""
        if warn == "Quá hạn":
            warn_b = badge(f"Quá hạn {od} ngày", "danger", "alarm-clock")
        elif warn == "Có sự cố":
            warn_b = badge("Có sự cố", "danger", "triangle-alert")
        elif warn:
            warn_b = badge(warn, "warning")
        target = "WM-ORD-02" if c == "DH-202609-0001" else "WM-ORD-02"
        rows.append([code(c, to=target, trigger="Click mã đơn → chi tiết"), col(text(cus, 13, 500), muted(route, 12), gap=0), status(stt),
                     num(money(tot)), num(money(paid), color=T["success"] if paid else None),
                     num(money(remain), weight=600 if remain else 400, color=T["warning"] if remain else T["text-muted"]),
                     num(due_), warn_b, row_menu()])
    content = col(
        page_header("Đơn hàng", "Tìm kiếm, lọc và theo dõi trạng thái đơn",
                    row(btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất Excel"),
                        btn("Tạo đơn", "primary", "plus", to="WM-ORD-03", trigger="Tạo đơn"), gap=8)),
        filter_bar("Tìm mã đơn, khách, tuyến…", ["Tất cả", "Hôm nay", "Đang thực hiện", "Chưa xếp xe", "Còn nợ", "Quá hạn", "Có sự cố"],
                   right=btn("Bộ lọc", "secondary", "sliders-horizontal", size="sm"), date="01/09 – 30/09/2026"),
        table(cols, rows, footer=pagination("1–10", 128), checkbox_col=True),
        gap=16)
    return wm_shell("orders", content)


# ---------------------------------------------------------------- WM-ORD-02
def ord_02():
    stops = table([("#", "left", "36px"), ("Loại", "left"), ("Địa điểm", "left"), ("Liên hệ", "left"), ("COD dự kiến", "right"), ("Trạng thái", "left")],
                  [[muted("1"), badge("Lấy", "info", "package-check"), col(text("Kho Cần Thơ", 13, 600), muted("KCN Trà Nóc 1, Bình Thủy", 12), gap=0),
                    muted("Anh Nam · 0901 234 567"), muted("—"), badge("Hoàn thành", "success")],
                   [muted("2"), badge("Trả", "primary", "map-pin"), col(text("Kho Bình Dương", 13, 600), muted("Số 12 ĐT743, Dĩ An", 12), gap=0),
                    muted("Chị Hạnh · 0902 345 678"), num(money(12_500_000), weight=600), badge("Chưa đến", "neutral")]], compact=True)
    trip = table([("Mã chuyến", "left"), ("Xe", "left"), ("Tài xế", "left"), ("Dự kiến", "left"), ("Trạng thái", "left")],
                 [[code("CX-202609-0001", to="WM-TRIP-01", trigger="Mở chuyến"), num("51C-123.45"), a("Nguyễn Văn Tài", "WM-DRV-02", "Mở tài xế"),
                   num("23/09 06:00 – 14:00"), status("Đang vận chuyển", "trip")]], compact=True)
    left = col(
        panel("Điểm lấy/trả", stops, a("Quản lý điểm dừng", "WM-ORD-04"), body_pad=False),
        panel("Chuyến", trip, a("Xem điều phối", "WM-DISPATCH-01", "Mở bảng điều phối"), body_pad=False),
        panel("Hàng hóa", dl([("Tên hàng", "Gạo ST25 bao 50 kg"), ("Số lượng", num("160 bao · 8 tấn")),
                              ("Tính chất", "Tránh ẩm"), ("Ghi chú", "Bốc xếp tại kho, có xe nâng")], cols=4)),
        gap=16, extra="flex: 2; min-width: 0;")
    right = col(
        panel("Khách hàng", partner_card("Công ty Gạo Miền Tây", "CUS-A-001", [("Còn nợ", money(27_500_000)), ("Quá hạn", money(15_000_000)),
                                                                              ("Hạn mức", money(100_000_000))], to="WM-CUS-02")),
        panel("Sự cố mở", col(row(badge("Trung bình", "warning"), text("Kẹt xe QL1A đoạn Tân An", 13, 600), gap=8),
                              muted("Báo từ app tài xế · 23/09 10:42", 12), a("Xem sự cố", "WM-INC-01"), gap=6)),
        panel("Hoạt động gần đây", timeline([("10:42", "Nguyễn Văn Tài", "Báo sự cố <b>Kẹt xe</b>", None, "danger"),
                                             ("09:05", "Nguyễn Văn Tài", "Chuyến → <b>Đang vận chuyển</b>", None, "accent"),
                                             ("20/09 16:10", "Lê Thu Vân", "Sửa giá cước 12.000.000 đ → 12.500.000 đ", "Khách thêm bốc xếp", "warning")]),
              a("Xem tất cả", "WM-SHELL-07", "Mở Timeline")),
        gap=16, extra="flex: 1; min-width: 0;")
    return order_detail("Tổng quan", row(left, right, gap=16, align="flex-start"), 1140)


# ---------------------------------------------------------------- WM-ORD-03
def ord_03():
    def section(n, title, body, right=""):
        return panel(None, col(row(f'<span style="display: inline-flex; width: 22px; height: 22px; border-radius: 50%; background: {T["primary-soft"]}; '
                                   f'color: {T["primary"]}; font-size: 12px; font-weight: 700; align-items: center; justify-content: center;">{n}</span>',
                                   h("sm", title), spacer(), right, gap=8), body, gap=14))

    cus = section(1, "Khách hàng", col(
        row(field("Khách hàng", _picker("Công ty Gạo Miền Tây", "CUS-A-001 · Còn nợ 27.500.000 đ"), True, width="60%"),
            field("Mã đơn", input_("Tự sinh: DH-202609-0013", disabled=True)), gap=12, align="flex-start"),
        warning_panel("Khách có công nợ quá hạn", ["DH-202608-0009 quá hạn 10 ngày · còn nợ 15.000.000 đ",
                                                    "Tổng nợ sau đơn này: 40.000.000 đ / hạn mức 100.000.000 đ"],
                      a("Xem công nợ khách", "WM-CUS-05")), gap=12))
    stop_row = lambda n, kind, tone, ic, place, addr, contact, cod: row(
        muted(str(n), 13), badge(kind, tone, ic),
        field("Địa điểm", _picker(place, addr, "map-pin"), width="38%"),
        field("Liên hệ", input_(contact), width="22%"),
        field("COD dự kiến", money_input(cod), width="16%"),
        field("Thời gian", input_("23/09 06:00", mono=True), width="12%"),
        icon_btn("grip-vertical", "Kéo để sắp xếp"), gap=10, align="flex-end")
    stops = section(2, "Điểm lấy/trả", col(
        stop_row(1, "Lấy", "info", "package-check", "Kho Cần Thơ", "Sổ địa chỉ · KCN Trà Nóc 1", "Anh Nam · 0901 234 567", None),
        stop_row(2, "Trả", "primary", "map-pin", "Kho Bình Dương", "Sổ địa chỉ · Số 12 ĐT743, Dĩ An", "Chị Hạnh · 0902 345 678", 12_500_000),
        row(btn("Thêm điểm lấy", "ghost", "plus", size="sm"), btn("Thêm điểm trả", "ghost", "plus", size="sm"),
            btn("Chọn từ sổ địa chỉ", "ghost", "contact", size="sm", to="WM-CUS-04", trigger="Mở sổ địa chỉ khách"), gap=4), gap=12))
    cargo = section(3, "Hàng hóa", row(field("Tên hàng", input_("Gạo ST25 bao 50 kg"), True, width="40%"),
                                       field("Loại hàng", select("Nông sản")), field("Khối lượng", input_("8", suffix="tấn")),
                                       field("Số kiện", input_("160", suffix="bao")), gap=12),
                    btn("Thêm dòng hàng", "ghost", "plus", size="sm"))
    price = section(4, "Giá cước & dịch vụ thêm", col(
        row(field("Giá cước (nhập tay)", money_input(12_000_000), True, width="30%"),
            field("Dịch vụ thêm", row(select("Bốc xếp", width="60%"), money_input(500_000, width="40%"), gap=8), width="50%"), gap=12, align="flex-end"),
        row(muted("Tổng thu khách = giá cước + dịch vụ thêm", 13), spacer(), text("Tổng thu khách", 14, 500),
            text(money(12_500_000), 20, 700, extra=NUM), gap=12,
            extra=f"padding: 10px 12px; background: {T['surface-muted']}; border-radius: 6px;"), gap=12))
    due_ = section(5, "Hạn thanh toán & ghi chú", row(
        field("Hạn thanh toán", date_input("08/10/2026"), True, hint="Gợi ý từ khách: 15 ngày công nợ", width="25%"),
        field("Trạng thái khi lưu", radio_cards([("Nháp", "Chưa gửi điều phối"), ("Đã xác nhận", "Sẵn sàng xếp xe")], 1), width="40%"),
        field("Ghi chú", textarea("Giao trong giờ hành chính", h=36), width="35%"), gap=12, align="flex-start"))
    content = col(
        page_header("Tạo đơn hàng", "Đơn 1 xe đi thẳng: chọn khách → điểm lấy/trả → giá cước → lưu, rồi tạo chuyến",
                    row(btn("Hủy", "secondary", to="WM-ORD-01", trigger="Hủy tạo đơn"),
                        btn("Lưu nháp", "secondary"),
                        btn("Lưu & tạo chuyến", "primary", "check", to="WM-ORD-02", trigger="Lưu đơn → chi tiết đơn"), gap=8),
                    crumbs=[("Đơn hàng", "WM-ORD-01"), ("Tạo đơn", None)]),
        cus, stops, cargo, price, due_, gap=14)
    return wm_shell("orders", content, h=1320)


def _picker(value, sub, ic="building-2"):
    use("EntityPicker")
    return (f'<div style="display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 10px; box-sizing: border-box; border: 1px solid {T["border-control"]}; '
            f'border-radius: 4px; background: {T["surface"]};">{icon(ic, 16, T["text-muted"])}'
            f'<div style="display: flex; flex-direction: column; flex-grow: 1; min-width: 0;">{text(value, 14, 500)}{subtle(sub, 11)}</div>'
            f'{icon("chevron-down", 16, T["text-muted"])}</div>')


# ---------------------------------------------------------------- WM-ORD-04 Điểm dừng tab
def ord_04():
    cols = [("", "left", "28px"), ("#", "left", "32px"), ("Loại", "left"), ("Địa điểm · Liên hệ", "left"), ("Chuyến", "left"),
            ("COD dự kiến", "right"), ("COD thực thu", "right"), ("POD", "left"), ("Trạng thái · Giờ thực tế", "left"), ("", "right")]
    rows = [
        [icon("grip-vertical", 16, T["text-subtle"]), muted("1"), badge("Lấy", "info", "package-check"),
         col(a("Kho Cần Thơ", "WM-STOP-01", "Mở chi tiết điểm dừng", 13, 600), muted("KCN Trà Nóc 1 · Anh Nam · 0901 234 567", 12), gap=0),
         code("CX-202609-0001"), muted("—"), muted("—"), muted("—"),
         row(badge("Hoàn thành", "success"), num("23/09 07:10", 12), gap=6), row_menu()],
        [icon("grip-vertical", 16, T["text-subtle"]), muted("2"), badge("Trả", "primary", "map-pin"),
         col(a("Kho Bình Dương", "WM-STOP-01", "Mở chi tiết điểm dừng", 13, 600), muted("Số 12 ĐT743, Dĩ An · Chị Hạnh · 0902 345 678", 12), gap=0),
         code("CX-202609-0001"), num(money(12_500_000), weight=600), muted("Chưa thu"),
         muted("Chưa có"), badge("Chưa đến", "neutral"), row_menu()],
    ]
    body = col(row(muted("Kéo để đổi thứ tự. Đánh dấu hoàn thành/bỏ qua trong menu từng điểm; sửa COD thực thu cần lý do.", 13), spacer(),
                   btn("Thêm điểm lấy", "secondary", "plus", size="sm"), btn("Thêm điểm trả", "secondary", "plus", size="sm"), gap=8),
               table(cols, rows), gap=12)
    return order_detail("Điểm dừng", body, 900)


# ---------------------------------------------------------------- WM-ORD-05 Hàng hóa tab
def ord_05():
    cols = [("Tên hàng", "left"), ("Loại", "left"), ("Khối lượng", "right"), ("Thể tích", "right"), ("Số kiện", "right"),
            ("Tính chất", "left"), ("Ghi chú", "left"), ("Ảnh", "left"), ("", "right")]
    rows = [[text("Gạo ST25 bao 50 kg", 13, 600), muted("Nông sản"), num("8.000 kg"), muted("—"), num("160 bao"), badge("Tránh ẩm", "warning"),
             muted("Bốc xếp tại kho, có xe nâng"), row(icon("image", 16, T["text-muted"]), muted("2"), gap=4), row_menu()],
            [text("Pallet gỗ", 13, 600), muted("Vật tư"), num("300 kg"), muted("—"), num("12 cái"), muted("—"), muted("Trả lại kho Cần Thơ"),
             muted("—"), row_menu()]]
    body = col(row(muted("Hàng hóa chỉ để ghi chú vận hành — chỉ bắt buộc tên hàng.", 13), spacer(),
                   btn("Thêm dòng hàng", "secondary", "plus", size="sm"), gap=8), table(cols, rows), gap=12)
    return order_detail("Hàng hóa", body, 860)


# ---------------------------------------------------------------- WM-ORD-06 Add-on & giá bán (drawer)
def ord_06():
    body = col(
        banner("Đơn đã xác nhận: sửa giá cước hoặc dịch vụ thêm là thao tác nhạy cảm, cần lý do.", "warning"),
        field("Giá cước (chung cả đơn)", money_input(12_000_000), True),
        text("Dịch vụ thêm (thu thêm của khách)", 14, 600),
        table([("Dịch vụ", "left"), ("Số tiền", "right"), ("", "right")],
              [[select("Bốc xếp", width="220px", h=32), money_input(500_000, "150px", h=32), icon_btn("trash-2", "Xóa dòng")],
               [select("Lưu ca xe", width="220px", h=32), money_input(None, "150px", h=32), icon_btn("trash-2", "Xóa dòng")]], compact=True),
        btn("Thêm dịch vụ", "ghost", "plus", size="sm"),
        divider(),
        row(text("Tổng thu khách", 14, 500), spacer(), text(money(12_500_000), 20, 700, extra=NUM)),
        diff("Tổng thu khách", money(12_000_000), money(12_500_000)),
        gap=12)
    foot = btn("Hủy", "secondary", to="WM-ORD-07", trigger="Đóng drawer") + btn("Lưu thay đổi giá", "primary", "check", to="WM-ORD-08", trigger="Lưu → nhập lý do (sensitive)")
    return order_detail("Tài chính", _fin_body(), 1040, overlay=(drawer("Giá cước & dịch vụ thêm", body, foot, 560, "DH-202609-0001", close_to="WM-ORD-07"), "right"))


# ---------------------------------------------------------------- WM-ORD-07 Tài chính tab
def _fin_body():
    rev = panel("Doanh thu đơn", table([("Khoản", "left"), ("Số tiền", "right")],
                                       [[text("Giá cước", 13), num(money(12_000_000))], [text("Bốc xếp (add-on)", 13), num(money(500_000))]],
                                       compact=True, total_row=["Tổng thu khách", money(12_500_000)]),
                a("Sửa giá & add-on", "WM-ORD-06", "Mở drawer giá cước/add-on"), body_pad=False,
                sub="Giá cước + dịch vụ thêm. Không phải tiền đã thu.")
    cash = panel("Dòng tiền đã phân bổ", empty_state("receipt", "Chưa có phiếu thu phân bổ vào đơn này",
                                                     btn("Ghi nhận thanh toán", "secondary", "plus", to="WM-PAY-03", trigger="Tạo phiếu thu"),
                                                     "Phiếu thu của khách được phân bổ thủ công vào từng đơn.", 24),
                 a("Phân bổ từ phiếu có sẵn", "WM-PAY-04"), body_pad=False, sub="Phiếu thu → phân bổ vào đơn")
    cost = panel("Chi phí đơn/chuyến", table([("Mã phiếu", "left"), ("Loại · Ai chi", "left"), ("Số tiền", "right"), ("Trạng thái", "left")],
                                             [[code("PC-202609-0001", to="WM-EXP-02", trigger="Mở phiếu chi"), col(text("Phí cầu đường", 13), muted("Tài xế chi trước", 12), gap=0),
                                               num(money(800_000)), status("Chưa trả", "fin")],
                                              [code("PC-202609-0004", to="WM-EXP-02", trigger="Mở phiếu chi"), col(text("Tạm ứng chuyến", 13), muted("Công ty", 12), gap=0),
                                               num(money(2_000_000)), badge("Chờ đối soát", "info")]],
                                             compact=True, total_row=["Tổng chi phí", "", money(2_800_000), ""]),
                 btn("Thêm chi phí", "secondary", "plus", size="sm", to="WM-EXP-03", trigger="Tạo phiếu chi gắn đơn"), body_pad=False,
                 sub="Tạm ứng chuyến không tính vào lãi/lỗ cho đến khi đối soát")
    pl = panel("Lãi/lỗ tạm tính", col(
        row(muted("Tổng thu khách"), spacer(), num(money(12_500_000), 14)),
        row(muted("Chi phí đơn/chuyến (đã ghi nhận)"), spacer(), num("−" + money(800_000), 14)),
        row(muted("Thuê xe ngoài"), spacer(), num(money(0), 14)),
        divider(),
        row(text("Lãi/lỗ tạm tính", 14, 600), spacer(), num(money(11_700_000), 18, 700, T["success"])),
        subtle("Tính từ dữ liệu gốc; thay đổi khi thêm chi phí.", 12), gap=8))
    return row(col(rev, cash, gap=16, extra="flex: 1; min-width: 0;"), col(cost, pl, gap=16, extra="flex: 1; min-width: 0;"), gap=16, align="flex-start")


def ord_07():
    return order_detail("Tài chính", _fin_body(), 1040)


# ---------------------------------------------------------------- WM-ORD-08 Sensitive modal
def ord_08():
    affected = col(diff("Giá cước", money(12_000_000), money(12_500_000)),
                   dl([("Đơn", code("DH-202609-0001")), ("Trạng thái", status("Đang thực hiện")),
                       ("Đã phân bổ", num(money(0))), ("Bảng kê liên quan", muted("Chưa có"))], cols=2), gap=10)
    m = sensitive_modal("Bạn đang <b>sửa giá cước</b> của đơn đã xác nhận. Các thao tác cùng nhóm: hủy đơn, sửa đơn hoàn thành, đổi trạng thái ngược.",
                        affected, "Công nợ khách và lãi/lỗ đơn sẽ tính lại. Bảng kê đã chốt không thay đổi.",
                        "Khách thêm dịch vụ bốc xếp tại kho Bình Dương", "Xác nhận sửa giá", back_to="WM-ORD-07", confirm_to="WM-ORD-02")
    return order_detail("Tài chính", _fin_body(), 1040, overlay=(m, "center"))


# ---------------------------------------------------------------- WM-ORD-09 Print
def ord_09():
    use("PrintSheet")
    sheet = (f'<div style="width: 595px; height: 790px; background: #FFFFFF; box-shadow: {SH_DIALOG}; padding: 40px; box-sizing: border-box; '
             f'display: flex; flex-direction: column; gap: 14px; font-size: 12px;">'
             + row(logo(True, 26), spacer(), col(text("PHIẾU GIAO HÀNG", 16, 700), num("DH-202609-0001", 12), gap=0, extra="align-items: flex-end;"))
             + divider()
             + dl([("Nhà xe", "BTA Demo Transport"), ("Khách hàng", "Công ty Gạo Miền Tây"), ("Xe", "51C-123.45"), ("Tài xế", "Nguyễn Văn Tài · 0900 000 001"),
                   ("Điểm lấy", "Kho Cần Thơ, KCN Trà Nóc 1"), ("Điểm trả", "Kho Bình Dương, Số 12 ĐT743")], cols=2, gap=8)
             + table([("Hàng hóa", "left"), ("Số lượng", "right"), ("Ghi chú", "left")],
                     [["Gạo ST25 bao 50 kg", "160 bao", "Tránh ẩm"], ["Pallet gỗ", "12 cái", "Trả lại kho"]], compact=True)
             + row(text("COD thu hộ", 13, 600), spacer(), text(money(12_500_000), 14, 700, extra=NUM))
             + spacer()
             + grid([col(text("Người giao", 12, 600), subtle("(ký, ghi rõ họ tên)", 11), gap=0, extra="align-items: center; height: 90px;"),
                     col(text("Người nhận", 12, 600), subtle("(ký, ghi rõ họ tên)", 11), gap=0, extra="align-items: center; height: 90px;")], 2)
             + '</div>')
    side = panel("Mẫu in", col(radio("Phiếu giao hàng", True), radio("Phiếu điều xe"), radio("Bảng chi phí chuyến"),
                               divider(), field("Khổ giấy", select("A4 dọc")), checkbox("Hiện COD thu hộ", True), checkbox("Hiện giá cước", False),
                               gap=10), extra="width: 300px;")
    content = col(page_header("In/chia sẻ đơn", "Xem trước PDF trước khi tải hoặc in",
                              row(btn("Quay lại đơn", "secondary", "arrow-left", to="WM-ORD-02", trigger="Quay lại chi tiết đơn"),
                                  btn("Tải PDF", "secondary", "download"), btn("In", "primary", "printer"), gap=8),
                              crumbs=[("Đơn hàng", "WM-ORD-01"), ("DH-202609-0001", "WM-ORD-02"), ("In phiếu", None)]),
                  row(side, f'<div style="flex-grow: 1; display: flex; justify-content: center; padding: 20px; background: {T["surface-muted"]}; border-radius: 8px; border: 1px solid {T["border"]};">{sheet}</div>',
                      gap=16, align="flex-start"), gap=16)
    return wm_shell("orders", content, h=1040)


C = dict(platform="wm", module="Đơn hàng", roles=ROLES_ALL)
register(
    Screen(id="WM-ORD-01", name="Danh sách đơn hàng", route="/orders", render=ord_01, pattern="list", **C,
           purpose="Tìm/lọc đơn, theo dõi trạng thái và tiền; điểm vào tạo đơn và chi tiết đơn.",
           api=["orders(filter, sort, first, after)"],
           data=["code", "customer.name", "routeSummary", "status", "totalAmount", "paidAmount", "remainingAmount", "dueDate", "warnings[]"],
           actions=[("Tạo đơn", "order.create"), ("Xuất Excel", "order.view"), ("Bulk: in phiếu / xuất", "order.view")],
           states={"loading": "DataTable loading (skeleton rows)", "empty": "EmptyState 'Chưa có đơn hàng' + nút 'Tạo đơn đầu tiên'",
                   "error": "Banner danger 'Không tải được danh sách đơn' + Thử lại"},
           notes=["Quick filter chips map sang filter.status/warning; filter nâng cao mở Drawer.", "Cột tiền căn phải, tabular-nums.",
                  "Row click hoặc click mã → /orders/:orderId."]),
    Screen(id="WM-ORD-02", name="Chi tiết đơn hàng", route="/orders/:orderId", render=ord_02, pattern="detail", h=1140, **C,
           purpose="Trung tâm xử lý một đơn: trạng thái, tiền, điểm dừng, chuyến, sự cố, chứng từ, timeline.",
           api=["order(id)", "activityLogs(entityType: ORDER, entityId)"],
           data=["code", "status", "customer", "stops[]", "cargoLines[]", "addons[]", "trips[]", "financeSummary", "incidents[]", "attachments[]"],
           actions=[("Tạo chuyến", "trip.create"), ("Sửa", "order.update"), ("In phiếu", "order.view"), ("Hủy đơn", "order.cancel — sensitive"),
                    ("Timeline", "order.view")],
           states={"loading": "Skeleton header + tabs", "error": "Không tìm thấy đơn / không có quyền → EmptyState + quay lại danh sách"},
           notes=["Tabs dùng ?tab= (overview|stops|cargo|trips|finance|incidents|attachments|timeline).",
                  "Primary next action đổi theo trạng thái: Nháp→Xác nhận; Đã xác nhận→Tạo chuyến; Hoàn thành→Ghi nhận thanh toán."]),
    Screen(id="WM-ORD-03", name="Tạo/sửa đơn", route="/orders/new · /orders/:orderId/edit", render=ord_03, pattern="form", h=1320, **C,
           purpose="Tạo đơn nhanh 1 xe (không wizard): khách → điểm lấy/trả → hàng → giá cước/add-on → hạn thanh toán.",
           api=["customers", "customerLocations(customerId)", "catalogItems(type: ADDON|CARGO_TYPE)", "createOrder(input)", "updateOrder(id, input)"],
           data=["customerId", "stops[{type, locationSnapshot, contact, codExpected, plannedAt}]", "cargoLines[]", "freightAmount", "addons[]", "dueDate", "status", "note"],
           actions=[("Lưu nháp", "order.create"), ("Lưu & tạo chuyến", "order.create → WM-TRIP-02")],
           states={"validation": "Lỗi inline danger dưới field; khách vượt hạn mức = WarningPanel (không chặn)"},
           notes=["react-hook-form + zod; MoneyInput số nguyên VND.", "Sửa giá đơn đã xác nhận → mở SensitiveActionModal (WM-ORD-08)."]),
    Screen(id="WM-ORD-04", name="Điểm lấy/trả (tab)", route="/orders/:orderId?tab=stops", render=ord_04, pattern="detail", h=900, **C,
           purpose="Danh sách stop theo thứ tự, COD dự kiến/thực thu, POD, trạng thái; thêm/sắp xếp stop.",
           api=["order(id){stops}", "createOrderStop", "reorderOrderStops", "updateStopStatus"],
           data=["sequence", "type", "location", "contact", "tripCode", "codExpected", "codActual", "podCount", "actualAt", "status"],
           actions=[("Thêm điểm lấy/trả", "order.update"), ("Kéo sắp xếp", "order.update"), ("Hoàn thành/bỏ qua", "trip.status.update")]),
    Screen(id="WM-ORD-05", name="Hàng hóa (tab)", route="/orders/:orderId?tab=cargo", render=ord_05, pattern="detail", h=860, **C,
           purpose="Cargo lines linh hoạt, chỉ bắt buộc tên hàng.", api=["order(id){cargoLines}", "upsertCargoLine", "deleteCargoLine"],
           data=["name", "type", "weightKg", "volumeM3", "packages", "properties", "note", "photos[]"]),
    Screen(id="WM-ORD-06", name="Add-on & giá bán (drawer)", route="/orders/:orderId?tab=finance (drawer)", render=ord_06, pattern="drawer", h=1040,
           overlay_of="WM-ORD-07", **C,
           purpose="Sửa giá cước và dịch vụ thêm; đơn đã xác nhận phải qua lý do.", api=["updateOrderPricing(id, input, reason)"],
           actions=[("Lưu thay đổi giá", "order.price.update — sensitive")]),
    Screen(id="WM-ORD-07", name="Tài chính đơn (tab)", route="/orders/:orderId?tab=finance", render=ord_07, pattern="detail", h=1040, **C,
           purpose="Tách 4 khối: doanh thu, dòng tiền đã phân bổ, chi phí, lãi/lỗ tạm tính. Không gộp.",
           api=["order(id){financeSummary, allocations, expenses}"],
           actions=[("Ghi nhận thanh toán", "payment.create"), ("Phân bổ", "payment.allocate"), ("Thêm chi phí", "expense.create")],
           notes=["Doanh thu ≠ phiếu thu. COD tài xế nộp không phải doanh thu."]),
    Screen(id="WM-ORD-08", name="Hủy/sửa nhạy cảm đơn", route="(modal)", render=ord_08, pattern="dialog", h=1040, overlay_of="WM-ORD-07", **C,
           purpose="SensitiveActionModal cho sửa giá sau xác nhận, hủy đơn, sửa đơn hoàn thành, đổi trạng thái ngược.",
           api=["updateOrderPricing(reason)", "cancelOrder(id, reason)", "reverseOrderStatus(id, reason)"],
           actions=[("Xác nhận", "order.price.update | order.cancel | order.completed.update")],
           notes=["Lý do bắt buộc (min 5 ký tự), ghi audit_log với before/after."]),
    Screen(id="WM-ORD-09", name="In/chia sẻ đơn", route="/orders/:orderId/print", render=ord_09, pattern="page", h=1040, **C,
           purpose="Preview PDF: phiếu giao hàng, phiếu điều xe, bảng chi phí chuyến.", api=["renderOrderDocument(orderId, template)"]),
)
