"""App Merchant (Flutter, phase 2) — MA-AUTH-01 … MA-PROFILE-01.

Bản mobile rút gọn của Web Merchant cho chủ nhà xe / operation / kế toán: cùng visual language với App Tài xế
(nền sáng, body ≥ 14sp, tap target ≥ 48dp, primary action full width ở đáy) nhưng read-heavy — xem nhanh, gọi nhanh,
duyệt nhanh; phần chỉnh chi tiết mở trên Web Merchant.
"""
from .. import data as D
from ..core import Screen, register
from ..shells import MA_TABS, bottom_nav, bottom_sheet, list_row, m_card, m_section, mobile_frame, mobile_header, primary_bottom_action
from ..ui import *  # noqa: F401,F403

ROLES_ALL = ["admin", "operation", "accountant"]
H = 844
NUMW = NUM + " white-space: nowrap;"


# ---------------------------------------------------------------- private mobile helpers
def _hbtn(ic, aria, to=None, count=None, trigger=None):
    """Header icon button 44×44 (tap target) with optional unread counter."""
    use("IconButton")
    b = ""
    if count:
        b = (f'<span style="position: absolute; top: 5px; right: 4px; min-width: 16px; height: 16px; padding: 0 4px; box-sizing: border-box; '
             f'border-radius: 8px; background: {T["danger"]}; color: #FFFFFF; font-size: 10px; font-weight: 700; display: flex; '
             f'align-items: center; justify-content: center;">{count}</span>')
    css = ("position: relative; display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; "
           "flex-shrink: 0; margin-right: -8px; text-decoration: none;")
    inner = icon(ic, 22, T["text"]) + b
    if to:
        edge(to, trigger or aria)
        return f'<a href="{href(to)}" aria-label="{aria}" style="{css}">{inner}</a>'
    return f'<button type="button" aria-label="{aria}" style="{css} border: 0; background: transparent; padding: 0;">{inner}</button>'


def _search(ph):
    use("SearchField")
    return (f'<div style="display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 12px; box-sizing: border-box; flex-shrink: 0; '
            f'border: 1px solid {T["border-control"]}; border-radius: 6px; background: {T["surface"]};">{icon("search", 18, T["text-muted"])}'
            f'<span style="font-size: 15px; color: {T["text-subtle"]}; white-space: nowrap;">{ph}</span></div>')


def _chips(items, active=0):
    use("FilterChip")
    out = []
    for i, c in enumerate(items):
        on = i == active
        out.append(f'<span style="display: inline-flex; align-items: center; height: 32px; padding: 0 12px; border-radius: 16px; font-size: 14px; '
                   f'font-weight: {600 if on else 500}; border: 1px solid {T["primary"] if on else T["border-control"]}; '
                   f'background: {T["primary-soft"] if on else T["surface"]}; color: {T["primary"] if on else T["text"]}; white-space: nowrap;">{c}</span>')
    return f'<div style="display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap;">{"".join(out)}</div>'


def _seg(items, active, links):
    """Full-width segmented control (Đơn / Chuyến, kỳ báo cáo)."""
    use("SegmentedControl")
    out = []
    for i, lab in enumerate(items):
        on = i == active
        css = (f"flex: 1; display: flex; align-items: center; justify-content: center; height: 36px; border-radius: 4px; font-size: 14px; "
               f"font-weight: {600 if on else 500}; text-decoration: none; background: {T['surface'] if on else 'transparent'}; "
               f"color: {T['text'] if on else T['text-muted']}; {'box-shadow: 0 1px 2px rgba(23,32,42,0.12);' if on else ''}")
        to = links[i] if links else None
        if to and not on:
            edge(to, f"Chuyển sang {lab}")
            out.append(f'<a href="{href(to)}" style="{css}">{lab}</a>')
        else:
            out.append(f'<span style="{css}">{lab}</span>')
    return (f'<div style="display: flex; gap: 2px; padding: 3px; flex-shrink: 0; border-radius: 6px; background: {T["surface-muted"]}; '
            f'border: 1px solid {T["border"]};">{"".join(out)}</div>')


def _kv(label, value, strong=False, color=None, size=15):
    return row(muted(label, 14), spacer(), text(value, size, 700 if strong else 500, color, NUM + " white-space: nowrap;"), gap=8)


def _mkpi(label, value, sub, ic, to, trigger, tone=None):
    use("KpiCard")
    color = TONES[tone][1] if tone else T["text"]
    edge(to, trigger)
    return (f'<a href="{href(to)}" style="display: flex; flex-direction: column; gap: 2px; padding: 12px; min-width: 0; background: {T["surface"]}; '
            f'border: 1px solid {T["border"]}; border-radius: 8px; text-decoration: none;">'
            f'{row(icon(ic, 16, TONES[tone][1] if tone else T["text-muted"]), text(label, 13, 500, T["text-muted"]), gap=6)}'
            f'<span style="font-size: 20px; line-height: 28px; font-weight: 700; color: {color}; {NUM} white-space: nowrap;">{value}</span>'
            f'{muted(sub, 13)}</a>')


def _fab(label, to, trigger):
    use("FloatingActionButton")
    edge(to, trigger)
    return (f'<a href="{href(to)}" style="position: absolute; right: 16px; bottom: 92px; display: inline-flex; align-items: center; gap: 8px; '
            f'height: 52px; padding: 0 20px; box-sizing: border-box; border-radius: 8px; background: {T["primary"]}; color: #FFFFFF; '
            f'font-size: 16px; font-weight: 600; text-decoration: none; box-shadow: 0 4px 12px rgba(23,32,42,0.18);">{icon("plus", 20, "#FFFFFF")}{label}</a>')


def _bar2(left, right):
    """Bottom action bar with two equal lg buttons."""
    use("PrimaryBottomAction")
    return (f'<div style="display: flex; gap: 8px; padding: 12px 16px 24px; background: {T["surface"]}; border-top: 1px solid {T["border"]}; flex-shrink: 0;">'
            f'<div style="flex: 1; display: flex;">{left}</div><div style="flex: 1; display: flex;">{right}</div></div>')


def _list(*rows_):
    """White list container with dividers (rows already carry border-bottom)."""
    return (f'<div style="background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px; overflow: hidden; flex-shrink: 0;">'
            f'{"".join(rows_)}</div>')


def _stop(n, kind, tone, ic, place, addr, contact, right, last=False):
    num_dot = (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; '
               f'background: {TONES[tone][0]}; color: {TONES[tone][1]}; font-size: 13px; font-weight: 700; flex-shrink: 0;">{n}</span>')
    bd = "" if last else f"border-bottom: 1px solid {T['border']};"
    return (f'<div style="display: flex; gap: 10px; padding: 12px 14px; {bd}">{num_dot}'
            f'{col(row(badge(kind, tone, ic, size=13), text(place, 15, 600), gap=8), muted(addr, 14), muted(contact, 14), right, gap=2, extra="min-width: 0; flex-grow: 1;")}</div>')


def _card_list(*items):
    return (f'<div style="background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px; flex-shrink: 0;">{"".join(items)}</div>')


def _warn_line(msg, tone="warning", ic="triangle-alert"):
    bg, fg = TONES[tone]
    return row(icon(ic, 16, fg), text(msg, 14, 500, fg), gap=6)


# ---------------------------------------------------------------- MA-AUTH-01
def auth_01():
    use("GoogleSignInButton")
    g = (f'<a href="{href("MA-HOME-01")}" style="display: flex; align-items: center; justify-content: center; gap: 10px; height: 52px; width: 100%; '
         f'box-sizing: border-box; border: 1px solid {T["border-control"]}; border-radius: 6px; background: {T["surface"]}; text-decoration: none; '
         f'font-size: 16px; font-weight: 600; color: {T["text"]};">'
         f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; '
         f'border: 1px solid {T["border"]}; font-size: 14px; font-weight: 700; color: {T["accent"]};">G</span>Đăng nhập bằng Google</a>')
    edge("MA-HOME-01", "Đăng nhập Google thành công → Tổng quan")
    body = col(
        '<div style="flex-grow: 1;"></div>',
        col(logo(False, 56), text("BTA Nhà xe", 24, 700), muted("Theo dõi đơn, chuyến, công nợ và duyệt bảng lương của nhà xe", 15),
            gap=10, extra="align-items: center; text-align: center;"),
        '<div style="height: 32px;"></div>',
        g,
        muted("Dùng tài khoản Google đã được admin nhà xe mời. Quyền trên app giống Web Merchant.", 14),
        '<div style="flex-grow: 1;"></div>',
        row(subtle("Phiên bản 2.0.0", 12), spacer(), subtle("Điều khoản · Bảo mật", 12)),
        gap=12, extra="flex-grow: 1; text-align: center;")
    return mobile_frame("", body, "", h=H, bg=T["surface"], pad=24)


