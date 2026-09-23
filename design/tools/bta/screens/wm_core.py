"""Web Merchant — Auth & onboarding (WM-AUTH-01…04), Khung chung (WM-SHELL-01…08), Dashboard (WM-DASH-01…03)."""
from .. import data as D
from ..core import Screen, register
from ..shells import wm_shell
from ..ui import *  # noqa: F401,F403
from .wm_orders import _fin_body, order_detail

ROLES_ALL = ["admin", "operation", "accountant"]


# ================================================================ private helpers
def _kpi(label, value, sub=None, tone=None, ic=None, to=None, trigger=None):
    """KpiCard sized for a 6-up strip (value 20px so VND amounts fit)."""
    use("KpiCard")
    color = TONES[tone][1] if tone else T["text"]
    head = row(icon(ic, 16, T["text-muted"]) if ic else "", muted(label, 13), spacer(),
               icon("chevron-right", 14, T["text-subtle"]) if to else "", gap=6)
    body = (f'{head}<div style="font-size: 20px; line-height: 28px; font-weight: 600; color: {color}; {NUM} white-space: nowrap;">{value}</div>'
            f'{muted(sub, 12) if sub else ""}')
    css = (f"display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; background: {T['surface']}; "
           f"border: 1px solid {T['border']}; border-radius: 8px; text-decoration: none; min-width: 0;")
    if to:
        edge(to, trigger or f"Click KPI {label}")
        return f'<a href="{href(to)}" style="{css}">{body}</a>'
    return f'<div style="{css}">{body}</div>'


def _auth_page(card, w=1440, h=960, below="", card_w=440):
    """Auth layout without AppShell: centered card on background."""
    use("AuthScreen")
    card_html = (f'<section style="width: {card_w}px; box-sizing: border-box; background: {T["surface"]}; border: 1px solid {T["border"]}; '
                 f'border-radius: 8px; padding: 32px; display: flex; flex-direction: column; gap: 20px;">{card}</section>')
    foot = row(subtle("© 2026 BTA", 12), subtle("·", 12), subtle("Điều khoản sử dụng", 12), subtle("·", 12), subtle("Hỗ trợ: 1900 6868", 12), gap=6)
    inner = (f'<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; width: 100%; height: 100%; '
             f'box-sizing: border-box; padding: 40px;">{logo(True, 36)}{card_html}{below}{foot}</div>')
    return page_root(inner, w, h)


def _signed_in_as(email="haitran.bta@gmail.com", name="Trần Hải"):
    return row(avatar("TH", 32, "accent"), col(text(name, 13, 600), subtle(email, 12), gap=0), spacer(),
               a("Đăng xuất", "WM-AUTH-01", "Đăng xuất", 13), gap=10,
               extra=f"padding: 10px 12px; border-radius: 6px; border: 1px solid {T['border']};")


def _menu_items(items):
    """Menu rows (same styling as ui.menu) without the popover wrapper, so they can sit in a composite popover."""
    use("Menu")
    out = []
    for it in items:
        if it == "-":
            out.append(divider(4))
            continue
        lab, ic, to = it[0], it[1], it[2]
        dang = len(it) > 3 and it[3]
        right = it[4] if len(it) > 4 else ""
        c = T["danger"] if dang else T["text"]
        inner = row(icon(ic, 16, c), text(lab, 13, 500, c), spacer(), right, gap=8)
        css = "display: block; padding: 7px 10px; border-radius: 4px; text-decoration: none;"
        if to:
            edge(to, lab)
            out.append(f'<a href="{href(to)}" style="{css}">{inner}</a>')
        else:
            out.append(f'<div style="{css}">{inner}</div>')
    return "".join(out)


def _dashed(label, body="", h_=None, extra=""):
    """Annotated layout region for the shell skeleton."""
    hh = f"height: {h_}px;" if h_ else ""
    return (f'<div style="position: relative; border: 1px dashed {T["border-strong"]}; border-radius: 8px; padding: 22px 14px 14px; box-sizing: border-box; {hh} {extra}">'
            f'<span style="position: absolute; top: -10px; left: 12px; padding: 0 6px; background: {T["background"]}; font-size: 12px; font-weight: 600; color: {T["primary"]};">{label}</span>'
            f'{body}</div>')


def _pill(s, tone="neutral"):
    bg, fg = TONES[tone]
    return (f'<span style="display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 13px; font-size: 12px; font-weight: 600; '
            f'background: {bg}; color: {fg}; white-space: nowrap;">{s}</span>')


# ================================================================ AUTH
def auth_01():
    card = col(
        col(h("lg", "Đăng nhập"), muted("Dùng tài khoản Google đã được nhà xe mời, hoặc tài khoản bạn dùng để tạo nhà xe.", 14), gap=4),
        btn("Đăng nhập bằng Google", "secondary", "log-in", to="WM-DASH-01", size="lg", full=True,
            trigger="Đăng nhập Google thành công (1 merchant) → Dashboard"),
        subtle("BTA không dùng mật khẩu riêng. Phiên đăng nhập do Google xác thực.", 12),
        divider(),
        col(text("Sau khi đăng nhập", 13, 600),
            row(icon("building-2", 14, T["text-muted"]), muted("Thuộc 1 nhà xe → vào", 13), a("Dashboard", "WM-DASH-01", "Sau đăng nhập: 1 merchant"), gap=6),
            row(icon("layers", 14, T["text-muted"]), muted("Thuộc nhiều nhà xe →", 13), a("Chọn nhà xe", "WM-AUTH-03", "Sau đăng nhập: nhiều merchant"), gap=6),
            row(icon("mail", 14, T["text-muted"]), muted("Chưa thuộc nhà xe nào →", 13), a("Chờ mời / tạo nhà xe", "WM-AUTH-04", "Sau đăng nhập: chưa có merchant"), gap=6),
            gap=6),
        gap=16)
    loading = col(subtle("Trạng thái: đang xác thực", 12),
                  f'<div style="padding: 16px; background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px; display: flex; flex-direction: column; gap: 8px;">'
                  + btn("Đang xác thực với Google…", "secondary", "loader-circle", size="md", full=True, disabled=True)
                  + subtle("Không đóng cửa sổ đăng nhập Google.", 12) + '</div>', gap=6, extra="width: 320px;")
    error = col(subtle("Trạng thái: lỗi", 12),
                f'<div style="padding: 16px; background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px; display: flex; flex-direction: column; gap: 8px;">'
                + row(icon("circle-alert", 16, T["danger"]), text("Không xác thực được tài khoản Google", 13, 600, T["danger"]), gap=6, align="flex-start")
                + muted("Phiên đã hết hạn hoặc bị từ chối. Thử lại; nếu vẫn lỗi, liên hệ quản trị nhà xe.", 12)
                + row(btn("Thử lại", "secondary", "refresh-cw", size="sm")) + '</div>', gap=6, extra="width: 320px;")
    below = row(loading, error, gap=16, align="flex-start")
    return _auth_page(card, below=below)


def auth_02():
    card = col(
        col(h("lg", "Tạo nhà xe"), muted("Lần đầu dùng BTA: nhập thông tin nhà xe. Bạn sẽ là Admin của nhà xe này.", 14), gap=4),
        _signed_in_as(),
        row(field("Tên nhà xe", input_("Vận tải Hải Phát"), True, hint="Hiển thị trên sidebar và chứng từ in", width="60%"),
            field("Mã nhà xe", input_("Tự sinh sau khi tạo", disabled=True), width="40%"), gap=12, align="flex-start"),
        row(field("Tên doanh nghiệp (pháp lý)", input_("Công ty TNHH Vận tải Hải Phát"), width="62%"),
            field("Mã số thuế", input_("0316 452 789", mono=True), hint="Không bắt buộc", width="38%"), gap=12, align="flex-start"),
        field("Địa chỉ", input_("Số 45 Quốc lộ 1A, P. Bình Hưng Hòa B, Q. Bình Tân, TP.HCM"), True),
        row(field("Người liên hệ", input_("Trần Hải"), True, width="30%"), field("Số điện thoại", input_("0908 123 456", mono=True), True, width="30%"),
            field("Email liên hệ", input_("haitran.bta@gmail.com"), width="40%"), gap=12, align="flex-start"),
        banner("Danh mục mặc định được tạo sẵn: loại chi phí, dịch vụ thêm, loại hàng, lý do tạm dừng, loại chứng từ. Sửa sau trong Cài đặt.", "info"),
        row(btn("Hủy và đăng xuất", "ghost", to="WM-AUTH-01", trigger="Hủy → logout"), spacer(),
            btn("Tạo nhà xe", "primary", "check", to="WM-DASH-01", trigger="Tạo merchant → Dashboard"), gap=8),
        gap=16)
    return _auth_page(card, card_w=640)


def auth_03():
    items = [
        ("BD", "primary", "BTA Demo Transport", "M-DEMO-A", "Admin", "Lần cuối: 23/09/2026 08:12", True, None),
        ("HB", "accent", "Vận tải Hòa Bình Logistics", "M-HBL-02", "Kế toán", "Lần cuối: 19/09/2026 17:40", False, None),
        ("TN", "neutral", "Chành xe Tây Ninh", "M-CTN-07", "Operation", "Admin nhà xe đã khóa", False, "Tạm khóa"),
    ]
    rows = []
    for ini, tone, name, mcode, role, last, cur, lock in items:
        inner = row(avatar(ini, 36, tone), col(row(text(name, 14, 600), badge("Đang dùng", "primary") if cur else "", gap=8),
                                              row(subtle(mcode, 12), subtle("·", 12), subtle(last, 12), gap=6), gap=0),
                    spacer(), badge(role, "neutral"), badge(lock, "danger") if lock else icon("chevron-right", 18, T["text-subtle"]), gap=12)
        css = (f"display: block; padding: 12px 14px; border: 1px solid {T['primary'] if cur else T['border']}; border-radius: 8px; "
               f"background: {T['primary-soft'] if cur else T['surface']}; text-decoration: none; {'opacity: 0.6;' if lock else ''}")
        if lock:
            rows.append(f'<div style="{css}">{inner}</div>')
        else:
            edge("WM-DASH-01", f"Chọn {name} → Dashboard")
            rows.append(f'<a href="{href("WM-DASH-01")}" style="{css}">{inner}</a>')
    use("MerchantList")
    card = col(
        col(h("lg", "Chọn nhà xe"), muted("Tài khoản của bạn thuộc nhiều nhà xe. Dữ liệu và quyền thay đổi theo nhà xe đang chọn.", 14), gap=4),
        _signed_in_as(),
        col(*rows, gap=8),
        row(a("Tạo nhà xe mới", "WM-AUTH-02", "Tạo merchant mới"), spacer(), subtle("Đổi nhà xe sau bằng menu tài khoản", 12), gap=8),
        gap=16)
    return _auth_page(card, card_w=560)


