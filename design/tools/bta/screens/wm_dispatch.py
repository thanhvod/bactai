"""Web Merchant — Điều phối (WM-TRIP-01/02, WM-STOP-01, WM-DISPATCH-01…05, WM-INC-01)."""
from .. import data as D
from ..core import Screen, register
from ..shells import wm_shell
from ..ui import *  # noqa: F401,F403

ROLES_OPS = ["admin", "operation", "accountant"]
TRIP_TABS = ["Tổng quan", "Điểm dừng", "Chi phí", "POD/COD", "GPS", "Sự cố", "Timeline"]
NOW = "13:40"


# ---------------------------------------------------------------- private helpers
def _num_dot(n):
    return (f'<span style="display: inline-flex; width: 22px; height: 22px; border-radius: 50%; background: {T["primary-soft"]}; '
            f'color: {T["primary"]}; font-size: 12px; font-weight: 700; align-items: center; justify-content: center; flex-shrink: 0;">{n}</span>')


def _section(n, title, body, right="", sub=None):
    return panel(None, col(row(_num_dot(n), col(h("sm", title), muted(sub, 12) if sub else "", gap=0), spacer(), right, gap=8), body, gap=14))


def _picker(value, sub, ic="building-2", disabled=False, open_=False):
    use("EntityPicker")
    bd = T["primary"] if open_ else T["border-control"]
    return (f'<div style="display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 10px; box-sizing: border-box; border: 1px solid {bd}; '
            f'border-radius: 4px; background: {T["surface-muted"] if disabled else T["surface"]};">{icon(ic, 16, T["text-muted"])}'
            f'<div style="display: flex; flex-direction: column; flex-grow: 1; min-width: 0;">{text(value, 14, 500, extra="white-space: nowrap;")}'
            f'{subtle(sub, 11)}</div>{icon("chevron-up" if open_ else "chevron-down", 16, T["text-muted"])}</div>')


def _ellip(s, size=13, weight=400, color=None):
    return text(s, size, weight, color, "display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;")


def _sev(level):
    return badge(level, {"Cao": "danger", "Trung bình": "warning", "Thấp": "neutral"}[level], "triangle-alert" if level == "Cao" else None)


def _inc_status(s):
    return badge(s, {"Mở": "danger", "Đang xử lý": "warning", "Đã đóng": "success"}[s])


def _stop_status(s):
    return badge(s, {"Chưa đến": "neutral", "Đã đến": "info", "Hoàn thành": "success", "Bỏ qua": "warning"}[s])


# ---------------------------------------------------------------- WM-TRIP-01 frame
def trip_header():
    use("EntityHeader")
    actions = row(
        btn("Timeline", "secondary", "history", to="WM-SHELL-07", trigger="Mở Timeline drawer"),
        btn("In phiếu điều xe", "secondary", "printer", to="WM-SHELL-05", trigger="In phiếu điều xe"),
        btn("Sửa chuyến", "secondary", "pencil", to="WM-TRIP-02", trigger="Sửa chuyến / đổi xe, tài xế"),
        icon_btn("ellipsis", "Thao tác khác", to="WM-SHELL-08", trigger="Menu: Hủy chuyến (sensitive)"),
        gap=8)
    head = row(
        col(row(h("display", "CX-202609-0001"), status("Đang vận chuyển", "trip"), badge("Sự cố mở", "danger", "triangle-alert"), gap=10),
            row(code("DH-202609-0001", 14, to="WM-ORD-02", trigger="Mở đơn hàng"), muted("·"),
                a("Công ty Gạo Miền Tây", "WM-CUS-02", "Mở khách hàng", 14), muted("·"),
                text("Kho Cần Thơ → Kho Bình Dương", 14, extra="white-space: nowrap;"), gap=8),
            row(icon("truck", 14, T["text-muted"]), a("51C-123.45", "WM-VEH-02", "Mở xe", 13), muted("Tải thùng 8 tấn", 12),
                subtle("·"), icon("id-card", 14, T["text-muted"]), a("Nguyễn Văn Tài", "WM-DRV-02", "Mở tài xế", 13), muted("0900 000 001", 12),
                subtle("· Tạo 22/09/2026 bởi Lê Thu Vân", 12), gap=6),
            gap=4),
        spacer(), actions, align="flex-start")
    strip = summary_strip([("Dự kiến", "23/09 06:00 – 14:00"), ("Bắt đầu thực tế", "06:12"), ("Điểm dừng xong", "1 / 2"),
                           ("COD dự kiến", money(12_500_000)), ("COD thực thu", money(0)), ("Chi phí chuyến", money(800_000)),
                           ("Thưởng tài xế", money(500_000), "primary")])
    return col(breadcrumb([("Điều phối", "WM-DISPATCH-01"), ("Bảng điều phối", "WM-DISPATCH-01"), ("CX-202609-0001", None)]), head, strip, gap=12)


def _trip_stops_table():
    cols = [("#", "left", "28px"), ("Loại", "left", "64px"), ("Địa điểm · Liên hệ", "left"), ("COD dự kiến · thực thu", "right"),
            ("Trạng thái · Giờ · POD", "left")]
    rows = [
        [muted("1"), badge("Lấy", "info", "package-check"),
         col(a("Kho Cần Thơ", "WM-STOP-01", "Mở chi tiết điểm dừng", 13, 600), muted("KCN Trà Nóc 1 · Anh Nam · 0901 234 567", 12), gap=0),
         col(muted("—"), muted("Không thu", 12), gap=0),
         col(row(_stop_status("Hoàn thành")), row(num("06:45 – 07:10", 12), subtle("· 2 ảnh", 12), gap=4), gap=2)],
        [muted("2"), badge("Trả", "primary", "map-pin"),
         col(a("Kho Bình Dương", "WM-STOP-01", "Mở chi tiết điểm dừng", 13, 600), muted("Số 12 ĐT743, Dĩ An · Chị Hạnh · 0902 345 678", 12), gap=0),
         col(num(money(12_500_000), weight=600), muted("Chưa thu", 12), gap=0),
         col(row(_stop_status("Chưa đến")), muted("ETA 14:30 · chưa có POD", 12), gap=2)],
    ]
    return table(cols, rows, compact=True)


def _trip_status_panel():
    use("StatusStepper")
    steps = ["Đã lên lịch", "Đang đến điểm lấy", "Đang lấy hàng", "Đang vận chuyển", "Đang trả hàng", "Hoàn thành"]
    body = col(
        stepper(steps, 3),
        row(muted("Cập nhật thay tài xế khi app mất kết nối. Tạm dừng, hủy, đổi ngược cần lý do và ghi Timeline.", 13), spacer(),
            btn("Tạm dừng", "secondary", "pause", size="sm", to="WM-SHELL-08", trigger="Tạm dừng chuyến (nhập lý do)"),
            btn("Hủy chuyến", "danger-outline", "x", size="sm", to="WM-SHELL-08", trigger="Hủy chuyến (sensitive)"),
            btn("Chuyển sang Đang trả hàng", "primary", "arrow-right", size="sm"), gap=8),
        gap=14)
    return panel("Trạng thái chuyến", body, subtle("Cập nhật cuối: 09:05 · Nguyễn Văn Tài (app)", 12))