# ---------------------------------------------------------------- MA-HOME-01
def home_01():
    right = _hbtn("bell", "Thông báo (5 chưa đọc)", "MA-NOTI-01", 5, "Chuông thông báo")
    head = mobile_header("Tổng quan", sub="BTA Demo Transport · Thứ Tư, 23/09/2026", right=right)
    kpis = grid([
        _mkpi("Chuyến đang chạy", "2", "1 chuyến có sự cố", "truck", "MA-TRIP-01", "KPI chuyến đang chạy → danh sách chuyến", "accent"),
        _mkpi("Nợ quá hạn", money(27_000_000), "2 khách", "alarm-clock", "MA-FIN-01", "KPI nợ quá hạn → tài chính nhanh", "danger"),
        _mkpi("COD tài xế giữ", money(5_500_000), "Vượt ngưỡng 5 tr", "hand-coins", "MA-COD-01", "KPI COD → COD tài xế", "warning"),
        _mkpi("Sự cố mở", "1", "Kẹt xe QL1A", "triangle-alert", "MA-TRIP-02", "KPI sự cố → chi tiết chuyến có sự cố", "danger"),
        _mkpi("Bảng lương chờ duyệt", "1", "BL-202609-0001", "banknote", "MA-PAYROLL-01", "KPI bảng lương → duyệt bảng lương", "warning"),
        _mkpi("Đơn chưa xếp xe", "2", "Cần điều phối", "package", "MA-ORD-01", "KPI đơn chưa xếp xe → danh sách đơn"),
    ], cols=2, gap=8)

    def quick(ic, lab, to, trig):
        edge(to, trig)
        return (f'<a href="{href(to)}" style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; '
                f'height: 64px; background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px; text-decoration: none;">'
                f'{icon(ic, 20, T["primary"])}{text(lab, 13, 500)}</a>')
    quicks = row(quick("plus", "Tạo nhanh đơn", "MA-ORD-03", "Lối tắt tạo nhanh đơn"), quick("map", "Theo dõi xe", "MA-MAP-01", "Lối tắt bản đồ xe"),
                 quick("customers", "Khách hàng", "MA-CUS-01", "Lối tắt khách hàng"), gap=8)

    def trip_mini(c, route, plate, drv, stt, warn=None):
        return m_card(col(row(text(c, 15, 600, extra=NUMW), spacer(), status(stt, "trip"), gap=8),
                          muted(f"{route} · {plate} · {drv}", 14),
                          _warn_line(warn, "danger") if warn else "", gap=2), to="MA-TRIP-02", trigger=f"Mở chuyến {c}", pad=12)
    trips = m_section("Chuyến đang chạy", col(
        trip_mini("CX-202609-0001", "Cần Thơ → Bình Dương", "51C-123.45", "Tài", "Đang vận chuyển", "Sự cố mở: kẹt xe QL1A"),
        trip_mini("CX-202609-0003", "Long An → Thủ Đức", "51D-678.90", "Lái", "Đang lấy hàng"), gap=8),
        a("Xem tất cả", "MA-TRIP-01", "Xem tất cả chuyến", 14))
    body = col(kpis, quicks, trips, gap=14)
    return mobile_frame(head, body, bottom_nav(MA_TABS, 0), h=H)


# ---------------------------------------------------------------- MA-NOTI-01
def noti_01():
    head = mobile_header("Thông báo", back_to="MA-HOME-01", right=text("Đọc tất cả", 14, 600, T["accent"], "white-space: nowrap;"))

    def item(ic, tone, title, body_, time, to, trig, unread=True, last=False):
        bg, fg = TONES[tone]
        dot = f'<span style="width: 8px; height: 8px; border-radius: 50%; background: {T["accent"]}; flex-shrink: 0; margin-top: 8px;"></span>' if unread else '<span style="width: 8px; flex-shrink: 0;"></span>'
        bd = "" if last else f"border-bottom: 1px solid {T['border']};"
        edge(to, trig)
        return (f'<a href="{href(to)}" style="display: flex; gap: 12px; padding: 12px 14px; {bd} text-decoration: none; '
                f'background: {T["surface"] if not unread else "#FBFCFE"};">'
                f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; '
                f'background: {bg}; flex-shrink: 0;">{icon(ic, 18, fg)}</span>'
                f'{col(text(title, 15, 600 if unread else 500), muted(body_, 14), subtle(time, 12), gap=1, extra="flex-grow: 1; min-width: 0;")}{dot}</a>')
    items = _card_list(
        item("banknote", "warning", "Bảng lương chờ duyệt", "BL-202609-0001 · kỳ 09/2026 · 3 tài xế · thực lãnh 33.300.000 đ", "Hôm nay 08:15",
             "MA-PAYROLL-01", "Mở bảng lương chờ duyệt"),
        item("triangle-alert", "danger", "Sự cố mở: kẹt xe", "CX-202609-0001 · Nguyễn Văn Tài báo kẹt xe QL1A đoạn Tân An", "Hôm nay 10:42",
             "MA-TRIP-02", "Mở chuyến có sự cố"),
        item("hand-coins", "warning", "COD tài xế vượt ngưỡng", "Trần Minh Lái đang giữ 5.500.000 đ (ngưỡng 5.000.000 đ)", "Hôm nay 07:00",
             "MA-COD-01", "Mở COD tài xế"),
        item("clock", "warning", "Gần trùng lịch xe", "51C-123.45: CX-202609-0001 và CX-202609-0002 cách nhau 1 giờ", "Hôm nay 06:30",
             "MA-TRIP-01", "Mở danh sách chuyến (cảnh báo lịch)"),
        item("alarm-clock", "danger", "Công nợ quá hạn", "DH-202608-0009 · Công ty Gạo Miền Tây quá hạn 10 ngày · còn nợ 15.000.000 đ", "Hôm qua 08:00",
             "MA-ORD-02", "Mở đơn quá hạn", unread=False),
        item("package", "info", "Đơn mới chờ xác nhận", "DH-202609-0012 · Bao bì Hưng Lợi · Bình Dương → Q. Tân Phú", "22/09/2026 16:20",
             "MA-ORD-02", "Mở đơn chờ xác nhận", unread=False, last=True),
    )
    body = col(_chips(["Tất cả", "Chưa đọc · 4", "Cần duyệt"], 0), items, gap=12)
    return mobile_frame(head, body, "", h=H)


# ---------------------------------------------------------------- MA-ORD-01
def _order_card(o):
    c, cus, route, stt, tot, paid, due_, od, warn = o
    remain = tot - paid
    if warn == "Quá hạn":
        w = badge(f"Quá hạn {od} ngày", "danger", "alarm-clock", size=13)
    elif warn == "Có sự cố":
        w = badge("Có sự cố", "danger", "triangle-alert", size=13)
    elif warn:
        w = badge(warn, "warning", size=13)
    else:
        w = muted(f"Hạn TT {due_}", 13) if due_ != "—" else ""
    money_line = row(muted("Còn nợ", 14), text(money(remain), 15, 600, T["warning"] if remain else T["text-muted"], NUMW), spacer(), w, gap=6)
    return m_card(col(row(text(c, 15, 600, extra=NUMW), spacer(), status(stt), gap=8),
                      col(text(cus, 15, 500), muted(route, 14), gap=0), money_line, gap=4),
                  to="MA-ORD-02", trigger="Mở chi tiết đơn", pad=12)


def ord_01():
    head = mobile_header("Đơn & chuyến", right=_hbtn("customers", "Khách hàng", "MA-CUS-01", trigger="Mở danh sách khách hàng"))
    orders = [D.order("DH-202609-0001"), D.order("DH-202609-0012"), D.order("DH-202608-0009")]
    body = col(_seg(["Đơn", "Chuyến"], 0, [None, "MA-TRIP-01"]),
               _search("Tìm mã đơn, khách, tuyến…"),
               _chips(["Tất cả", "Đang chạy", "Chưa xếp xe", "Quá hạn"], 0),
               *[_order_card(o) for o in orders],
               _fab("Tạo nhanh", "MA-ORD-03", "Tạo nhanh đơn"), gap=10)
    return mobile_frame(head, body, bottom_nav(MA_TABS, 1), h=H)


