"""Web Khách hàng (phase 3) — khách cuối tìm nhà xe, gửi booking, theo dõi đơn, tải bảng kê.

Customer đăng nhập = Bao bì Hưng Lợi (CUS-A-003) của nhà xe BTA Demo Transport.
Booking (BK-) không bao giờ tự thành đơn: operation tiếp nhận rồi tạo đơn ở WM-ORD-03.
Chỉ hiện dữ liệu customer-safe: không chi phí, không lãi/lỗ, không ghi chú nội bộ.
"""
from .. import data as D
from ..core import Screen, register
from ..shells import cw_shell
from ..ui import *  # noqa: F401,F403

CUS_NAME = "Bao bì Hưng Lợi"
MER = D.MERCHANT["name"]  # BTA Demo Transport

# Nav index in shells.CW_NAV: 0 Tìm nhà xe · 1 Booking của tôi · 2 Đơn hàng · 3 Bảng kê ; -1 = trang tài khoản
NAV_FIND, NAV_BOOK, NAV_ORD, NAV_DEBT, NAV_NONE = 0, 1, 2, 3, -1

BOOKING_STATUS = {"Chờ tiếp nhận": "warning", "Đang xử lý": "info", "Đã tạo đơn": "success", "Đã hủy": "neutral"}

# Địa chỉ thường dùng của khách (customer-owned address book) — extra seed
ADDRESSES = [
    ("Xưởng Hưng Lợi Tân Uyên", "Lô C5, KCN Nam Tân Uyên, Tân Uyên, Bình Dương", "Anh Lợi", "0918 456 123", "Lấy hàng", "Xe nâng tại cổng 2, nhận hàng 07:00–16:00", True),
    ("Kho Thuận An", "Số 45 ĐT743C, Thuận An, Bình Dương", "Chị Hoa", "0918 222 789", "Lấy hàng", "Đường vào cấm xe trên 10 tấn 06:00–09:00", False),
    ("Sài Gòn Food — Kho Tân Phú", "Số 102 Lũy Bán Bích, Q. Tân Phú, TP.HCM", "Anh Minh", "0909 876 543", "Trả hàng", "Giao giờ hành chính, gọi trước 30 phút", False),
    ("Bánh kẹo Hải Hà — Nhà máy Q.12", "Lô 18, KCN Tân Thới Hiệp, Q.12, TP.HCM", "Chị Trang", "0937 111 555", "Trả hàng", "Xuất trình phiếu giao hàng tại cổng bảo vệ", False),
    ("Nước giải khát Tân Tạo", "Đường số 3, KCN Tân Tạo, Q. Bình Tân, TP.HCM", "Anh Khoa", "0976 333 222", "Trả hàng", "Dỡ hàng tại dock 4", False),
]

# code, sent_at, pickup, drop, pickup_time, cargo, status, order
BOOKINGS = [
    ("BK-202609-0007", "23/09/2026 09:40", "Xưởng Hưng Lợi Tân Uyên", "Bánh kẹo Hải Hà — Q.12", "24/09 07:00", "Thùng carton 5 lớp · 3 tấn", "Chờ tiếp nhận", None),
    ("BK-202609-0006", "22/09/2026 16:05", "Kho Thuận An", "Nước giải khát Tân Tạo", "25/09 08:00", "Màng co PE · 2,5 tấn", "Đang xử lý", None),
    ("BK-202609-0005", "21/09/2026 08:30", "Xưởng Hưng Lợi Tân Uyên", "Sài Gòn Food — Tân Phú", "22/09 07:00", "Thùng carton 3 lớp · 4 tấn", "Đã tạo đơn", "DH-202609-0012"),
    ("BK-202609-0003", "15/09/2026 10:12", "Xưởng Hưng Lợi Tân Uyên", "Nước giải khát Tân Tạo", "23/09 06:30", "Khay nhựa PET · 3,5 tấn", "Đã tạo đơn", "DH-202609-0008"),
    ("BK-202609-0002", "12/09/2026 14:50", "Kho Thuận An", "Công trình Quận 7", "14/09 08:00", "Pallet giấy · 1,2 tấn", "Đã hủy", None),
    ("BK-202609-0001", "05/09/2026 09:05", "Xưởng Hưng Lợi Tân Uyên", "Bánh kẹo Hải Hà — Q.12", "08/09 07:00", "Thùng carton 5 lớp · 3 tấn", "Đã tạo đơn", "DH-202609-0006"),
]

# Đơn khách thấy được (không có Nháp). code, created, route, status, total, paid, due, booking
MY_ORDERS = [
    ("DH-202609-0012", "21/09/2026", "Tân Uyên → Q. Tân Phú", "Chờ xác nhận", 4_800_000, 0, "30/09/2026", "BK-202609-0005"),
    ("DH-202609-0008", "16/09/2026", "Tân Uyên → Q. Bình Tân", "Đang thực hiện", 3_900_000, 0, "03/10/2026", "BK-202609-0003"),
    ("DH-202609-0006", "06/09/2026", "Tân Uyên → Q.12", "Hoàn thành", 3_600_000, 3_600_000, "15/09/2026", "BK-202609-0001"),
    ("DH-202608-0021", "26/08/2026", "Thuận An → Q. Tân Phú", "Hoàn thành", 4_200_000, 4_200_000, "02/09/2026", None),
    ("DH-202608-0014", "14/08/2026", "Tân Uyên → Q.12", "Hoàn thành", 3_000_000, 3_000_000, "21/08/2026", None),
    ("DH-202608-0006", "05/08/2026", "Tân Uyên → Q. Bình Tân", "Hoàn thành", 5_400_000, 5_400_000, "12/08/2026", None),
]

# code, period, sent, orders, total, paid, remain, status
STATEMENTS = [
    ("CN-202609-0004", "01/09 – 20/09/2026", "21/09/2026", 2, 7_500_000, 3_600_000, 3_900_000, "Đã gửi"),
    ("CN-202608-0009", "01/08 – 31/08/2026", "02/09/2026", 3, 12_600_000, 12_600_000, 0, "Đã gửi"),
    ("CN-202607-0011", "01/07 – 31/07/2026", "03/08/2026", 2, 6_800_000, 6_800_000, 0, "Đã gửi"),
]


# ---------------------------------------------------------------- private helpers
def _bk(label):
    return badge(label, BOOKING_STATUS[label], outline=(label == "Đã hủy"))


def _section(n, title, body, right=""):
    return panel(None, col(row(f'<span style="display: inline-flex; width: 22px; height: 22px; border-radius: 50%; background: {T["primary-soft"]}; '
                               f'color: {T["primary"]}; font-size: 12px; font-weight: 700; align-items: center; justify-content: center;">{n}</span>',
                               h("sm", title), spacer(), right, gap=8), body, gap=14))


def _picker(value, sub, ic="map-pin"):
    use("EntityPicker")
    return (f'<div style="display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 10px; box-sizing: border-box; border: 1px solid {T["border-control"]}; '
            f'border-radius: 4px; background: {T["surface"]};">{icon(ic, 16, T["text-muted"])}'
            f'<div style="display: flex; flex-direction: column; flex-grow: 1; min-width: 0;">{text(value, 14, 500)}{subtle(sub, 11)}</div>'
            f'{icon("chevron-down", 16, T["text-muted"])}</div>')


def _right_drawer(html):
    return f'<div style="width: 100%; height: 100%; display: flex; justify-content: flex-end;">{html}</div>'


def _merchant_mark(initials, size=44):
    return (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: {size}px; height: {size}px; flex-shrink: 0; '
            f'border-radius: 8px; background: {T["primary-soft"]}; color: {T["primary"]}; font-size: {size // 3}px; font-weight: 700;">{initials}</span>')


def _chip(label, ic=None):
    return badge(label, "neutral", ic)


def _not_order_note():
    return banner("Yêu cầu chưa phải đơn hàng — nhà xe sẽ liên hệ xác nhận giá, xe và thời gian rồi mới tạo đơn.", "info", "info")