def trip_01():
    cost = panel("Chi phí chuyến", table(
        [("Mã phiếu", "left"), ("Loại · Ai chi", "left"), ("Số tiền", "right"), ("Trạng thái", "left")],
        [[code("PC-202609-0001", to="WM-EXP-02", trigger="Mở phiếu chi"), col(text("Phí cầu đường", 13), muted("Tài xế chi trước · hoàn tài xế", 12), gap=0),
          num(money(800_000)), status("Chưa trả", "fin")],
         [code("PC-202609-0004", to="WM-ADV-01", trigger="Mở tạm ứng chuyến"), col(text("Tạm ứng chuyến", 13), muted("Công ty · chờ đối soát", 12), gap=0),
          num(money(2_000_000)), badge("Chờ đối soát", "info")]],
        compact=True, total_row=["Chi phí tính lãi/lỗ", "", money(800_000), ""]),
        btn("Thêm chi phí", "secondary", "plus", size="sm", to="WM-EXP-03", trigger="Thêm chi phí chuyến"), body_pad=False,
        sub="Tạm ứng không tính vào lãi/lỗ cho đến khi đối soát")
    podcod = panel("POD/COD", col(
        dl([("COD dự kiến", num(money(12_500_000), 14, 600)), ("COD thực thu", muted("Chưa thu", 14)),
            ("POD điểm trả", muted("Chưa có", 14)), ("Ảnh điểm lấy", row(num("2 ảnh", 14), a("Xem", "WM-SHELL-06", "Xem ảnh POD"), gap=6))], cols=4),
        subtle("COD tài xế thu hộ ghi vào công nợ tài xế, không phải doanh thu. Nộp lại qua phiếu thu COD.", 12), gap=10),
        a("COD tài xế đang giữ", "WM-COD-01", "Mở COD tài xế"))
    left = col(_trip_status_panel(), panel("Điểm dừng được giao", _trip_stops_table(), muted("Chuyến phụ trách 2/2 điểm của đơn", 12), body_pad=False),
               cost, podcod, gap=16, extra="flex: 2; min-width: 0;")
    assign = panel("Phân công", col(
        row(icon("truck", 18, T["text-muted"]), col(a("51C-123.45", "WM-VEH-02", "Mở xe", 14, 600), muted("Tải thùng · 8 tấn", 12), gap=0), spacer(),
            badge("Đang chạy", "accent"), gap=10),
        row(icon("id-card", 18, T["text-muted"]), col(a("Nguyễn Văn Tài", "WM-DRV-02", "Mở tài xế", 14, 600), muted("0900 000 001 · App đang online", 12), gap=0),
            spacer(), gap=10),
        divider(),
        row(muted("Chuyến kế tiếp"), spacer(), code("CX-202609-0002", to="WM-TRIP-01", trigger="Mở chuyến kế tiếp"), badge("Gần trùng 1 giờ", "warning"), gap=6),
        gap=10), btn("Đổi xe/tài xế", "secondary", "refresh-cw", size="sm", to="WM-TRIP-02", trigger="Đổi xe/tài xế"))
    gps = panel("Vị trí gần nhất", col(
        map_placeholder(h=150, pins=[(62, 48, "51C-123.45", "accent"), (84, 30, "Kho Bình Dương", "primary")], label="QL13 · Thủ Đức"),
        row(icon("locate-fixed", 14, T["text-muted"]), text("Ngã tư Bình Phước, QL13, TP. Thủ Đức", 13), gap=6),
        row(subtle("cập nhật 2 phút trước · 13:38", 12), spacer(), muted("42 km/h", 12), gap=6), gap=8),
        a("Theo dõi vị trí", "WM-DISPATCH-04", "Mở bản đồ vị trí xe"))
    inc = panel("Sự cố", col(
        row(_sev("Trung bình"), text("Kẹt xe QL1A đoạn Tân An", 13, 600), spacer(), _inc_status("Mở"), gap=8),
        muted("Báo từ app tài xế · 23/09 10:42 · Chưa gán người xử lý", 12),
        row(a("Xem sự cố", "WM-INC-01", "Mở chi tiết sự cố"), spacer(), btn("Báo sự cố", "ghost", "plus", size="sm", to="WM-DISPATCH-05", trigger="Báo sự cố mới"), gap=8),
        gap=6))
    tl = panel("Hoạt động gần đây", timeline([
        ("10:42", "Nguyễn Văn Tài", "Báo sự cố <b>Kẹt xe</b>", None, "danger"),
        ("09:05", "Nguyễn Văn Tài", "Chuyến → <b>Đang vận chuyển</b>", None, "accent"),
        ("07:10", "Nguyễn Văn Tài", "Điểm 1 Kho Cần Thơ → <b>Hoàn thành</b> · 2 ảnh", None, "success"),
        ("22/09 16:30", "Lê Thu Vân", "Tạo chuyến, gán 51C-123.45 · Nguyễn Văn Tài")]),
        a("Xem tất cả", "WM-SHELL-07", "Mở Timeline"))
    right = col(assign, gps, inc, tl, gap=16, extra="flex: 1; min-width: 0;")
    content = col(trip_header(), tabs(TRIP_TABS, 0, counts={"Điểm dừng": 2, "Chi phí": 2, "Sự cố": 1}),
                  row(left, right, gap=16, align="flex-start"), gap=16)
    return wm_shell("dispatch", content, h=1440, child="WM-DISPATCH-01")


# ---------------------------------------------------------------- WM-TRIP-02
def trip_02():
    order = _section(1, "Đơn hàng", col(
        row(field("Đơn hàng", _picker("DH-202609-0002 · Kho Thép An Phát", "Long An → Q.7, Thủ Đức · 3 điểm · Đã xếp xe 1/2 chuyến", "package"), True, width="62%"),
            field("Mã chuyến", input_("Tự sinh: CX-202609-0002", disabled=True)), gap=12, align="flex-start"),
        row(icon("info", 14, T["info"]), muted("Đơn nhiều xe: chọn các điểm chuyến này phụ trách. Điểm đã gán chuyến khác hiển thị mã chuyến.", 12),
            spacer(), a("Mở đơn", "WM-ORD-02", "Mở đơn hàng"), gap=6), gap=10))
    stop_cols = [("", "left", "32px"), ("#", "left", "28px"), ("Loại", "left", "70px"), ("Địa điểm · Liên hệ", "left"), ("COD dự kiến", "right"), ("Chuyến đang phụ trách", "left")]
    stop_rows = [
        [checkbox(checked=True), muted("1"), badge("Lấy", "info", "package-check"),
         col(text("Nhà máy Long An", 13, 600), muted("KCN Tân Đức, Đức Hòa · Anh Phúc · 0903 111 222", 12), gap=0), muted("—"),
         row(code("CX-202609-0003", to="WM-TRIP-01", trigger="Mở chuyến B"), muted("+ chuyến này", 12), gap=6)],
        [checkbox(checked=True), muted("2"), badge("Trả", "primary", "map-pin"),
         col(text("Công trình Quận 7", 13, 600), muted("Số 8 Nguyễn Hữu Thọ, Q.7 · Anh Khang · 0903 333 444", 12), gap=0), num(money(0)), muted("Chưa gán")],
        [checkbox(checked=False), muted("3"), badge("Trả", "primary", "map-pin"),
         col(text("Công trình Thủ Đức", 13, 600, T["text-muted"]), muted("Số 25 Võ Nguyên Giáp · Chị Lan · 0903 555 666", 12), gap=0), num(money(0)),
         code("CX-202609-0003")],
    ]
    stops = _section(2, "Điểm dừng chuyến phụ trách", table(stop_cols, stop_rows, compact=True, selected=[0, 1]),
                     muted("Đã chọn 2/3 điểm", 12), "Đơn 1 xe thì mặc định gán tất cả điểm")
    drivers_pop = popover(col(
        _drv_opt("Nguyễn Văn Tài", "DRV-A-001 · chạy CX-202609-0001 đến 14:00", True, warn="Gần trùng"),
        _drv_opt("Trần Minh Lái", "DRV-A-002 · CX-202609-0003 13:00 – 18:00", False, warn="Trùng lịch"),
        _drv_opt("Lê Hoàng Phúc", "DRV-A-004 · Rảnh", False),
        _drv_opt("Phạm Văn Dự", "DRV-A-003 · không chọn được", False, disabled=True),
        gap=0, extra="padding: 4px;"), width="100%")
    warn = warning_panel("Gần trùng lịch 1 giờ (ngưỡng 2 giờ)", [
        "Xe <b>51C-123.45</b> chạy CX-202609-0001 đến 14:00 — chuyến này bắt đầu 15:00, cách 1 giờ.",
        "Tài xế <b>Nguyễn Văn Tài</b> cùng chuyến CX-202609-0001, đang có sự cố kẹt xe — có thể trễ.",
        "Cảnh báo mềm: vẫn lưu được nếu có quyền override và ghi lý do."],
        row(btn("Tiếp tục và ghi lý do", "primary", "arrow-right", size="sm", to="WM-DISPATCH-03", trigger="Tiếp tục và ghi lý do → cảnh báo lịch"),
            btn("Đổi xe/tài xế", "secondary", size="sm"), a("Xem lịch", "WM-DISPATCH-02", "Xem lịch xe/tài xế"), gap=8, wrap=True))
    time_ = _section(3, "Thời gian dự kiến", row(
        field("Bắt đầu", input_("23/09/2026 15:00", mono=True, suffix=icon("calendar", 16, T["text-muted"])), required=True, width="25%"),
        field("Kết thúc", input_("23/09/2026 19:00", mono=True, suffix=icon("calendar", 16, T["text-muted"])), required=True, width="25%"),
        field("Thời lượng", input_("4 giờ", disabled=True), width="15%"), spacer(), gap=12))
    assign = _section(4, "Xe & tài xế", row(
        col(field("Xe", _picker("51C-123.45 · Tải thùng 8 tấn", "VEH-A-001 · CX-202609-0001 đến 14:00", "truck"), True),
            field("Tài xế", _picker("Nguyễn Văn Tài", "DRV-A-001 · 0900 000 001", "id-card", open_=True), True),
            drivers_pop, gap=8, extra="width: 50%;"),
        f'<div style="width: 50%;">{warn}</div>', gap=16, align="flex-start"),
        right=a("Xem lịch xe/tài xế", "WM-DISPATCH-02", "Mở lịch xe/tài xế"), sub="Tài xế không cố định xe — gán theo từng chuyến. Xe/tài xế ngừng hoạt động không chọn được.")
    bonus = _section(5, "Thưởng tài xế & ghi chú", row(
        field("Thưởng tài xế theo chuyến", money_input(300_000), hint="Tính vào bảng lương kỳ 09/2026", width="30%"),
        field("Ghi chú cho tài xế", textarea("Giao thép cuộn tại cổng số 2, liên hệ anh Khang trước 30 phút", h=36), width="70%"),
        gap=12, align="flex-start"))
    content = col(
        page_header("Tạo chuyến", "Tách đơn nhiều xe: chọn điểm dừng, xe, tài xế và giờ dự kiến",
                    row(btn("Hủy", "secondary", to="WM-ORD-02", trigger="Hủy → quay lại đơn"),
                        btn("Lưu chuyến", "primary", "check", to="WM-TRIP-01", trigger="Lưu chuyến (không cảnh báo) → chi tiết chuyến"), gap=8),
                    crumbs=[("Điều phối", "WM-DISPATCH-01"), ("DH-202609-0002", "WM-ORD-02"), ("Tạo chuyến", None)]),
        order, stops, time_, assign, bonus, gap=14)
    return wm_shell("dispatch", content, h=1460, child="WM-DISPATCH-01")