# ---------------------------------------------------------------- MA-ORD-02
def ord_02():
    head = mobile_header("DH-202609-0001", back_to="MA-ORD-01", sub="Tạo 20/09/2026 · Lê Thu Vân",
                         right=_hbtn("phone", "Gọi khách Công ty Gạo Miền Tây"))
    summary = m_card(col(
        row(status("Đang thực hiện"), badge("Có sự cố", "danger", "triangle-alert", size=13), gap=6),
        row(icon("customers", 18, T["text-muted"]), a("Công ty Gạo Miền Tây", "MA-CUS-02", "Mở khách hàng", 15, 600), gap=8),
        row(icon("route", 18, T["text-muted"]), text("Kho Cần Thơ → Kho Bình Dương", 15), gap=8),
        row(icon("package", 18, T["text-muted"]), text("Gạo ST25 bao 50 kg · 160 bao · 8 tấn", 15), gap=8), gap=6), pad=12)
    stops = m_section("Điểm dừng", _card_list(
        _stop(1, "Lấy", "info", "package-check", "Kho Cần Thơ", "KCN Trà Nóc 1, Bình Thủy", "Anh Nam · 0901 234 567",
              row(status("Hoàn thành", "trip"), subtle("23/09 07:10", 12), gap=6)),
        _stop(2, "Trả", "primary", "map-pin", "Kho Bình Dương", "Số 12 ĐT743, Dĩ An", "Chị Hạnh · 0902 345 678",
              row(badge("Chưa đến", "neutral", size=13), muted("COD dự kiến", 13), text(money(12_500_000), 14, 600, extra=NUMW), gap=6), last=True)))
    trip = m_section("Chuyến", m_card(col(
        row(text("CX-202609-0001", 15, 600, extra=NUMW), spacer(), status("Đang vận chuyển", "trip"), gap=8),
        muted("51C-123.45 · Nguyễn Văn Tài · 06:00 – 14:00", 14), gap=2), to="MA-TRIP-02", trigger="Mở chuyến CX-202609-0001", pad=12))
    fin = m_section("Tài chính tóm tắt", m_card(col(
        _kv("Tổng thu khách", money(12_500_000)),
        _kv("Đã thu (phân bổ)", money(0), color=T["success"]),
        _kv("Còn nợ · hạn 08/10/2026", money(12_500_000), color=T["warning"]),
        _kv("Chi phí đơn/chuyến", money(800_000)),
        divider(2),
        _kv("Lãi/lỗ tạm tính", money(11_700_000), strong=True, color=T["success"], size=16), gap=4), pad=12),
        a("Tài chính", "MA-FIN-01", "Mở tài chính nhanh", 14))
    docs = m_section("Chứng từ · 3", _list(
        list_row("image", "POD lấy hàng Kho Cần Thơ", sub="2 ảnh · 23/09 07:12"),
        list_row("file-text", "Phiếu giao hàng.pdf", sub="PDF · 124 KB"),
    ))
    hint = banner("Sửa giá, điểm dừng, hàng hóa, hủy đơn: " + a("mở trên web để chỉnh chi tiết", "WM-ORD-02", "Mở đơn trên Web Merchant", 13), "info", "external-link")
    body = col(summary, stops, trip, fin, docs, hint, gap=14)
    bottom = _bar2(btn("Gọi khách", "secondary", "phone", size="lg", full=True),
                   btn("Xem chuyến", "primary", "truck", to="MA-TRIP-02", size="lg", full=True, trigger="Xem chuyến của đơn"))
    return mobile_frame(head, body, bottom, h=1220)


# ---------------------------------------------------------------- MA-ORD-03
def _mpicker(value, sub, ic):
    use("EntityPicker")
    return (f'<div style="display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 6px 12px; box-sizing: border-box; '
            f'border: 1px solid {T["border-control"]}; border-radius: 6px; background: {T["surface"]};">{icon(ic, 18, T["text-muted"])}'
            f'{col(text(value, 15, 500), muted(sub, 13), gap=0, extra="flex-grow: 1; min-width: 0;")}{icon("chevron-down", 18, T["text-muted"])}</div>')


def ord_03():
    head = mobile_header("Tạo nhanh đơn", back_to="MA-ORD-01", back_label="Hủy tạo đơn")
    body = col(
        field("Khách hàng", _mpicker("Công ty Gạo Miền Tây", "CUS-A-001 · còn nợ 27.500.000 đ", "customers"), True),
        _warn_line("Nợ quá hạn 15.000.000 đ · vẫn tạo được đơn", "warning"),
        field("Điểm đi (lấy hàng)", _mpicker("Kho Cần Thơ", "Sổ địa chỉ · KCN Trà Nóc 1, Bình Thủy", "package-check"), True),
        field("Điểm đến (trả hàng)", _mpicker("Kho Bình Dương", "Sổ địa chỉ · Số 12 ĐT743, Dĩ An", "map-pin"), True),
        row(field("Giá cước", money_input(12_000_000, h=48, fs=16), True, width="50%"),
            field("Hạn thanh toán", _mdate("08/10/2026"), True, hint="Khách: 15 ngày công nợ", width="50%"), gap=10, align="flex-start"),
        field("Ghi chú hàng", textarea("Gạo ST25 bao 50 kg, 160 bao, tránh ẩm", h=48, fs=15)),
        field("Trạng thái khi lưu", radio_cards([("Nháp", "Chưa gửi điều phối"), ("Đã xác nhận", "Sẵn sàng xếp xe")], 1)),
        banner("Dịch vụ thêm, nhiều điểm dừng, COD: chỉnh trên web.", "info", "external-link"),
        gap=10)
    return mobile_frame(head, body, primary_bottom_action("Tạo đơn", "MA-ORD-02", "check", trigger="Tạo đơn → chi tiết đơn"), h=H, bg=T["surface"])


def _mdate(v):
    use("DateField")
    return (f'<div style="display: flex; align-items: center; gap: 8px; height: 48px; padding: 0 12px; box-sizing: border-box; '
            f'border: 1px solid {T["border-control"]}; border-radius: 4px; background: {T["surface"]};">'
            f'<span style="flex-grow: 1; font-size: 16px; {NUM}">{v}</span>{icon("calendar", 18, T["text-muted"])}</div>')


# ---------------------------------------------------------------- MA-TRIP-01
def _trip_card(t):
    c, oc, route, plate, drv, planned, stt, warn = t
    tone = "danger" if warn == "Sự cố mở" else "warning"
    return m_card(col(row(text(c, 15, 600, extra=NUMW), spacer(), status(stt, "trip"), gap=8),
                      text(route, 15, 500),
                      muted(f"{plate} · {drv}" if plate != "—" else "Chưa gán xe/tài xế", 14),
                      row(icon("clock", 14, T["text-muted"]), muted(planned, 14), spacer(),
                          badge(warn, tone, "triangle-alert" if tone == "danger" else None, size=13) if warn else "", gap=6), gap=2),
                  to="MA-TRIP-02", trigger="Mở chi tiết chuyến", pad=12)


def trip_01():
    head = mobile_header("Đơn & chuyến", right=_hbtn("map", "Theo dõi xe", "MA-MAP-01", trigger="Mở bản đồ theo dõi xe"))
    trips = [t for t in D.TRIPS if t[0] in ("CX-202609-0001", "CX-202609-0003", "CX-202609-0002", "CX-202609-0004")]
    body = col(_seg(["Đơn", "Chuyến"], 1, ["MA-ORD-01", None]),
               _chips(["Hôm nay · 4", "Đang chạy · 2", "Sắp chạy", "Có cảnh báo"], 0),
               *[_trip_card(t) for t in trips], gap=10)
    return mobile_frame(head, body, bottom_nav(MA_TABS, 1), h=H)