# ---------------------------------------------------------------- CW-AUTH-01
def auth_01():
    form = col(
        segmented(["Đăng nhập", "Đăng ký"], 0, links=[None, "CW-AUTH-01"]),
        field("Email hoặc số điện thoại", input_("logistics@baobihungloi.test", prefix_ic="mail", h=40), True),
        field("Mật khẩu", input_("••••••••••", prefix_ic="lock", suffix="Hiện", h=40), True),
        row(checkbox("Ghi nhớ đăng nhập", True), spacer(), a("Quên mật khẩu?", "CW-AUTH-01", "Quên mật khẩu (gửi mã về email/SĐT)"), gap=8),
        btn("Đăng nhập", "primary", "log-in", to="CW-HOME-01", trigger="Đăng nhập thành công → Trang khám phá", size="lg", full=True),
        row(muted("Chưa có tài khoản?", 13), a("Đăng ký tài khoản khách hàng", "CW-AUTH-01", "Chuyển tab Đăng ký"), gap=6, justify="center"),
        gap=16)
    card = panel(None, col(col(h("lg", "Đăng nhập tài khoản khách hàng"),
                               muted("Dùng email hoặc số điện thoại đã đăng ký với nhà xe.", 13), gap=2), form, gap=20), pad=28,
                 extra="width: 440px;")
    reg = panel("Đăng ký gồm", col(
        dl([("Bắt buộc", "Họ tên, email hoặc SĐT, mật khẩu"), ("Tùy chọn", "Tên doanh nghiệp, mã số thuế")], cols=1),
        subtle("Nếu SĐT/email trùng với khách hàng nhà xe đã tạo, tài khoản sẽ được liên kết sau khi xác minh mã OTP.", 12), gap=10),
        extra="width: 360px;")
    side = col(
        panel("Tài khoản khách hàng dùng để", col(
            *[row(icon(ic, 16, T["primary"]), text(t, 13), gap=8, align="flex-start") for ic, t in [
                ("send", "Gửi yêu cầu vận chuyển tới nhà xe"), ("package", "Theo dõi đơn nhà xe đã tạo cho bạn"),
                ("file-text", "Tải bảng kê công nợ nhà xe đã gửi"), ("contact", "Lưu địa chỉ lấy/trả thường dùng")]], gap=10),
              extra="width: 360px;"),
        reg,
        row(muted("Chỉ muốn xem nhà xe?", 13), a("Tìm nhà xe không cần đăng nhập", "CW-HOME-01", "Tiếp tục không đăng nhập"), gap=6),
        gap=16)
    content = row(card, side, gap=24, align="flex-start", justify="center", extra="padding-top: 36px;")
    return cw_shell(NAV_NONE, content, logged_in=False)


# ---------------------------------------------------------------- CW-HOME-01
MERCHANTS = [
    ("BT", MER, "Bình Dương · TP.HCM · Miền Tây", ["Hàng nguyên xe", "Hàng lẻ ghép", "Bốc xếp"], "Tải thùng · Mui bạt · Xe lạnh",
     "Tiếp nhận 07:00–19:00", "Đã hợp tác · 6 đơn"),
    ("PN", "Vận tải Phương Nam", "Bình Dương · Đồng Nai · TP.HCM", ["Hàng nguyên xe", "Container 20/40"], "Tải thùng 5–15 tấn · Đầu kéo",
     "Tiếp nhận 06:00–20:00", None),
    ("MK", "Nhà xe Minh Khang", "TP.HCM · Long An · Tiền Giang", ["Hàng lẻ ghép", "Giao nội thành"], "Tải nhẹ 1,5–2,5 tấn",
     "Tiếp nhận 07:30–17:30", None),
    ("TB", "Vận tải Tân Cảng Bắc", "Bình Dương · Tây Ninh · Bình Phước", ["Hàng nguyên xe", "Bốc xếp"], "Mui bạt 10–15 tấn",
     "Tiếp nhận 07:00–18:00", None),
]


def home_01():
    search = (f'<div style="display: flex; align-items: flex-end; gap: 10px; padding: 14px 16px; background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px;">'
              + field("Tuyến — điểm đi", select("Bình Dương"), width="200px")
              + field("Điểm đến", select("TP.HCM"), width="200px")
              + field("Dịch vụ", select("Hàng nguyên xe"), width="200px")
              + field("Loại xe", select("Tải thùng 5–10 tấn"), width="200px")
              + field("Từ khóa", input_("", "Tên nhà xe", prefix_ic="search"))
              + btn("Tìm nhà xe", "primary", "search") + '</div>')
    items = []
    for i, (ini, name, area, svcs, veh, hours, rel) in enumerate(MERCHANTS):
        bt = i == 0
        left = row(_merchant_mark(ini),
                   col(row(a(name, "CW-MER-01", f"Mở hồ sơ nhà xe {name}" if bt else "Mở hồ sơ nhà xe", 15, 600),
                           badge(rel, "primary", "handshake") if rel else "", gap=8),
                       row(icon("map", 14, T["text-muted"]), muted(area, 13), muted("·"), icon("clock", 14, T["text-muted"]), muted(hours, 13), gap=6),
                       row(*[_chip(s) for s in svcs], muted("·"), muted(veh, 12), gap=6), gap=4), gap=14, align="flex-start")
        acts = row(btn("Xem hồ sơ", "secondary", to="CW-MER-01", trigger="Xem hồ sơ nhà xe"),
                   btn("Gửi yêu cầu", "primary" if bt else "secondary", "send", to="CW-BOOK-01", trigger="Gửi yêu cầu → Tạo booking"), gap=8)
        bd = f"border-top: 1px solid {T['border']};" if i else ""
        items.append(f'<div style="display: flex; align-items: center; gap: 16px; padding: 16px 18px; {bd}">{left}{spacer()}{acts}</div>')
    results = (f'<div style="background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px;">'
               f'<div style="display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-bottom: 1px solid {T["border"]}; background: {T["surface-muted"]}; border-radius: 8px 8px 0 0;">'
               f'{text("4 nhà xe phù hợp", 13, 600)}{muted("· Bình Dương → TP.HCM · Hàng nguyên xe", 13)}{spacer()}{muted("Sắp xếp", 13)}{select("Đã hợp tác trước", width="180px", h=30, fs=13)}</div>'
               f'{"".join(items)}</div>')
    recent = panel("Yêu cầu gần đây của bạn", col(
        *[row(code(c, to="CW-BOOK-03", trigger="Mở booking gần đây"), spacer(), _bk(s), gap=8) for c, _, _, _, _, _, s, _ in BOOKINGS[:3]],
        a("Xem tất cả booking", "CW-BOOK-02"), gap=10), extra="width: 300px; flex-shrink: 0;")
    note = panel("Cách gửi yêu cầu", col(
        *[row(text(f"{n}.", 13, 600, T["primary"]), muted(t, 13), gap=6, align="flex-start") for n, t in [
            (1, "Chọn nhà xe phù hợp tuyến và loại xe."), (2, "Gửi yêu cầu: điểm lấy/trả, hàng, thời gian."),
            (3, "Nhà xe xác nhận giá và tạo đơn."), (4, "Theo dõi đơn và tải chứng từ tại mục Đơn hàng.")]], gap=6),
        extra="width: 300px; flex-shrink: 0;")
    content = col(
        page_header("Tìm nhà xe", "Tìm theo tuyến, dịch vụ và loại xe; xem hồ sơ trước khi gửi yêu cầu vận chuyển"),
        search,
        row(col(results, subtle("Chỉ hiển thị nhà xe đã bật hồ sơ công khai.", 12), gap=8, extra="flex: 1; min-width: 0;"),
            col(recent, note, gap=16), gap=20, align="flex-start"),
        gap=18)
    return cw_shell(NAV_FIND, content)


# ---------------------------------------------------------------- CW-MER-01
def mer_01():
    head = row(_merchant_mark("BT", 56),
               col(row(h("display", MER), badge("Đã hợp tác", "primary", "handshake"), gap=10),
                   row(icon("map", 14, T["text-muted"]), muted("Bình Dương · TP.HCM · Miền Tây", 14), muted("·"),
                       icon("clock", 14, T["text-muted"]), muted("Tiếp nhận yêu cầu 07:00–19:00, cả Chủ nhật", 14), gap=6), gap=4),
               spacer(),
               row(btn("Gọi 0283 812 3456", "secondary", "phone"),
                   btn("Gửi yêu cầu vận chuyển", "primary", "send", to="CW-BOOK-01", trigger="Gửi yêu cầu vận chuyển"), gap=8), gap=16)
    services = table([("Dịch vụ", "left"), ("Mô tả", "left"), ("Ghi chú", "left")],
                     [[text("Hàng nguyên xe", 13, 600), muted("Nguyên chuyến 1 xe, đi thẳng điểm lấy → điểm trả"), muted("Giá theo tuyến, báo khi xác nhận")],
                      [text("Hàng lẻ ghép", 13, 600), muted("Ghép hàng tuyến Bình Dương ↔ TP.HCM"), muted("Tối thiểu 500 kg")],
                      [text("Bốc xếp", 13, 600), muted("Bốc xếp tại điểm lấy/trả"), muted("Thu thêm theo khối lượng")],
                      [text("Lưu ca xe", 13, 600), muted("Chờ nhận hàng quá 2 giờ"), muted("Thu thêm theo giờ")]], compact=True)
    vehicles = table([("Loại xe", "left"), ("Tải trọng", "left"), ("Phù hợp", "left")],
                     [[text("Tải thùng", 13, 600), num("8 – 10 tấn"), muted("Thùng carton, bao bì, pallet")],
                      [text("Mui bạt", 13, 600), num("15 tấn"), muted("Hàng cồng kềnh, vật liệu")],
                      [text("Xe lạnh", 13, 600), num("5 tấn"), muted("Thực phẩm cần giữ lạnh")]], compact=True)
    routes = row(*[_chip(r, "route") for r in ["Bình Dương → TP.HCM", "Cần Thơ → Bình Dương", "Long An → TP.HCM", "Đồng Tháp → Thủ Đức", "Phú Mỹ → Biên Hòa"]],
                 gap=6, wrap=True)
    left = col(
        panel("Giới thiệu", col(text("Nhà xe vận tải hàng hóa đường bộ khu vực Đông Nam Bộ và Miền Tây, đội xe tải thùng, mui bạt và xe lạnh. "
                                      "Nhận hàng công nghiệp, bao bì, nông sản; có bốc xếp tại kho.", 14), routes, gap=12)),
        panel("Dịch vụ", services, body_pad=False),
        panel("Loại xe", vehicles, body_pad=False, sub="Số xe sẵn sàng do nhà xe xác nhận khi tiếp nhận yêu cầu"),
        panel("Lưu ý từ nhà xe", col(
            *[row(icon("minus", 14, T["text-subtle"]), text(t, 13), gap=4, align="flex-start") for t in [
                "Gửi yêu cầu trước ít nhất 12 giờ với chuyến đi tỉnh.",
                "Giá cước báo sau khi tiếp nhận; không thu cọc khi đặt.",
                "Hàng dễ vỡ, hàng cần giữ lạnh: ghi rõ trong phần hàng hóa.",
                "Công nợ theo bảng kê định kỳ, thanh toán chuyển khoản."]], gap=4)),
        gap=16, extra="flex: 2; min-width: 0;")
    right = col(
        panel("Liên hệ", dl([("Điều phối", "0283 812 3456"), ("Email", "dieuphoi@bta-demo.test"),
                             ("Văn phòng", "Số 88 Quốc lộ 13, Thuận An, Bình Dương"), ("Giờ tiếp nhận", "07:00 – 19:00 hằng ngày")], cols=1, gap=10)),
        panel("Bạn và nhà xe này", col(
            row(muted("Mã khách tại nhà xe", 13), spacer(), code("CUS-A-003"), gap=8),
            row(muted("Đơn hàng", 13), spacer(), a("6 đơn", "CW-ORD-01", "Xem đơn với nhà xe này"), gap=8),
            row(muted("Booking đang chờ", 13), spacer(), a("2 yêu cầu", "CW-BOOK-02", "Xem booking đang chờ"), gap=8),
            row(muted("Bảng kê đã nhận", 13), spacer(), a("3 bảng kê", "CW-DEBT-01", "Xem bảng kê của nhà xe"), gap=8), gap=10)),
        banner("Gửi yêu cầu không tạo đơn ngay. Nhà xe tiếp nhận, xác nhận giá rồi mới tạo đơn hàng.", "info"),
        gap=16, extra="flex: 1; min-width: 0;")
    content = col(breadcrumb([("Tìm nhà xe", "CW-HOME-01"), (MER, None)]), head, row(left, right, gap=20, align="flex-start"), gap=16)
    return cw_shell(NAV_FIND, content, h=1120)