def _drv_opt(name, sub, sel=False, warn=None, disabled=False):
    bg = T["accent-soft"] if sel else "transparent"
    right = badge(warn, "danger" if warn == "Trùng lịch" else "warning") if warn else ""
    if disabled:
        right = badge("Ngừng hoạt động", "neutral")
    op = "opacity: 0.55;" if disabled else ""
    return (f'<div aria-disabled="{str(disabled).lower()}" style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 4px; background: {bg}; {op}">'
            f'{avatar("".join(w[0] for w in name.split()[-2:]), 28, "neutral" if disabled else "accent")}'
            f'{col(text(name, 13, 600), subtle(sub, 11), gap=0)}{spacer()}{right}'
            f'{icon("check", 16, T["primary"]) if sel else ""}</div>')


# ---------------------------------------------------------------- WM-STOP-01 (drawer over trip)
def stop_01():
    pod_slot = lambda lab: (f'<div style="flex: 1; height: 88px; border-radius: 6px; border: 1px dashed {T["border-strong"]}; background: {T["surface-muted"]}; '
                            f'display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">'
                            f'{icon("camera", 20, T["text-subtle"], 1.5)}{subtle(lab, 11)}</div>')
    pickup_pod = row(*[f'<a href="{href("WM-SHELL-06")}" style="flex: 1; text-decoration: none;">{photo_placeholder(h=88, label=l)}</a>'
                       for l in ("Nhận hàng 07:02", "Biên bản 07:08")], gap=8)
    edge("WM-SHELL-06", "Xem ảnh POD điểm lấy")
    body = col(
        row(badge("Trả", "primary", "map-pin"), _stop_status("Chưa đến"), muted("Điểm 2/2 · CX-202609-0001", 13), gap=8),
        dl([("Địa chỉ", "Số 12 ĐT743, Dĩ An, Bình Dương"), ("Liên hệ", row(text("Chị Hạnh · 0902 345 678", 14), icon("phone", 14, T["text-muted"]), gap=6)),
            ("Đơn hàng", code("DH-202609-0001", 14, to="WM-ORD-02", trigger="Mở đơn hàng")), ("Chuyến", code("CX-202609-0001", 14, to="WM-TRIP-01", trigger="Mở chuyến")),
            ("Giờ dự kiến", num("23/09 14:00", 14)), ("Giờ thực tế", muted("Đến — · Xong —", 14))], cols=2),
        divider(),
        row(text("COD", 15, 600), spacer(), btn("Sửa COD", "secondary", "pencil", size="sm", to="WM-SHELL-08", trigger="Sửa COD thực thu (sensitive, nhập lý do)"), gap=8),
        summary_strip([("COD dự kiến", money(12_500_000)), ("COD thực thu", "Chưa nhập"), ("Chênh lệch", "—")]),
        subtle("Tài xế nhập COD thực thu tại điểm trên app. Sửa sau khi đã lưu cần lý do, ghi before/after vào audit.", 12),
        divider(),
        row(text("POD điểm trả", 15, 600), spacer(), muted("0 ảnh", 12), gap=8),
        row(pod_slot("Chờ tài xế chụp"), pod_slot("Ảnh hàng"), pod_slot("Biên bản ký"), gap=8),
        row(text("Ảnh tại điểm lấy (điểm 1)", 13, 600), spacer(), a("Xem tất cả", "WM-SHELL-06", "Mở attachment viewer"), gap=8),
        pickup_pod,
        divider(),
        text("Lịch sử điểm dừng", 15, 600),
        timeline([("22/09 16:30", "Lê Thu Vân", "Gán điểm vào chuyến CX-202609-0001"),
                  ("20/09 14:05", "Lê Thu Vân", "Tạo điểm trả từ sổ địa chỉ · COD dự kiến 12.500.000 đ")]),
        gap=12)
    foot = (btn("Bỏ qua điểm", "danger-outline", size="md", to="WM-SHELL-08", trigger="Bỏ qua điểm (nhập lý do)")
            + spacer() + btn("Đóng", "secondary", to="WM-TRIP-01", trigger="Đóng drawer")
            + btn("Đánh dấu đã đến", "primary", "check"))
    dr = drawer("Kho Bình Dương", body, foot, 560, "Chi tiết điểm dừng", close_to="WM-TRIP-01")
    return wm_shell("dispatch", _trip01_base(), h=1280, child="WM-DISPATCH-01", overlay=(dr, "right"))


def _trip01_base():
    """Trip detail content used under the stop drawer (header + stops, lighter)."""
    return col(trip_header(), tabs(TRIP_TABS, 1, counts={"Điểm dừng": 2, "Chi phí": 2, "Sự cố": 1}),
               _trip_status_panel(), panel("Điểm dừng được giao", _trip_stops_table(), body_pad=False), gap=16)


# ---------------------------------------------------------------- WM-DISPATCH-01 board
def _trip_card(tr, extra_warn=None):
    use("TripCard")
    c, oc, route, veh, drv, planned, st, warn = tr
    w = ""
    if warn == "Sự cố mở":
        w = row(badge("Sự cố mở", "danger", "triangle-alert"), a("Xem", "WM-INC-01", "Mở sự cố từ thẻ chuyến", 12), gap=6)
    elif warn and "trùng" in warn:
        w = row(badge("Gần trùng 1 giờ", "warning", "triangle-alert"), a("Xem", "WM-DISPATCH-03", "Mở cảnh báo lịch từ thẻ chuyến", 12), gap=6)
    elif warn == "Chưa gán xe":
        w = row(badge("Chưa gán xe", "warning"), spacer(), btn("Gán xe", "secondary", size="sm", to="WM-TRIP-02", trigger="Gán xe/tài xế từ thẻ"), gap=6)
    tone = TONES[TRIP_STATUS.get(st, "neutral")][1]
    vd = (row(icon("truck", 13, T["text-muted"]), num(veh, 12), subtle("·"), _ellip(drv, 12), gap=4) if veh != "—"
          else row(icon("truck", 13, T["text-subtle"]), muted("Chưa gán xe/tài xế", 12), gap=4))
    return (f'<div style="display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; background: {T["surface"]}; border: 1px solid {T["border"]}; '
            f'border-left: 3px solid {tone}; border-radius: 6px; min-width: 0;">'
            f'{code(c, 13, to="WM-TRIP-01", trigger="Mở chuyến từ thẻ")}'
            f'{_ellip(route, 13, 600)}'
            f'{row(icon("package", 13, T["text-muted"]), code(oc, 12, to="WM-ORD-02", trigger="Mở đơn từ thẻ"), gap=4)}{vd}'
            f'{row(icon("clock", 13, T["text-muted"]), num(planned, 12), gap=4)}'
            f'{row(status(st, "trip"))}{w}</div>')