def auth_04():
    card = col(
        row(f'<span style="display: inline-flex; padding: 10px; border-radius: 8px; background: {T["warning-soft"]};">{icon("mail", 22, T["warning"])}</span>',
            col(h("lg", "Tài khoản chưa thuộc nhà xe nào"), muted("Chưa có lời mời nào gửi tới email này.", 14), gap=2), gap=12),
        _signed_in_as(),
        col(text("Để được vào nhà xe", 13, 600),
                        f'<ol style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 22px; color: {T["text"]};">'
                        f'<li>Nhờ Admin nhà xe mời email <b>haitran.bta@gmail.com</b> trong Cài đặt → Nhân viên.</li>'
                        f'<li>Mở email mời hoặc bấm “Kiểm tra lại lời mời” bên dưới.</li></ol>', gap=6,
            extra=f"padding: 12px 14px; border-radius: 6px; background: {T['surface-muted']};"),
        row(btn("Kiểm tra lại lời mời", "secondary", "refresh-cw", to="WM-AUTH-03", trigger="Đã có lời mời → chọn merchant"),
            spacer(), btn("Tạo nhà xe mới", "primary", "plus", to="WM-AUTH-02", trigger="Tạo merchant"), gap=8),
        divider(),
        row(muted("Không phải tài khoản này?", 13), a("Đăng nhập tài khoản khác", "WM-AUTH-01", "Logout → đăng nhập lại"), gap=6),
        gap=16)
    return _auth_page(card, card_w=520)


# ================================================================ DASHBOARD 01 (also base of SHELL-02/03)
TODAY_TRIPS = [t for t in D.TRIPS if t[5].startswith("23/09") or t[5].startswith("24/09")]


def _trip_rows(trips, show_order=False):
    out = []
    for c, o, route, veh, drv, plan, stt, warn in trips:
        w = ""
        if warn == "Sự cố mở":
            w = badge("Sự cố", "danger", "triangle-alert")
        elif warn and "trùng" in warn:
            w = badge("Gần trùng lịch", "warning", "clock")
        elif warn:
            w = badge(warn, "warning")
        vd = col(num(veh, 13, 500), muted(drv, 12), gap=0) if veh != "—" else col(muted("Chưa gán xe", 13), subtle("—", 12), gap=0)
        out.append([col(code(c, to="WM-TRIP-01", trigger="Mở chuyến"), muted(route, 12), gap=0), vd, num(plan, 12),
                    row(status(stt, "trip"), w, gap=6)])
    return out


def _dash01_content():
    head = page_header("Tổng quan", "Thứ Tư, 23/09/2026 · Cập nhật 14:32",
                       row(segmented(["Hôm nay", "7 ngày", "Tháng này"], 0, [None, "WM-DASH-02", "WM-DASH-03"]),
                           btn("Tạo đơn", "primary", "plus", to="WM-ORD-03", trigger="Tạo đơn"), gap=8))
    kpis = grid([
        _kpi("Chuyến đang chạy", "2", "1 có sự cố · 1 đang lấy hàng", None, "route", "WM-DISPATCH-01", "KPI Chuyến đang chạy → bảng điều phối"),
        _kpi("Đơn cần xử lý", "3", "1 chờ xác nhận · 2 chưa xếp xe", "warning", "package", "WM-ORD-01", "KPI Đơn cần xử lý → đơn lọc sẵn"),
        _kpi("Công nợ quá hạn", money(27_000_000), "2 khách · 2 đơn", "danger", "alarm-clock", "WM-DEBT-01", "KPI Công nợ quá hạn → công nợ khách"),
        _kpi("COD tài xế đang giữ", money(5_500_000), "1 tài xế vượt ngưỡng", "warning", "hand-coins", "WM-COD-01", "KPI COD tài xế giữ → COD"),
        _kpi("Sự cố mở", "1", "Mức trung bình · CX-202609-0001", "danger", "triangle-alert", "WM-DISPATCH-05", "KPI Sự cố mở → danh sách sự cố"),
        _kpi("Bảng lương chờ duyệt", "1", "BL-202609-0001 · 3 tài xế", "warning", "banknote", "WM-PAYROLL-01", "KPI Bảng lương chờ duyệt → bảng lương"),
    ], 6, 12)

    trips = panel("Chuyến hôm nay và ngày mai", table([("Mã chuyến · Tuyến", "left"), ("Xe · Tài xế", "left"), ("Kế hoạch", "left"), ("Trạng thái", "left")],
                                                       _trip_rows(TODAY_TRIPS), compact=True),
                  a("Mở bảng điều phối", "WM-DISPATCH-01"), body_pad=False, sub="4 chuyến · 1 chưa gán xe")
    todo_rows = [
        [code("DH-202609-0012", to="WM-ORD-02", trigger="Mở đơn cần xử lý"), col(text("Bao bì Hưng Lợi", 13, 500), muted("Bình Dương → Q. Tân Phú", 12), gap=0),
         status("Chờ xác nhận"), btn("Xác nhận", "secondary", size="sm", to="WM-ORD-02", trigger="Xác nhận đơn")],
        [code("DH-202609-0011", to="WM-ORD-02", trigger="Mở đơn cần xử lý"), col(text("Nông sản Đồng Tháp Xanh", 13, 500), muted("Đồng Tháp → Thủ Đức", 12), gap=0),
         status("Đã xác nhận"), btn("Tạo chuyến", "secondary", size="sm", to="WM-TRIP-02", trigger="Tạo chuyến từ dashboard")],
        [code("CX-202609-0004", to="WM-TRIP-01", trigger="Mở chuyến chưa gán xe"), col(text("Chưa gán xe/tài xế", 13, 500), muted("24/09 05:00 · Đồng Tháp → Thủ Đức", 12), gap=0),
         status("Đã lên lịch", "trip"), btn("Gán xe", "secondary", size="sm", to="WM-TRIP-02", trigger="Gán xe/tài xế")],
    ]
    todo = panel("Đơn/chuyến cần xử lý", table([("Mã", "left"), ("Khách · Tuyến", "left"), ("Trạng thái", "left"), ("", "right")], todo_rows, compact=True),
                 a("Xem tất cả đơn", "WM-ORD-01"), body_pad=False)
    fleet_rows = [
        [col(a(v["plate"], "WM-VEH-02", "Mở xe", 13, 600), muted(f'{v["type"]} · {v["cap"]}', 12), gap=0),
         badge(v["status"], {"Đang chạy": "accent", "Bảo dưỡng": "warning", "Sẵn sàng": "success"}[v["status"]]),
         muted(next((f'{t[4]} · {t[0]}' for t in D.TRIPS if t[3] == v["plate"] and t[6] not in ("Hoàn thành", "Đã lên lịch")), "—"), 12)]
        for v in D.VEHICLES]
    fleet = panel("Xe hôm nay", table([("Xe", "left"), ("Trạng thái", "left"), ("Tài xế · Chuyến đang chạy", "left")], fleet_rows, compact=True),
                  a("Dashboard vận hành", "WM-DASH-02", "Mở dashboard vận hành"), body_pad=False, sub="2 đang chạy · 1 sẵn sàng · 1 bảo dưỡng · tài xế rảnh: Lê Hoàng Phúc")
    left = col(text("Vận hành hôm nay", 15, 600), trips, todo, fleet, gap=12, extra="flex: 3; min-width: 0;")

    sched = warning_panel("Cảnh báo lịch (1)", ["<b>CX-202609-0002</b> gần trùng lịch 1 giờ với CX-202609-0001 · 51C-123.45 · Nguyễn Văn Tài"],
                          a("Xem cảnh báo lịch", "WM-DISPATCH-03"))
    debt = panel("Công nợ quá hạn", table([("Khách · Đơn", "left"), ("Quá hạn", "left"), ("Còn nợ", "right")], [
        [col(a("Công ty Gạo Miền Tây", "WM-CUS-05", "Mở công nợ khách", 13, 600), code("DH-202608-0009", 12, to="WM-ORD-02", trigger="Mở đơn quá hạn"), gap=0),
         badge("10 ngày", "danger", "alarm-clock"), num(money(15_000_000), weight=600, color=T["danger"])],
        [col(a("Vật liệu Xây dựng Phú Mỹ", "WM-CUS-05", "Mở công nợ khách", 13, 600), code("DH-202609-0005", 12, to="WM-ORD-02", trigger="Mở đơn quá hạn"), gap=0),
         badge("8 ngày", "danger", "alarm-clock"), num(money(12_000_000), weight=600, color=T["danger"])],
    ], compact=True), a("Công nợ khách", "WM-DEBT-01", "Xem công nợ khách"), body_pad=False)
    cod = panel("COD tài xế đang giữ", table([("Tài xế", "left"), ("Đang giữ", "right"), ("", "right")], [
        [col(a("Trần Minh Lái", "WM-DRV-06", "Mở COD tài xế đang giữ", 13, 600), row(badge("Vượt ngưỡng", "warning"), subtle("giữ 2 ngày", 12), gap=6), gap=2),
         num(money(5_500_000), weight=600, color=T["warning"]), btn("Ghi nhận nộp", "secondary", size="sm", to="WM-PAY-03", trigger="Ghi nhận tài xế nộp COD")],
    ], compact=True), a("Xem tất cả", "WM-COD-01", "Xem COD tài xế"), body_pad=False, sub="Ngưỡng: 5.000.000 đ hoặc 2 ngày. COD nộp lại không phải doanh thu.")
    inc = panel("Sự cố mở", col(
        row(badge("Trung bình", "warning"), a("Kẹt xe QL1A đoạn Tân An", "WM-INC-01", "Mở sự cố", 13, 600), spacer(), subtle("10:42", 12), gap=8),
        row(code("CX-202609-0001", 12, to="WM-TRIP-01", trigger="Mở chuyến có sự cố"), muted("· Nguyễn Văn Tài · báo từ app", 12), gap=6), gap=4),
        a("Xem tất cả", "WM-DISPATCH-05", "Xem danh sách sự cố"), pad=14)
    pay = panel("Bảng lương chờ duyệt", row(
        col(code("BL-202609-0001", to="WM-PAYROLL-02", trigger="Mở bảng lương"), muted("Tháng 09/2026 · 3 tài xế · Lê Thu Vân gửi 22/09", 12), gap=0),
        spacer(), num(money(33_300_000), 14, 600), btn("Duyệt", "primary", size="sm", to="WM-PAYROLL-05", trigger="Duyệt bảng lương"), gap=10), pad=14)
    right = col(text("Cảnh báo tiền và sự cố", 15, 600), sched, debt, cod, inc, pay, gap=12, extra="flex: 2; min-width: 0;")
    return col(head, kpis, row(left, right, gap=16, align="flex-start"), gap=16)