# ---------------------------------------------------------------- CW-BOOK-01
def book_01():
    to_mer = row(_merchant_mark("BT", 36), col(row(muted("Gửi tới", 12), gap=4), a(MER, "CW-MER-01", "Xem hồ sơ nhà xe", 14, 600), gap=0),
                 spacer(), a("Đổi nhà xe", "CW-HOME-01", "Đổi nhà xe"), gap=10)
    addr_btn = btn("Chọn từ địa chỉ thường dùng", "ghost", "contact", size="sm", to="CW-ADDR-01", trigger="Chọn từ địa chỉ thường dùng")
    stop_row = lambda kind, tone, ic, place, addr, contact: row(
        badge(kind, tone, ic), field("Địa điểm", _picker(place, addr), True, width="56%"),
        field("Người liên hệ tại điểm", input_(contact), width="36%"), gap=12, align="flex-end")
    stops = _section(1, "Điểm lấy và điểm trả", col(
        stop_row("Lấy", "info", "package-check", "Xưởng Hưng Lợi Tân Uyên", "Địa chỉ thường dùng · Lô C5, KCN Nam Tân Uyên", "Anh Lợi · 0918 456 123"),
        stop_row("Trả", "primary", "map-pin", "Bánh kẹo Hải Hà — Nhà máy Q.12", "Địa chỉ thường dùng · Lô 18, KCN Tân Thới Hiệp", "Chị Trang · 0937 111 555"),
        row(btn("Thêm điểm trả", "ghost", "plus", size="sm"), spacer(), subtle("Tối đa 5 điểm trả trong một yêu cầu", 12), gap=8), gap=12), addr_btn)
    cargo = _section(2, "Hàng hóa", col(
        row(field("Tên hàng", input_("Thùng carton 5 lớp"), True, width="40%"), field("Khối lượng", input_("3", suffix="tấn")),
            field("Số kiện", input_("120", suffix="kiện")), field("Loại xe đề nghị", select("Tải thùng 5–10 tấn")), gap=12),
        row(checkbox("Cần bốc xếp tại điểm lấy", True), checkbox("Cần bốc xếp tại điểm trả"), checkbox("Hàng dễ vỡ / tránh ẩm", True), gap=20), gap=12))
    timing = _section(3, "Thời gian", row(
        field("Lấy hàng từ", input_("24/09/2026 07:00", mono=True, prefix_ic="calendar"), True, width="30%"),
        field("Giao trước", input_("24/09/2026 12:00", mono=True, prefix_ic="calendar"), width="30%"),
        field("Mức linh hoạt", select("Có thể lệch ± 2 giờ"), width="40%"), gap=12))
    contact = _section(4, "Ghi chú và liên hệ", row(
        field("Ghi chú cho nhà xe", textarea("Hàng xếp sẵn trên pallet, xe vào cổng 2. Cần xuất phiếu giao hàng có tên người nhận.", h=84), width="55%"),
        col(field("Người liên hệ chính", input_("Trần Văn Hưng"), True), field("Số điện thoại", input_("0918 456 120", mono=True), True), gap=12,
            extra="width: 45%;"), gap=12, align="flex-start"))
    summary = panel("Tóm tắt yêu cầu", col(
        dl([("Tuyến", "Tân Uyên → Q.12"), ("Hàng", "Thùng carton 5 lớp · 3 tấn · 120 kiện"), ("Lấy hàng", num("24/09/2026 07:00")),
            ("Loại xe", "Tải thùng 5–10 tấn"), ("Dịch vụ thêm", "Bốc xếp tại điểm lấy")], cols=1, gap=10),
        divider(),
        row(muted("Giá cước", 13), spacer(), text("Nhà xe báo giá", 13, 600), gap=8),
        subtle("Giá và xe được nhà xe xác nhận khi tiếp nhận. Bạn sẽ nhận thông báo khi yêu cầu được tạo thành đơn.", 12),
        gap=12), extra="width: 340px; flex-shrink: 0;")
    content = col(
        page_header("Tạo yêu cầu vận chuyển", "Điền điểm lấy/trả, hàng hóa và thời gian; nhà xe sẽ xác nhận giá và tạo đơn",
                    row(btn("Hủy", "secondary", to="CW-MER-01", trigger="Hủy → quay lại hồ sơ nhà xe"),
                        btn("Gửi yêu cầu", "primary", "send", to="CW-BOOK-03", trigger="Gửi yêu cầu → Chi tiết booking"), gap=8),
                    crumbs=[("Tìm nhà xe", "CW-HOME-01"), (MER, "CW-MER-01"), ("Tạo yêu cầu", None)]),
        _not_order_note(),
        row(col(panel(None, to_mer, pad=14), stops, cargo, timing, contact, gap=14, extra="flex: 1; min-width: 0;"),
            col(summary, gap=16), gap=20, align="flex-start"),
        gap=16)
    return cw_shell(NAV_BOOK, content, h=1200)


# ---------------------------------------------------------------- CW-BOOK-02
def book_02():
    cols = [("Mã booking", "left", "140px"), ("Nhà xe", "left"), ("Điểm lấy → điểm trả", "left"), ("Lấy hàng", "left"),
            ("Hàng hóa", "left"), ("Trạng thái", "left"), ("Đơn hàng", "left"), ("Gửi lúc", "left")]
    rows = []
    for c, sent, pu, dr, t, cargo, s, o in BOOKINGS:
        rows.append([code(c, to="CW-BOOK-03", trigger="Click mã booking → chi tiết"), muted(MER),
                     col(text(pu, 13, 500), muted("→ " + dr, 12), gap=0), num(t), muted(cargo), _bk(s),
                     code(o, to="CW-ORD-02", trigger="Mở đơn đã tạo từ booking") if o else muted("—"), num(sent, 12)])
    content = col(
        page_header("Booking của tôi", "Yêu cầu vận chuyển đã gửi tới nhà xe và trạng thái tiếp nhận",
                    btn("Tạo yêu cầu mới", "primary", "plus", to="CW-BOOK-01", trigger="Tạo booking")),
        _not_order_note(),
        filter_bar("Tìm mã booking, địa điểm, hàng…", ["Tất cả · 6", "Chờ tiếp nhận · 1", "Đang xử lý · 1", "Đã tạo đơn · 3", "Đã hủy · 1"],
                   date="01/09 – 30/09/2026"),
        table(cols, rows, footer=pagination("1–6", 6)),
        row(muted("Chỉ sửa hoặc hủy được khi booking còn “Chờ tiếp nhận”. Khi nhà xe đã tạo đơn, theo dõi tiếp tại", 13),
            a("Đơn hàng", "CW-ORD-01", "Mở lịch sử đơn hàng"), gap=6),
        gap=16)
    return cw_shell(NAV_BOOK, content)