def dispatch_01():
    trips = {t[0]: t for t in D.TRIPS}
    extra = ("CX-202609-0007", "DH-202609-0011", "Đồng Tháp → Thủ Đức", "51C-456.78", "Lê Hoàng Phúc", "23/09 04:30 – 10:30", "Hoàn thành", None)
    cols_def = [
        ("Đã lên lịch", [trips["CX-202609-0002"], trips["CX-202609-0004"]]),
        ("Đến / lấy hàng", [trips["CX-202609-0003"]]),
        ("Đang vận chuyển", [trips["CX-202609-0001"]]),
        ("Đang trả hàng", []),
        ("Hoàn thành", [extra, trips["CX-202609-0005"]]),
    ]
    board = []
    for title, items in cols_def:
        cards = "".join(_trip_card(t) for t in items) or empty_state("inbox", "Không có chuyến", sub="Kéo thẻ vào để đổi trạng thái", pad=20)
        board.append(f'<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 10px; background: {T["surface-muted"]}; '
                     f'border: 1px solid {T["border"]}; border-radius: 8px;">'
                     f'{row(text(title, 13, 600), badge(str(len(items)), "neutral"), gap=6)}{cards}</div>')
    use("DispatchBoard")
    view = segmented([("Danh sách", "list"), ("Bảng", "kanban"), ("Lịch", "calendar-days")], 1, links=[None, None, "WM-DISPATCH-02"])
    content = col(
        page_header("Bảng điều phối", "Chuyến theo trạng thái; cảnh báo lịch không chặn gán xe",
                    row(f'<div style="white-space: nowrap; flex-shrink: 0;">{view}</div>', btn("Cảnh báo lịch (1)", "secondary", "triangle-alert", to="WM-DISPATCH-03", trigger="Mở cảnh báo lịch"),
                        btn("Tạo chuyến", "primary", "plus", to="WM-TRIP-02", trigger="Tạo chuyến"), gap=8)),
        filter_bar("Tìm mã chuyến, mã đơn, biển số…", date="22/09 – 24/09/2026", selects=("Tài xế: Tất cả", "Xe: Tất cả", "Trạng thái: Tất cả"),
                   right=btn("Xóa lọc", "ghost", size="sm")),
        row(*[kpi(l, v, s, t, ic, to, tr) for l, v, s, t, ic, to, tr in [
            ("Chuyến trong kỳ", "6", "2 đang chạy", None, "route", None, None),
            ("Chưa gán xe", "1", "CX-202609-0004 · 24/09", "warning", "truck", "WM-TRIP-02", "Gán xe cho chuyến chưa gán"),
            ("Cảnh báo lịch", "1", "Gần trùng 1 giờ", "warning", "triangle-alert", "WM-DISPATCH-03", "Click KPI cảnh báo lịch"),
            ("Sự cố mở", "1", "Kẹt xe · CX-202609-0001", "danger", "incident", "WM-DISPATCH-05", "Click KPI sự cố"),
            ("Xe đang chạy", "2 / 4", "1 xe bảo dưỡng", None, "vehicles", "WM-DISPATCH-04", "Mở vị trí xe")]],
            gap=12, align="stretch", extra="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr));"),
        row(*board, gap=12, align="flex-start"),
        row(subtle(f"Tự làm mới mỗi 30 giây · cập nhật lúc {NOW}", 12), spacer(), a("Lịch xe/tài xế", "WM-DISPATCH-02", "Mở lịch xe/tài xế", 12),
            a("Vị trí xe", "WM-DISPATCH-04", "Mở vị trí xe", 12), gap=16),
        gap=16)
    return wm_shell("dispatch", content, h=960, child="WM-DISPATCH-01")


# ---------------------------------------------------------------- WM-DISPATCH-02 schedule
PX_H = 38  # px per hour


def _block(code_, label, start, end, tone="accent", warn=False, to="WM-TRIP-01", hatched=False):
    fg = TONES[tone][1]
    bg = TONES[tone][0]
    left, width = start * PX_H, (end - start) * PX_H
    outline = f"outline: 2px dashed {T['warning']}; outline-offset: 1px;" if warn else ""
    bgc = (f"background: repeating-linear-gradient(135deg, {T['neutral-soft']}, {T['neutral-soft']} 6px, {T['surface-muted']} 6px, {T['surface-muted']} 12px);"
           if hatched else f"background: {bg};")
    inner = (f'<span style="font-size: 12px; font-weight: 600; color: {fg}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{code_}</span>'
             f'<span style="font-size: 11px; color: {T["text-muted"]}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{label}</span>')
    css = (f"position: absolute; top: 6px; left: {left}px; width: {width - 2}px; height: 40px; box-sizing: border-box; padding: 3px 8px; "
           f"border-radius: 4px; border-left: 3px solid {fg}; {bgc} {outline} display: flex; flex-direction: column; justify-content: center; "
           f"overflow: hidden; text-decoration: none;")
    if to:
        edge(to, f"Click block {code_}")
        return f'<a href="{href(to)}" style="{css}">{inner}</a>'
    return f'<div style="{css}">{inner}</div>'


def _sched_row(label, sub, blocks, dim=False, now=13 + 40 / 60):
    grid_lines = "".join(f'<div style="position: absolute; top: 0; bottom: 0; left: {h_ * PX_H}px; width: 1px; background: {T["border"]};"></div>'
                         for h_ in range(0, 25, 2))
    now_line = f'<div style="position: absolute; top: 0; bottom: 0; left: {now * PX_H}px; width: 2px; background: {T["danger"]};"></div>'
    op = "opacity: 0.55;" if dim else ""
    return (f'<div style="display: flex; border-bottom: 1px solid {T["border"]}; {op}">'
            f'<div style="width: 200px; flex-shrink: 0; padding: 8px 12px; box-sizing: border-box; border-right: 1px solid {T["border"]};">'
            f'{col(text(label, 13, 600, extra="white-space: nowrap;"), subtle(sub, 11), gap=0)}</div>'
            f'<div style="position: relative; width: {24 * PX_H}px; height: 52px; flex-shrink: 0;">{grid_lines}{now_line}{"".join(blocks)}</div></div>')


def dispatch_02():
    use("ScheduleView")
    axis = "".join(f'<div style="position: absolute; left: {h_ * PX_H}px; top: 2px; line-height: 14px; transform: translateX(-50%); font-size: 11px; color: {T["text-muted"]}; {NUM}">'
                   f'{h_:02d}</div>' for h_ in range(0, 25, 2))
    axis_row = (f'<div style="display: flex; border-bottom: 1px solid {T["border"]}; background: {T["surface-muted"]};">'
                f'<div style="width: 200px; flex-shrink: 0; padding: 8px 12px; box-sizing: border-box; border-right: 1px solid {T["border"]};">{muted("23/09/2026", 12)}</div>'
                f'<div style="position: relative; width: {24 * PX_H}px; height: 32px; flex-shrink: 0;">{axis}'
                f'<div style="position: absolute; left: {(13 + 40 / 60) * PX_H}px; top: 17px; line-height: 14px; transform: translateX(-50%); font-size: 10px; font-weight: 700; color: {T["danger"]}; background: {T["surface-muted"]}; padding: 0 2px;">{NOW}</div></div></div>')

    def group(title):
        return (f'<div style="padding: 6px 12px; background: {T["surface-muted"]}; border-bottom: 1px solid {T["border"]}; font-size: 12px; font-weight: 600; '
                f'color: {T["text-muted"]};">{title}</div>')

    rows = [
        group("Xe (4)"),
        _sched_row("51C-123.45", "Tải thùng 8 tấn", [_block("CX-202609-0001", "Cần Thơ → Bình Dương", 6, 14, warn=True),
                                                       _block("CX-202609-0002", "Long An → Q.7", 15, 19, "neutral", warn=True)]),
        _sched_row("51D-678.90", "Mui bạt 15 tấn", [_block("CX-202609-0003", "Long An → Thủ Đức", 13, 18, "info")]),
        _sched_row("51C-456.78", "Tải thùng 10 tấn", [_block("CX-202609-0007", "Đồng Tháp → Thủ Đức", 4.5, 10.5, "success")]),
        _sched_row("51H-111.22", "Xe lạnh 5 tấn · Bảo dưỡng", [_block("Bảo dưỡng", "Gara Đại Lộc · không xếp chuyến", 0, 24, "neutral", to=None, hatched=True)]),
        group("Tài xế (4)"),
        _sched_row("Nguyễn Văn Tài", "DRV-A-001", [_block("CX-202609-0001", "51C-123.45", 6, 14, warn=True),
                                                   _block("CX-202609-0002", "51C-123.45", 15, 19, "neutral", warn=True)]),
        _sched_row("Trần Minh Lái", "DRV-A-002", [_block("CX-202609-0003", "51D-678.90", 13, 18, "info")]),
        _sched_row("Lê Hoàng Phúc", "DRV-A-004", [_block("CX-202609-0007", "51C-456.78", 4.5, 10.5, "success")]),
        _sched_row("Phạm Văn Dự", "DRV-A-003 · Ngừng hoạt động", [], dim=True),
    ]
    sched = (f'<div style="background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px; overflow: hidden;">'
             f'{axis_row}{"".join(rows)}</div>')
    legend_ = row(*[row(f'<span style="display: inline-block; flex-shrink: 0; width: 16px; height: 10px; border-radius: 2px; background: {TONES[t][0]}; border-left: 3px solid {TONES[t][1]};"></span>',
                        muted(l, 12), gap=6) for l, t in [("Đã lên lịch", "neutral"), ("Đang lấy hàng", "info"), ("Đang vận chuyển", "accent"), ("Hoàn thành", "success")]],
                  row(f'<span style="display: inline-block; flex-shrink: 0; width: 16px; height: 10px; border-radius: 2px; outline: 2px dashed {T["warning"]};"></span>', muted("Trùng / gần trùng lịch", 12), gap=6),
                  row(f'<span style="display: inline-block; flex-shrink: 0; width: 2px; height: 12px; background: {T["danger"]};"></span>', muted("Hiện tại", 12), gap=6), gap=16)
    warn = warning_panel("1 cảnh báo gần trùng lịch hôm nay", [
        "51C-123.45 · Nguyễn Văn Tài: CX-202609-0001 kết thúc 14:00, CX-202609-0002 bắt đầu 15:00 — cách 1 giờ (ngưỡng 2 giờ)."],
        a("Xem cảnh báo lịch", "WM-DISPATCH-03", "Mở danh sách cảnh báo lịch"))
    content = col(
        page_header("Lịch xe/tài xế", "Mỗi dòng là một xe hoặc tài xế; khối là chuyến. Click khối để mở chuyến.",
                    row(btn("Tạo chuyến", "primary", "plus", to="WM-TRIP-02", trigger="Tạo chuyến"), gap=8)),
        filter_bar("Tìm biển số, tài xế…", date="23/09/2026", selects=("Loại xe: Tất cả", "Trạng thái: Tất cả"),
                   right=row(segmented(["Ngày", "Tuần"], 0), segmented([("Danh sách", "list"), ("Bảng", "kanban"), ("Lịch", "calendar-days")], 2,
                                                                        links=["WM-DISPATCH-01", "WM-DISPATCH-01", None]), gap=8)),
        warn, legend_, sched, gap=16)
    return wm_shell("dispatch", content, h=1000, child="WM-DISPATCH-02")