# ---------------------------------------------------------------- MA-TRIP-02
def trip_02():
    head = mobile_header("CX-202609-0001", back_to="MA-TRIP-01", sub="Cần Thơ → Bình Dương")
    st_card = m_card(col(
        row(status("Đang vận chuyển", "trip"), spacer(), muted("23/09 06:00 – 14:00", 14), gap=8),
        row(icon("locate-fixed", 16, T["text-muted"]), muted("Vị trí cuối 14:05 · QL1A, Tân An, Long An", 14), gap=6),
        row(a("Xem trên bản đồ", "MA-MAP-01", "Xem xe trên bản đồ", 14), spacer(),
            a("Đơn DH-202609-0001", "MA-ORD-02", "Mở đơn của chuyến", 14), gap=8), gap=6), pad=12)
    inc = warning_panel("Sự cố mở · Trung bình", ["Kẹt xe QL1A đoạn Tân An, dự kiến trễ 2 giờ", "Nguyễn Văn Tài báo 10:42 · 1 ảnh"],
                        a("Xử lý sự cố trên web", "WM-INC-01", "Mở sự cố trên Web Merchant", 14), tone="danger")
    crew = m_card(col(
        row(avatar("NT", 40, "primary"), col(text("Nguyễn Văn Tài", 16, 600), muted("0900 000 001 · Tài xế", 14), gap=0), spacer(), gap=10),
        btn("Gọi tài xế", "secondary", "phone", size="lg", full=True),
        divider(2),
        row(icon("truck", 18, T["text-muted"]), text("51C-123.45", 15, 600, extra=NUMW), muted("Tải thùng · 8 tấn", 14), gap=8), gap=10), pad=12)
    stops = m_section("Điểm dừng · POD/COD", _card_list(
        _stop(1, "Lấy", "info", "package-check", "Kho Cần Thơ", "KCN Trà Nóc 1, Bình Thủy", "Anh Nam · 0901 234 567",
              col(row(status("Hoàn thành", "trip"), subtle("07:10", 12), gap=6),
                  row(photo_placeholder("64px", 48, "POD 1"), photo_placeholder("64px", 48, "POD 2"), gap=6), gap=6)),
        _stop(2, "Trả", "primary", "map-pin", "Kho Bình Dương", "Số 12 ĐT743, Dĩ An", "Chị Hạnh · 0902 345 678",
              col(row(badge("Chưa đến", "neutral", size=13)),
                  _kv("COD dự kiến", money(12_500_000), size=14), _kv("COD thực thu", "—", size=14), gap=2), last=True)))
    body = col(st_card, inc, crew, stops, gap=12)
    bottom = primary_bottom_action("Cập nhật trạng thái thay tài xế", None, "refresh-cw", trigger="Mở bottom sheet cập nhật trạng thái")
    return mobile_frame(head, body, bottom, h=1000)


# ---------------------------------------------------------------- MA-MAP-01
def map_01():
    head = mobile_header("Theo dõi xe", back_to="MA-TRIP-01", sub="2 xe đang chạy · cập nhật 14:05")
    mp = map_placeholder("100%", 300, [(38, 58, "51C-123.45", "accent"), (70, 38, "51D-678.90", "info"), (58, 80, "51C-456.78", "neutral")],
                         "Vị trí cuối (last known)")

    def veh(plate, trip, drv, stt, when, warn=None, to=True):
        body_ = col(row(text(plate, 16, 600, extra=NUMW), spacer(), status(stt, "trip") if stt in TRIP_STATUS else badge(stt, "neutral", size=13), gap=8),
                    muted(f"{trip} · {drv}", 14),
                    row(icon("locate-fixed", 14, T["text-muted"]), muted(when, 14), spacer(), badge(warn, "warning", size=13) if warn else "", gap=6), gap=2)
        return m_card(body_, to="MA-TRIP-02" if to else None, trigger=f"Mở chuyến của xe {plate}", pad=12)
    body = col(mp, _chips(["Đang chạy · 2", "Tất cả xe · 4"], 0),
               veh("51C-123.45", "CX-202609-0001", "Nguyễn Văn Tài", "Đang vận chuyển", "14:05 · QL1A, Tân An", "Có sự cố"),
               veh("51D-678.90", "CX-202609-0003", "Trần Minh Lái", "Đang lấy hàng", "14:02 · KCN Tân Đức, Long An"),
               veh("51C-456.78", "Rảnh", "Lê Hoàng Phúc", "Sẵn sàng", "12:40 · Bãi xe Bình Tân", to=False),
               gap=10)
    return mobile_frame(head, body, "", h=H)


# ---------------------------------------------------------------- MA-CUS-01
def cus_01():
    head = mobile_header("Khách hàng", back_to="MA-HOME-01", sub="5 khách đang hoạt động")

    def card(c):
        if c["overdue"]:
            w = badge(f"Quá hạn {money(c['overdue'])}", "danger", "alarm-clock", size=13)
        elif c["credit"]:
            w = badge(f"Số dư {money(c['credit'])}", "info", size=13)
        else:
            w = ""
        warn2 = badge(c["warn"], "warning", size=13) if c["warn"] == "Vượt hạn mức" else ""
        return m_card(col(row(text(c["name"], 15, 600), spacer(), warn2, gap=8),
                          muted(f"{c['id']} · {c['phone']}", 14),
                          row(muted("Còn nợ", 14), text(money(c["debt"]), 15, 600, T["warning"] if c["debt"] else T["text-muted"], NUMW), spacer(), w, gap=6),
                          gap=2), to="MA-CUS-02", trigger="Mở chi tiết khách", pad=12)
    body = col(_search("Tìm tên, mã, số điện thoại…"), _chips(["Tất cả", "Còn nợ", "Quá hạn", "Vượt hạn mức"], 0),
               *[card(c) for c in D.CUSTOMERS], gap=10)
    return mobile_frame(head, body, "", h=H)


# ---------------------------------------------------------------- MA-CUS-02
def cus_02():
    head = mobile_header("Công ty Gạo Miền Tây", back_to="MA-CUS-01", sub="CUS-A-001 · 0292 3812 456",
                         right=_hbtn("phone", "Gọi khách"))
    debt = m_card(col(
        row(col(muted("Còn nợ", 14), text(money(27_500_000), 22, 700, T["warning"], NUMW), gap=0), spacer(),
            col(muted("Quá hạn", 14), text(money(15_000_000), 18, 700, T["danger"], NUMW), gap=0, extra="align-items: flex-end;"), gap=8),
        progress(27.5, "warning", 8),
        row(muted("Hạn mức 100.000.000 đ · 27,5%", 13), spacer(), muted("Nợ 15 ngày", 13), gap=8),
        divider(2),
        _kv("Số dư khách (trả trước)", money(0)),
        a("Công nợ chi tiết trên web", "WM-CUS-05", "Mở công nợ khách trên Web Merchant", 14), gap=6), pad=12)

    def o_row(c, stt, sub, amt, tone, last=False):
        bd = "" if last else f"border-bottom: 1px solid {T['border']};"
        edge("MA-ORD-02", f"Mở đơn {c}")
        return (f'<a href="{href("MA-ORD-02")}" style="display: block; padding: 10px 14px; {bd} text-decoration: none;">'
                f'{col(row(text(c, 15, 600, extra=NUMW), spacer(), status(stt), gap=8), row(muted(sub, 14), spacer(), text(amt, 14, 600, TONES[tone][1] if tone else T["text-muted"], NUMW), gap=6), gap=2)}</a>')
    orders = m_section("Đơn gần đây · 18", _card_list(
        o_row("DH-202609-0001", "Đang thực hiện", "Cần Thơ → Bình Dương", "Còn " + money(12_500_000), "warning"),
        o_row("DH-202609-0009", "Hoàn thành", "Cần Thơ → Q. Bình Tân", "Đã thu đủ", "success"),
        o_row("DH-202608-0009", "Hoàn thành", "Quá hạn 10 ngày", "Còn " + money(15_000_000), "danger", last=True)))
    addr = m_section("Địa chỉ · 2", _card_list(
        _stop("A", "Lấy", "info", "package-check", "Kho Cần Thơ", "KCN Trà Nóc 1, Bình Thủy, Cần Thơ", "Anh Nam · 0901 234 567", ""),
        _stop("B", "Trả", "primary", "map-pin", "Kho Bình Dương", "Số 12 ĐT743, Dĩ An, Bình Dương", "Chị Hạnh · 0902 345 678", "", last=True)))
    body = col(debt, orders, addr, gap=14)
    bottom = _bar2(btn("Gọi khách", "secondary", "phone", size="lg", full=True),
                   btn("Tạo đơn", "primary", "plus", to="MA-ORD-03", size="lg", full=True, trigger="Tạo đơn cho khách"))
    return mobile_frame(head, body, bottom, h=940)