# ---------------------------------------------------------------- CW-BOOK-03
def book_03():
    head = row(
        col(row(h("display", "BK-202609-0005"), _bk("Đã tạo đơn"), gap=10),
            row(text("Gửi tới", 14), a(MER, "CW-MER-01", "Mở hồ sơ nhà xe", 14), muted("·"), text("Xưởng Hưng Lợi Tân Uyên → Sài Gòn Food — Tân Phú", 14), gap=6),
            subtle("Gửi 21/09/2026 08:30 bởi Trần Văn Hưng · Cập nhật 21/09/2026 14:10", 12), gap=4),
        spacer(),
        row(btn("Sửa yêu cầu", "secondary", "pencil", disabled=True), btn("Hủy yêu cầu", "danger-outline", "x", disabled=True),
            btn("Xem đơn DH-202609-0012", "primary", "package", to="CW-ORD-02", trigger="Xem đơn hàng đã tạo"), gap=8), align="flex-start")
    prog = panel(None, stepper(["Đã gửi", "Chờ tiếp nhận", "Đang xử lý", "Đã tạo đơn"], 4), pad=14)
    converted = banner(row(text("Nhà xe đã tạo đơn", 13), code("DH-202609-0012", to="CW-ORD-02", trigger="Mở đơn liên kết"),
                           text("từ yêu cầu này. Giá, xe và thời gian chính thức theo đơn hàng.", 13), gap=6),
                       "success", "circle-check", a("Xem lịch sử đơn", "CW-ORD-01", "Mở lịch sử đơn hàng"))
    req = panel("Nội dung yêu cầu", col(
        table([("#", "left", "32px"), ("Loại", "left"), ("Địa điểm", "left"), ("Liên hệ", "left")],
              [[muted("1"), badge("Lấy", "info", "package-check"), col(text("Xưởng Hưng Lợi Tân Uyên", 13, 600), muted("Lô C5, KCN Nam Tân Uyên, Tân Uyên, Bình Dương", 12), gap=0),
                muted("Anh Lợi · 0918 456 123")],
               [muted("2"), badge("Trả", "primary", "map-pin"), col(text("Sài Gòn Food — Kho Tân Phú", 13, 600), muted("Số 102 Lũy Bán Bích, Q. Tân Phú, TP.HCM", 12), gap=0),
                muted("Anh Minh · 0909 876 543")]], compact=True),
        dl([("Hàng hóa", "Thùng carton 3 lớp"), ("Khối lượng · số kiện", num("4 tấn · 160 kiện")), ("Loại xe đề nghị", "Tải thùng 5–10 tấn"),
            ("Lấy hàng từ", num("22/09/2026 07:00")), ("Giao trước", num("22/09/2026 14:00")), ("Dịch vụ thêm", "Bốc xếp tại điểm lấy"),
            ("Liên hệ chính", "Trần Văn Hưng · 0918 456 120"), ("Ghi chú", "Giao giờ hành chính, gọi trước 30 phút")], cols=3),
        gap=14))
    diff_panel = panel("Nhà xe điều chỉnh khi tạo đơn", col(
        diff("Lấy hàng", "22/09/2026 07:00", "22/09/2026 08:00"),
        diff("Giá cước", "Chưa có", "4.500.000 đ + bốc xếp 300.000 đ"),
        subtle("Thông tin chính thức xem tại đơn hàng.", 12), gap=8))
    msgs = [("Trần Văn Hưng", "Bạn", "21/09 08:32", "Hàng xếp sẵn trên pallet, xe vào cổng 2 giúp em.", True),
            ("Lê Thu Vân", MER, "21/09 09:05", "Nhà xe đã tiếp nhận. Ngày 22/09 chỉ còn xe lấy hàng từ 08:00, anh xác nhận giúp em.", False),
            ("Trần Văn Hưng", "Bạn", "21/09 09:20", "Ok 08:00 được em.", True),
            ("Lê Thu Vân", MER, "21/09 14:10", "Đã tạo đơn DH-202609-0012: cước 4.500.000 đ, bốc xếp 300.000 đ.", False)]
    bubbles = []
    for who, org, t, body, me in msgs:
        bg = T["primary-soft"] if me else T["surface-muted"]
        bubbles.append(col(row(text(who, 13, 600), subtle(org, 12), subtle(t, 12), gap=6),
                           f'<div style="padding: 8px 12px; border-radius: 6px; background: {bg}; font-size: 13px; line-height: 20px; color: {T["text"]};">{body}</div>',
                           gap=2, extra="align-items: flex-end;" if me else ""))
    thread = panel("Trao đổi với nhà xe", col(*bubbles, divider(),
                                              field("Ghi chú mới", textarea("", "Nhập nội dung gửi nhà xe…", h=56)),
                                              row(spacer(), btn("Gửi ghi chú", "secondary", "send", size="sm"), gap=8), gap=12))
    tl = panel("Trạng thái", timeline([
        ("21/09 14:10", "Lê Thu Vân", "Tạo đơn " + code("DH-202609-0012", to="CW-ORD-02", trigger="Mở đơn từ timeline") + " → <b>Đã tạo đơn</b>", None, "success"),
        ("21/09 09:05", "Lê Thu Vân", "Tiếp nhận → <b>Đang xử lý</b>", None, "info"),
        ("21/09 08:30", "Trần Văn Hưng", "Gửi yêu cầu → <b>Chờ tiếp nhận</b>", None, "warning")]))
    rules = panel(None, col(text("Sửa / hủy yêu cầu", 14, 600),
                            muted("Chỉ được sửa hoặc hủy khi booking còn “Chờ tiếp nhận”. Sau khi nhà xe tiếp nhận, trao đổi qua ghi chú hoặc gọi điều phối 0283 812 3456.", 13), gap=4))
    content = col(
        breadcrumb([("Booking của tôi", "CW-BOOK-02"), ("BK-202609-0005", None)]), head, prog, converted,
        row(col(req, thread, gap=16, extra="flex: 2; min-width: 0;"), col(diff_panel, tl, rules, gap=16, extra="flex: 1; min-width: 0;"), gap=20, align="flex-start"),
        gap=16)
    return cw_shell(NAV_BOOK, content, h=1320)


# ---------------------------------------------------------------- CW-ORD-01
def ord_01():
    cols = [("Mã đơn · Ngày tạo", "left", "150px"), ("Nhà xe · Tuyến", "left"), ("Trạng thái", "left"), ("Tổng tiền", "right"),
            ("Đã thanh toán", "right"), ("Còn phải trả", "right"), ("Hạn thanh toán", "left"), ("Từ booking", "left")]
    rows = []
    for c, created, route, s, tot, paid, due_, bk in MY_ORDERS:
        remain = tot - paid
        pending = s == "Chờ xác nhận"
        rows.append([col(code(c, to="CW-ORD-02", trigger="Click mã đơn → chi tiết"), subtle(created, 12), gap=0),
                     col(text(MER, 13, 500), muted(route, 12), gap=0), status(s), num(money(tot)),
                     num(money(paid), color=T["success"] if paid else T["text-muted"]),
                     num(money(remain), weight=600 if remain else 400, color=(T["text-muted"] if (pending or not remain) else T["warning"])),
                     badge("Đã thanh toán", "success") if not remain else (muted("Chờ xác nhận giá", 12) if pending else due(None, due_)),
                     code(bk, to="CW-BOOK-03", trigger="Mở booking gốc") if bk else muted("Đặt qua điện thoại", 12)])
    content = col(
        page_header("Đơn hàng", "Đơn nhà xe đã tạo cho bạn — từ booking hoặc đặt trực tiếp qua điện thoại",
                    btn("Xem bảng kê công nợ", "secondary", "file-text", to="CW-DEBT-01", trigger="Xem bảng kê")),
        summary_strip([("Đang thực hiện", "1 đơn"), ("Chờ xác nhận", "1 đơn"), ("Còn phải trả", money(3_900_000), "warning"),
                       ("Quá hạn", money(0)), ("Tiền trả trước chưa trừ", money(3_000_000), "info")]),
        filter_bar("Tìm mã đơn, tuyến…", ["Tất cả", "Đang thực hiện", "Chờ xác nhận", "Hoàn thành", "Còn phải trả"], date="01/07 – 30/09/2026"),
        table(cols, rows, footer=pagination("1–6", 6)),
        subtle("Số tiền theo dữ liệu hiện tại của nhà xe. Đơn “Chờ xác nhận” chưa tính vào số còn phải trả.", 12),
        gap=16)
    return cw_shell(NAV_ORD, content)