# ---------------------------------------------------------------- WM-DISPATCH-03 conflicts
def dispatch_03():
    cols = [("Loại", "left"), ("Đối tượng", "left"), ("Chuyến đang lưu", "left"), ("Chuyến bị trùng", "left"),
            ("Khoảng cách", "right"), ("Trạng thái", "left"), ("", "right")]
    rows = [
        [badge("Gần trùng", "warning", "triangle-alert"), col(text("Xe 51C-123.45", 13, 600), muted("Tải thùng 8 tấn", 12), gap=0),
         col(text("CX-202609-0002 (đang lưu)", 13, 500), muted("23/09 15:00 – 19:00", 12), gap=0),
         col(code("CX-202609-0001", to="WM-TRIP-01", trigger="Mở chuyến bị trùng"), muted("23/09 06:00 – 14:00", 12), gap=0),
         col(num("1 giờ", 13, 600, T["warning"]), subtle("ngưỡng 2 giờ", 11), gap=0), badge("Chờ xử lý", "warning"),
         btn("Override", "secondary", size="sm", to="WM-SHELL-08", trigger="Override cảnh báo (sensitive)")],
        [badge("Gần trùng", "warning", "triangle-alert"), col(text("Tài xế Nguyễn Văn Tài", 13, 600), muted("DRV-A-001", 12), gap=0),
         col(text("CX-202609-0002 (đang lưu)", 13, 500), muted("23/09 15:00 – 19:00", 12), gap=0),
         col(code("CX-202609-0001", to="WM-TRIP-01", trigger="Mở chuyến bị trùng"), muted("23/09 06:00 – 14:00", 12), gap=0),
         col(num("1 giờ", 13, 600, T["warning"]), subtle("ngưỡng 2 giờ", 11), gap=0), badge("Chờ xử lý", "warning"),
         btn("Override", "secondary", size="sm", to="WM-SHELL-08", trigger="Override cảnh báo (sensitive)")],
        [badge("Trùng lịch", "danger", "triangle-alert"), col(text("Tài xế Trần Minh Lái", 13, 600), muted("DRV-A-002", 12), gap=0),
         col(code("CX-202609-0005", to="WM-TRIP-01", trigger="Mở chuyến"), muted("22/09 07:00 – 10:30", 12), gap=0),
         col(code("CX-202609-0006", to="WM-TRIP-01", trigger="Mở chuyến bị trùng"), muted("22/09 09:30 – 11:00 (đã đổi)", 12), gap=0),
         col(num("−1 giờ", 13, 600, T["danger"]), subtle("chồng lấn", 11), gap=0), badge("Đã đổi tài xế", "success"), muted("—")],
        [badge("Gần trùng", "warning", "triangle-alert"), col(text("Xe 51D-678.90", 13, 600), muted("Mui bạt 15 tấn", 12), gap=0),
         col(code("CX-202609-0003", to="WM-TRIP-01", trigger="Mở chuyến"), muted("23/09 13:00 – 18:00", 12), gap=0),
         col(code("CX-202609-0005", to="WM-TRIP-01", trigger="Mở chuyến bị trùng"), muted("22/09 07:00 – 10:30", 12), gap=0),
         col(num("—", 13), subtle("khác ngày", 11), gap=0), badge("Đã override", "neutral"), muted("—")],
    ]
    override = panel("Ghi lý do và tiếp tục lưu CX-202609-0002", col(
        dl([("Chuyến", text("CX-202609-0002 · DH-202609-0002", 14, 500)), ("Xe · Tài xế", text("51C-123.45 · Nguyễn Văn Tài", 14)),
            ("Cảnh báo", text("2 gần trùng (xe, tài xế) · cách 1 giờ", 14, 500, T["warning"])), ("Quyền", text("dispatch.override_warning", 14, extra=NUM))], cols=4),
        field("Lý do override", textarea("Khách Q.7 nhận hàng sau 16:00; tuyến Thủ Đức → Long An 45 phút, còn dư thời gian.", h=56), required=True,
              hint="Bắt buộc. Lưu vào Timeline/Audit cùng người thực hiện, thời điểm và danh sách cảnh báo."),
        row(checkbox("Báo tài xế qua app về chuyến sát giờ", True), spacer(),
            btn("Quay lại sửa chuyến", "secondary", "arrow-left", to="WM-TRIP-02", trigger="Quay lại form chuyến"),
            btn("Xác nhận override và lưu", "primary", "check", to="WM-TRIP-01", trigger="Override có lý do → lưu chuyến"), gap=8),
        gap=12), subtle("Thiếu quyền override: nút lưu bị khóa, cần đổi xe/tài xế/giờ.", 12))
    content = col(
        page_header("Cảnh báo lịch", "Chuyến trùng hoặc gần trùng theo xe và tài xế. Cảnh báo mềm: override được khi có quyền và lý do.",
                    row(btn("Quay lại form chuyến", "secondary", "arrow-left", to="WM-TRIP-02", trigger="Quay lại form chuyến"),
                        btn("Lịch xe/tài xế", "secondary", "calendar-days", to="WM-DISPATCH-02", trigger="Mở lịch xe/tài xế"), gap=8),
                    crumbs=[("Điều phối", "WM-DISPATCH-01"), ("Cảnh báo lịch", None)]),
        banner(f'Ngưỡng gần trùng hiện tại: <b>2 giờ</b>. Kiểm tra riêng cho xe và tài xế. {a("Đổi ngưỡng", "WM-SET-01", "Mở cài đặt vận hành")}', "info"),
        override,
        filter_bar("Tìm mã chuyến, xe, tài xế…", ["Chờ xử lý (2)", "Đã override", "Đã xử lý", "Tất cả"], date="20/09 – 23/09/2026",
                   selects=("Loại: Tất cả",)),
        table(cols, rows, selected=[0, 1], footer=pagination("1–4", 4)),
        gap=16)
    return wm_shell("dispatch", content, h=1060, child="WM-DISPATCH-03")