# ---------------------------------------------------------------- MA-FIN-01
def fin_01():
    head = mobile_header("Tài chính", sub="BTA Demo Transport · cập nhật 14:30")
    tiles = grid([
        _mkpi("Nợ quá hạn", money(27_000_000), "2 khách · 2 đơn", "alarm-clock", "MA-CUS-01", "KPI nợ quá hạn → khách hàng", "danger"),
        _mkpi("COD tài xế giữ", money(5_500_000), "1 tài xế vượt ngưỡng", "hand-coins", "MA-COD-01", "KPI COD → COD tài xế", "warning"),
    ], cols=2, gap=8)

    def debt_row(name, sub, amt, last=False):
        bd = "" if last else f"border-bottom: 1px solid {T['border']};"
        edge("MA-CUS-02", f"Mở khách {name}")
        return (f'<a href="{href("MA-CUS-02")}" style="display: block; padding: 10px 14px; {bd} text-decoration: none;">'
                f'{col(row(text(name, 15, 600), spacer(), text(money(amt), 15, 600, T["danger"], NUMW), gap=8), muted(sub, 14), gap=0)}</a>')
    overdue = m_section("Nợ khách quá hạn", _card_list(
        debt_row("Công ty Gạo Miền Tây", "DH-202608-0009 · quá hạn 10 ngày", 15_000_000),
        debt_row("Vật liệu Xây dựng Phú Mỹ", "DH-202609-0005 · quá hạn 8 ngày", 12_000_000, last=True)),
        a("Khách hàng", "MA-CUS-01", "Mở danh sách khách hàng", 14))
    payroll = m_card(row(icon("banknote", 20, T["warning"]), col(text("BL-202609-0001 chờ duyệt", 15, 600), muted("Kỳ 09/2026 · thực lãnh 33.300.000 đ", 14), gap=0),
                         spacer(), icon("chevron-right", 18, T["text-subtle"]), gap=10), to="MA-PAYROLL-01", trigger="Mở bảng lương chờ duyệt", pad=12)

    def mv(code_, title, sub, amt, sign, stt, last=False):
        bd = "" if last else f"border-bottom: 1px solid {T['border']};"
        color = T["success"] if sign > 0 else T["text"]
        return (f'<div style="padding: 10px 14px; {bd}">'
                f'{col(row(text(code_, 14, 600, extra=NUMW), status(stt, "fin") if stt else "", spacer(), text(("+" if sign > 0 else "−") + money(amt), 15, 600, color, NUMW), gap=6), text(title, 14), muted(sub, 13), gap=0)}</div>')
    recent = m_section("Thu chi gần đây", _card_list(
        mv("PT-202609-0004", "Vật liệu Xây dựng Phú Mỹ trả", "22/09 · Chuyển khoản", 6_500_000, 1, "Đã phân bổ"),
        mv("PT-202609-0003", "Trần Minh Lái nộp COD", "21/09 · Tiền mặt · không phải doanh thu", 2_000_000, 1, None),
        mv("PC-202609-0001", "Phí cầu đường · CX-202609-0001", "23/09 · Tài xế chi trước", 800_000, -1, "Chưa trả"),
        mv("PC-202609-0003", "Thuê xe ngoài · DH-202609-0002", "22/09 · Chành Xe Miền Trung", 8_000_000, -1, "Chưa trả", last=True)),
        a("Sổ thu chi trên web", "WM-FIN-01", "Mở sổ thu chi trên Web Merchant", 14))
    body = col(tiles, overdue, payroll, recent, gap=14)
    return mobile_frame(head, body, bottom_nav(MA_TABS, 2), h=940)


# ---------------------------------------------------------------- MA-COD-01
def cod_01():
    head = mobile_header("COD tài xế", back_to="MA-FIN-01", sub="Tiền thu hộ tài xế đang giữ")
    total = m_card(col(muted("Tổng COD đang giữ", 14), text(money(5_500_000), 24, 700, T["warning"], NUMW),
                       muted("Ngưỡng cảnh báo 5.000.000 đ hoặc giữ quá 2 ngày", 13), gap=2), pad=12)
    note = banner("COD tài xế nộp về là tiền thu hộ, <b>không phải doanh thu</b>.", "info")
    lai = m_card(col(
        row(avatar("TL", 40, "warning"), col(text("Trần Minh Lái", 16, 600), muted("0900 000 002", 14), gap=0), spacer(),
            badge("Vượt ngưỡng", "danger", "triangle-alert", size=13), gap=10),
        _kv("Đã thu tại điểm giao", money(7_500_000), size=14),
        _kv("Đã nộp · PT-202609-0003", "−" + money(2_000_000), size=14),
        _kv("Đang giữ", money(5_500_000), strong=True, color=T["warning"], size=16),
        muted("Giữ lâu nhất: CX-202609-0005 · 22/09/2026", 13),
        row(btn("Gọi", "secondary", "phone", size="lg"),
            f'<div style="flex-grow: 1; display: flex;">{btn("Ghi nhận nộp COD", "primary", "hand-coins", size="lg", full=True)}</div>', gap=8),
        gap=6), pad=12)
    tai = m_card(col(
        row(avatar("NT", 40, "primary"), col(text("Nguyễn Văn Tài", 16, 600), muted("0900 000 001 · 51C-123.45", 14), gap=0), spacer(),
            text(money(0), 15, 600, T["text-muted"], NUMW), gap=10),
        row(icon("clock", 14, T["text-muted"]), muted("Sắp thu: 12.500.000 đ tại Kho Bình Dương (CX-202609-0001)", 13), gap=6), gap=6),
        to="MA-TRIP-02", trigger="Mở chuyến sắp thu COD", pad=12)
    phuc = m_card(row(avatar("LP", 40, "neutral"), col(text("Lê Hoàng Phúc", 16, 600), muted("0900 000 004 · không giữ COD", 14), gap=0), spacer(),
                      text(money(0), 15, 600, T["text-muted"], NUMW), gap=10), pad=12)
    body = col(total, note, lai, tai, phuc, gap=10)
    return mobile_frame(head, body, "", h=H)


# ---------------------------------------------------------------- MA-PAYROLL-01
def payroll_01():
    head = mobile_header("Duyệt bảng lương", back_to="MA-HOME-01", sub="1 bảng lương chờ duyệt")
    top = m_card(col(
        row(text("BL-202609-0001", 17, 700, extra=NUMW), spacer(), status("Chờ duyệt", "fin"), gap=8),
        muted("Kỳ 01/09 – 30/09/2026 · 3 tài xế", 14),
        muted("Lê Thu Vân gửi duyệt 22/09/2026 17:30", 14),
        divider(2),
        _kv("Lương cố định", money(31_500_000), size=14),
        _kv("Thưởng chuyến/đơn", "+" + money(4_300_000), size=14),
        _kv("Tạm ứng/ứng lương", "−" + money(2_000_000), size=14),
        _kv("Giảm trừ", "−" + money(500_000), size=14),
        divider(2),
        _kv("Tổng thực lãnh", money(33_300_000), strong=True, size=18), gap=4), pad=14)

    def line(name, sal, bonus, adv, ded, net, warn, last=False):
        bd = "" if last else f"border-bottom: 1px solid {T['border']};"
        parts = [f"Lương {money(sal)}", f"thưởng {money(bonus)}"]
        if adv:
            parts.append(f"ứng {money(adv)}")
        if ded:
            parts.append(f"giảm trừ {money(ded)}")
        return (f'<div style="padding: 10px 14px; {bd}">'
                f'{col(row(text(name, 15, 600), badge(warn, "warning", size=12) if warn else "", spacer(), text(money(net), 16, 700, extra=NUMW), gap=6), muted(" · ".join(parts), 13), gap=2)}</div>')
    lines = m_section("Thực lãnh theo tài xế", _card_list(*[line(*l, last=i == len(D.PAYROLL_LINES) - 1) for i, l in enumerate(D.PAYROLL_LINES)]),
                      a("Chi tiết trên web", "WM-PAYROLL-02", "Mở chi tiết bảng lương trên Web Merchant", 14))
    info = row(icon("info", 16, T["text-muted"]), muted("Số liệu là snapshot khi tạo bảng lương. Trả về cần nhập lý do; duyệt được ghi audit như trên web.", 13),
               gap=6, align="flex-start")
    body = col(top, lines, info, gap=14)
    bottom = _bar2(btn("Trả về", "danger-outline", "undo-2", size="lg", full=True),
                   btn("Duyệt", "primary", "check", size="lg", full=True))
    return mobile_frame(head, body, bottom, h=H)