H_DASH1 = 1180


def dash_01():
    return wm_shell("dashboard", _dash01_content(), h=H_DASH1, child="WM-DASH-01")


# ================================================================ DASHBOARD 02
def dash_02():
    head = page_header("Dashboard vận hành", "Chuyến, xe và tài xế theo thời gian thực · tự làm mới mỗi 60 giây",
                       row(badge("Cập nhật 14:32", "neutral", "refresh-cw"), btn("Làm mới", "secondary", "refresh-cw"),
                           btn("Mở bản đồ", "secondary", "map", to="WM-DISPATCH-04", trigger="Mở bản đồ vị trí"),
                           btn("Bảng điều phối", "primary", "route", to="WM-DISPATCH-01", trigger="Mở bảng điều phối"), gap=8))
    strip = summary_strip([("Đã lên lịch", "2"), ("Đang đến điểm lấy", "0"), ("Đang lấy hàng", "1", "info"), ("Đang vận chuyển", "1", "accent"),
                           ("Tạm dừng", "0"), ("Đang trả hàng", "0"), ("Hoàn thành (7 ngày)", "2", "success"), ("Có cảnh báo", "3", "warning")])
    trips_tbl = table([("Mã chuyến · Đơn", "left"), ("Xe · Tài xế", "left"), ("Kế hoạch · Tuyến", "left"), ("Trạng thái · Cảnh báo", "left")],
                      [[col(code(t[0], to="WM-TRIP-01", trigger="Mở chuyến"), code(t[1], 12, to="WM-ORD-02", trigger="Mở đơn của chuyến"), gap=0),
                        r[1], col(num(t[5], 12), muted(t[2], 12), gap=0), r[3]]
                       for t, r in zip(D.TRIPS, _trip_rows(D.TRIPS))], compact=True)
    trips = panel("Chuyến theo trạng thái", col(
        filter_bar("Tìm mã chuyến, xe, tài xế…", ["Tất cả 6", "Đang chạy 2", "Sắp chạy 2", "Hoàn thành 2", "Có cảnh báo 3"], date="21/09 – 24/09/2026"),
        trips_tbl, gap=12), a("Xem trên lịch", "WM-DISPATCH-02", "Mở lịch xe/tài xế"), pad=12)
    warns = panel("Cảnh báo lịch", table([("Chuyến", "left"), ("Cảnh báo", "left"), ("Khoảng cách", "left"), ("", "right")], [
        [code("CX-202609-0002", to="WM-TRIP-01", trigger="Mở chuyến cảnh báo"), col(text("Gần trùng lịch xe 51C-123.45", 13, 500), muted("Với CX-202609-0001 kết thúc 14:00", 12), gap=0),
         badge("1 giờ", "warning", "clock"), a("Xử lý", "WM-DISPATCH-03", "Mở cảnh báo lịch")],
        [code("CX-202609-0001", to="WM-TRIP-01", trigger="Mở chuyến cảnh báo"), col(text("Sự cố mở: kẹt xe QL1A", 13, 500), muted("Có thể trễ giờ trả hàng 14:00", 12), gap=0),
         badge("Trễ ~45 phút", "danger"), a("Xem sự cố", "WM-INC-01")],
        [code("CX-202609-0004", to="WM-TRIP-01", trigger="Mở chuyến cảnh báo"), col(text("Chưa gán xe/tài xế", 13, 500), muted("Khởi hành 24/09 05:00", 12), gap=0),
         badge("Còn 14 giờ", "warning"), a("Gán xe", "WM-TRIP-02", "Gán xe/tài xế")],
    ], compact=True), body_pad=False, sub="Ngưỡng gần trùng: 2 giờ (Cài đặt vận hành)")
    left = col(trips, warns, gap=16, extra="flex: 3; min-width: 0;")

    mp = panel("Vị trí gần nhất", col(
        map_placeholder(h=210, pins=[(30, 62, "51C-123.45", "accent"), (62, 40, "51D-678.90", "info")], label="Vị trí gần nhất · 14:30"),
        row(muted("GPS gửi mỗi 5 phút khi chuyến đang chạy.", 12), spacer(), a("Mở theo dõi vị trí", "WM-DISPATCH-04"), gap=8), gap=10), pad=12)
    veh = panel("Xe", table([("Biển số · Loại", "left"), ("Trạng thái", "left"), ("Chuyến hiện tại", "left")], [
        [col(a(v["plate"], "WM-VEH-02", "Mở xe", 13, 600), muted(f'{v["type"]} · {v["cap"]}', 12), gap=0),
         badge(v["status"], {"Đang chạy": "accent", "Bảo dưỡng": "warning", "Sẵn sàng": "success"}[v["status"]]),
         code(v["trip"], to="WM-TRIP-01", trigger="Mở chuyến hiện tại") if v["trip"] != "—" else muted("—")] for v in D.VEHICLES], compact=True),
        a("Danh sách xe", "WM-VEH-01"), body_pad=False)
    drv = panel("Tài xế", table([("Tài xế", "left"), ("Trạng thái", "left"), ("Đang chạy", "left")], [
        [a(d["name"], "WM-DRV-02", "Mở tài xế", 13, 600),
         badge("Đang chạy" if d["current"].startswith("CX") else ("Rảnh" if d["status"] == "Hoạt động" else "Ngừng"),
               "accent" if d["current"].startswith("CX") else ("success" if d["status"] == "Hoạt động" else "neutral")),
         muted(d["current"] if d["current"].startswith("CX") else "—", 12)] for d in D.DRIVERS], compact=True),
        a("Danh sách tài xế", "WM-DRV-01"), body_pad=False)
    right = col(mp, veh, drv, gap=16, extra="flex: 2; min-width: 0;")
    content = col(head, strip, row(left, right, gap=16, align="flex-start"), gap=16)
    return wm_shell("dashboard", content, h=1140, child="WM-DASH-02")


# ================================================================ DASHBOARD 03
MONTHS = ["T4", "T5", "T6", "T7", "T8", "T9"]
REV = [74.0, 81.0, 78.0, 86.0, 92.0, 89.2]
COST = [51.0, 55.0, 53.0, 57.0, 60.0, 49.8]
PROFIT = [round(r - c, 1) for r, c in zip(REV, COST)]


def _tr(v):
    return f"{v:.1f}".replace(".", ",")


def dash_03():
    head = page_header("Dashboard tài chính", "Doanh thu, chi phí, công nợ và COD — tháng 09/2026 (tạm tính đến 23/09)",
                       row(segmented(["Tháng này", "Quý 3", "6 tháng"], 0),
                           btn("Xuất báo cáo", "secondary", "download", to="WM-SHELL-05", trigger="Xuất báo cáo"),
                           btn("Báo cáo lãi/lỗ", "primary", "chart-column", to="WM-RPT-02", trigger="Mở báo cáo lãi/lỗ"), gap=8))
    kpis = grid([
        _kpi("Doanh thu tạm tính", money(89_200_000), "6 đơn đã xác nhận", None, "chart-column", "WM-RPT-02", "KPI Doanh thu → báo cáo"),
        _kpi("Chi phí tạm tính", money(49_800_000), "Gồm lương chờ duyệt 33.300.000 đ", None, "receipt-text", "WM-EXP-01", "KPI Chi phí → phiếu chi"),
        _kpi("Lãi/lỗ tạm tính", money(39_400_000), "Biên 44,2%", "success", "trending-up", "WM-RPT-03", "KPI Lãi/lỗ → lãi/lỗ theo đơn"),
        _kpi("Công nợ khách", money(135_200_000), "Quá hạn 27.000.000 đ", "warning", "scale", "WM-DEBT-01", "KPI Công nợ khách"),
        _kpi("Công nợ NCC", money(10_500_000), "2 nhà cung cấp chưa trả", None, "store", "WM-DEBT-02", "KPI Công nợ NCC"),
        _kpi("COD chưa nộp", money(5_500_000), "1 tài xế vượt ngưỡng", "warning", "hand-coins", "WM-COD-01", "KPI COD chưa nộp"),
    ], 6, 12)
    cash = banner("Tiền đã thu từ khách tháng này: <b>14.500.000 đ</b> (3 phiếu thu). Tài xế nộp COD: <b>2.000.000 đ</b> — là tiền thu hộ, không tính doanh thu.",
                  "info", action=a("Sổ thu chi", "WM-FIN-01", "Mở sổ thu chi"))

    bar = bar_chart(MONTHS, [("Doanh thu", REV, "chart-1"), ("Chi phí", COST, "chart-3")], w=520, h=220)
    tbl1 = table([("Tháng", "left"), ("Doanh thu", "right"), ("Chi phí", "right")],
                 [[muted(f"{m}/2026"), num(_tr(r)), num(_tr(c))] for m, r, c in zip(MONTHS, REV, COST)], compact=True,
                 total_row=["6 tháng", _tr(sum(REV)), _tr(sum(COST))])
    p1 = panel("Doanh thu và chi phí theo tháng", row(col(bar, extra="flex-shrink: 0;"), col(tbl1, subtle("Đơn vị: triệu đồng", 11), gap=6, extra="flex-grow: 1; min-width: 0;"), gap=20, align="flex-start"),
               a("Chi tiết", "WM-RPT-02", "Mở báo cáo doanh thu - chi phí"), sub="Doanh thu = giá cước + dịch vụ thêm của đơn đã xác nhận; không phải tiền đã thu")
    line = line_chart(MONTHS, [("Lãi/lỗ", PROFIT, "chart-2")], w=520, h=200)
    tbl2 = table([("Tháng", "left"), ("Lãi/lỗ", "right"), ("Biên", "right")],
                 [[muted(f"{m}/2026"), num(_tr(p), color=T["success"]), num(f"{p / r * 100:.1f}%".replace(".", ","))] for m, p, r in zip(MONTHS, PROFIT, REV)],
                 compact=True)
    p2 = panel("Lãi/lỗ tạm tính theo tháng", row(col(line, extra="flex-shrink: 0;"), col(tbl2, subtle("Đơn vị: triệu đồng", 11), gap=6, extra="flex-grow: 1; min-width: 0;"), gap=20, align="flex-start"),
               a("Lãi/lỗ theo đơn", "WM-RPT-03", "Mở lãi/lỗ theo đơn"), sub="Tháng 09 tạm tính, gồm bảng lương BL-202609-0001 chờ duyệt")

    cus = sorted([c for c in D.CUSTOMERS if c["debt"]], key=lambda c: -c["debt"])
    t_cus = panel("Công nợ khách", table([("Khách hàng", "left"), ("Còn nợ", "right"), ("Quá hạn", "right")], [
        [col(a(c["name"], "WM-CUS-05", "Mở công nợ khách", 13, 600), badge(c["warn"], "danger" if c["warn"] else "neutral") if c["warn"] else subtle(c["id"], 11), gap=2, extra="align-items: flex-start;"),
         num(money(c["debt"]), weight=600), num(money(c["overdue"]), color=T["danger"] if c["overdue"] else T["text-muted"])] for c in cus], compact=True,
        total_row=["Tổng", money(135_200_000), money(27_000_000)]),
        a("Báo cáo", "WM-RPT-06", "Mở báo cáo công nợ khách"), body_pad=False)
    sup = [s for s in D.SUPPLIERS if s["debt"]]
    t_sup = panel("Công nợ NCC", table([("Nhà cung cấp", "left"), ("Phải trả", "right")], [
        [col(a(s["name"], "WM-SUP-02", "Mở nhà cung cấp", 13, 600), muted(s["type"], 12), gap=0), num(money(s["debt"]), weight=600)] for s in sup],
        compact=True, total_row=["Tổng", money(10_500_000)]),
        a("Xem tất cả", "WM-DEBT-02", "Mở công nợ NCC"), body_pad=False)
    t_cod = panel("COD tài xế chưa nộp", table([("Tài xế", "left"), ("Đang giữ", "right")], [
        [col(a("Trần Minh Lái", "WM-DRV-06", "Mở COD tài xế", 13, 600), badge("Vượt ngưỡng · 2 ngày", "warning"), gap=2, extra="align-items: flex-start;"),
         col(num(money(5_500_000), weight=600, color=T["warning"]), subtle("Đã thu 7.500.000 đ", 11), subtle("Đã nộp 2.000.000 đ", 11), gap=0, extra="align-items: flex-end;")]],
        compact=True, total_row=["Tổng", money(5_500_000)]),
        a("Báo cáo COD", "WM-RPT-07", "Mở báo cáo COD tài xế"), body_pad=False, sub="Nộp lại tạo phiếu thu loại Tài xế nộp COD")
    bottom = row(col(t_cus, extra="flex: 5; min-width: 0;"), col(t_sup, extra="flex: 3; min-width: 0;"), col(t_cod, extra="flex: 4; min-width: 0;"),
                 gap=16, align="flex-start")
    content = col(head, kpis, cash, p1, p2, bottom, gap=16)
    return wm_shell("dashboard", content, h=1560, child="WM-DASH-03")