# ---------------------------------------------------------------- CW-ORD-02
def ord_02():
    head = row(
        col(row(h("display", "DH-202609-0008"), status("Đang thực hiện"), gap=10),
            row(a(MER, "CW-MER-01", "Mở hồ sơ nhà xe", 14), muted("·"), text("Xưởng Hưng Lợi Tân Uyên → Nước giải khát Tân Tạo", 14, extra="white-space: nowrap;"), gap=6),
            row(subtle("Từ booking", 12), code("BK-202609-0003", 12, to="CW-BOOK-03", trigger="Mở booking gốc"),
                subtle("· Nhà xe tạo 16/09/2026 · Cập nhật 23/09/2026 11:20", 12), gap=4), gap=4),
        spacer(),
        row(btn("Tải phiếu giao hàng", "secondary", "download"),
            btn("Xem bảng kê", "secondary", "file-text", to="CW-DEBT-01", trigger="Xem bảng kê chứa đơn"),
            btn("Liên hệ nhà xe", "primary", "phone", to="CW-MER-01", trigger="Liên hệ nhà xe"), gap=8), align="flex-start")
    strip = summary_strip([("Tổng phải trả", money(3_900_000)), ("Đã thanh toán", money(0), "success"), ("Còn phải trả", money(3_900_000), "warning"),
                           ("Hạn thanh toán", "03/10/2026"), ("Bảng kê", "CN-202609-0004")])
    progress_panel = panel("Tiến trình vận chuyển", col(
        stepper(["Đã xác nhận", "Đã xếp xe", "Đang vận chuyển", "Hoàn thành"], 2),
        row(dl([("Chuyến", code("CX-202609-0007")), ("Xe", col(num("51C-456.78"), subtle("Tải thùng 10 tấn", 12), gap=0)), ("Tài xế", "Lê Hoàng Phúc"),
                ("Trạng thái chuyến", status("Đang trả hàng", "trip"))], cols=4), gap=8),
        row(icon("clock", 14, T["text-muted"]), muted("Cập nhật từ tài xế lúc 23/09/2026 11:20 · dự kiến hoàn thành 12:00", 13), gap=6),
        gap=14))
    stops = panel("Điểm lấy/trả", table(
        [("#", "left", "32px"), ("Loại", "left"), ("Địa điểm · Liên hệ", "left"), ("Dự kiến · Thực tế", "left"), ("Trạng thái", "left")],
        [[muted("1"), badge("Lấy", "info", "package-check"),
          col(text("Xưởng Hưng Lợi Tân Uyên", 13, 600), muted("Lô C5, KCN Nam Tân Uyên · Anh Lợi 0918 456 123", 12), gap=0),
          col(num("DK 23/09 06:30", 12), num("TT 23/09 06:40", 12), gap=0), badge("Hoàn thành", "success")],
         [muted("2"), badge("Trả", "primary", "map-pin"),
          col(text("Nước giải khát Tân Tạo", 13, 600), muted("Đường số 3, KCN Tân Tạo, Bình Tân · Anh Khoa 0976 333 222", 12), gap=0),
          col(num("DK 23/09 11:00", 12), num("Đến 23/09 11:15", 12), gap=0), badge("Đang trả hàng", "primary")]], compact=True), body_pad=False)
    cargo = panel("Hàng hóa", dl([("Tên hàng", "Khay nhựa PET"), ("Số lượng", num("3,5 tấn · 140 kiện")), ("Tính chất", "Hàng nhẹ, tránh đè"),
                                  ("Ghi chú", "Dỡ hàng tại dock 4")], cols=4))
    pay = panel("Thanh toán", col(
        table([("Khoản", "left"), ("Số tiền", "right")],
              [[text("Giá cước", 13), num(money(3_600_000))], [text("Bốc xếp", 13), num(money(300_000))]],
              compact=True, total_row=["Tổng phải trả", money(3_900_000)]),
        row(muted("Đã thanh toán", 13), spacer(), num(money(0), 14), gap=8),
        row(text("Còn phải trả", 14, 600), spacer(), num(money(3_900_000), 18, 700, T["warning"]), gap=8),
        row(muted("Hạn thanh toán", 13), spacer(), due(None, "03/10/2026"), gap=8),
        divider(),
        row(muted("Nằm trong bảng kê", 13), spacer(), code("CN-202609-0004", to="CW-DEBT-01", trigger="Mở bảng kê chứa đơn"), gap=8),
        subtle("Thanh toán chuyển khoản theo thông tin trên bảng kê. Số dư trả trước do nhà xe trừ vào đơn.", 12), gap=10))
    docs = panel("Chứng từ được chia sẻ", col(
        attachment_list([("POD điểm lấy — phiếu xuất kho.jpg", "POD", "23/09 06:42 · 1,2 MB", "image"),
                         ("Phiếu giao hàng DH-202609-0008.pdf", "PDF", "Nhà xe chia sẻ 22/09", "file-text")]),
        subtle("POD điểm trả hiển thị sau khi tài xế hoàn thành điểm dừng và nhà xe chia sẻ.", 12), gap=10))
    content = col(breadcrumb([("Đơn hàng", "CW-ORD-01"), ("DH-202609-0008", None)]), head, strip,
                  row(col(progress_panel, stops, cargo, gap=16, extra="flex: 2; min-width: 0;"),
                      col(pay, docs, gap=16, extra="flex: 1; min-width: 0;"), gap=20, align="flex-start"), gap=16)
    return cw_shell(NAV_ORD, content, h=1080)


# ---------------------------------------------------------------- CW-DEBT-01
def debt_01():
    cols = [("Mã bảng kê", "left", "150px"), ("Kỳ bảng kê", "left"), ("Số đơn", "right"), ("Tổng tiền", "right"), ("Đã thanh toán", "right"),
            ("Còn lại", "right"), ("Ngày gửi", "left"), ("Trạng thái", "left"), ("", "right")]
    rows = []
    for c, per, sent, n, tot, paid, rem, s in STATEMENTS:
        rows.append([code(c), col(text(per, 13, 500, extra=NUM), subtle(MER, 12), gap=0), num(str(n)), num(money(tot)),
                     num(money(paid), color=T["success"]), num(money(rem), weight=600 if rem else 400, color=T["warning"] if rem else T["text-muted"]),
                     num(sent), status(s, "fin"), btn("Tải PDF", "secondary", "download", size="sm")])
    lines = table([("Ngày đơn", "left"), ("Mã đơn", "left"), ("Tuyến", "left"), ("Tổng tiền", "right"), ("Đã thu", "right"),
                   ("Còn lại", "right"), ("Hạn thanh toán", "left"), ("Quá hạn", "right")],
                  [[num("06/09/2026"), code("DH-202609-0006", to="CW-ORD-02", trigger="Mở đơn trong bảng kê"), muted("Tân Uyên → Q.12"),
                    num(money(3_600_000)), num(money(3_600_000), color=T["success"]), num(money(0), color=T["text-muted"]), num("15/09/2026"), muted("—")],
                   [num("16/09/2026"), code("DH-202609-0008", to="CW-ORD-02", trigger="Mở đơn trong bảng kê"), muted("Tân Uyên → Q. Bình Tân"),
                    num(money(3_900_000)), num(money(0)), num(money(3_900_000), weight=600, color=T["warning"]), num("03/10/2026"), muted("0 ngày")]],
                  compact=True, total_row=["", "", "Tổng", money(7_500_000), money(3_600_000), money(3_900_000), "", ""])
    detail = panel("CN-202609-0004 · kỳ 01/09 – 20/09/2026", col(
        banner("Số liệu là bản chốt ngày 21/09/2026. Thanh toán sau ngày chốt cập nhật ở mục Đơn hàng, không sửa bảng kê đã gửi.", "primary", "lock"),
        lines, gap=12),
        row(btn("Tải PDF", "secondary", "download", size="sm"), gap=8), sub="Bảng kê nhà xe đã chốt và gửi cho bạn")
    content = col(
        page_header("Bảng kê công nợ", "Bảng kê nhà xe đã chốt và gửi cho bạn; tải PDF để đối chiếu",
                    btn("Xem đơn hàng", "secondary", "package", to="CW-ORD-01", trigger="Mở lịch sử đơn hàng")),
        grid([kpi("Còn phải trả", money(3_900_000), "1 đơn · hạn gần nhất 03/10/2026", "warning", "scale", to="CW-ORD-01", trigger="Xem đơn còn phải trả"),
              kpi("Quá hạn", money(0), "Không có đơn quá hạn", None, "alarm-clock"),
              kpi("Tiền trả trước chưa trừ", money(3_000_000), "Nhà xe sẽ trừ vào đơn sau", "info", "wallet"),
              kpi("Bảng kê mới nhất", "CN-202609-0004", "Gửi 21/09/2026", None, "file-text")], 4),
        filter_bar("Tìm mã bảng kê…", ["Tất cả · 3", "Còn phải trả · 1", "Đã thanh toán đủ · 2"], selects=["Nhà xe: " + MER]),
        table(cols, rows, selected=0),
        detail,
        subtle("Chỉ hiện bảng kê nhà xe đã chốt và gửi. Bảng kê nháp hoặc đã hủy không hiển thị với khách.", 12),
        gap=16)
    return cw_shell(NAV_DEBT, content)