# ---------------------------------------------------------------- MA-RPT-01
def rpt_01():
    head = mobile_header("Báo cáo", sub="Tháng 09/2026 · đến 23/09")
    period = _seg(["Hôm nay", "Tuần", "Tháng", "Quý"], 2, None)
    nums = grid([
        col(muted("Doanh thu", 13), text(money(89_200_000), 17, 700, extra=NUMW), gap=0),
        col(muted("Chi phí", 13), text(money(16_500_000), 17, 700, extra=NUMW), gap=0),
        col(muted("Lãi/lỗ", 13), text(money(72_700_000), 17, 700, T["success"], NUMW), gap=0),
        col(muted("Tiền đã thu", 13), text(money(15_700_000), 17, 700, extra=NUMW), gap=0),
    ], cols=2, gap=12)
    top = m_card(col(nums, subtle("Doanh thu = tổng thu khách của đơn đã xác nhận; khác tiền đã thu. COD tài xế nộp không tính.", 12), gap=10), pad=14)
    chart = m_section("Doanh thu và chi phí theo tuần", m_card(
        bar_chart(["T36", "T37", "T38", "T39"], [("Doanh thu", [18.5, 22.0, 27.2, 21.5], "chart-1"), ("Chi phí", [3.2, 5.1, 4.2, 4.0], "chart-3")],
                  w=330, h=150), pad=12))
    debt = m_section("Công nợ", m_card(col(
        _kv("Còn phải thu khách", money(135_200_000)),
        _kv("Trong đó quá hạn", money(27_000_000), color=T["danger"]),
        _kv("Phải trả nhà cung cấp", money(10_500_000)),
        _kv("COD tài xế đang giữ", money(5_500_000), color=T["warning"]), gap=4), pad=12))
    web = btn("Xem sâu trên web", "secondary", "external-link", to="WM-RPT-01", size="lg", full=True, trigger="Mở trung tâm báo cáo trên Web Merchant")
    body = col(period, top, chart, debt, web, gap=12)
    return mobile_frame(head, body, bottom_nav(MA_TABS, 3), h=900)


# ---------------------------------------------------------------- MA-PROFILE-01
def profile_01():
    head = mobile_header("Tài khoản")
    me = m_card(row(avatar("TH", 52, "accent"), col(text("Trần Hải", 18, 600), muted("admin@bta-demo.test", 14), row(badge("Admin", "primary", size=13)), gap=2), gap=14), pad=14)
    merchant = m_section("Nhà xe đang dùng", _list(
        list_row("building-2", "BTA Demo Transport", "", sub="M-DEMO-A · Admin"),
        list_row("arrow-down-up", "Đổi nhà xe", "1 nhà xe", sub="Chỉ hiện nhà xe bạn được mời"),
    ))
    settings = m_section("Cài đặt", _list(
        f'<div style="padding: 12px 16px; background: {T["surface"]}; border-bottom: 1px solid {T["border"]};">'
        f'{switch(True, "Thông báo đẩy", "Sự cố, COD vượt ngưỡng, bảng lương chờ duyệt")}</div>',
        list_row("bell", "Thông báo", "5", to="MA-NOTI-01", trigger="Mở thông báo"),
        list_row("external-link", "Mở Web Merchant", "", to="WM-DASH-01", sub="Chỉnh chi tiết, cài đặt, phân quyền", trigger="Mở Web Merchant"),
        list_row("info", "Phiên bản", "2.0.0"),
    ))
    logout = _list(list_row("log-out", "Đăng xuất", to="MA-AUTH-01", danger=True, trigger="Đăng xuất"))
    body = col(me, merchant, settings, logout, gap=14)
    return mobile_frame(head, body, bottom_nav(MA_TABS, 4), h=H)


# ---------------------------------------------------------------- register
def C(module):
    return dict(platform="ma", module=module, w=390)