# ---------------------------------------------------------------- WM-DISPATCH-04 locations
def _loc_item(code_, plate, drv, st, place, ago, speed, tone="accent", stale=False):
    use("LocationList")
    return col(
        row(code(code_, 13, to="WM-TRIP-01", trigger="Mở chuyến từ danh sách vị trí"), status(st, "trip"), spacer(),
            badge("Mất tín hiệu", "warning", "wifi-off") if stale else badge("Online", "success"), gap=6),
        row(icon("truck", 14, T["text-muted"]), num(plate, 13, 600), subtle("·"), text(drv, 13), gap=6),
        row(icon("locate-fixed", 14, TONES[tone][1]), text(place, 13), gap=6),
        row(subtle(ago, 12), subtle("·"), subtle(speed, 12), spacer(), a("Lịch sử GPS", "WM-TRIP-01", "Mở tab GPS của chuyến", 12), gap=6),
        gap=4, extra=f"padding: 12px 14px; border-bottom: 1px solid {T['border']};")


def dispatch_04():
    mp = map_placeholder(h=700, pins=[(64, 42, "51C-123.45 · CX-0001", "accent"), (36, 62, "51D-678.90 · CX-0003", "info"),
                                      (80, 26, "Kho Bình Dương", "primary"), (22, 70, "Nhà máy Long An", "primary"),
                                      (70, 55, "51C-456.78 · bãi", "neutral")], label="Bản đồ · TP.HCM và lân cận")
    locs = col(
        _loc_item("CX-202609-0001", "51C-123.45", "Nguyễn Văn Tài", "Đang vận chuyển", "Ngã tư Bình Phước, QL13, TP. Thủ Đức", "cập nhật 2 phút trước", "42 km/h"),
        _loc_item("CX-202609-0003", "51D-678.90", "Trần Minh Lái", "Đang lấy hàng", "KCN Tân Đức, Đức Hòa, Long An", "cập nhật 4 phút trước", "0 km/h · đứng yên", "info"),
        col(row(code("CX-202609-0002", 13, to="WM-TRIP-01", trigger="Mở chuyến chưa chạy"), status("Đã lên lịch", "trip"), gap=6),
            muted("Chưa có vị trí — app chỉ gửi GPS khi chuyến đang chạy", 12), gap=4,
            extra=f"padding: 12px 14px; border-bottom: 1px solid {T['border']};"),
        gap=0)
    side = panel("Vị trí gần nhất", col(locs, row(subtle("Tự làm mới mỗi 60 giây", 12), spacer(), btn("Làm mới", "ghost", "refresh-cw", size="sm"), gap=8,
                                                  extra="padding: 10px 14px;"), gap=0), badge("2 đang chạy", "accent"), body_pad=False,
                 extra="")
    idle = panel("Xe không có chuyến chạy", col(
        row(icon("truck", 14, T["text-muted"]), a("51C-456.78", "WM-VEH-02", "Mở xe"), muted("Tải thùng 10 tấn", 12), spacer(), badge("Sẵn sàng", "success"), gap=6),
        row(icon("truck", 14, T["text-muted"]), a("51H-111.22", "WM-VEH-02", "Mở xe"), muted("Xe lạnh 5 tấn", 12), spacer(), badge("Bảo dưỡng", "neutral"), gap=6),
        subtle("Không theo dõi GPS khi xe không có chuyến đang chạy.", 12), gap=10))
    gps_note = banner("App tài xế Nguyễn Văn Tài, Trần Minh Lái đã cấp quyền vị trí. Nếu tài xế tắt quyền, danh sách hiện cảnh báo.", "info")
    side = col(side, idle, gps_note, gap=16, extra="width: 380px; flex-shrink: 0;")
    content = col(
        page_header("Theo dõi vị trí", "Vị trí gần nhất của xe có chuyến đang chạy, gửi từ app tài xế",
                    row(btn("Bảng điều phối", "secondary", "kanban", to="WM-DISPATCH-01", trigger="Mở bảng điều phối"), gap=8)),
        filter_bar("Tìm biển số, tài xế, mã chuyến…", ["Đang chạy (2)", "Mất tín hiệu (0)", "Tất cả xe"], date="23/09/2026"),
        row(f'<div style="flex-grow: 1; min-width: 0;">{mp}</div>', side, gap=16, align="flex-start"),
        gap=16)
    return wm_shell("dispatch", content, h=1000, child="WM-DISPATCH-04")


# ---------------------------------------------------------------- WM-DISPATCH-05 incidents
INCIDENTS = [
    ("SC-202609-0004", "Kẹt xe", "Kẹt xe QL1A đoạn Tân An", "Trung bình", "DH-202609-0001", "CX-202609-0001", "Nguyễn Văn Tài · 23/09 10:42", None, "Mở"),
    ("SC-202609-0003", "Khách hẹn lại", "Công trình Thủ Đức nhận sau 17:00", "Thấp", "DH-202609-0002", "CX-202609-0003", "Trần Minh Lái · 23/09 13:15", "Lê Thu Vân", "Đang xử lý"),
    ("SC-202609-0002", "Hư xe", "Nổ lốp sau tại KCN Phú Mỹ", "Cao", "DH-202609-0010", "CX-202609-0005", "Trần Minh Lái · 22/09 07:40", "Lê Thu Vân", "Đã đóng"),
    ("SC-202609-0001", "Hàng hóa", "Thiếu 2 bao khi giao, khách ký nhận 158 bao", "Trung bình", "DH-202609-0009", "CX-202609-0006", "Lê Hoàng Phúc · 21/09 11:20", "Trần Hải", "Đã đóng"),
]


def dispatch_05():
    cols = [("Mã sự cố", "left", "140px"), ("Loại · Mô tả", "left"), ("Mức độ", "left"), ("Đơn · Chuyến", "left"),
            ("Báo bởi · Lúc", "left"), ("Người xử lý", "left"), ("Trạng thái", "left"), ("", "right", "44px")]
    rows = []
    for c, typ, desc, sev, oc, tc, by, handler, st in INCIDENTS:
        rows.append([code(c, to="WM-INC-01", trigger="Mở chi tiết sự cố"), col(text(typ, 13, 600), muted(desc, 12), gap=0), _sev(sev),
                     col(code(oc, 12, to="WM-ORD-02", trigger="Mở đơn"), code(tc, 12, to="WM-TRIP-01", trigger="Mở chuyến"), gap=0),
                     muted(by, 12), text(handler, 13) if handler else badge("Chưa gán", "warning"), _inc_status(st), row_menu()])
    content = col(
        page_header("Sự cố vận hành", "Sự cố từ app tài xế hoặc operation ghi nhận; gán người xử lý và đóng kèm ghi chú",
                    row(btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất danh sách sự cố"),
                        btn("Tạo sự cố", "primary", "plus", to="WM-INC-01", trigger="Tạo sự cố"), gap=8)),
        row(kpi("Đang mở", "1", "Chưa gán người xử lý", "danger", "incident"), kpi("Đang xử lý", "1", "Lê Thu Vân", "warning", "loader-circle"),
            kpi("Đã đóng tháng 9", "2", "Thời gian xử lý TB 3,5 giờ", None, "circle-check"),
            kpi("Mức độ cao", "1", "Hư xe · đã đóng", None, "triangle-alert"), gap=12, extra="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));"),
        filter_bar("Tìm mã sự cố, đơn, chuyến…", ["Tất cả", "Mở", "Đang xử lý", "Đã đóng"], date="01/09 – 30/09/2026",
                   selects=("Mức độ: Tất cả", "Loại: Tất cả", "Người xử lý: Tất cả")),
        table(cols, rows, selected=0, footer=pagination("1–4", 4)),
        gap=16)
    return wm_shell("dispatch", content, h=960, child="WM-DISPATCH-05")