# ================================================================ SHELL-01 Layout chính + user menu
def shell_01():
    sk = lambda w, h=12: skeleton(w, h)
    hdr = _dashed("PageHeader", row(col(row(sk("70px", 10), sk("90px", 10), gap=8), sk("260px", 22), sk("380px", 12), gap=8), spacer(),
                                    row(btn("Thao tác phụ", "secondary", size="sm"), btn("Thao tác chính", "primary", "plus", size="sm"), gap=8), gap=8, align="flex-end"))
    tool = _dashed("Toolbar", row(input_("", "Tìm kiếm", "260px", "search", h=32), _pill("Bộ lọc nhanh", "primary"), _pill("Hôm nay"), _pill("Còn nợ"),
                                  _pill("Quá hạn"), spacer(), btn("Khoảng ngày", "secondary", "calendar", size="sm"), btn("Bộ lọc nâng cao", "secondary", "sliders-horizontal", size="sm"), gap=8))
    lines = "".join(row(sk("120px"), sk("220px"), sk("90px"), spacer(), sk("110px"), gap=24,
                        extra=f"padding: 12px 0; border-bottom: 1px solid {T['border']};") for _ in range(7))
    main = _dashed("Nội dung chính · table / detail / dashboard", col(row(sk("100%", 20), gap=0), lines, gap=0), extra="flex-grow: 1; align-self: stretch;")
    notes = panel("Quy ước khung", col(
        row(icon("layout-dashboard", 16, T["text-muted"]), muted("Sidebar 260px: nhóm module, mục đang mở màu teal; badge cảnh báo danger/warning theo mức.", 13), gap=8, align="flex-start"),
        row(icon("search", 16, T["text-muted"]), muted("Tìm nhanh luôn hiện ở topbar, phím tắt Ctrl K →", 13), a("Tìm kiếm nhanh", "WM-SHELL-03", "Mở tìm kiếm nhanh"), gap=6, align="flex-start"),
        row(icon("bell", 16, T["text-muted"]), muted("Chuông: số chưa đọc →", 13), a("Trung tâm thông báo", "WM-SHELL-02", "Mở thông báo"), gap=6, align="flex-start"),
        row(icon("user", 16, T["text-muted"]), muted("Menu tài khoản: đổi nhà xe, hồ sơ, đăng xuất (đang mở).", 13), gap=8, align="flex-start"),
        gap=8), pad=14)
    content = col(hdr, tool, row(col(notes, extra="width: 340px; flex-shrink: 0;"), main, gap=16, align="flex-start", extra="flex-grow: 1;"), gap=16,
                  extra="height: 100%;")

    head = row(avatar("TH", 36, "accent"), col(text("Trần Hải", 14, 600), subtle("admin@bta-demo.test", 12), gap=0), gap=10,
               extra="padding: 12px 14px;")
    cur = col(subtle("Nhà xe đang dùng", 11),
              row(avatar("BD", 28, "primary"), col(text("BTA Demo Transport", 13, 600), subtle("M-DEMO-A · Admin", 11), gap=0), spacer(),
                  icon("check", 16, T["primary"]), gap=8), gap=4, extra="padding: 0 14px 10px;")
    items = _menu_items([
        ("Đổi nhà xe", "arrow-down-up", "WM-AUTH-03", False, badge("3", "neutral")),
        "-",
        ("Hồ sơ nhà xe", "building-2", "WM-ORG-01"),
        ("Tài khoản của tôi", "user", "WM-USER-02"),
        ("Cài đặt vận hành", "settings", "WM-SET-01"),
        "-",
        ("Đăng xuất", "log-out", "WM-AUTH-01", True),
    ])
    pop = popover(head + divider() + f'<div style="padding-top: 10px;">{cur}</div>' + divider() + f'<div style="padding: 4px;">{items}</div>', 290)
    return wm_shell("dashboard", content, overlay=(pop, "topright"))


# ================================================================ SHELL-02 Notification center
def _notif(ic, tone, title, body, meta, to, trigger, unread=True):
    use("NotificationItem")
    bg, fg = TONES[tone]
    dot = f'<span style="width: 8px; height: 8px; border-radius: 50%; background: {T["accent"]}; flex-shrink: 0; margin-top: 6px;"></span>' if unread \
        else '<span style="width: 8px; flex-shrink: 0;"></span>'
    inner = row(f'<span style="display: inline-flex; padding: 7px; border-radius: 6px; background: {bg}; flex-shrink: 0;">{icon(ic, 16, fg)}</span>',
                col(text(title, 13, 600), f'<div style="font-size: 13px; line-height: 19px; color: {T["text"]};">{body}</div>', subtle(meta, 12), gap=2,
                    extra="flex-grow: 1; min-width: 0;"), dot, gap=10, align="flex-start")
    edge(to, trigger)
    return (f'<a href="{href(to)}" style="display: block; padding: 11px 16px; text-decoration: none; border-bottom: 1px solid {T["border"]}; '
            f'background: {T["surface"] if not unread else "#FBFCFE"};">{inner}</a>')


def shell_02():
    items = [
        _notif("clock", "warning", "Gần trùng lịch xe", "CX-202609-0002 bắt đầu 15:00, cách CX-202609-0001 (51C-123.45) 1 giờ.",
               "Điều phối · 10:55 · cho Operation", "WM-DISPATCH-03", "Thông báo gần trùng lịch → cảnh báo lịch"),
        _notif("hand-coins", "warning", "COD giữ vượt ngưỡng", "Trần Minh Lái đang giữ 5.500.000 đ quá 2 ngày (ngưỡng 5.000.000 đ).",
               "Tài chính · 09:00 · cho Kế toán", "WM-COD-01", "Thông báo COD vượt ngưỡng → COD tài xế"),
        _notif("banknote", "info", "Bảng lương chờ duyệt", "BL-202609-0001 tháng 09/2026 · 3 tài xế · 33.300.000 đ.",
               "Lương · 22/09 17:20 · Lê Thu Vân gửi", "WM-PAYROLL-02", "Thông báo bảng lương chờ duyệt → bảng lương"),
        _notif("alarm-clock", "danger", "Công nợ quá hạn", "DH-202608-0009 · Công ty Gạo Miền Tây quá hạn 10 ngày, còn nợ 15.000.000 đ.",
               "Công nợ · 08:00", "WM-CUS-05", "Thông báo nợ quá hạn → công nợ khách"),
        _notif("triangle-alert", "danger", "Sự cố mới: kẹt xe", "CX-202609-0001 · Nguyễn Văn Tài báo kẹt xe QL1A đoạn Tân An, mức trung bình.",
               "Sự cố · 10:42", "WM-INC-01", "Thông báo sự cố → chi tiết sự cố", unread=False),
        _notif("package", "neutral", "Đơn mới chờ xác nhận", "DH-202609-0012 · Bao bì Hưng Lợi · Bình Dương → Q. Tân Phú.",
               "Đơn hàng · 22/09 15:10", "WM-ORD-02", "Thông báo đơn mới → chi tiết đơn", unread=False),
    ]
    head = row(h("sm", "Thông báo"), badge("4 chưa đọc", "accent"), spacer(), btn("Đánh dấu đã đọc", "link", "list-checks", size="sm"),
               icon_btn("x", "Đóng", to="WM-DASH-01", trigger="Đóng thông báo"), gap=8, extra="padding: 12px 16px 8px;")
    seg = f'<div style="padding: 0 16px 10px; border-bottom: 1px solid {T["border"]};">{segmented(["Tất cả 6", "Chưa đọc 4", "Tiền", "Vận hành"], 0)}</div>'
    foot = row(a("Cài đặt ngưỡng cảnh báo", "WM-SET-01", "Cài đặt ngưỡng cảnh báo"), spacer(), subtle("Lưu 30 ngày", 12), gap=8,
               extra="padding: 10px 16px;")
    pop = popover(head + seg + "".join(items) + foot, 420)
    use("NotificationCenter")
    # anchor under the bell (bell sits ~ 190px from the right edge)
    pop = f'<div style="margin-right: -40px;">{pop}</div>'
    return wm_shell("dashboard", _dash01_content(), h=H_DASH1, child="WM-DASH-01", overlay=(pop, "topright"))