# ---------------------------------------------------------------- CW-PROFILE-01
def profile_01():
    company = panel("Thông tin doanh nghiệp", col(
        row(field("Tên doanh nghiệp", input_(CUS_NAME), True, width="50%"), field("Mã số thuế", input_("3702 458 916", mono=True), width="50%"), gap=12),
        row(field("Địa chỉ xuất hóa đơn", input_("Lô C5, KCN Nam Tân Uyên, Tân Uyên, Bình Dương"), width="70%"),
            field("Điện thoại", input_("0274 3755 902", mono=True), width="30%"), gap=12), gap=14))
    person = panel("Người liên hệ chính", col(
        row(field("Họ tên", input_("Trần Văn Hưng"), True, width="50%"), field("Chức vụ", input_("Trưởng kho vận"), width="50%"), gap=12),
        row(field("Email", input_("logistics@baobihungloi.test"), True, width="50%"), field("Số điện thoại", input_("0918 456 120", mono=True), True, width="50%"), gap=12),
        gap=14))
    security = panel("Đăng nhập và bảo mật", col(
        row(col(text("Mật khẩu", 14, 500), muted("Đổi lần cuối 02/09/2026", 12), gap=0), spacer(), btn("Đổi mật khẩu", "secondary", "key", size="sm"), gap=8),
        divider(),
        row(col(text("Đăng xuất khỏi thiết bị này", 14, 500), muted("Phiên hiện tại: Chrome · Windows", 12), gap=0), spacer(),
            btn("Đăng xuất", "danger-outline", "log-out", size="sm", to="CW-AUTH-01", trigger="Đăng xuất"), gap=8), gap=12))
    noti = panel("Nhận thông báo", col(
        switch(True, "Booking được tiếp nhận hoặc tạo đơn", "Trong web và email"),
        switch(True, "Đơn hàng cập nhật trạng thái", "Lấy hàng, đang giao, hoàn thành"),
        switch(True, "Bảng kê mới được gửi", "Khi nhà xe chốt và gửi bảng kê"),
        switch(False, "Tin nhắn SMS", "Chỉ gửi khi booking bị hủy"), gap=14),
        a("Xem thông báo", "CW-NOTI-01"))
    right = col(
        panel("Nhà xe đang hợp tác", col(
            row(_merchant_mark("BT", 36), col(a(MER, "CW-MER-01", "Mở hồ sơ nhà xe", 14, 600), subtle("Mã khách tại nhà xe: CUS-A-003", 12), gap=0), gap=10),
            row(muted("Hạn thanh toán mặc định", 13), spacer(), text("7 ngày", 13, 500), gap=8),
            row(muted("Còn phải trả", 13), spacer(), a(money(3_900_000), "CW-DEBT-01", "Xem công nợ"), gap=8), gap=10)),
        panel("Địa chỉ thường dùng", col(
            *[row(icon("map-pin", 14, T["text-muted"]), col(text(n, 13, 500), subtle(ad, 12), gap=0), gap=8, align="flex-start") for n, ad, *_ in ADDRESSES[:3]],
            muted("và 2 địa chỉ khác", 12), gap=10),
              a("Quản lý địa chỉ", "CW-ADDR-01", "Mở địa chỉ thường dùng")),
        gap=16, extra="width: 380px; flex-shrink: 0;")
    content = col(
        page_header("Hồ sơ khách hàng", "Thông tin doanh nghiệp và người liên hệ nhà xe dùng khi xác nhận yêu cầu",
                    row(btn("Hủy thay đổi", "secondary"), btn("Lưu thay đổi", "primary", "check"), gap=8)),
        row(col(company, person, security, noti, gap=16, extra="flex: 1; min-width: 0;"), right, gap=20, align="flex-start"),
        gap=16)
    return cw_shell(NAV_NONE, content, h=1200)


# ---------------------------------------------------------------- CW-ADDR-01
def _addr_list():
    cols = [("Tên địa điểm · Địa chỉ", "left"), ("Dùng cho", "left"), ("Người liên hệ", "left"), ("Ghi chú bốc/trả", "left"), ("", "right", "44px")]
    rows = []
    for name, addr, who, phone, use_, note, default in ADDRESSES:
        rows.append([col(row(text(name, 13, 600), badge("Mặc định", "primary") if default else "", gap=6), muted(addr, 12), gap=0),
                     badge(use_, "info" if use_ == "Lấy hàng" else "primary"), col(text(who, 13), num(phone, 12), gap=0),
                     muted(note if len(note) < 34 else note[:32] + "…", 12), row_menu()])
    return col(
        page_header("Địa chỉ thường dùng", "Kho, điểm lấy/trả và người liên hệ để chọn nhanh khi tạo yêu cầu",
                    row(btn("Tạo yêu cầu vận chuyển", "secondary", "send", to="CW-BOOK-01", trigger="Dùng địa chỉ cho booking"),
                        btn("Thêm địa chỉ", "primary", "plus"), gap=8),
                    crumbs=[("Hồ sơ khách hàng", "CW-PROFILE-01"), ("Địa chỉ thường dùng", None)]),
        filter_bar("Tìm tên, địa chỉ, người liên hệ…", ["Tất cả · 5", "Lấy hàng · 2", "Trả hàng · 3"]),
        table(cols, rows, selected=1, footer=pagination("1–5", 5)),
        subtle("Sửa địa chỉ không làm thay đổi booking/đơn đã gửi — mỗi booking lưu bản sao địa chỉ tại thời điểm gửi.", 12),
        gap=16)


def addr_01():
    body = col(
        field("Tên địa điểm", input_("Kho Thuận An"), True),
        field("Địa chỉ", textarea("Số 45 ĐT743C, Thuận An, Bình Dương", h=56), True, hint="Có thể ghim vị trí trên bản đồ để tài xế tìm nhanh"),
        map_placeholder(h=120, pins=[(46, 62, "Kho Thuận An", "primary")], label="Ghim vị trí"),
        field("Dùng cho", radio_cards([("Lấy hàng", "Điểm đi"), ("Trả hàng", "Điểm đến"), ("Cả hai", "")], 0)),
        row(field("Người liên hệ", input_("Chị Hoa"), True, width="50%"), field("Số điện thoại", input_("0918 222 789", mono=True), True, width="50%"), gap=12),
        field("Ghi chú bốc/trả hàng", textarea("Đường vào cấm xe trên 10 tấn 06:00–09:00", h=56)),
        checkbox("Đặt làm điểm lấy mặc định khi tạo yêu cầu"),
        gap=14)
    foot = (btn("Xóa địa chỉ", "danger-outline", "trash-2") + spacer()
            + btn("Hủy", "secondary", to="CW-ADDR-01", trigger="Đóng drawer")
            + btn("Lưu địa chỉ", "primary", "check", to="CW-ADDR-01", trigger="Lưu địa chỉ → danh sách"))
    dr = drawer("Sửa địa chỉ", body, foot, 480, "Kho Thuận An", close_to="CW-ADDR-01")
    return cw_shell(NAV_NONE, _addr_list(), overlay=_right_drawer(dr))


# ---------------------------------------------------------------- CW-NOTI-01
NOTIS = [
    ("Hôm nay", [
        ("truck", "accent", "Đơn DH-202609-0008 đang trả hàng", "Tài xế đã đến Nước giải khát Tân Tạo lúc 11:15.", "11:20", "CW-ORD-02", "Mở đơn", True),
        ("send", "neutral", "Đã gửi yêu cầu BK-202609-0007", "Tân Uyên → Q.12 · lấy hàng 24/09 07:00. Nhà xe chưa tiếp nhận.", "09:42", "CW-BOOK-03", "Mở booking", False),
    ]),
    ("Hôm qua", [
        ("message-square", "info", "Nhà xe đang xử lý BK-202609-0006", "Lê Thu Vân: “Ngày 25/09 xe lấy hàng từ 09:00, anh chị xác nhận giúp.”", "16:30", "CW-BOOK-03", "Mở booking", True),
    ]),
    ("Trước đó", [
        ("file-text", "primary", "Bảng kê mới CN-202609-0004", "Kỳ 01/09 – 20/09/2026 · còn lại 3.900.000 đ.", "21/09 15:00", "CW-DEBT-01", "Xem bảng kê", True),
        ("package-check", "success", "Booking BK-202609-0005 đã được tạo đơn", "Đơn DH-202609-0012 · tổng 4.800.000 đ · chờ nhà xe xác nhận.", "21/09 14:10", "CW-ORD-02", "Mở đơn", False),
        ("circle-check", "info", "Nhà xe đã tiếp nhận BK-202609-0005", "BTA Demo Transport đang sắp xe cho yêu cầu của bạn.", "21/09 09:05", "CW-BOOK-03", "Mở booking", False),
        ("camera", "success", "Đơn DH-202609-0006 hoàn thành", "POD điểm trả đã được chia sẻ.", "08/09 11:40", "CW-ORD-02", "Xem POD", False),
    ]),
]


def noti_01():
    groups = []
    for label, items in NOTIS:
        rows_ = []
        for i, (ic, tone, title, body, t, to, act, unread) in enumerate(items):
            bg, fg = TONES[tone]
            dot = f'<span style="width: 8px; height: 8px; border-radius: 50%; background: {T["accent"] if unread else "transparent"}; flex-shrink: 0;"></span>'
            bd = f"border-top: 1px solid {T['border']};" if i else ""
            rows_.append(f'<div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; {bd} background: {T["accent-soft"] if unread else T["surface"]};">'
                         + dot
                         + f'<span style="display: inline-flex; padding: 8px; border-radius: 6px; background: {bg};">{icon(ic, 16, fg)}</span>'
                         + col(text(title, 14, 600 if unread else 500), muted(body, 13), gap=0, extra="flex: 1; min-width: 0;")
                         + subtle(t, 12) + a(act, to, f"Thông báo: {act}") + '</div>')
        groups.append(col(text(label, 13, 600, T["text-muted"]),
                          f'<div style="background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px; overflow: hidden;">{"".join(rows_)}</div>',
                          gap=8))
    side = panel("Loại thông báo", col(
        *[row(muted(lab, 13), spacer(), text(n, 13, 600), gap=8) for lab, n in
          [("Booking", "4"), ("Đơn hàng", "2"), ("Bảng kê", "1")]],
        divider(), a("Cài đặt nhận thông báo", "CW-PROFILE-01", "Mở cài đặt thông báo trong hồ sơ"), gap=10),
        extra="width: 280px; flex-shrink: 0;")
    content = col(
        page_header("Thông báo", "Cập nhật về booking, đơn hàng và bảng kê của bạn",
                    btn("Đánh dấu tất cả đã đọc", "secondary", "list-checks")),
        row(segmented(["Tất cả · 7", "Chưa đọc · 3"], 0), gap=8),
        row(col(*groups, gap=16, extra="flex: 1; min-width: 0;"), side, gap=20, align="flex-start"),
        gap=16)
    return cw_shell(NAV_NONE, content)