# ---------------------------------------------------------------- WM-INC-01 incident detail
def inc_01():
    head = row(
        col(row(h("display", "SC-202609-0004"), _inc_status("Mở"), _sev("Trung bình"), gap=10),
            row(text("Kẹt xe QL1A đoạn Tân An", 14, 600), muted("·"), code("CX-202609-0001", 14, to="WM-TRIP-01", trigger="Mở chuyến liên quan"),
                muted("·"), code("DH-202609-0001", 14, to="WM-ORD-02", trigger="Mở đơn liên quan"), gap=8),
            subtle("Báo từ app tài xế bởi Nguyễn Văn Tài · 23/09/2026 10:42", 12), gap=4),
        spacer(),
        row(btn("Timeline", "secondary", "history", to="WM-SHELL-07", trigger="Mở Timeline drawer"),
            btn("Gán người xử lý", "secondary", "user-plus"),
            btn("Đóng sự cố", "primary", "check", to="WM-SHELL-08", trigger="Đóng sự cố (nhập ghi chú)"), gap=8), align="flex-start")
    desc = panel("Mô tả", col(
        dl([("Loại sự cố", "Kẹt xe"), ("Mức độ", _sev("Trung bình")), ("Vị trí báo", "QL1A, Tân An"), ("Ảnh hưởng", "Dự kiến trễ 60–90 phút")], cols=4),
        f'<div style="font-size: 14px; line-height: 22px; color: {T["text"]};">Tai nạn giữa 2 xe con trên QL1A hướng về TP.HCM, CSGT phân luồng. '
        f'Xe đứng yên khoảng 40 phút. Đã báo chị Hạnh (Kho Bình Dương) có thể giao trễ.</div>', gap=12))
    photos = panel("Ảnh & chứng từ", col(
        row(*[f'<a href="{href("WM-SHELL-06")}" style="flex: 1; text-decoration: none;">{photo_placeholder(h=110, label=l)}</a>'
              for l in ("IMG_1042.jpg · 10:41", "IMG_1043.jpg · 10:42")],
            f'<div style="flex: 1;">{upload_zone("Kéo thả ảnh hoặc", 110)}</div>', gap=10), gap=8), muted("2 ảnh", 12))
    edge("WM-SHELL-06", "Xem ảnh sự cố")
    handle = panel("Cập nhật xử lý", col(
        row(field("Trạng thái", select("Đang xử lý"), width="30%"), field("Người xử lý", select("Lê Thu Vân · Operation"), width="35%"),
            field("Ảnh hưởng tới chuyến", select("Trễ giờ giao"), width="35%"), gap=12),
        field("Ghi chú xử lý", textarea("Đã gọi tài xế, xe đã qua điểm kẹt lúc 11:25. Báo khách lùi giờ nhận sang 14:30.", h=56), required=True,
              hint="Ghi chú lưu vào Timeline sự cố. Đóng sự cố bắt buộc có ghi chú."),
        row(spacer(), btn("Lưu cập nhật", "primary", "check"), gap=8), gap=12))
    left = col(desc, photos, handle, gap=16, extra="flex: 2; min-width: 0;")
    related = panel("Liên quan", col(
        row(icon("route", 16, T["text-muted"]), col(code("CX-202609-0001", 13, to="WM-TRIP-01", trigger="Mở chuyến liên quan"),
                                                     muted("Cần Thơ → Bình Dương", 12), gap=0), spacer(), status("Đang vận chuyển", "trip"), gap=10),
        row(icon("package", 16, T["text-muted"]), col(code("DH-202609-0001", 13, to="WM-ORD-02", trigger="Mở đơn liên quan"),
                                                       muted("Công ty Gạo Miền Tây", 12), gap=0), spacer(), status("Đang thực hiện"), gap=10),
        row(icon("id-card", 16, T["text-muted"]), a("Nguyễn Văn Tài", "WM-DRV-02", "Mở tài xế"), spacer(), muted("0900 000 001", 12), gap=10),
        row(icon("truck", 16, T["text-muted"]), a("51C-123.45", "WM-VEH-02", "Mở xe"), spacer(), muted("Tải thùng 8 tấn", 12), gap=10),
        gap=10))
    handler = panel("Người xử lý", col(
        row(avatar("?", 28, "warning"), col(text("Chưa gán", 13, 600, T["warning"]), muted("Gợi ý: Lê Thu Vân (Operation, ca sáng)", 12), gap=0), gap=10),
        select("Chọn người xử lý"), gap=10))
    tl = panel("Timeline", timeline([
        ("11:30", "Trần Hải", "Ghi chú: gọi tài xế, xe đã qua điểm kẹt lúc 11:25", None, "info"),
        ("10:45", "Hệ thống", "Gửi thông báo sự cố cho Operation"),
        ("10:42", "Nguyễn Văn Tài", "Báo sự cố <b>Kẹt xe</b> · mức Trung bình · 2 ảnh", None, "danger")]),
        a("Xem tất cả", "WM-SHELL-07", "Mở Timeline"))
    right = col(related, handler, tl, gap=16, extra="flex: 1; min-width: 0;")
    content = col(breadcrumb([("Điều phối", "WM-DISPATCH-01"), ("Sự cố", "WM-DISPATCH-05"), ("SC-202609-0004", None)]), head,
                  row(left, right, gap=16, align="flex-start"), gap=16)
    return wm_shell("dispatch", content, h=1000, child="WM-DISPATCH-05")