# ================================================================ SHELL-03 Command palette
def _result(ic, title, sub, right, to, trigger, active=False):
    edge(to, trigger)
    bg = T["accent-soft"] if active else T["surface"]
    inner = row(icon(ic, 16, T["text-muted"]), col(text(title, 13, 600), muted(sub, 12), gap=0, extra="min-width: 0;"), spacer(), right,
                kbd("Enter") if active else "", gap=10)
    return f'<a href="{href(to)}" style="display: block; padding: 7px 12px; border-radius: 6px; background: {bg}; text-decoration: none;">{inner}</a>'


def _group(title, items):
    return col(f'<div style="padding: 6px 12px 2px; font-size: 11px; font-weight: 600; color: {T["text-subtle"]}; text-transform: uppercase; letter-spacing: 0.04em;">{title}</div>',
               *items, gap=0)


def shell_03():
    use("CommandPalette")
    q = row(icon("search", 18, T["text-muted"]), text("0001", 15, 500, extra=NUM), f'<span style="width: 1px; height: 18px; background: {T["text"]};"></span>',
            spacer(), subtle("7 kết quả", 12), kbd("Esc"), gap=8,
            extra=f"padding: 14px 16px; border-bottom: 1px solid {T['border']};")
    scope = row(*[_pill(s, "primary" if i == 0 else "neutral") for i, s in enumerate(["Tất cả", "Đơn", "Chuyến", "Khách", "Tài xế", "Xe", "Phiếu thu/chi"])],
                gap=6, extra="padding: 10px 16px 4px;")
    groups = col(
        _group("Đơn hàng", [_result("package", "DH-202609-0001", "Công ty Gạo Miền Tây · Cần Thơ → Bình Dương · 12.500.000 đ", status("Đang thực hiện"),
                                    "WM-ORD-02", "Kết quả đơn → chi tiết đơn", active=True)]),
        _group("Chuyến", [_result("route", "CX-202609-0001", "51C-123.45 · Nguyễn Văn Tài · 23/09 06:00 – 14:00", status("Đang vận chuyển", "trip"),
                                  "WM-TRIP-01", "Kết quả chuyến → chi tiết chuyến")]),
        _group("Khách hàng", [_result("building-2", "Công ty Gạo Miền Tây", "CUS-A-001 · 0292 3812 456 · còn nợ 27.500.000 đ", badge("Quá hạn", "danger"),
                                      "WM-CUS-02", "Kết quả khách → chi tiết khách")]),
        _group("Tài xế", [_result("id-card", "Nguyễn Văn Tài", "DRV-A-001 · 0900 000 001 · đang chạy CX-202609-0001", "",
                                  "WM-DRV-02", "Kết quả tài xế → chi tiết tài xế")]),
        _group("Xe", [_result("truck", "51C-123.45", "VEH-A-001 · Tải thùng 8 tấn · đang chạy", badge("Đang chạy", "accent"),
                              "WM-VEH-02", "Kết quả xe → chi tiết xe")]),
        _group("Phiếu thu / phiếu chi", [
            _result("receipt", "PT-202609-0001", "Khách trả · Công ty Gạo Miền Tây · 5.000.000 đ · 15/09/2026", status("Đã phân bổ", "fin"),
                    "WM-PAY-02", "Kết quả phiếu thu → chi tiết phiếu thu"),
            _result("receipt-text", "PC-202609-0001", "Phí cầu đường · CX-202609-0001 · 800.000 đ · 23/09/2026", status("Chưa trả", "fin"),
                    "WM-EXP-02", "Kết quả phiếu chi → chi tiết phiếu chi")]),
        gap=4, extra="padding: 4px 4px 8px;")
    foot = row(kbd("↑"), kbd("↓"), subtle("di chuyển", 12), kbd("Enter"), subtle("mở", 12), kbd("Esc"), subtle("đóng", 12), spacer(),
               subtle("Tìm theo mã, tên, SĐT, biển số", 12), gap=6,
               extra=f"padding: 10px 16px; border-top: 1px solid {T['border']}; background: {T['surface-muted']}; border-radius: 0 0 8px 8px;")
    edge("WM-DASH-01", "Esc / click ngoài → đóng", "back")
    pal = (f'<div role="dialog" aria-label="Tìm kiếm nhanh" style="width: 680px; background: {T["surface"]}; border-radius: 8px; box-shadow: {SH_DIALOG};">'
           f'{q}{scope}{groups}{foot}</div>')
    return wm_shell("dashboard", _dash01_content(), h=H_DASH1, child="WM-DASH-01", overlay=(pal, "top"))


# ================================================================ SHELL-04 Import wizard (over customer list)
def _cus_list_base():
    rows = []
    for c in D.CUSTOMERS:
        rows.append([col(a(c["name"], "WM-CUS-02", "Mở khách hàng", 13, 600), subtle(c["id"], 11), gap=0), num(c["phone"]),
                     num(money(c["debt"])), num(money(c["limit"])), num(str(c["orders"])),
                     badge(c["warn"], "danger") if c["warn"] else muted("—")])
    return col(page_header("Khách hàng", "Danh sách khách, công nợ và hạn mức",
                           row(btn("Nhập Excel", "secondary", "upload"), btn("Tạo khách", "primary", "plus", to="WM-CUS-03", trigger="Tạo khách"), gap=8)),
               filter_bar("Tìm tên, SĐT, mã khách…", ["Tất cả", "Còn nợ", "Quá hạn", "Vượt hạn mức"]),
               table([("Khách hàng", "left"), ("SĐT", "left"), ("Còn nợ", "right"), ("Hạn mức", "right"), ("Số đơn", "right"), ("Cảnh báo", "left")], rows),
               gap=16)


def shell_04():
    summ = summary_strip([("Tổng số dòng", "48"), ("Hợp lệ", "41", "success"), ("Cảnh báo", "4", "warning"), ("Lỗi — sẽ bỏ qua", "3", "danger")])
    cols = [("Dòng", "right", "52px"), ("Tên khách · Mã", "left"), ("SĐT", "left"), ("MST", "left"), ("Hạn mức", "right"), ("Kết quả kiểm tra", "left")]

    def res(tone, ic, msg):
        return row(icon(ic, 14, TONES[tone][1]), text(msg, 12, 500, TONES[tone][1]), gap=4)
    rows = [
        [num("7"), col(text("Cơ khí Tân Tiến", 13, 600), subtle("KH-IMP-007", 11), gap=0), num("0283 88 12", color=T["danger"]), num("0314 225 118"), num("50.000.000"),
         res("danger", "circle-x", "SĐT không hợp lệ (cần 10–11 số)")],
        [num("12"), col(muted("(trống)"), subtle("KH-IMP-012", 11), gap=0), num("0909 441 220"), num("—"), num("30.000.000"),
         res("danger", "circle-x", "Thiếu tên khách (bắt buộc)")],
        [num("19"), col(text("Thép Đông Á Long An", 13, 600), subtle("KH-IMP-019", 11), gap=0), num("0272 3826 330"), num("1101 823 456", color=T["danger"]), num("120.000.000"),
         res("danger", "circle-x", "MST trùng Kho Thép An Phát (CUS-A-002)")],
        [num("23"), col(text("Cty Gạo Miền Tây", 13, 600), subtle("KH-IMP-023", 11), gap=0), num("0292 3812 457"), num("1800 456 777"), num("100.000.000"),
         res("warning", "triangle-alert", "Tên gần giống Công ty Gạo Miền Tây")],
        [num("31"), col(text("Nhựa Bình Minh Q.6", 13, 600), subtle("KH-IMP-031", 11), gap=0), num("0283 969 1122"), num("0301 459 087"), muted("(trống)"),
         res("warning", "triangle-alert", "Hạn mức trống → dùng 0 đ")],
        [num("32"), col(text("Gỗ Trường Thành", 13, 600), subtle("KH-IMP-032", 11), gap=0), num("0274 3642 118"), num("3700 256 781"), num("80.000.000"),
         res("warning", "triangle-alert", "Số ngày công nợ 45 > mặc định 15")],
    ]
    body = col(
        row(field("Loại dữ liệu", select("Khách hàng"), width="200px"), field("File", row(icon("file-spreadsheet", 16, T["success"]),
                                                                                        text("khach-hang-2026-09.xlsx", 13, 500), subtle("· 48 dòng · 32 KB", 12), gap=6)),
            spacer(), field("Khi có dòng lỗi", radio_cards([("Bỏ qua dòng lỗi", "Nhập 41 + 4 cảnh báo"), ("Dừng, sửa file", "Không nhập gì")], 0), width="380px"),
            gap=16, align="flex-end"),
        summ,
        row(segmented(["Lỗi & cảnh báo 7", "Chỉ lỗi 3", "Tất cả 48"], 0), spacer(),
            btn("Tải file lỗi (.xlsx)", "secondary", "download", size="sm"), gap=8),
        table(cols, rows, compact=True),
        subtle("Dòng cảnh báo vẫn được nhập. Dòng lỗi bị bỏ qua; sửa trong file lỗi rồi nhập lại. Chưa có dữ liệu nào được ghi cho đến khi xác nhận.", 12),
        gap=12)
    foot = (btn("Hủy", "ghost", to="WM-CUS-01", trigger="Hủy import") + spacer()
            + btn("Quay lại: Map cột", "secondary", "arrow-left")
            + btn("Tiếp tục: Xác nhận", "primary", "arrow-right", to="WM-CUS-01", trigger="Xác nhận import 45 dòng → danh sách khách"))
    use("ImportWizard")
    dlg = dialog("Nhập khách hàng từ Excel", col(stepper(["Upload file", "Map cột", "Kiểm tra lỗi", "Xác nhận"], 2),
                                                  divider(), body, gap=14),
                 f'<div style="display: flex; gap: 8px; width: 100%;">{foot}</div>', 1000, "Bước 3/4 · Kiểm tra lỗi theo dòng", close_to="WM-CUS-01")
    return wm_shell("customers", _cus_list_base(), overlay=(dlg, "center"))