# ---------------------------------------------------------------- registry
R = ["customer"]
AUTH_NOTE = "Customer principal tách khỏi merchant user; mọi query scope theo customerId của phiên (không thấy dữ liệu khách khác)."
register(
    Screen(id="CW-AUTH-01", name="Đăng nhập/đăng ký khách", platform="cw", module="Đăng nhập", route="/login", render=auth_01, pattern="auth",
           roles=["guest"],
           purpose="Khách cuối đăng nhập hoặc đăng ký bằng email/SĐT; quên mật khẩu qua mã OTP. Social login chốt sau.",
           api=["customerLogin(identifier, password)", "registerCustomer(input)", "requestCustomerPasswordReset(identifier)", "resetCustomerPassword(token, password)"],
           data=["identifier (email | phone)", "password", "rememberMe", "register: fullName, companyName?, taxCode?"],
           actions=[("Đăng nhập", "public → CW-HOME-01 (hoặc returnUrl)"), ("Đăng ký", "public; liên kết customer nhà xe sau OTP"),
                    ("Quên mật khẩu", "public; gửi OTP email/SĐT")],
           states={"loading": "Nút Đăng nhập loading, khóa form", "error": "Inline danger 'Email/SĐT hoặc mật khẩu không đúng' dưới form; khóa 5 phút sau 5 lần sai",
                   "empty": "—"},
           notes=["Tab Đăng nhập / Đăng ký dùng ?mode=register.", "Sau đăng nhập quay về returnUrl (vd. từ 'Gửi yêu cầu' trên CW-MER-01).",
                  "Trang khám phá và hồ sơ nhà xe xem được khi chưa đăng nhập; tạo booking yêu cầu đăng nhập."]),
    Screen(id="CW-HOME-01", name="Trang khám phá", platform="cw", module="Tìm nhà xe", route="/", render=home_01, pattern="list", roles=R + ["guest"],
           purpose="Tìm nhà xe theo tuyến, dịch vụ, loại xe; mở hồ sơ hoặc gửi yêu cầu ngay.",
           api=["publicMerchants(filter: {from, to, service, vehicleType, keyword}, first, after)", "myBookings(first: 3)"],
           data=["merchant.name", "serviceAreas[]", "services[]", "vehicleTypes[]", "intakeHours", "relationship (đã hợp tác, số đơn)"],
           actions=[("Tìm nhà xe", "public"), ("Xem hồ sơ", "public → CW-MER-01"), ("Gửi yêu cầu", "customer (chưa đăng nhập → CW-AUTH-01) → CW-BOOK-01")],
           states={"loading": "Skeleton 3 dòng kết quả", "empty": "EmptyState 'Chưa có nhà xe phù hợp tuyến này' + nút Xóa bộ lọc",
                   "error": "Banner danger 'Không tải được danh sách nhà xe' + Thử lại"},
           notes=["Chỉ merchant bật hồ sơ công khai (publish) mới hiện.", "Không có quảng cáo/xếp hạng sao; sắp xếp mặc định 'Đã hợp tác trước'.",
                  "Khối 'Yêu cầu gần đây' chỉ hiện khi đã đăng nhập."]),
    Screen(id="CW-MER-01", name="Hồ sơ nhà xe", platform="cw", module="Tìm nhà xe", route="/merchants/:merchantId", render=mer_01, pattern="detail", h=1120,
           roles=R + ["guest"],
           purpose="Xem thông tin công khai của nhà xe (giới thiệu, liên hệ, dịch vụ, loại xe, lưu ý) trước khi gửi yêu cầu.",
           api=["publicMerchant(id)", "myMerchantRelationship(merchantId)"],
           data=["name", "intro", "serviceAreas[]", "routes[]", "services[{name, description, note}]", "vehicleTypes[{type, capacity, fit}]", "contact{phone, email, address, hours}", "notes[]"],
           actions=[("Gửi yêu cầu vận chuyển", "customer → CW-BOOK-01?merchantId="), ("Gọi điều phối", "public (tel:)")],
           states={"loading": "Skeleton header + panels", "error": "Nhà xe không công khai / không tồn tại → EmptyState + quay lại Tìm nhà xe"},
           notes=["Khối 'Bạn và nhà xe này' chỉ hiện khi khách đã liên kết với merchant (customer record CUS-A-003).",
                  "Không hiển thị giá cước cố định — giá do nhà xe xác nhận trên từng yêu cầu."]),
    Screen(id="CW-BOOK-01", name="Tạo booking/yêu cầu vận chuyển", platform="cw", module="Booking", route="/bookings/new", render=book_01, pattern="form", h=1200,
           roles=R,
           purpose="Khách gửi yêu cầu vận chuyển: điểm lấy/trả, hàng hóa, thời gian, ghi chú, liên hệ. Không phải đơn hàng, không có giá.",
           api=["publicMerchant(id)", "myAddresses", "createBooking(input)"],
           data=["merchantId", "stops[{type, addressId?, addressSnapshot, contact}]", "cargo{name, weightTon, packages, vehicleTypeHint, fragile}",
                 "services{loadingAtPickup, loadingAtDrop}", "pickupFrom", "deliverBefore", "flexibility", "note", "contact{name, phone}"],
           actions=[("Gửi yêu cầu", "customer · booking.create → CW-BOOK-03 (status Chờ tiếp nhận)"), ("Chọn từ địa chỉ thường dùng", "customer → CW-ADDR-01 picker"),
                    ("Hủy", "→ CW-MER-01")],
           states={"validation": "Inline danger: thiếu điểm lấy/trả, tên hàng, thời gian lấy, SĐT liên hệ", "loading": "Nút Gửi yêu cầu loading",
                   "error": "Banner danger 'Không gửi được yêu cầu' giữ nguyên dữ liệu đã nhập"},
           notes=["Booking KHÔNG tự thành order; operation tiếp nhận và convert ở WM-ORD-03 (có thể sửa giá/điểm/hàng).",
                  "Lưu snapshot địa chỉ vào booking; sửa sổ địa chỉ sau đó không đổi booking.", "Mã tự sinh BK-YYYYMM-0001 theo merchant.",
                  "Picker địa chỉ mở CW-ADDR-01 ở chế độ chọn (drawer/modal)."]),
    Screen(id="CW-BOOK-02", name="Danh sách booking", platform="cw", module="Booking", route="/bookings", render=book_02, pattern="list", roles=R,
           purpose="Theo dõi các yêu cầu đã gửi: Chờ tiếp nhận / Đang xử lý / Đã tạo đơn / Đã hủy, và đơn liên kết.",
           api=["myBookings(filter: {status, dateRange, keyword}, first, after)"],
           data=["code", "merchant.name", "pickup.name", "drop.name", "pickupFrom", "cargoSummary", "status", "order.code?", "createdAt"],
           actions=[("Tạo yêu cầu mới", "customer → CW-BOOK-01"), ("Mở booking", "customer (own) → CW-BOOK-03"), ("Mở đơn liên kết", "customer (own) → CW-ORD-02")],
           states={"loading": "DataTable skeleton", "empty": "EmptyState 'Bạn chưa gửi yêu cầu nào' + nút 'Tìm nhà xe'", "error": "Banner danger + Thử lại"},
           notes=["Status tone: Chờ tiếp nhận=warning, Đang xử lý=info, Đã tạo đơn=success, Đã hủy=neutral outline.", AUTH_NOTE]),
    Screen(id="CW-BOOK-03", name="Chi tiết booking", platform="cw", module="Booking", route="/bookings/:bookingId", render=book_03, pattern="detail", h=1320,
           roles=R,
           purpose="Nội dung yêu cầu, trao đổi ghi chú với nhà xe, timeline trạng thái và đơn liên kết khi đã tạo (DH-202609-0012).",
           api=["myBooking(id){stops, cargo, contact, status, statusHistory, notes, order{id, code}, orderAdjustments}", "addBookingNote(bookingId, body)",
                "updateBooking(id, input)", "cancelBooking(id, reason)"],
           data=["code", "status", "merchant", "stops[]", "cargo", "pickupFrom", "deliverBefore", "contact", "note", "notes[{author, side, body, at}]",
                 "statusHistory[]", "order{code}", "adjustments (yêu cầu → đơn)"],
           actions=[("Xem đơn", "customer (own) → CW-ORD-02"), ("Gửi ghi chú", "customer (own)"),
                    ("Sửa yêu cầu", "chỉ khi Chờ tiếp nhận → CW-BOOK-01 (edit mode)"), ("Hủy yêu cầu", "chỉ khi Chờ tiếp nhận; dialog nhập lý do")],
           states={"loading": "Skeleton", "error": "Không tìm thấy / không phải booking của mình → EmptyState + về CW-BOOK-02",
                   "pending": "Banner info 'Chờ nhà xe tiếp nhận', nút Sửa/Hủy enabled, không có đơn liên kết",
                   "cancelled": "Banner neutral lý do hủy + người hủy"},
           notes=["Mockup vẽ trạng thái Đã tạo đơn: Sửa/Hủy disabled kèm giải thích.", "Khối 'Nhà xe điều chỉnh khi tạo đơn' so sánh yêu cầu với đơn (thời gian, giá) — chỉ field customer-safe.",
                  "Ghi chú nội bộ của nhà xe không hiện; chỉ note có side=customer_visible."]),
    Screen(id="CW-ORD-01", name="Lịch sử đơn hàng", platform="cw", module="Đơn hàng & công nợ", route="/orders", render=ord_01, pattern="list", roles=R,
           purpose="Đơn nhà xe đã tạo cho khách (từ booking hoặc đặt điện thoại): trạng thái, tuyến, tổng tiền, đã thanh toán, còn phải trả.",
           api=["myOrders(filter: {status, dateRange, keyword}, first, after)", "myDebtSummary"],
           data=["code", "createdAt", "merchant.name", "routeSummary", "status", "totalAmount", "paidAmount", "remainingAmount", "dueDate", "booking.code?"],
           actions=[("Mở đơn", "customer (own, merchant exposes history) → CW-ORD-02"), ("Mở booking gốc", "customer → CW-BOOK-03"), ("Xem bảng kê", "→ CW-DEBT-01")],
           states={"loading": "DataTable skeleton", "empty": "EmptyState 'Chưa có đơn hàng' + 'Gửi yêu cầu vận chuyển'", "error": "Banner danger + Thử lại"},
           notes=["Không hiển thị đơn Nháp và đơn merchant chưa mở cho khách.", "Cột tiền căn phải, tabular-nums; đơn Chờ xác nhận chưa tính còn phải trả.", AUTH_NOTE]),
    Screen(id="CW-ORD-02", name="Chi tiết đơn khách", platform="cw", module="Đơn hàng & công nợ", route="/orders/:orderId", render=ord_02, pattern="detail", h=1080,
           roles=R,
           purpose="Theo dõi đơn customer-safe: trạng thái, tiến trình chuyến, điểm lấy/trả, POD được chia sẻ, tiền phải trả/đã trả, tải chứng từ.",
           api=["myOrder(id){status, stops, cargo, tripProgress, pricingLines, paidAmount, dueDate, statement{code}, sharedAttachments}", "attachmentDownloadUrl(id)"],
           data=["code", "status", "merchant", "booking.code?", "trip{code, plate, vehicleType, driverName, status, lastUpdateAt}", "stops[{type, place, contact, plannedAt, actualAt, status}]",
                 "cargo", "pricingLines[freight, addons]", "totalAmount", "paidAmount", "remainingAmount", "dueDate", "sharedAttachments[]"],
           actions=[("Tải phiếu giao hàng / chứng từ", "customer · chỉ attachment shared=true"), ("Xem bảng kê", "→ CW-DEBT-01"), ("Liên hệ nhà xe", "→ CW-MER-01")],
           states={"loading": "Skeleton header + panels", "error": "Không phải đơn của mình → EmptyState 403", "empty": "Chưa có chứng từ chia sẻ → dòng muted"},
           notes=["Mockup vẽ DH-202609-0008 (đang trả hàng, có POD điểm lấy) vì DH-202609-0012 còn Chờ xác nhận; cùng layout.",
                  "Không lộ: chi phí, lãi/lỗ, COD tài xế, ghi chú nội bộ, SĐT tài xế.", "Mã chuyến hiển thị text, không link (khách không có màn hình chuyến)."]),
    Screen(id="CW-DEBT-01", name="Bảng kê/công nợ của tôi", platform="cw", module="Đơn hàng & công nợ", route="/debt-statements", render=debt_01, pattern="list",
           roles=R,
           purpose="Bảng kê nhà xe đã chốt và gửi (snapshot), tổng còn phải trả, tải PDF để đối chiếu.",
           api=["myDebtStatements(filter, first, after)", "myDebtStatement(id){lines}", "debtStatementPdf(id)", "myDebtSummary"],
           data=["code (CN-YYYYMM-0001)", "periodFrom/To", "sentAt", "orderCount", "total", "paid", "remaining", "status", "lines[{orderDate, orderCode, route, total, paid, remaining, dueDate, overdueDays}]"],
           actions=[("Tải PDF", "customer · chỉ statement Đã chốt/Đã gửi và shared"), ("Mở đơn trong bảng kê", "→ CW-ORD-02"), ("Xem đơn còn phải trả", "→ CW-ORD-01")],
           states={"loading": "Skeleton KPI + table", "empty": "EmptyState 'Nhà xe chưa gửi bảng kê nào'", "error": "Banner danger + Thử lại"},
           notes=["Chi tiết bảng kê (statement detail) mở inline dưới dòng đã chọn — không có route riêng.",
                  "Số liệu bảng kê là snapshot tại thời điểm chốt; KPI còn phải trả lấy dữ liệu hiện tại.",
                  "Tiền trả trước chưa trừ = số dư (credit) khách, ví dụ PT-202609-0002 3.000.000 đ chưa phân bổ."]),
    Screen(id="CW-PROFILE-01", name="Hồ sơ khách hàng", platform="cw", module="Tài khoản", route="/profile", render=profile_01, pattern="form", h=1200, roles=R,
           purpose="Cập nhật thông tin doanh nghiệp, người liên hệ, bảo mật và cài đặt thông báo.",
           api=["me{customer, contact, notificationPrefs, merchantLinks}", "updateCustomerProfile(input)", "changeCustomerPassword(old, new)", "updateNotificationPrefs(input)", "logout"],
           data=["companyName", "taxCode", "billingAddress", "phone", "contact{name, title, email, phone}", "notificationPrefs{booking, order, statement, sms}", "merchantLinks[{merchant, customerCode, paymentTermDays}]"],
           actions=[("Lưu thay đổi", "customer (own)"), ("Đổi mật khẩu", "customer"), ("Đăng xuất", "→ CW-AUTH-01"), ("Quản lý địa chỉ", "→ CW-ADDR-01")],
           states={"validation": "Inline danger: email/SĐT sai định dạng", "loading": "Skeleton form"},
           notes=["Sửa hồ sơ không đổi thông tin customer phía merchant; nhà xe nhận thông báo để cập nhật nếu cần."]),
    Screen(id="CW-ADDR-01", name="Địa chỉ thường dùng", platform="cw", module="Tài khoản", route="/addresses", render=addr_01, pattern="list", roles=R,
           purpose="Sổ địa chỉ kho/điểm lấy/trả với người liên hệ, SĐT, ghi chú; thêm/sửa trong drawer; dùng khi tạo booking.",
           api=["myAddresses", "createMyAddress(input)", "updateMyAddress(id, input)", "deleteMyAddress(id)"],
           data=["name", "address", "geo?", "usage (pickup|drop|both)", "contactName", "contactPhone", "note", "isDefaultPickup"],
           actions=[("Thêm địa chỉ", "customer → drawer"), ("Sửa (menu dòng)", "customer → drawer"), ("Xóa địa chỉ", "customer; confirm dialog"),
                    ("Lưu địa chỉ", "customer → danh sách"), ("Tạo yêu cầu vận chuyển", "→ CW-BOOK-01")],
           states={"loading": "DataTable skeleton", "empty": "EmptyState 'Chưa có địa chỉ thường dùng' + 'Thêm địa chỉ'",
                   "validation": "Inline danger: thiếu tên/địa chỉ/SĐT"},
           notes=["Mockup vẽ drawer 'Sửa địa chỉ' mở trên danh sách (dòng Kho Thuận An được chọn).",
                  "Khi mở từ CW-BOOK-01, trang ở chế độ chọn: click dòng → điền vào điểm lấy/trả và quay lại form.",
                  "Booking lưu snapshot địa chỉ; sửa/xóa ở đây không ảnh hưởng booking/đơn đã gửi."]),
    Screen(id="CW-NOTI-01", name="Thông báo khách", platform="cw", module="Tài khoản", route="/notifications", render=noti_01, pattern="list", roles=R,
           purpose="Thông báo booking được tiếp nhận/tạo đơn, đơn cập nhật, bảng kê mới; mỗi dòng mở màn hình chi tiết tương ứng.",
           api=["myNotifications(filter: {unread}, first, after)", "markNotificationsRead(ids | all)"],
           data=["type (booking | order | statement)", "title", "body", "createdAt", "readAt", "target{kind, id}"],
           actions=[("Mở booking", "→ CW-BOOK-03"), ("Mở đơn", "→ CW-ORD-02"), ("Xem bảng kê", "→ CW-DEBT-01"), ("Đánh dấu tất cả đã đọc", "customer"),
                    ("Cài đặt nhận thông báo", "→ CW-PROFILE-01")],
           states={"loading": "Skeleton 5 dòng", "empty": "EmptyState 'Chưa có thông báo'"},
           notes=["Chỉ gửi loại khách đã bật trong hồ sơ.", "Chấm xanh + nền accent-soft = chưa đọc; click dòng đánh dấu đã đọc."]),
)