# ---------------------------------------------------------------- register
C = dict(platform="wm", module="Điều phối", roles=ROLES_OPS)
register(
    Screen(id="WM-TRIP-01", name="Chi tiết chuyến", route="/trips/:tripId", render=trip_01, pattern="detail", h=1440, **C,
           purpose="Trung tâm một chuyến: phân công xe/tài xế, điểm dừng được giao, trạng thái (cập nhật thay tài xế), chi phí, thưởng, POD/COD, GPS, sự cố, timeline.",
           api=["trip(id)", "updateTripStatus(id, status, reason?)", "updateTrip(id, input, reason?)", "activityLogs(entityType: TRIP, entityId)", "tripLocations(tripId, last: 1)"],
           data=["code", "status", "order{code, customer}", "vehicle{plate, type}", "driver{name, phone}", "plannedStartAt", "plannedEndAt", "actualStartAt",
                 "stops[{sequence, type, location, contact, codExpected, codActual, podCount, status, actualArrivedAt, actualCompletedAt}]",
                 "expenses[]", "advances[]", "driverBonusAmount", "lastLocation{lat, lng, capturedAt, speed}", "incidents[]"],
           actions=[("Cập nhật trạng thái thay tài xế", "trip.status.update (Admin, Operation)"), ("Tạm dừng / hủy / đổi ngược", "trip.status.update — sensitive, lý do bắt buộc"),
                    ("Sửa chuyến / đổi xe, tài xế", "trip.assign → WM-TRIP-02, check overlap"), ("Thêm chi phí", "expense.create → WM-EXP-03"),
                    ("Báo sự cố", "incident.manage"), ("In phiếu điều xe", "trip.view")],
           states={"loading": "Skeleton header + tabs", "error": "Không tìm thấy chuyến / không có quyền → EmptyState + quay lại bảng điều phối",
                   "offline driver": "Banner info 'App tài xế mất kết nối từ 10:50' khi lastSeen > 15 phút"},
           notes=["Tabs dùng ?tab= (overview|stops|expenses|podcod|gps|incidents|timeline); mockup vẽ tab Tổng quan gồm tóm tắt mọi tab.",
                  "Tạm dừng lưu previous status để resume. Hủy chuyến/đổi ngược mở SensitiveActionModal (WM-SHELL-08).",
                  "Tạm ứng chuyến không tính vào lãi/lỗ đến khi đối soát (WM-ADV-01). COD tài xế thu không phải doanh thu.",
                  "Accountant chỉ xem; nút cập nhật trạng thái/sửa ẩn theo quyền."]),
    Screen(id="WM-TRIP-02", name="Tạo/sửa chuyến", route="/orders/:orderId/trips/new · /trips/:tripId/edit", render=trip_02, pattern="form", h=1460,
           **{**C, "roles": ["admin", "operation"]},
           purpose="Tạo chuyến từ đơn: chọn điểm dừng phụ trách (đơn nhiều xe), xe, tài xế, giờ dự kiến, thưởng tài xế; kiểm tra trùng/gần trùng lịch mềm.",
           api=["order(id){stops, trips}", "vehicles(filter: {status: ACTIVE})", "drivers(filter: {status: ACTIVE})", "checkTripOverlap(input)",
                "createTrip(input)", "updateTrip(id, input, reason?)"],
           data=["orderId", "stopIds[]", "vehicleId", "driverId", "plannedStartAt", "plannedEndAt", "driverBonusAmount", "note", "warnings[{type, subject, conflictTripId, gapMinutes}]"],
           actions=[("Lưu chuyến", "trip.create / trip.assign"), ("Tiếp tục và ghi lý do", "dispatch.override_warning → WM-DISPATCH-03"),
                    ("Đổi xe/tài xế", "trip.assign")],
           states={"validation": "Thiếu xe/tài xế/giờ → lỗi inline danger; end < start → lỗi inline",
                   "warning": "Overlap/gần overlap → WarningPanel (không chặn); thiếu quyền override → nút Lưu khóa",
                   "checking": "Gọi checkTripOverlap debounce 400ms khi đổi xe/tài xế/giờ; spinner nhỏ cạnh WarningPanel"},
           notes=["Đơn 1 xe: mặc định gán tất cả điểm. Đơn nhiều xe: checkbox điểm; điểm đã gán chuyến khác hiện mã chuyến.",
                  "Tài xế/xe ngừng hoạt động hiện disabled trong picker (DRV-A-003), không chọn được.",
                  "Ngưỡng gần trùng lấy từ merchant settings (seed: 2 giờ).", "MoneyInput số nguyên VND cho thưởng tài xế."]),
    Screen(id="WM-STOP-01", name="Chi tiết điểm dừng", route="/orders/:orderId/stops/:stopId (drawer trên chuyến/đơn)", render=stop_01, pattern="drawer",
           h=1280, overlay_of="WM-TRIP-01", **C,
           purpose="Chi tiết một điểm lấy/trả: địa chỉ, liên hệ, trạng thái, COD dự kiến/thực thu, POD, giờ thực tế; sửa COD có lý do.",
           api=["orderStop(id){attachments(category: POD), statusHistory}", "updateStopStatus(id, status, reason?)", "updateStopCodActual(id, amount, reason)"],
           data=["type", "sequence", "location{name, address}", "contact{name, phone}", "plannedAt", "actualArrivedAt", "actualCompletedAt",
                 "codExpected", "codActual", "podAttachments[]", "status", "statusHistory[]"],
           actions=[("Đánh dấu đã đến / hoàn thành", "trip.status.update"), ("Bỏ qua điểm", "trip.status.update — lý do bắt buộc"),
                    ("Sửa COD", "cod.update — sensitive, WM-SHELL-08, audit before/after"), ("Xem POD", "trip.view → WM-SHELL-06")],
           states={"empty POD": "Ô POD nét đứt 'Chờ tài xế chụp'", "loading": "Skeleton trong drawer"},
           notes=["Mở dạng drawer từ WM-TRIP-01 / WM-ORD-04; mở trực tiếp URL thì render như page.",
                  "Xóa/bỏ qua điểm đã có POD/COD cần action nhạy cảm."]),
    Screen(id="WM-DISPATCH-01", name="Bảng điều phối", route="/dispatch", render=dispatch_01, pattern="board", h=960, **C,
           purpose="Theo dõi chuyến theo ngày/trạng thái, lọc tài xế/xe, mở chuyến, gán xe cho chuyến chưa gán; cảnh báo lịch nổi rõ nhưng không chặn.",
           api=["trips(filter: {dateFrom, dateTo, status, driverId, vehicleId}, first, after)", "dispatchSummary(date)", "updateTripStatus(id, status, reason?)"],
           data=["code", "order.code", "routeSummary", "vehicle.plate", "driver.name", "plannedStartAt", "plannedEndAt", "status", "warnings[]"],
           actions=[("Tạo chuyến", "trip.create"), ("Gán xe", "trip.assign"), ("Kéo thẻ đổi trạng thái", "trip.status.update"), ("Mở chuyến", "trip.view")],
           states={"loading": "Skeleton cột + 2 thẻ/cột", "empty": "Cột trống 'Không có chuyến'", "error": "Banner danger + Thử lại",
                   "polling": "Refetch 30 giây để nhận trạng thái từ app tài xế"},
           notes=["SegmentedControl Danh sách · Bảng · Lịch; Lịch → /dispatch/calendar (WM-DISPATCH-02). Danh sách = DataTable cùng filter.",
                  "Filter lưu vào query string (?date=&driverId=&vehicleId=&status=&view=board)."]),
    Screen(id="WM-DISPATCH-02", name="Lịch xe/tài xế", route="/dispatch/calendar", render=dispatch_02, pattern="board", h=1000, **C,
           purpose="ScheduleView: dòng là xe hoặc tài xế, trục 00–24, khối là chuyến; trùng/gần trùng có viền cảnh báo; click khối mở chuyến.",
           api=["vehicleSchedules(date)", "driverSchedules(date)", "checkTripOverlap(input)"],
           data=["resource{type, id, label, status}", "blocks[{tripId, code, start, end, status, warning}]"],
           actions=[("Click khối → chi tiết chuyến", "trip.view"), ("Tạo chuyến", "trip.create")],
           states={"empty": "Dòng không có khối = rảnh", "inactive": "Xe bảo dưỡng: khối gạch chéo; tài xế ngừng hoạt động: dòng mờ"},
           notes=["Phase 1 có thể thay bằng list nhóm theo xe/tài xế (BRD 05 §1).", "Vạch đỏ = thời điểm hiện tại."]),
    Screen(id="WM-DISPATCH-03", name="Cảnh báo lịch", route="/dispatch/conflicts", render=dispatch_03, pattern="list", h=1060, **C,
           purpose="Danh sách chuyến trùng/gần trùng theo xe và tài xế, khoảng cách thời gian; override có quyền + lý do, ghi audit; quay lại form chuyến.",
           api=["checkTripOverlap(input)", "scheduleWarnings(filter)", "createTrip(input, overrideReason)", "updateTrip(id, input, reason)"],
           data=["type (OVERLAP|NEAR_OVERLAP)", "subject (VEHICLE|DRIVER)", "trip", "conflictTrip", "gapMinutes", "thresholdMinutes", "status", "overrideReason"],
           actions=[("Xác nhận override và lưu", "dispatch.override_warning — lý do bắt buộc"), ("Override từng dòng", "WM-SHELL-08"),
                    ("Quay lại sửa chuyến", "→ WM-TRIP-02")],
           states={"no permission": "Khối override hiển thị 'Bạn không có quyền override' và khóa nút lưu",
                   "empty": "EmptyState 'Không có cảnh báo lịch'"},
           notes=["Ngưỡng gần trùng = merchant setting (WM-SET-01), seed 2 giờ.", "Override ghi audit_log gồm danh sách cảnh báo tại thời điểm lưu."]),
    Screen(id="WM-DISPATCH-04", name="Theo dõi vị trí", route="/dispatch/map", render=dispatch_04, pattern="page", h=1000, **C,
           purpose="Bản đồ + LocationList vị trí gần nhất của xe có chuyến đang chạy; mở chuyến/lịch sử GPS.",
           api=["lastKnownLocations(filter: {status: RUNNING})", "tripLocations(tripId)"],
           data=["trip{code, status}", "vehicle.plate", "driver.name", "lat", "lng", "address", "capturedAt", "speed", "isStale"],
           actions=[("Mở chuyến / lịch sử GPS", "trip.view"), ("Làm mới", "trip.view")],
           states={"no GPS": "'Chưa có vị trí — app chỉ gửi GPS khi chuyến đang chạy'", "stale": "Badge 'Mất tín hiệu' khi capturedAt > 15 phút",
                   "map error": "Fallback chỉ LocationList"},
           notes=["Polling 60 giây. Map SDK (Google Maps/Mapbox) quyết định ở tech; mockup dùng MapView placeholder."]),
    Screen(id="WM-DISPATCH-05", name="Sự cố vận hành", route="/dispatch/incidents", render=dispatch_05, pattern="list", **C,
           purpose="Danh sách sự cố theo trạng thái/mức độ; tạo, gán người xử lý, đóng.",
           api=["incidents(filter: {status, severity, type, assigneeId, dateFrom, dateTo}, first, after)"],
           data=["code", "type", "title", "severity", "order.code", "trip.code", "reportedBy", "reportedAt", "assignee", "status"],
           actions=[("Tạo sự cố", "incident.manage"), ("Gán người xử lý", "incident.manage"), ("Đóng sự cố", "incident.manage — ghi chú bắt buộc; Accountant ⚠️")],
           states={"empty": "EmptyState 'Chưa có sự cố'", "loading": "DataTable skeleton"},
           notes=["Mã sự cố SC-YYYYMM-NNNN theo cấu hình mã tự động (WM-SET-02)."]),
    Screen(id="WM-INC-01", name="Chi tiết sự cố", route="/dispatch/incidents/:incidentId", render=inc_01, pattern="detail", h=1000, **C,
           purpose="Loại, mức độ, mô tả, ảnh, đơn/chuyến liên quan, người xử lý, trạng thái, timeline; cập nhật xử lý và đóng.",
           api=["incident(id)", "updateIncident(id, input)", "assignIncident(id, userId)", "closeIncident(id, note)", "createAttachment(input)"],
           data=["code", "type", "severity", "title", "description", "location", "attachments[]", "order", "trip", "driver", "vehicle", "assignee", "status", "activity[]"],
           actions=[("Cập nhật xử lý", "incident.manage"), ("Gán người xử lý", "incident.manage"), ("Đóng sự cố", "incident.manage — ghi chú bắt buộc"),
                    ("Upload ảnh", "incident.manage")],
           states={"closed": "Form cập nhật ẩn; hiện ghi chú đóng + người đóng", "loading": "Skeleton"},
           notes=["Ảnh mở Attachment viewer (WM-SHELL-06).", "Sự cố mở hiển thị badge trên đơn/chuyến liên quan và Dashboard."]),
)