# ================================================================ SHELL-05 Export / print preview
def shell_05():
    use("PrintSheet")
    lines = [("DH-202608-0009", "28/08/2026", "Cần Thơ → Bình Dương", 20_000_000, 5_000_000, "13/09/2026"),
             ("DH-202609-0009", "06/09/2026", "Cần Thơ → Q. Bình Tân", 15_000_000, 15_000_000, "20/09/2026"),
             ("DH-202609-0001", "20/09/2026", "Cần Thơ → Bình Dương", 12_500_000, 0, "08/10/2026")]
    trs = [[col(num(c, 11, 500), subtle(f"{d} · {r}", 10), gap=0), num(money(t), 11), num(money(p), 11),
            col(num(money(t - p), 11, 600), subtle(f"hạn {du}", 10), gap=0, extra="align-items: flex-end;")]
           for c, d, r, t, p, du in lines]
    sheet = (f'<div style="width: 620px; height: 860px; background: #FFFFFF; box-shadow: {SH_DIALOG}; padding: 40px 36px; box-sizing: border-box; '
             f'display: flex; flex-direction: column; gap: 14px; font-size: 12px;">'
             + row(col(logo(True, 24), subtle("BTA Demo Transport · Số 45 QL1A, Bình Tân, TP.HCM · 0908 123 456", 10), gap=4), spacer(),
                   col(text("BẢNG KÊ CÔNG NỢ", 15, 700), num("CN-202609-0001", 11), subtle("Kỳ 01/09 – 30/09/2026", 10), gap=0, extra="align-items: flex-end;"), align="flex-start")
             + divider()
             + dl([("Khách hàng", "Công ty Gạo Miền Tây"), ("Mã khách", "CUS-A-001"), ("Địa chỉ", "KCN Trà Nóc 1, Bình Thủy, Cần Thơ"),
                   ("Ngày lập", "23/09/2026 · Phan Ngọc Mai")], cols=2, gap=6)
             + table([("Đơn · Ngày · Tuyến", "left"), ("Tổng thu", "right"), ("Đã thu", "right"), ("Còn nợ · Hạn", "right")],
                     trs, compact=True, total_row=["Tổng", money(47_500_000), money(20_000_000), money(27_500_000)])
             + col(row(muted("Trong đó quá hạn", 12), spacer(), num(money(15_000_000), 12, 600, T["danger"])),
                   row(muted("Số dư trả trước", 12), spacer(), num(money(0), 12)),
                   row(text("Số tiền cần thanh toán", 13, 700), spacer(), num(money(27_500_000), 15, 700)), gap=4)
             + subtle("Chuyển khoản: Vietcombank · 0071 000 123 456 · CÔNG TY TNHH BTA DEMO TRANSPORT. Nội dung: CN-202609-0001.", 10)
             + spacer()
             + grid([col(text("Bên lập bảng kê", 12, 600), subtle("(ký, ghi rõ họ tên)", 10), gap=0, extra="align-items: center; height: 80px;"),
                     col(text("Xác nhận của khách hàng", 12, 600), subtle("(ký, ghi rõ họ tên)", 10), gap=0, extra="align-items: center; height: 80px;")], 2)
             + '</div>')
    side = panel("Mẫu xuất", col(
        text("Loại tài liệu", 13, 600),
        radio("Bảng kê công nợ", True, "CN-202609-0001 · đã chốt"), radio("Bảng lương", False, "BL-202609-0001"), radio("Phiếu giao hàng / điều xe"),
        radio("Bảng chi phí chuyến"), radio("COD tài xế đang giữ"),
        divider(),
        field("Định dạng", segmented(["PDF", "Excel"], 0)),
        field("Khổ giấy", select("A4 dọc")),
        checkbox("Hiện chi tiết tuyến", True), checkbox("Hiện thông tin chuyển khoản", True), checkbox("Hiện chữ ký", True),
        divider(),
        banner("Bảng kê đã chốt: PDF là bản snapshot, không đổi khi dữ liệu gốc sửa sau.", "primary", "lock"),
        gap=10), extra="width: 320px; flex-shrink: 0;")
    preview = (f'<div style="flex-grow: 1; min-width: 0; display: flex; justify-content: center; padding: 20px; background: {T["surface-muted"]}; '
               f'border-radius: 8px; border: 1px solid {T["border"]};">{sheet}</div>')
    content = col(page_header("Xuất / in tài liệu", "Xem trước trước khi tải PDF/Excel hoặc in",
                              row(btn("Quay lại bảng kê", "secondary", "arrow-left", to="WM-DEBT-04", trigger="Quay lại chi tiết bảng kê"),
                                  btn("Tải Excel", "secondary", "file-spreadsheet"), btn("Tải PDF", "secondary", "download"),
                                  btn("In", "primary", "printer"), gap=8),
                              crumbs=[("Thu chi & Công nợ", "WM-FIN-01"), ("Bảng kê công nợ", "WM-DEBT-03"), ("CN-202609-0001", "WM-DEBT-04"), ("Xuất / in", None)]),
                  row(side, preview, gap=16, align="flex-start"), gap=16)
    return wm_shell("finance", content, h=1120, child="WM-DEBT-03")


# ================================================================ SHELL-06 Attachment viewer (drawer over order)
ATTS = [("Bien-ban-lay-hang_KhoCanTho.jpg", "POD lấy hàng", "23/09 07:10 · Nguyễn Văn Tài · 2,4 MB", "image"),
        ("Phieu-xuat-kho_PX-0923.pdf", "Phiếu xuất kho", "23/09 07:12 · Nguyễn Văn Tài · 312 KB", "file-text"),
        ("Su-co_ket-xe_QL1A.jpg", "Ảnh sự cố", "23/09 10:42 · Nguyễn Văn Tài · 1,8 MB", "image")]


def _att_tab():
    return col(row(muted("Chứng từ của đơn, chuyến và điểm dừng. Tài xế tải từ app; web tải thêm hóa đơn, biên nhận.", 13), spacer(),
                   btn("Tải chứng từ", "secondary", "upload", size="sm"), gap=8),
               panel(None, attachment_list(ATTS, to="WM-SHELL-06"), pad=12), gap=12)


def shell_06():
    viewer = (f'<div style="position: relative; height: 380px; border-radius: 6px; background: #1F2933; display: flex; align-items: center; justify-content: center;">'
              f'<div style="width: 300px; height: 360px;">{photo_placeholder("100%", 360, "Bien-ban-lay-hang_KhoCanTho.jpg")}</div>'
              f'<div style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%);">{icon_btn("chevron-left", "Chứng từ trước", variant="secondary")}</div>'
              f'<div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);">{icon_btn("chevron-right", "Chứng từ sau", variant="secondary")}</div>'
              f'</div>')
    tools = row(subtle("1 / 3", 12), spacer(), icon_btn("minus", "Thu nhỏ", size="sm"), text("100%", 12, 500, extra=NUM), icon_btn("plus", "Phóng to", size="sm"),
                icon_btn("rotate-ccw", "Xoay", size="sm"), icon_btn("external-link", "Toàn màn hình", size="sm"), gap=4)
    meta = dl([("Loại chứng từ", badge("POD lấy hàng", "info")), ("Gắn với", row(code("DH-202609-0001"), muted("·"), a("Điểm lấy Kho Cần Thơ", "WM-STOP-01", "Mở điểm dừng"), gap=6)),
               ("Chuyến", code("CX-202609-0001", to="WM-TRIP-01", trigger="Mở chuyến")), ("Tải lên bởi", "Nguyễn Văn Tài · App tài xế"),
               ("Thời điểm chụp", num("23/09/2026 07:08", 14)), ("Thời điểm tải lên", num("23/09/2026 07:10", 14)),
               ("Tệp", num("JPG · 3024×4032 · 2,4 MB", 14)), ("Vị trí chụp", num("10.0712, 105.7415 · Bình Thủy", 14))], cols=2)
    thumbs = row(*[f'<div style="flex: 1; padding: 6px; border-radius: 6px; border: {"2px solid " + T["primary"] if i == 0 else "1px solid " + T["border"]}; box-sizing: border-box;">'
                   f'{photo_placeholder("100%", 54, n.split("_")[0]) if ic == "image" else col(icon("file-text", 20, T["text-muted"]), subtle("PDF", 11), gap=2, extra="height: 54px; align-items: center; justify-content: center;")}'
                   f'</div>' for i, (n, k, m, ic) in enumerate(ATTS)], gap=8)
    body = col(viewer, tools, thumbs, divider(), meta,
               field("Ghi chú", textarea("Đủ 160 bao, bao bì nguyên vẹn. Thủ kho: Anh Nam.", h=40)), gap=12)
    foot = (btn("Xóa chứng từ", "danger-outline", "trash-2", to="WM-SHELL-08", trigger="Xóa chứng từ (sensitive)")
            + spacer() + btn("Mở tab mới", "secondary", "external-link") + btn("Tải xuống", "primary", "download"))
    use("AttachmentViewer")
    dr = drawer("Bien-ban-lay-hang_KhoCanTho.jpg", body, f'<div style="display: flex; gap: 8px; width: 100%;">{foot}</div>', 720,
                "Chứng từ DH-202609-0001", close_to="WM-ORD-02")
    return order_detail("Chứng từ", _att_tab(), 1000, overlay=(dr, "right"))