register(
    Screen(id="MA-AUTH-01", name="Đăng nhập", route="MerchantLoginRoute", render=auth_01, pattern="auth", h=H, roles=ROLES_ALL, **C("Đăng nhập"),
           purpose="Đăng nhập App Merchant bằng Google (Firebase Auth) giống Web Merchant; chỉ user đã là thành viên merchant mới vào được.",
           api=["Firebase Google Sign-In (google_sign_in + firebase_auth)", "me"],
           data=["me.user", "me.memberships[]", "me.permissions[]"],
           actions=[("Đăng nhập bằng Google", "public"), ("Sau login: 1 merchant → MerchantHomeRoute; nhiều merchant → chọn nhà xe", "session")],
           states={"loading": "Nút Google disabled + spinner trong nút", "error": "Banner danger 'Không đăng nhập được' (tài khoản chưa thuộc nhà xe / huỷ đăng nhập / mất mạng)",
                   "offline": "Banner 'Không có kết nối' — không cho bấm đăng nhập"},
           notes=["Không có form email/mật khẩu (D-006).", "Lưu session bằng flutter_secure_storage; token refresh tự động.",
                  "Banner lỗi (state error) hiện phía trên nút Google: 'Tài khoản … chưa thuộc nhà xe nào. Liên hệ admin để được mời.'"]),
    Screen(id="MA-HOME-01", name="Tổng quan mobile", route="MerchantHomeRoute", render=home_01, pattern="dashboard", h=H, roles=ROLES_ALL, **C("Tổng quan & thông báo"),
           purpose="Mở nhanh việc cần xử lý: chuyến đang chạy, nợ quá hạn, COD tài xế giữ, sự cố mở, bảng lương chờ duyệt, đơn chưa xếp xe.",
           api=["dashboardSummary(filter: {date: today})", "trips(filter: {status: RUNNING}, first: 3)", "notifications(filter: {unread: true}){totalCount}"],
           data=["runningTripCount", "overdueDebtAmount", "overdueCustomerCount", "codHeldAmount", "openIncidentCount", "pendingPayrollCount",
                 "unassignedOrderCount", "runningTrips[{code, route, vehicle.plate, driver.name, status, openIncident}]"],
           actions=[("KPI → màn đã lọc tương ứng", "theo quyền xem"), ("Tạo nhanh đơn", "order.create"), ("Theo dõi xe", "trip.view"),
                    ("Bảng lương chờ duyệt", "payroll.view (duyệt: payroll.approve — admin)")],
           states={"loading": "Skeleton 6 KPI + 2 card", "empty": "Không có chuyến đang chạy → EmptyState nhỏ 'Hôm nay chưa có chuyến chạy'",
                   "error": "Banner danger + Thử lại; pull-to-refresh"},
           notes=["Card theo role: operation ẩn 'Nợ quá hạn' nếu không có finance.view; accountant ẩn 'Đơn chưa xếp xe'; chỉ admin thấy CTA duyệt lương.",
                  "KPI 'Sự cố mở' = 1 mở thẳng chuyến có sự cố; nếu > 1 mở MerchantTripListRoute(filter: incident).",
                  "Pull-to-refresh; tự refresh khi quay lại foreground."]),
    Screen(id="MA-NOTI-01", name="Thông báo", route="MerchantNotificationsRoute", render=noti_01, pattern="list", h=H, roles=ROLES_ALL, **C("Tổng quan & thông báo"),
           purpose="Cảnh báo và việc cần duyệt/xử lý; chạm để mở đúng entity (đơn / chuyến / bảng lương / COD).",
           api=["notifications(filter, first, after)", "markNotificationRead(id)", "markAllNotificationsRead"],
           data=["type", "title", "body", "entityType", "entityId", "createdAt", "readAt"],
           actions=[("Mở thông báo → entity", "quyền xem entity"), ("Đọc tất cả", "notification.read")],
           states={"empty": "EmptyState 'Chưa có thông báo'", "loading": "Skeleton 5 dòng", "error": "Banner danger + Thử lại"},
           notes=["Deep link theo entityType: PAYROLL → MA-PAYROLL-01, TRIP/INCIDENT/OVERLAP → MA-TRIP-02 (hoặc danh sách nếu nhiều), ORDER → MA-ORD-02, COD → MA-COD-01.",
                  "Push notification (FCM) mở cùng route; đánh dấu đã đọc khi mở."]),
    Screen(id="MA-ORD-01", name="Danh sách đơn", route="MerchantOrderListRoute", render=ord_01, pattern="list", h=H, roles=ROLES_ALL, **C("Đơn & chuyến"),
           purpose="Tìm/lọc đơn, xem trạng thái và công nợ; điểm vào tạo nhanh đơn và chi tiết đơn. Segmented Đơn/Chuyến trong tab Đơn/Chuyến.",
           api=["orders(filter: {search, status, warning}, sort, first, after)"],
           data=["code", "customer.name", "routeSummary", "status", "remainingAmount", "dueDate", "overdueDays", "warnings[]"],
           actions=[("Tạo nhanh (FAB)", "order.create — ẩn nếu không có quyền"), ("Mở chi tiết", "order.view")],
           states={"loading": "Skeleton card", "empty": "EmptyState 'Không có đơn phù hợp' + Xoá bộ lọc", "error": "Banner danger + Thử lại"},
           notes=["Infinite scroll (first: 20, cursor).", "Chip map sang filter.status / filter.warning như WM-ORD-01.",
                  "Tab Đơn/Chuyến giữ state bộ lọc riêng từng segment."]),
    Screen(id="MA-ORD-02", name="Chi tiết đơn", route="MerchantOrderDetailRoute(orderId)", render=ord_02, pattern="detail", h=1220, roles=ROLES_ALL, **C("Đơn & chuyến"),
           purpose="Xem nhanh một đơn: tổng quan, điểm dừng, chuyến, tài chính tóm tắt, chứng từ. Sửa chi tiết mở trên web.",
           api=["order(id){status, customer, stops, cargoLines, trips, financeSummary, attachments}"],
           data=["code", "status", "warnings[]", "customer{id, name, phone}", "stops[]", "cargoSummary", "trips[]",
                 "financeSummary{totalAmount, allocatedAmount, remainingAmount, dueDate, expenseAmount, profitEstimate}", "attachments[]"],
           actions=[("Gọi khách", "tel: customer.phone"), ("Xem chuyến", "trip.view"), ("Xác nhận đơn (khi Chờ xác nhận)", "order.update"),
                    ("Mở trên web để chỉnh", "deep link /orders/:orderId")],
           states={"loading": "Skeleton header + sections", "error": "Không tìm thấy / không có quyền → EmptyState + Quay lại"},
           notes=["Trang cuộn; mockup cao 1220 thể hiện toàn bộ nội dung.", "Đổi trạng thái nhẹ (Chờ xác nhận → Đã xác nhận) hiện ở bottom bar thay 'Xem chuyến' khi đơn chưa xác nhận.",
                  "Sửa giá / hủy đơn là sensitive — chỉ làm trên web (WM-ORD-08)."]),
    Screen(id="MA-ORD-03", name="Tạo nhanh đơn", route="MerchantQuickOrderCreateRoute", render=ord_03, pattern="form", h=H, roles=["admin", "operation"], **C("Đơn & chuyến"),
           purpose="Tạo order tối thiểu: khách, điểm đi/đến, giá cước, ghi chú hàng, hạn thanh toán. Phần chi tiết chỉnh trên web.",
           api=["customers(filter: {search})", "customerLocations(customerId)", "createOrder(input)"],
           data=["customerId", "pickupLocation", "dropoffLocation", "freightAmount", "cargoNote", "dueDate", "status (DRAFT|CONFIRMED)"],
           actions=[("Tạo đơn", "order.create (accountant chỉ khi được cấp)")],
           states={"validation": "Lỗi inline dưới field (khách, điểm đi, điểm đến, giá cước > 0, hạn TT)",
                   "warning": "Khách nợ quá hạn / vượt hạn mức = dòng cảnh báo vàng, không chặn", "submitting": "Nút 'Tạo đơn' loading, chặn double-submit"},
           notes=["Hạn thanh toán gợi ý = hôm nay + customer.debtDays.", "Điểm đi/đến chọn từ sổ địa chỉ khách hoặc nhập mới (bottom sheet).",
                  "Sau tạo → MerchantOrderDetailRoute(orderId) thay thế route hiện tại."]),
    Screen(id="MA-TRIP-01", name="Danh sách chuyến", route="MerchantTripListRoute", render=trip_01, pattern="list", h=H, roles=ROLES_ALL, **C("Đơn & chuyến"),
           purpose="Theo dõi chuyến hôm nay / đang chạy / sắp chạy và cảnh báo lịch.",
           api=["trips(filter: {date, status, hasWarning}, sort: plannedStart, first, after)"],
           data=["code", "order.code", "routeSummary", "vehicle.plate", "driver.name", "plannedStart", "plannedEnd", "status", "warnings[]"],
           actions=[("Mở chi tiết chuyến", "trip.view"), ("Theo dõi xe", "trip.view")],
           states={"loading": "Skeleton card", "empty": "EmptyState 'Không có chuyến trong ngày'", "error": "Banner danger + Thử lại"}),
    Screen(id="MA-TRIP-02", name="Chi tiết chuyến", route="MerchantTripDetailRoute(tripId)", render=trip_02, pattern="detail", h=1000, roles=ROLES_ALL, **C("Đơn & chuyến"),
           purpose="Xe, tài xế, điểm dừng, trạng thái, POD/COD, sự cố; gọi tài xế, xem POD, cập nhật trạng thái thay tài xế.",
           api=["trip(id){status, vehicle, driver, stops{status, pod, codExpected, codActual}, incidents, lastLocation}", "updateTripStatus(id, status, reason?)",
                "updateStopStatus(id, status, reason?)"],
           data=["code", "status", "plannedStart/End", "lastLocation{lat, lng, at, address}", "vehicle", "driver{name, phone}", "stops[]", "incidents[open]"],
           actions=[("Gọi tài xế", "tel: driver.phone"), ("Xem POD (full screen)", "trip.view"),
                    ("Cập nhật trạng thái thay tài xế", "trip.status.update (admin, operation) — bottom sheet"),
                    ("Tạm dừng / hủy / lùi trạng thái", "sensitive — lý do bắt buộc")],
           states={"loading": "Skeleton", "error": "Không tìm thấy / không có quyền", "conflict": "Tài xế vừa cập nhật → toast 'Trạng thái đã thay đổi' + tải lại"},
           notes=["Bottom sheet 'Cập nhật trạng thái thay tài xế': radio trạng thái kế tiếp hợp lệ (Đang vận chuyển → Đang trả hàng → Hoàn thành), "
                  "chọn điểm dừng, ghi chú; Tạm dừng/Hủy/lùi trạng thái yêu cầu Lý do (bắt buộc); nút 'Xác nhận cập nhật'. Ghi activity 'cập nhật thay tài xế' + người thực hiện.",
                  "Accountant: ẩn nút cập nhật trạng thái.", "Chạm ảnh POD mở viewer toàn màn hình.", "Trang cuộn; mockup cao 1000."]),
    Screen(id="MA-MAP-01", name="Theo dõi xe", route="MerchantMapRoute", render=map_01, pattern="page", h=H, roles=ROLES_ALL, **C("Đơn & chuyến"),
           purpose="Vị trí cuối (last known) của xe đang chạy trên bản đồ + danh sách xe.",
           api=["vehicleLastLocations(filter: {running: true})", "trips(filter: {status: RUNNING})"],
           data=["vehicle.plate", "trip.code", "driver.name", "tripStatus", "lastLocation{lat, lng, at, address}", "warnings[]"],
           actions=[("Chạm xe / pin → chi tiết chuyến", "trip.view")],
           states={"stale": "Vị trí > 15 phút: badge 'Mất tín hiệu' màu warning", "empty": "Không có xe đang chạy", "error": "Không tải được bản đồ → vẫn hiện danh sách"},
           notes=["Map SDK (google_maps_flutter); không realtime, refresh 60s hoặc pull-to-refresh.", "Chip 'Tất cả xe' hiện cả xe rảnh (không mở chuyến)."]),
    Screen(id="MA-CUS-01", name="Khách hàng", route="MerchantCustomerListRoute", render=cus_01, pattern="list", h=H, roles=ROLES_ALL, **C("Khách hàng"),
           purpose="Tìm khách, xem công nợ/quá hạn/số dư; gọi khách, mở chi tiết.",
           api=["customers(filter: {search, debtStatus}, first, after){debtSummary}"],
           data=["code", "name", "phone", "debtAmount", "overdueAmount", "creditBalance", "creditLimitWarning"],
           actions=[("Mở chi tiết khách", "customer.view"), ("Gọi khách (vuốt/giữ)", "tel:")],
           states={"loading": "Skeleton", "empty": "EmptyState 'Không tìm thấy khách'", "error": "Banner danger + Thử lại"}),
    Screen(id="MA-CUS-02", name="Chi tiết khách", route="MerchantCustomerDetailRoute(customerId)", render=cus_02, pattern="detail", h=940, roles=ROLES_ALL, **C("Khách hàng"),
           purpose="Công nợ, đơn gần đây, địa chỉ, số dư; gọi khách và tạo đơn nhanh cho khách.",
           api=["customer(id){debtSummary, locations, recentOrders(first: 5)}"],
           data=["name", "code", "phone", "debtAmount", "overdueAmount", "creditLimit", "debtDays", "creditBalance", "recentOrders[]", "locations[]"],
           actions=[("Gọi khách", "tel:"), ("Tạo đơn", "order.create → MA-ORD-03 với customerId"), ("Công nợ chi tiết trên web", "debt.view")],
           states={"loading": "Skeleton", "error": "Không tìm thấy / không có quyền"},
           notes=["Tạo đơn truyền customerId → form Tạo nhanh đơn điền sẵn khách.", "Trang cuộn; mockup cao 940."]),
    Screen(id="MA-FIN-01", name="Tài chính nhanh", route="MerchantFinanceRoute", render=fin_01, pattern="dashboard", h=940, roles=["admin", "accountant", "operation"], **C("Tài chính & lương"),
           purpose="Cảnh báo tiền: nợ khách quá hạn, COD tài xế đang giữ, bảng lương chờ duyệt, thu/chi gần đây.",
           api=["customerDebt(filter: {overdue: true})", "driverCodHeld(filter)", "payments(first: 3)", "expenses(first: 3)", "payrolls(filter: {status: SUBMITTED})"],
           data=["overdueDebtTotal", "overdueByCustomer[]", "codHeldTotal", "receivableTotal", "recentPayments[]", "recentExpenses[]", "pendingPayroll"],
           actions=[("Mở khách quá hạn", "debt.view"), ("COD tài xế", "driver.ledger.view"), ("Duyệt bảng lương", "payroll.view"), ("Sổ thu chi trên web", "finance.view")],
           states={"forbidden": "Operation không có finance.view → tab Tài chính chỉ hiện COD tài xế", "loading": "Skeleton", "error": "Banner danger + Thử lại"},
           notes=["Phiếu thu COD tài xế nộp hiển thị kèm 'không phải doanh thu'.", "Trang cuộn; mockup cao 940."]),
    Screen(id="MA-COD-01", name="COD tài xế", route="MerchantCodRoute", render=cod_01, pattern="list", h=H, roles=ROLES_ALL, **C("Tài chính & lương"),
           purpose="COD đang giữ theo tài xế; gọi nhắc và ghi nhận nộp COD nếu có quyền.",
           api=["driverCodHeld(filter)", "driverLedger(driverId)", "createPaymentIn(input: {type: DRIVER_COD_REMITTANCE})"],
           data=["driver{name, phone, vehicle}", "codCollected", "codRemitted", "codHeld", "oldestHeldAt", "overThreshold", "upcomingCodExpected"],
           actions=[("Gọi tài xế", "tel:"), ("Ghi nhận nộp COD", "payment.create COD remittance — admin, accountant (operation ẩn)")],
           states={"empty": "EmptyState 'Không tài xế nào đang giữ COD'", "loading": "Skeleton", "error": "Banner danger + Thử lại"},
           notes=["COD held = Σ stop.codActual − Σ payment_in DRIVER_COD_REMITTANCE (khớp WM-COD-01).",
                  "Bottom sheet 'Ghi nhận nộp COD': số tiền (mặc định = đang giữ, ≤ đang giữ), hình thức (tiền mặt/chuyển khoản), ngày nộp, ghi chú → tạo PT-… loại tài xế nộp COD.",
                  "Ngưỡng cảnh báo từ merchant settings: 5.000.000 đ / 2 ngày."]),
    Screen(id="MA-PAYROLL-01", name="Duyệt bảng lương", route="MerchantPayrollApprovalRoute", render=payroll_01, pattern="detail", h=H, roles=ROLES_ALL, **C("Tài chính & lương"),
           purpose="Giám đốc xem bảng lương chờ duyệt (tổng tiền + thực lãnh từng tài xế) và duyệt / trả về.",
           api=["payrolls(filter: {status: SUBMITTED})", "payroll(id){lines}", "approvePayroll(id, reason?)", "returnPayroll(id, reason)"],
           data=["code", "period", "status", "submittedBy", "submittedAt", "totals{salary, bonus, advance, deduction, net}", "lines[{driver, salary, bonus, advance, deduction, net}]"],
           actions=[("Duyệt", "payroll.approve — chỉ admin; ghi chú tuỳ chọn"), ("Trả về", "payroll.approve — lý do bắt buộc")],
           states={"forbidden": "Không có payroll.approve → ẩn bottom bar, chỉ xem", "empty": "Không có bảng lương chờ duyệt",
                   "done": "Sau duyệt: badge 'Đã duyệt' + toast, quay lại Tổng quan"},
           notes=["Bottom sheet 'Trả về bảng lương': textarea Lý do (bắt buộc, ≥ 5 ký tự) + nút danger 'Trả về'; bottom sheet 'Duyệt': tổng thực lãnh + ghi chú tuỳ chọn + nút 'Xác nhận duyệt'.",
                  "Nếu có nhiều bảng lương chờ duyệt: hiển thị danh sách card trước, chạm để mở.", "Audit giống WM-PAYROLL-05."]),
    Screen(id="MA-RPT-01", name="Báo cáo tóm tắt", route="MerchantReportsRoute", render=rpt_01, pattern="report", h=900, roles=ROLES_ALL, **C("Báo cáo & tài khoản"),
           purpose="Doanh thu, chi phí, lãi/lỗ, tiền đã thu, công nợ theo kỳ; xem sâu trên web.",
           api=["reportProfit(filter: {period})", "reportCustomerDebt(filter)", "reportCodHeld(filter)", "dashboardSummary(filter)"],
           data=["revenue", "cost", "profit", "cashIn", "weeklySeries[]", "receivable", "overdue", "supplierPayable", "codHeld"],
           actions=[("Đổi kỳ", "report.view"), ("Xem sâu trên web", "deep link /reports")],
           states={"loading": "Skeleton số + chart", "empty": "Kỳ chưa có dữ liệu → số 0 + ghi chú", "forbidden": "Operation không có finance.view → chỉ số vận hành"},
           notes=["Cùng công thức với báo cáo web (không tính lại trên client).", "Trang cuộn; mockup cao 900."]),
    Screen(id="MA-PROFILE-01", name="Tài khoản & cài đặt nhẹ", route="MerchantProfileRoute", render=profile_01, pattern="page", h=H, roles=ROLES_ALL, **C("Báo cáo & tài khoản"),
           purpose="Hồ sơ, nhà xe đang dùng, đổi nhà xe, thông báo đẩy, đăng xuất.",
           api=["me", "selectMerchant(merchantId)", "updateNotificationPreference(input)"],
           data=["user{name, email, avatar}", "currentMembership{merchant, role}", "memberships[]", "pushEnabled", "appVersion"],
           actions=[("Đổi nhà xe", "selectMerchant — bottom sheet danh sách nhà xe"), ("Đăng xuất", "session")],
           states={"loading": "Skeleton"},
           notes=["Đổi nhà xe reset toàn bộ cache/bloc và về MerchantHomeRoute.", "Đăng xuất: xoá token + FCM token, về MerchantLoginRoute."]),
)