# ================================================================ SHELL-07 Timeline drawer
def shell_07():
    chips = row(*[_pill(s, "primary" if i == 0 else "neutral") for i, s in enumerate(["Tất cả 9", "Trạng thái", "Tiền", "Chứng từ", "Ghi chú", "Nhạy cảm"])],
                gap=6, wrap=True)
    entries = [
        ("23/09 10:42", "Nguyễn Văn Tài · App", f'Báo sự cố <b>Kẹt xe QL1A</b> trên {code("CX-202609-0001")} · {a("Xem sự cố", "WM-INC-01")}', None, "danger"),
        ("23/09 09:05", "Nguyễn Văn Tài · App", "Chuyến CX-202609-0001: Đang lấy hàng → <b>Đang vận chuyển</b>", None, "accent"),
        ("23/09 07:10", "Nguyễn Văn Tài · App", f'Hoàn thành điểm lấy Kho Cần Thơ · 2 chứng từ · {a("Xem POD", "WM-SHELL-06", "Mở chứng từ POD")}', None, "success"),
        ("22/09 16:30", "Phan Ngọc Mai", f'Tạo phiếu chi {code("PC-202609-0004", to="WM-EXP-02", trigger="Mở phiếu chi")} tạm ứng chuyến 2.000.000 đ', None, "neutral"),
        ("20/09 16:10", "Lê Thu Vân", "Sửa giá cước (thao tác nhạy cảm)" + '<div style="margin-top: 6px;">' + diff("Tổng thu khách", money(12_000_000), money(12_500_000)) + '</div>',
         "Khách thêm dịch vụ bốc xếp tại kho Bình Dương", "warning"),
        ("20/09 15:40", "Lê Thu Vân", f'Tạo chuyến {code("CX-202609-0001", to="WM-TRIP-01", trigger="Mở chuyến")} · 51C-123.45 · Nguyễn Văn Tài', None, "neutral"),
        ("20/09 15:20", "Lê Thu Vân", "Đơn: Nháp → <b>Đã xác nhận</b>", None, "info"),
        ("20/09 15:02", "Lê Thu Vân", "Tạo đơn DH-202609-0001 · giá cước 12.000.000 đ", None, "neutral"),
    ]
    body = col(chips, row(checkbox("Gồm sự kiện của chuyến và điểm dừng", True), spacer(), subtle("Mới nhất trước", 12), gap=8), divider(), timeline(entries), gap=12)
    foot = btn("Xuất nhật ký", "secondary", "download") + btn("Đóng", "secondary", to="WM-ORD-07", trigger="Đóng timeline")
    dr = drawer("Timeline", body, foot, 480, "DH-202609-0001 · ai làm gì, trước/sau, lý do", close_to="WM-ORD-07")
    return order_detail("Tài chính", _fin_body(), 1040, overlay=(dr, "right"))


# ================================================================ SHELL-08 Sensitive action modal (generic)
def shell_08():
    affected = col(
        dl([("Phiếu chi", code("PC-202609-0001")), ("Loại · Ai chi", "Phí cầu đường · Tài xế chi trước"),
            ("Gắn với", row(code("CX-202609-0001"), muted("·"), code("DH-202609-0001"), gap=6)), ("Số tiền", num(money(800_000), 14, 600))], cols=2),
        diff("Lãi/lỗ tạm tính đơn", money(11_700_000), money(12_500_000)),
        diff("Công ty nợ Nguyễn Văn Tài", money(800_000), money(0)),
        row(icon("shield-check", 14, T["success"]), subtle("Quyền cần: expense.cancel · Bạn: Admin — được phép", 12), gap=6),
        gap=10)
    m = sensitive_modal("Bạn đang <b>hủy phiếu chi PC-202609-0001</b>. Cùng khung này dùng cho: hủy chuyến, sửa/hủy phiếu thu, sửa COD thực thu, "
                        "đổi trạng thái ngược, xóa chứng từ.",
                        affected, "Sổ công nợ tài xế và lãi/lỗ đơn sẽ tính lại. Phiếu vẫn nằm trong sổ thu chi với trạng thái Đã hủy.",
                        "Trạm thu phí đã hoàn tiền vé cho tài xế", "Xác nhận hủy phiếu", back_to="WM-ORD-07", confirm_to="WM-ORD-07", width=560)
    return order_detail("Tài chính", _fin_body(), 1040, overlay=(m, "center"))


# ================================================================ register
A = dict(platform="wm", module="Auth & onboarding", roles=ROLES_ALL, pattern="auth")
S = dict(platform="wm", module="Khung chung", roles=ROLES_ALL)
DB = dict(platform="wm", module="Dashboard", pattern="dashboard")
register(
    # ---------------- Auth
    Screen(id="WM-AUTH-01", name="Đăng nhập Google", route="/login", render=auth_01, **A,
           purpose="Đăng nhập Web Merchant bằng Firebase Google. Không có form email/mật khẩu (D-006).",
           api=["Firebase signInWithPopup(GoogleAuthProvider)", "me → memberships, permissions"],
           data=["firebaseIdToken", "me.memberships[]"],
           actions=[("Đăng nhập bằng Google", "public"),
                    ("Điều hướng sau login", "1 merchant → WM-DASH-01; nhiều → WM-AUTH-03; không có → WM-AUTH-04")],
           states={"loading": "Nút disabled 'Đang xác thực với Google…' khi popup/verify đang chạy",
                   "error": "Inline danger dưới nút: token invalid/expired, popup bị chặn, API verify fail + Thử lại",
                   "session": "Đã có session hợp lệ → redirect thẳng theo memberships"},
           notes=["Không có đăng ký/mật khẩu; tài khoản mới đi qua WM-AUTH-04/WM-AUTH-02.",
                  "Sau verify, backend map Firebase UID/email → user + merchant memberships.",
                  "Giữ returnUrl để quay lại trang cũ sau khi đăng nhập."]),
    Screen(id="WM-AUTH-02", name="Tạo/hoàn tất merchant", route="/onboarding/merchant", render=auth_02, **A,
           purpose="Self-service tạo nhà xe sau lần đăng nhập đầu; user trở thành Admin, seed danh mục mặc định.",
           api=["createMerchant(input: {name, legalName, taxCode, address, contactName, phone, email})", "selectMerchant(merchantId)"],
           data=["name", "legalName", "taxCode?", "address", "contactName", "phone", "email"],
           actions=[("Tạo nhà xe", "user đã đăng nhập, chưa bị chặn tạo merchant → admin membership"), ("Hủy và đăng xuất", "logout")],
           states={"validation": "Lỗi inline: tên nhà xe, địa chỉ, người liên hệ, SĐT bắt buộc; MST 10/13 số nếu nhập",
                   "submitting": "Nút 'Tạo nhà xe' loading, khóa form", "error": "Banner danger nếu createMerchant fail"},
           notes=["Seed catalog mặc định (loại chi phí, add-on, loại hàng, lý do tạm dừng, loại chứng từ, loại sự cố) và number sequences.",
                  "Mã nhà xe sinh tự động, không cho sửa."]),
    Screen(id="WM-AUTH-03", name="Chọn merchant", route="/select-merchant", render=auth_03, **A,
           purpose="User thuộc nhiều nhà xe chọn tenant làm việc; cũng mở từ merchant switcher.",
           api=["me{memberships{merchant{id, code, name}, role, status, lastAccessAt}}", "selectMerchant(merchantId)"],
           data=["merchant.name", "merchant.code", "role", "status", "lastAccessAt"],
           actions=[("Chọn nhà xe", "membership active → WM-DASH-01"), ("Tạo nhà xe mới", "→ WM-AUTH-02"), ("Đăng xuất", "logout")],
           states={"locked": "Membership bị khóa: dòng mờ + badge 'Tạm khóa', không click được", "loading": "Skeleton 3 dòng"},
           notes=["Đổi merchant phải reset toàn bộ cache (Apollo/React Query) để không lộ dữ liệu tenant cũ."]),
    Screen(id="WM-AUTH-04", name="Không có quyền / chờ mời", route="/access-pending", render=auth_04, **A,
           purpose="Tài khoản Google chưa thuộc merchant nào: hướng dẫn nhờ admin mời hoặc tạo nhà xe mới.",
           api=["me{memberships, pendingInvitations}"],
           data=["user.email", "pendingInvitations[]"],
           actions=[("Kiểm tra lại lời mời", "refetch me → WM-AUTH-03/WM-DASH-01 nếu đã có"), ("Tạo nhà xe mới", "nếu merchant self-service bật → WM-AUTH-02"),
                    ("Đăng nhập tài khoản khác", "logout → WM-AUTH-01")],
           states={"has_invite": "Có lời mời chờ: hiện danh sách lời mời + nút Chấp nhận"},
           notes=["User chưa mapping merchant không được vào dashboard (guard route)."]),
    # ---------------- Shell
    Screen(id="WM-SHELL-01", name="Layout chính", route="(layout) /*", render=shell_01, pattern="page", **S,
           purpose="AppShell: sidebar module, topbar (tìm nhanh, chuông, user menu), vùng PageHeader → Toolbar → nội dung. Menu tài khoản đang mở.",
           api=["me{user, currentMerchant, memberships, permissions}", "notifications(filter: {unread: true}){totalCount}", "navBadges (counts cảnh báo)"],
           data=["user.name", "user.email", "currentMerchant{name, code}", "role", "memberships.count", "navBadges{dispatch, finance, payroll}", "unreadCount"],
           actions=[("Đổi nhà xe", "→ WM-AUTH-03"), ("Hồ sơ nhà xe", "settings.manage (admin)"), ("Tài khoản của tôi", "self"),
                    ("Đăng xuất", "logout, clear cache"), ("Ctrl K", "→ WM-SHELL-03"), ("Chuông", "→ WM-SHELL-02")],
           states={"loading": "Skeleton trong vùng nội dung, shell không nhấp nháy",
                   "no_permission": "Mục sidebar ẩn theo permission; truy cập trực tiếp route → EmptyState 'Bạn không có quyền xem trang này'"},
           notes=["Sidebar 260px, mục đang mở dùng primary-soft + primary text.", "Badge sidebar: danger cho tiền quá hạn, warning cho việc chờ xử lý.",
                  "Ẩn/disable action theo permission nhưng backend vẫn guard."]),
    Screen(id="WM-SHELL-02", name="Trung tâm thông báo", route="(popover) — từ chuông topbar", render=shell_02, pattern="drawer", h=H_DASH1,
           overlay_of="WM-DASH-01", **S,
           purpose="Danh sách thông báo công việc/cảnh báo; đánh dấu đã đọc; mở entity liên quan.",
           api=["notifications(filter: {unread?, category?}, first, after)", "markNotificationRead(id)", "markAllNotificationsRead"],
           data=["id", "category", "title", "body", "entityType", "entityId", "createdAt", "readAt", "severity"],
           actions=[("Mở thông báo", "view entity → đánh dấu đã đọc"), ("Đánh dấu đã đọc", "self"), ("Cài đặt ngưỡng", "settings.manage")],
           states={"empty": "EmptyState 'Không có thông báo mới'", "loading": "Skeleton 4 dòng", "polling": "Poll 60 giây cập nhật badge"},
           notes=["Thông báo theo role: Operation (lịch), Kế toán (COD/nợ), Admin (bảng lương).",
                  "Deep link theo entityType: ORDER → WM-ORD-02, TRIP → WM-TRIP-01, PAYROLL → WM-PAYROLL-02, CUSTOMER_DEBT → WM-CUS-05, INCIDENT → WM-INC-01, COD → WM-COD-01."]),
    Screen(id="WM-SHELL-03", name="Tìm kiếm nhanh", route="(dialog) Ctrl K", render=shell_03, pattern="dialog", h=H_DASH1, overlay_of="WM-DASH-01", **S,
           purpose="Command palette: tìm theo mã đơn, mã chuyến, khách, tài xế, xe, phiếu thu/chi và nhảy tới detail.",
           api=["globalSearch(query, types[], first: 5 per type)"],
           data=["type", "id", "code/name", "subtitle", "status"],
           actions=[("Enter / click kết quả", "view permission của entity"), ("Lọc phạm vi", "chip loại")],
           states={"empty_query": "Hiện mục mở gần đây", "no_result": "EmptyState 'Không tìm thấy kết quả cho …'", "loading": "Spinner trong ô tìm, debounce 250ms"},
           notes=["Kết quả nhóm theo loại, tối đa 5/nhóm; điều hướng bằng ↑↓, Enter, Esc.", "Chỉ trả kết quả trong merchant hiện tại."]),
    Screen(id="WM-SHELL-04", name="Import wizard", route="(dialog) từ danh sách khách/xe/tài xế", render=shell_04, pattern="dialog",
           overlay_of="WM-CUS-01", **S,
           purpose="Import Excel khách hàng/xe/tài xế: Upload → Map cột → Kiểm tra lỗi → Xác nhận. Không ghi dữ liệu trước khi xác nhận.",
           api=["startImport(input: {entityType, fileKey, mapping})", "importPreview(sessionId, filter)", "commitImport(sessionId, skipErrors)"],
           data=["entityType", "fileName", "totalRows", "validRows", "warningRows", "errorRows", "rows[{line, values, errors[], warnings[]}]"],
           actions=[("Tải file lỗi", "create permission của entity"), ("Xác nhận nhập", "customer.create | vehicle.create | driver.create")],
           states={"uploading": "Progress trong bước 1", "validating": "Skeleton bảng + 'Đang kiểm tra 48 dòng…'",
                   "all_valid": "Banner success, bỏ qua bước lọc lỗi", "commit_error": "Banner danger, giữ session để thử lại"},
           notes=["Lỗi = chặn dòng (SĐT/MST sai, thiếu trường bắt buộc, trùng MST/biển số); cảnh báo = vẫn nhập (tên gần giống, trường trống dùng mặc định).",
                  "Import tenant-safe; audit log ghi số dòng nhập."]),
    Screen(id="WM-SHELL-05", name="Export/print preview", route="(page) …/export · …/print", render=shell_05, pattern="page", h=1120, **S,
           purpose="Xem trước PDF/Excel, chọn mẫu, tải hoặc in: bảng kê, bảng lương, phiếu giao hàng/điều xe, chi phí chuyến, COD.",
           api=["exportFile(input: {template, entityId, format, options})", "debtStatement(id){pdfSnapshotUrl}"],
           data=["template", "format", "paperSize", "options", "previewUrl"],
           actions=[("Tải PDF / Excel", "quyền view/export theo tài liệu (payroll export: admin, accountant)"), ("In", "như trên")],
           states={"generating": "Skeleton trang A4 + 'Đang tạo file…'", "error": "Banner danger + Thử lại"},
           notes=["Bảng kê đã chốt dùng PDF snapshot lưu trong debt_statement, không render lại.", "Tiền VND số nguyên, ngày dd/mm/yyyy trong file Excel."]),
    Screen(id="WM-SHELL-06", name="Attachment viewer", route="(drawer) ?attachment=:id", render=shell_06, pattern="drawer", h=1000, overlay_of="WM-ORD-02", **S,
           purpose="Xem ảnh/PDF chứng từ (POD, hóa đơn, phiếu xuất kho, ảnh sự cố), metadata, tải xuống, chuyển trước/sau.",
           api=["attachments(entity)", "attachment(id){signedUrl}"],
           data=["fileName", "category", "entity{type, id, code}", "uploadedBy", "capturedAt", "uploadedAt", "mime", "size", "gps?", "note"],
           actions=[("Tải xuống", "view permission của entity"), ("Xóa chứng từ", "attachment.delete — sensitive → WM-SHELL-08")],
           states={"loading": "Skeleton khung ảnh", "pdf": "Hiện trình xem PDF nhiều trang", "unsupported": "Icon file + nút Tải xuống"},
           notes=["Signed URL ngắn hạn; không lộ file key.", "Mũi tên trái/phải chuyển chứng từ cùng entity."]),
    Screen(id="WM-SHELL-07", name="Timeline drawer", route="(drawer) ?timeline=1", render=shell_07, pattern="drawer", h=1040, overlay_of="WM-ORD-07", **S,
           purpose="Nhật ký activity/audit theo entity: ai làm gì, khi nào, trước/sau, lý do.",
           api=["activityTimeline(entity: {type, id}, filter: {category}, includeChildren)"],
           data=["createdAt", "actor{name, source}", "action", "category", "reason?", "before", "after", "relatedEntity"],
           actions=[("Lọc loại sự kiện", "view"), ("Xuất nhật ký", "admin")],
           states={"empty": "EmptyState 'Chưa có hoạt động'", "loading": "Skeleton 5 dòng"},
           notes=["Category: status, money, attachment, note, sensitive.", "Sensitive action luôn hiện lý do + AuditDiff trước/sau."]),
    Screen(id="WM-SHELL-08", name="Sensitive action modal", route="(modal)", render=shell_08, pattern="dialog", h=1040, overlay_of="WM-ORD-07", **S,
           purpose="Khung dùng chung cho thao tác nhạy cảm: nội dung thay đổi, dữ liệu bị ảnh hưởng, cảnh báo, lý do bắt buộc.",
           api=["cancelExpense(id, reason)", "cancelTrip(id, reason)", "updatePayment(id, input, reason)", "deleteAttachment(id, reason)"],
           data=["action", "entity", "affected[]", "before/after", "requiredPermission", "reason"],
           actions=[("Xác nhận", "permission riêng theo action + reason ≥ 5 ký tự"), ("Quay lại", "đóng modal, không đổi dữ liệu")],
           states={"no_permission": "Nút xác nhận disabled + inline 'Bạn cần quyền … — liên hệ Admin'", "validation": "Lý do trống → lỗi inline danger",
                   "error": "Banner danger trong modal, giữ lý do đã nhập"},
           notes=["Backend reject nếu thiếu reason; ghi audit_log {actor, action, reason, before, after}.",
                  "Ví dụ trong mockup: hủy phiếu chi PC-202609-0001 trên tab Tài chính của DH-202609-0001."]),
    # ---------------- Dashboard
    Screen(id="WM-DASH-01", name="Dashboard tổng quan", route="/", render=dash_01, h=H_DASH1, roles=ROLES_ALL, **DB,
           purpose="Màn cảnh báo vận hành: 6 KPI, vận hành hôm nay (trái), cảnh báo tiền/sự cố (phải).",
           api=["dashboardSummary(filter: {range})", "trips(filter: {date: today..tomorrow})", "orders(filter: {needsAction: true})"],
           data=["runningTrips", "ordersNeedAction", "overdueDebt", "codHeld", "openIncidents", "payrollPending", "todayTrips[]", "overdueOrders[]", "codHolders[]"],
           actions=[("Click KPI", "mở list đã lọc tương ứng"), ("Tạo đơn", "order.create"), ("Ghi nhận nộp COD", "payment.create (admin, accountant)"),
                    ("Duyệt bảng lương", "payroll.approve (admin)")],
           states={"loading": "Skeleton KPI + bảng", "empty": "Mỗi panel có EmptyState ngắn (vd 'Không có chuyến hôm nay')",
                   "polling": "Tự làm mới 60 giây"},
           notes=["Card theo role: Operation ẩn khối tiền chi tiết nếu không có finance.view; Kế toán ẩn nút Tạo đơn.",
                  "KPI click → list đã filter (WM-ORD-01?filter=needsAction, WM-DEBT-01?overdue=1…).", "Bảng nhỏ quan trọng hơn chart lớn."]),
    Screen(id="WM-DASH-02", name="Dashboard vận hành", route="/dashboard/operations", render=dash_02, h=1140, roles=["admin", "operation"], **DB,
           purpose="Theo dõi điều phối bằng polling: chuyến theo trạng thái, xe/tài xế đang chạy, cảnh báo lịch, vị trí gần nhất.",
           api=["trips(filter: {dateRange, status})", "vehicles{status, currentTrip}", "drivers{status, currentTrip}", "scheduleWarnings", "lastKnownLocations"],
           data=["tripCountsByStatus", "trips[]", "vehicles[]", "drivers[]", "warnings[]", "locations[]"],
           actions=[("Mở chuyến", "trip.view → WM-TRIP-01"), ("Mở bản đồ", "→ WM-DISPATCH-04"), ("Xử lý cảnh báo", "→ WM-DISPATCH-03")],
           states={"polling": "Refetch 60 giây, badge thời điểm cập nhật", "gps_stale": "Pin xám + 'GPS cũ > 30 phút'"},
           notes=["Kế toán có thể xem nếu có dispatch.view; ẩn khỏi sidebar nếu không."]),
    Screen(id="WM-DASH-03", name="Dashboard tài chính", route="/dashboard/finance", render=dash_03, h=1560, roles=["admin", "accountant"], **DB,
           purpose="Tổng hợp cho giám đốc/kế toán: doanh thu tạm tính, chi phí, lãi/lỗ, công nợ khách, công nợ NCC, COD chưa nộp.",
           api=["dashboardSummary(filter: {range, finance: true})", "reportProfit(filter: {groupBy: MONTH})", "reportCustomerDebt(filter)", "reportCodHeld(filter)"],
           data=["revenue", "cost", "profit", "customerDebt", "overdueDebt", "supplierDebt", "codHeld", "cashIn", "monthly[{month, revenue, cost, profit}]"],
           actions=[("Mở báo cáo", "report.view"), ("Xuất báo cáo", "report.export → WM-SHELL-05")],
           states={"loading": "Skeleton KPI + chart", "no_data": "Chart rỗng + 'Chưa có dữ liệu trong kỳ'"},
           notes=["Doanh thu ≠ tiền đã thu; COD tài xế nộp không phải doanh thu.", "Mỗi chart có DataTable bên cạnh (accessibility, đối chiếu số).",
                  "Dùng cùng công thức với WM-RPT-02/03 và tab Tài chính đơn.", "Operation chỉ xem nếu có finance.view (⚠️)."]),
)
