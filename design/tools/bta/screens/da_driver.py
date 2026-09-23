"""App Tài xế (Flutter, phase 1) — DA-AUTH-01 … DA-PROFILE-01.

Driver = Nguyễn Văn Tài (DRV-A-001), xe 51C-123.45. Active trip CX-202609-0001 (DH-202609-0001,
Kho Cần Thơ → Kho Bình Dương, Đang vận chuyển, COD dự kiến 12.500.000 đ, sự cố mở "Kẹt xe").
All screens 390 × 844 dp; body ≥ 14px, key data 16–18px, tap targets ≥ 48px.
"""
from ..core import Screen, register
from ..shells import (DA_TABS, bottom_nav, bottom_sheet, list_row, m_card, m_section, mobile_frame, mobile_header,
                      primary_bottom_action, sync_status)
from ..ui import *  # noqa: F401,F403

W, H = 390, 844
TRIP = "CX-202609-0001"
ROLES = ["driver"]
NW = NUM + " white-space: nowrap;"
NOTI_BADGE = {2: "3"}


# ---------------------------------------------------------------- private helpers
def _st(label):
    """Trip/stop status badge, mobile size (13px, always with text)."""
    tone = TRIP_STATUS.get(label) or {"Chưa đến": "neutral", "Đã đến": "info", "Bỏ qua": "warning"}.get(label, "neutral")
    ic = {"Tạm dừng": "pause", "Hoàn thành": "check"}.get(label)
    return badge(label, tone, ic, size=13)


def _kind(kind):
    return badge("Lấy hàng", "info", "package-check", size=13) if kind == "pickup" else badge("Trả hàng", "primary", "map-pin", size=13)


def _seg(items, active=0, h=48):
    """Full-width segmented filter, 48dp tall (tap target)."""
    use("SegmentedControl")
    out = []
    for i, it in enumerate(items):
        on = i == active
        out.append(f'<span style="flex: 1; display: flex; align-items: center; justify-content: center; height: {h - 8}px; border-radius: 6px; '
                   f'font-size: 14px; font-weight: {600 if on else 500}; white-space: nowrap; '
                   f'background: {T["surface"] if on else "transparent"}; color: {T["primary"] if on else T["text-muted"]}; '
                   f'{"box-shadow: 0 1px 2px rgba(23,32,42,0.12);" if on else ""}">{it}</span>')
    return (f'<div role="tablist" style="display: flex; gap: 2px; padding: 4px; height: {h}px; box-sizing: border-box; border-radius: 8px; '
            f'background: {T["surface-muted"]}; border: 1px solid {T["border"]};">{"".join(out)}</div>')


def _kv(label, value, color=None, size=15):
    return row(muted(label, 14), spacer(), text(value, size, 600, color, NUM + " white-space: nowrap;"), gap=8)


def _money(v, size=18, color=None, weight=700):
    use("MoneyText")
    return text(money(v), size, weight, color, NUM + " white-space: nowrap;")


def _meta(ic, s):
    return row(icon(ic, 16, T["text-muted"]), text(s, 15, 400, T["text"], NUM + " white-space: nowrap;"), gap=6)


def _trip_card(code_, route, time_, st_, vehicle="51C-123.45", extra="", to="DA-TRIP-01", trigger=None, sync=None):
    use("TripCard")
    top = row(text(code_, 15, 600, extra=NW), spacer(), _st(st_), gap=8)
    meta = row(_meta("clock", time_), _meta("truck", vehicle), spacer(), sync or "", gap=12)
    body = col(top, text(route, 16, 600), meta, extra, gap=6)
    return m_card(body, to=to, trigger=trigger or f"Mở chuyến {code_}")


def _field(label, control, required=False, hint=None):
    use("FormField")
    req = f'<span style="color: {T["danger"]};"> *</span>' if required else ""
    return col(f'<label style="font-size: 14px; font-weight: 600; color: {T["text"]};">{label}{req}</label>', control,
               muted(hint, 13) if hint else "", gap=6)


def _big_input(value="", placeholder="", prefix_ic=None, suffix=None):
    return input_(value, placeholder, prefix_ic=prefix_ic, suffix=suffix, h=48, fs=16)


def _option(title, sub=None, on=False, to=None, trigger=None, disabled=False):
    """Radio option row (≥ 56dp) used in bottom sheets."""
    use("RadioGroup")
    dot = (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; '
           f'border: 2px solid {T["primary"] if on else T["border-control"]}; box-sizing: border-box; flex-shrink: 0;">'
           f'{"<span style=" + chr(34) + "width: 10px; height: 10px; border-radius: 50%; background: " + T["primary"] + ";" + chr(34) + "></span>" if on else ""}</span>')
    c = T["text-subtle"] if disabled else T["text"]
    inner = row(dot, col(text(title, 16, 600, c), muted(sub, 13) if sub else "", gap=0), spacer(),
                icon("chevron-right", 18, T["text-subtle"]) if to else "", gap=12)
    css = (f"display: block; padding: 10px 14px; min-height: 56px; box-sizing: border-box; border-radius: 8px; text-decoration: none; "
           f"border: 1px solid {T['primary'] if on else T['border']}; background: {T['primary-soft'] if on else T['surface']}; "
           f"{'opacity: 0.6;' if disabled else ''}")
    if to:
        edge(to, trigger or title)
        return f'<a href="{href(to)}" style="{css}">{inner}</a>'
    return f'<div style="{css}">{inner}</div>'


def _chip(label, on=False, ic=None):
    use("FilterChip")
    return (f'<span style="display: flex; align-items: center; justify-content: center; gap: 6px; height: 48px; padding: 0 12px; box-sizing: border-box; '
            f'border-radius: 8px; font-size: 15px; font-weight: {600 if on else 500}; border: 1px solid {T["primary"] if on else T["border-control"]}; '
            f'background: {T["primary-soft"] if on else T["surface"]}; color: {T["primary"] if on else T["text"]};">'
            f'{icon("check", 16, T["primary"], 2.5) if on else (icon(ic, 16, T["text-muted"]) if ic else "")}{label}</span>')


def _thumb(state, label, pct=None, size=78):
    """Captured-photo thumbnail with upload state (AttachmentCapture)."""
    use("AttachmentCapture")
    tone, ic, cap = {"done": ("success", "circle-check", "Đã tải lên"), "uploading": ("info", "cloud-upload", f"Đang tải {pct}%"),
                     "queued": ("warning", "cloud-off", "Chờ mạng"), "failed": ("danger", "circle-alert", "Lỗi tải")}[state]
    fg = TONES[tone][1]
    img = (f'<div role="img" aria-label="{label}" style="position: relative; width: {size}px; height: {size}px; border-radius: 6px; '
           f'background: {T["neutral-soft"]}; border: 1px solid {fg if state == "failed" else T["border"]}; display: flex; align-items: center; justify-content: center;">'
           f'{icon("image", 24, T["text-subtle"], 1.5)}'
           f'<span style="position: absolute; top: 4px; right: 4px; display: inline-flex; padding: 2px; border-radius: 50%; background: {T["surface"]};">{icon(ic, 16, fg)}</span>'
           + (f'<div style="position: absolute; left: 6px; right: 6px; bottom: 6px;">{progress(pct, "info", 4)}</div>' if state == "uploading" else "")
           + '</div>')
    return col(img, text(cap, 13, 600, fg, "white-space: nowrap;"), gap=4, extra=f"width: {size}px;")


def _add_tile(size=78, label="Thêm ảnh"):
    return (f'<div style="width: {size}px; height: {size}px; border-radius: 6px; border: 1px dashed {T["border-strong"]}; background: {T["surface"]}; '
            f'display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; box-sizing: border-box;">'
            f'{icon("camera", 22, T["primary"])}{text(label, 13, 600, T["primary"])}</div>')


def _icon_box(ic, tone="neutral", size=40):
    bg, fg = TONES[tone]
    return (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: {size}px; height: {size}px; border-radius: 8px; '
            f'background: {bg}; flex-shrink: 0;">{icon(ic, 20, fg)}</span>')


def _offline_banner(n=5):
    use("OfflineBanner")
    return banner(f"Đang mất kết nối. {n} mục được lưu trên máy và tự gửi khi có mạng.", "danger", "wifi-off", title="Offline.")


def _nav(active):
    return bottom_nav(DA_TABS, active, NOTI_BADGE)


# ---------------------------------------------------------------- DA-AUTH-01 Splash
def auth_01():
    use("Logo")
    edge("DA-HOME-01", "Tự động: có phiên hợp lệ → Trang chủ")
    edge("DA-AUTH-02", "Tự động: chưa đăng nhập / phiên hết hạn → Đăng nhập")
    mark = (f'<a href="{href("DA-HOME-01")}" aria-label="BTA" style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; '
            f'border-radius: 8px; background: {T["primary"]}; text-decoration: none;">{icon("truck", 44, "#FFFFFF")}</a>')
    body = col(
        spacer(),
        col(mark, text("BTA Tài xế", 24, 700), muted("BTA Demo Transport", 15), gap=10, extra="align-items: center;"),
        col(row(icon("loader-circle", 20, T["primary"]), text("Đang kiểm tra phiên đăng nhập…", 16, 500), gap=8, justify="center"),
            f'<div style="width: 200px; align-self: center;">{progress(60, "primary", 4)}</div>', gap=12, extra="margin-top: 40px;"),
        spacer(),
        m_card(row(icon("refresh-cw", 18, T["warning"]), col(text("2 mục chờ đồng bộ trên máy", 15, 600),
                                                              muted("Sẽ gửi ngay sau khi vào app. Dữ liệu không bị mất.", 13), gap=0), gap=10)),
        row(a("Đăng nhập tài khoản khác", "DA-AUTH-02", "Tự động: chưa đăng nhập / phiên hết hạn → Đăng nhập", 15), gap=0, justify="center",
            extra="min-height: 48px;"),
        subtle("Phiên bản 1.0.0 (phase 1)", 13),
        gap=16, extra="flex-grow: 1; align-items: stretch; text-align: center;")
    return mobile_frame("", body, pad=24, bg=T["surface"])


# ---------------------------------------------------------------- DA-AUTH-02 Login
def auth_02():
    body = col(
        col(logo(True, 40), gap=0, extra="margin-top: 24px;"),
        col(h("display", "Đăng nhập tài xế"), muted("Dùng tài khoản do nhà xe cấp cho bạn.", 15), gap=4),
        _seg(["Mật khẩu", "Mã OTP"], 0),
        _field("Số điện thoại", _big_input("0900 000 001", prefix_ic="phone"), True),
        _field("Mật khẩu", input_("••••••••", prefix_ic="lock", h=48, fs=16) .replace("</div>", f'{icon("eye", 20, T["text-muted"])}</div>', 1), True),
        row(checkbox("Ghi nhớ đăng nhập trên máy này", True, 20), gap=0, extra="min-height: 48px;"),
        row(spacer(), a("Quên mật khẩu?", "DA-AUTH-03", "Quên mật khẩu", 15, 600), gap=0, extra="min-height: 48px;"),
        banner("Phương thức đăng nhập (mật khẩu hay OTP) đang chờ chốt — UI giữ cả hai tab.", "info", title="Chờ quyết định."),
        spacer(),
        muted("Chưa có tài khoản hoặc bị khóa? Liên hệ điều phối nhà xe để được cấp/đặt lại.", 14),
        gap=16, extra="flex-grow: 1;")
    return mobile_frame("", body, primary_bottom_action("Đăng nhập", "DA-HOME-01", "log-in", trigger="Đăng nhập thành công → Trang chủ"),
                        pad=20, bg=T["surface"])


# ---------------------------------------------------------------- DA-AUTH-03 Forgot password
def auth_03():
    otp = row(*[(f'<span style="display: flex; align-items: center; justify-content: center; width: 48px; height: 56px; border-radius: 6px; '
                 f'border: {"2px solid " + T["primary"] if i == 4 else "1px solid " + T["border-control"]}; box-sizing: border-box; '
                 f'font-size: 22px; font-weight: 600; {NUM}">{d}</span>') for i, d in enumerate(["4", "8", "2", "7", "", ""])],
              gap=8, justify="space-between")
    body = col(
        stepper(["Số điện thoại", "Mã xác thực", "Mật khẩu mới"], 1),
        m_card(row(_icon_box("smartphone", "primary"), col(muted("Mã đã gửi tới", 14), text("0900 000 001", 17, 600, extra=NW), gap=0), spacer(),
                   a("Đổi số", "DA-AUTH-03", "Đổi số điện thoại", 15), gap=12)),
        _field("Nhập mã 6 số", otp, True, "Mã có hiệu lực 5 phút."),
        row(icon("timer", 18, T["text-muted"]), muted("Gửi lại mã sau 00:45", 15), gap=6, extra="min-height: 48px;"),
        _field("Mật khẩu mới", input_("", "Tối thiểu 8 ký tự", prefix_ic="lock", h=48, fs=16), True, "Nhập sau khi mã được xác thực."),
        banner("Không nhận được mã? Admin/Operation của nhà xe có thể đặt lại tài khoản app cho bạn.", "info"),
        spacer(),
        row(a("Quay lại đăng nhập", "DA-AUTH-02", "Quay lại đăng nhập", 15, 600), justify="center", extra="min-height: 48px;"),
        gap=16, extra="flex-grow: 1;")
    return mobile_frame(mobile_header("Quên mật khẩu", "DA-AUTH-02", "Khôi phục bằng số điện thoại"), body,
                        primary_bottom_action("Xác nhận & đặt lại mật khẩu", "DA-AUTH-02", "check", trigger="Đặt lại xong → Đăng nhập"),
                        bg=T["surface"])


# ---------------------------------------------------------------- DA-HOME-01 Home today
def home_01():
    running = m_card(col(
        row(text(TRIP, 16, 600, extra=NW), spacer(), _st("Đang vận chuyển"), gap=8),
        text("Kho Cần Thơ → Kho Bình Dương", 18, 600),
        row(_meta("clock", "06:00 – 14:00"), _meta("truck", "51C-123.45"), gap=14),
        row(_icon_box("map-pin", "primary", 36), col(muted("Điểm tiếp theo · Trả hàng", 13), text("Kho Bình Dương", 16, 600),
                                                     muted("Số 12 ĐT743, Dĩ An, Bình Dương", 14), gap=0), gap=10, align="flex-start",
            extra=f"padding-top: 8px; border-top: 1px solid {T['border']};"),
        row(muted("COD cần thu", 14), spacer(), _money(12_500_000, 18), gap=8),
        row(badge("Sự cố mở: Kẹt xe", "danger", "triangle-alert", size=13), spacer(), muted("Dự kiến trễ ~1 giờ", 13), gap=8),
        btn("Mở chuyến đang chạy", "primary", "arrow-right", to="DA-TRIP-01", size="lg", full=True, trigger="Mở chuyến đang chạy"),
        gap=8), extra=f"border-color: {T['primary']}; border-width: 1.5px;")
    use("TripCard")
    cod = m_card(row(_icon_box("hand-coins", "warning"),
                     col(text("Nhớ thu COD 12.500.000 đ", 16, 600, T["warning"]),
                         muted("Tại Kho Bình Dương. Nộp lại cho kế toán trong 2 ngày sau khi thu.", 14), gap=2), gap=12, align="flex-start"),
                 to="DA-MONEY-01", trigger="Cảnh báo COD → Thưởng & khoản ứng",
                 extra=f"background: {T['warning-soft']}; border-color: {T['warning']}55;")
    nxt = _trip_card("CX-202609-0002", "Nhà máy Long An → Công trình Quận 7", "15:00 – 19:00", "Đã lên lịch",
                     trigger="Mở chuyến CX-202609-0002 (15:00)")
    body = col(
        sync_status("pending", 2, to="DA-SYNC-01"),
        m_section("Chuyến đang chạy", running),
        cod,
        m_section("Chuyến hôm nay (2)", nxt, a("Xem tất cả", "DA-JOB-01", "Xem tất cả chuyến", 15, 600)),
        gap=12)
    header = mobile_header("Hôm nay", sub="Thứ Tư, 23/09/2026 · Nguyễn Văn Tài",
                           right=icon_btn("user", "Tài khoản", to="DA-PROFILE-01", size="lg", trigger="Mở hồ sơ"))
    return mobile_frame(header, body, _nav(0))


# ---------------------------------------------------------------- DA-JOB-01 Job list
def job_01():
    t1 = _trip_card(TRIP, "Kho Cần Thơ → Kho Bình Dương", "06:00 – 14:00", "Đang vận chuyển",
                    extra=row(badge("1 chờ gửi", "warning", "refresh-cw", size=13), spacer(), muted("COD cần thu", 14),
                              _money(12_500_000, 16, weight=600), gap=8))
    t2 = _trip_card("CX-202609-0002", "Nhà máy Long An → Công trình Quận 7", "15:00 – 19:00", "Đã lên lịch",
                    extra=row(muted("COD", 14), spacer(), muted("Không thu", 14), gap=8))
    later = col(text("Sắp tới", 15, 600),
                _trip_card("CX-202609-0010", "Kho Cần Thơ → Kho Bình Dương", "25/09 05:30 – 13:00", "Đã lên lịch",
                           trigger="Mở chuyến sắp tới CX-202609-0010"), gap=8)
    body = col(
        _seg(["Hôm nay", "Sắp tới", "Đang chạy", "Hoàn thành"], 0),
        row(text("Thứ Tư, 23/09/2026", 15, 600), spacer(), muted("2 chuyến", 14), gap=8),
        t1, t2, later,
        row(icon("info", 16, T["text-muted"]), muted("Chuyến do điều phối giao cho bạn — không cần bấm nhận việc.", 14), gap=6),
        gap=12)
    header = mobile_header("Chuyến của tôi", sub="Nguyễn Văn Tài · 51C-123.45",
                           right=icon_btn("calendar-days", "Xem lịch chuyến", to="DA-JOB-02", size="lg", trigger="Mở lịch chuyến"))
    return mobile_frame(header, body, _nav(1))


# ---------------------------------------------------------------- DA-JOB-02 Calendar
def job_02():
    use("Calendar")
    trips = {5: "danger", 16: "success", 19: "success", 21: "success", 23: "accent", 25: "neutral", 27: "neutral"}
    head = "".join(f'<span style="text-align: center; font-size: 13px; font-weight: 600; color: {T["text-muted"]};">{d}</span>'
                   for d in ["T2", "T3", "T4", "T5", "T6", "T7", "CN"])
    cells = ['<span></span>']  # 01/09/2026 is Tuesday
    for d in range(1, 31):
        on = d == 23
        dot = ""
        if d in trips:
            c = T["surface"] if on else TONES[trips[d]][1]
            n = 2 if d == 23 else 1
            dot = row(*[f'<span style="width: 6px; height: 6px; border-radius: 50%; background: {c};"></span>'] * n, gap=3, justify="center")
        bg = T["primary"] if on else "transparent"
        fg = "#FFFFFF" if on else (T["text"] if d >= 23 else T["text-muted"])
        bd = f"border: 1px solid {T['primary']};" if d == 24 and False else ""
        cells.append(f'<span style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; height: 48px; '
                     f'border-radius: 8px; background: {bg}; {bd}"><span style="font-size: 15px; font-weight: {700 if on else 500}; color: {fg}; {NUM}">{d}</span>'
                     f'{dot or "<span style=" + chr(34) + "height: 6px;" + chr(34) + "></span>"}</span>')
    grid_ = (f'<div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 2px;">{head}{"".join(cells)}</div>')
    cal = m_card(col(row(icon_btn("chevron-left", "Tháng trước", size="lg"), spacer(), text("Tháng 9/2026", 17, 600), spacer(),
                         icon_btn("chevron-right", "Tháng sau", size="lg"), gap=4), grid_,
                     gap=8), pad=12)

    def mini(code_, route, t, st_):
        use("TripCard")
        return m_card(row(col(row(text(code_, 15, 600, extra=NW), _st(st_), gap=8), text(route, 15, 500), muted(t, 14), gap=2), spacer(),
                          icon("chevron-right", 20, T["text-subtle"]), gap=8), to="DA-TRIP-01", trigger=f"Chọn ngày → mở chuyến {code_}", pad=12)
    body = col(
        _seg(["Tháng", "Tuần"], 0),
        cal,
        row(text("Thứ Tư, 23/09 · 2 chuyến", 15, 600), spacer(), a("Danh sách", "DA-JOB-01", "Xem dạng danh sách", 15), gap=8),
        mini(TRIP, "Kho Cần Thơ → Kho Bình Dương", "06:00 – 14:00 · 51C-123.45", "Đang vận chuyển"),
        mini("CX-202609-0002", "Nhà máy Long An → Công trình Quận 7", "15:00 – 19:00 · 51C-123.45", "Đã lên lịch"),
        gap=12)
    return mobile_frame(mobile_header("Lịch chuyến", "DA-JOB-01", "Chọn ngày để xem chuyến"), body, _nav(1))


# ---------------------------------------------------------------- DA-TRIP-01 Trip detail (+ base for status sheets)
def _stop_line(n, kind, place, sub, st_, cod=None, to="DA-STOP-02"):
    use("StopCard")
    num_ = (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; '
            f'background: {T["success"] if st_ == "Hoàn thành" else T["primary-soft"]}; color: {"#FFFFFF" if st_ == "Hoàn thành" else T["primary"]}; '
            f'font-size: 14px; font-weight: 700; flex-shrink: 0;">{n}</span>')
    right = col(_st(st_), _money(cod, 15, weight=600) if cod else "", gap=2, extra="align-items: flex-end;")
    return m_card(row(num_, col(row(text(place, 16, 600), gap=6), muted(sub, 14), gap=0, extra="min-width: 0; flex: 1;"), right,
                      icon("chevron-right", 18, T["text-subtle"]), gap=10), to=to, trigger=f"Mở điểm {place}", pad=12)


def _trip_page(overlay=None):
    use("EntityHeader")
    head = m_card(col(
        row(_st("Đang vận chuyển"), badge("Sự cố mở", "danger", "triangle-alert", size=13), gap=6),
        text("Kho Cần Thơ → Kho Bình Dương", 18, 600),
        row(_meta("truck", "51C-123.45"), _meta("clock", "23/09 06:00 – 14:00"), gap=14),
        a("Đang gửi vị trí · cập nhật 13:42", "DA-GPS-01", "Trạng thái GPS của chuyến", 14),
        gap=6), pad=12)
    stops = m_section("Điểm lấy/trả", col(
        _stop_line(1, "pickup", "Kho Cần Thơ", "Lấy · xong 07:10", "Hoàn thành"),
        _stop_line(2, "drop", "Kho Bình Dương", "Trả · dự kiến 13:30", "Chưa đến", 12_500_000), gap=8),
        a("Xem tất cả", "DA-STOP-01", "Mở danh sách điểm dừng", 15, 600))
    cargo = m_card(col(row(icon("package", 18, T["text-muted"]), text("Gạo ST25 bao 50 kg · 160 bao · 8 tấn", 15, 500), gap=8),
                       row(icon("sticky-note", 18, T["warning"]), text("Tránh ẩm. Kho trả có xe nâng, giao giờ hành chính.", 14), gap=8, align="flex-start"),
                       gap=6), pad=12)
    def tile(ic, label, val, sub, tone, to, trig):
        return m_card(col(row(icon(ic, 18, TONES[tone][1]), muted(label, 13), gap=6), text(val, 15, 700, TONES[tone][1] if tone != "neutral" else None, NW),
                          muted(sub, 13), gap=2), to=to, trigger=trig, pad=10)
    rows_ = grid([tile("hand-coins", "COD cần thu", money(12_500_000), "Chưa nhập", "warning", "DA-COD-01", "Nhập COD"),
                  tile("camera", "Chứng từ/POD", "0 ảnh", "Thêm chứng từ", "neutral", "DA-ATT-01", "Upload chứng từ chuyến"),
                  tile("triangle-alert", "Sự cố", "Kẹt xe", "Đang mở · 10:42", "danger", "DA-INC-01", "Xem/báo sự cố")], 3, 8,
                 extra="grid-template-columns: 1.35fr 1fr 1fr;")
    body = col(head, stops, m_section("Hàng hóa & ghi chú", cargo), rows_, gap=10)
    sec = row(btn("Tạm dừng", "secondary", "pause", to="DA-STATUS-02", size="lg", full=True, trigger="Tạm dừng chuyến"),
              btn("Báo sự cố", "danger-outline", "triangle-alert", to="DA-INC-01", size="lg", full=True, trigger="Báo sự cố"), gap=8)
    bottom = primary_bottom_action("Đến điểm trả", "DA-STATUS-01", "map-pin", secondary=sec, trigger="Primary theo trạng thái: Đến điểm trả → xác nhận")
    header = mobile_header(TRIP, "DA-HOME-01", "Đơn DH-202609-0001 · Gạo Miền Tây",
                           right=icon_btn("list", "Danh sách điểm dừng", to="DA-STOP-01", size="lg", trigger="Mở danh sách điểm dừng"))
    return mobile_frame(header, body, bottom, overlay=overlay, body_gap=10)


def trip_01():
    return _trip_page()


# ---------------------------------------------------------------- DA-STOP-01 Stop list
def _stop_card_full(n, kind, place, addr, contact, phone, times, st_, cod=None, done=False):
    use("StopCard")
    num_ = (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; '
            f'background: {T["success"] if done else T["primary"]}; color: #FFFFFF; font-size: 15px; font-weight: 700; flex-shrink: 0;">'
            f'{icon("check", 18, "#FFFFFF", 3) if done else n}</span>')
    body = col(
        row(num_, _kind(kind), spacer(), _st(st_), gap=8),
        a(place, "DA-STOP-02", f"Mở chi tiết điểm {place}", 17, 600),
        text(addr, 15),
        row(icon("user", 16, T["text-muted"]), text(f"{contact} · {phone}", 15, 500, extra=NW), gap=6),
        row(icon("clock", 16, T["text-muted"]), muted(times, 14), gap=6),
        row(muted("COD cần thu", 14), spacer(), _money(cod, 17), gap=8) if cod else "",
        row(btn("Gọi", "secondary", "phone", size="lg", full=True), btn("Chỉ đường", "secondary", "navigation", size="lg", full=True), gap=8),
        gap=6)
    return m_card(body, extra=f"opacity: {0.85 if done else 1};")


def stop_01():
    body = col(
        row(text("1/2 điểm hoàn thành", 15, 600), spacer(), muted(TRIP, 14), gap=8),
        progress(50, "success", 6),
        _stop_card_full(1, "pickup", "Kho Cần Thơ", "KCN Trà Nóc 1, Bình Thủy, Cần Thơ", "Anh Nam", "0901 234 567",
                        "Dự kiến 06:30 · Đến 06:52 · Xong 07:10", "Hoàn thành", done=True),
        _stop_card_full(2, "drop", "Kho Bình Dương", "Số 12 ĐT743, Dĩ An, Bình Dương", "Chị Hạnh", "0902 345 678",
                        "Dự kiến 13:30", "Chưa đến", 12_500_000),
        gap=12)
    return mobile_frame(mobile_header("Điểm dừng", "DA-TRIP-01", f"{TRIP} · 2 điểm"), body,
                        primary_bottom_action("Mở điểm tiếp theo: Kho Bình Dương", "DA-STOP-02", "arrow-right", trigger="Mở điểm tiếp theo"))


# ---------------------------------------------------------------- DA-STOP-02 Stop detail
def stop_02():
    place = m_card(col(
        row(_kind("drop"), muted("Điểm 2/2", 14), spacer(), _st("Đã đến"), gap=8),
        text("Kho Bình Dương", 20, 700),
        text("Số 12 ĐT743, Dĩ An, Bình Dương", 17, 500),
        muted("Dự kiến 13:30 · Đã đến 13:05", 14),
        gap=2))
    contact = m_card(col(
        row(_icon_box("user", "neutral", 40), col(text("Chị Hạnh", 16, 600), text("0902 345 678", 17, 600, extra=NW), gap=0), gap=12),
        row(btn("Gọi", "secondary", "phone", size="lg", full=True), btn("Chỉ đường", "secondary", "navigation", size="lg", full=True), gap=8),
        gap=10))
    cod = m_card(col(
        row(col(muted("COD cần thu", 14), _money(12_500_000, 24), gap=0), spacer(),
            col(muted("Thực thu", 14), text("Chưa nhập", 16, 600, T["warning"]), gap=0, extra="align-items: flex-end;"), gap=8),
        btn("Nhập COD", "secondary", "hand-coins", to="DA-COD-01", size="lg", full=True, trigger="Nhập COD thực thu"),
        gap=10), extra=f"border-color: {T['warning']}66;")
    pod = m_card(col(
        row(col(text("POD / chứng từ", 16, 600), muted("Bắt buộc ít nhất 1 ảnh trước khi hoàn thành", 14), gap=0), spacer(),
            badge("0 ảnh", "warning", size=13), gap=8),
        btn("Chụp POD", "secondary", "camera", to="DA-POD-01", size="lg", full=True, trigger="Chụp POD"),
        gap=10))
    cargo = row(icon("package", 18, T["text-muted"]), text("Giao 160 bao gạo ST25 · 8 tấn · có xe nâng", 15), gap=8)
    body = col(place, contact, cod, pod, cargo,
               row(a("Báo sự cố tại điểm", "DA-INC-01", "Báo sự cố", 15), spacer(), muted("Bỏ qua điểm (cần lý do)", 15), gap=8), gap=10)
    return mobile_frame(mobile_header("Chi tiết điểm dừng", "DA-STOP-01", f"{TRIP} · Trả hàng"), body,
                        primary_bottom_action("Hoàn thành điểm", "DA-TRIP-01", "check", trigger="Hoàn thành điểm → về chuyến"), pad=12, body_gap=10)


# ---------------------------------------------------------------- DA-STATUS-01 Status update sheet
def status_01():
    body = col(
        _option("Đang trả hàng", "Đã đến điểm trả Kho Bình Dương", on=True),
        _option("Tạm dừng", "Giờ cấm tải, nghỉ đêm, chờ phà… (cần lý do)", to="DA-STATUS-02", trigger="Chọn Tạm dừng → chọn lý do"),
        row(icon("lock", 16, T["text-muted"]), muted("Không thể lùi trạng thái. Cần đổi ngược → liên hệ điều phối.", 13), gap=6),
        _field("Ghi chú", textarea("", "Không bắt buộc, ví dụ: đã gọi chị Hạnh ra nhận", 64, 15)),
        m_card(col(_kv("Giờ thực tế ghi nhận", "23/09/2026 13:05"), _kv("Vị trí", "Dĩ An, Bình Dương"), gap=4), pad=10,
               extra=f"background: {T['surface-muted']};"),
        gap=10)
    foot = row(btn("Hủy", "secondary", to="DA-TRIP-01", size="lg", full=True, trigger="Hủy → về chuyến"),
               btn("Xác nhận", "primary", "check", to="DA-STOP-02", size="lg", full=True, trigger="Xác nhận Đang trả hàng → mở điểm trả"), gap=8)
    sheet = bottom_sheet("Cập nhật trạng thái chuyến", body, foot, sub=f"{TRIP} · hiện tại: Đang vận chuyển")
    return _trip_page(overlay=(sheet, "bottom"))


# ---------------------------------------------------------------- DA-STATUS-02 Pause (ReasonBottomSheet)
def status_02():
    use("ReasonBottomSheet")
    reasons = ["Giờ cấm tải", "Nghỉ đêm", "Chờ phà", "Hư xe", "Kẹt xe", "Chờ bốc xếp"]
    body = col(
        banner(f'Tạm dừng chỉ đổi trạng thái chuyến, không tạo sự cố. Hư hỏng, tai nạn, mất hàng → {a("Báo sự cố", "DA-INC-01", "Chuyển sang báo sự cố", 13, 600)}.',
               "info"),
        _field("Lý do tạm dừng", grid([_chip(r, r == "Giờ cấm tải") for r in reasons], 2, 8), True),
        _field("Ghi chú", textarea("Cấm tải nội ô Dĩ An đến 16:00", "", 48, 15)),
        row(_add_tile(56, "Ảnh"), muted("Ảnh không bắt buộc", 14), gap=10),
        muted("Khi tiếp tục, chuyến quay lại trạng thái trước: Đang vận chuyển.", 13),
        gap=10)
    foot = row(btn("Hủy", "secondary", to="DA-TRIP-01", size="lg", full=True, trigger="Hủy → về chuyến"),
               btn("Xác nhận tạm dừng", "primary", "pause", to="DA-TRIP-01", size="lg", full=True, trigger="Xác nhận tạm dừng → chuyến Tạm dừng"), gap=8)
    sheet = bottom_sheet("Tạm dừng chuyến", body, foot, sub=f"{TRIP} · Đang vận chuyển")
    return _trip_page(overlay=(sheet, "bottom"))


# ---------------------------------------------------------------- DA-POD-01 POD capture
def pod_01():
    use("PodCapture")
    corner = lambda pos: f'<span style="position: absolute; {pos} width: 28px; height: 28px; border-color: #FFFFFF; border-style: solid; border-width: 0;"></span>'
    vf = (f'<div role="img" aria-label="Khung camera" style="position: relative; height: 230px; border-radius: 8px; background: #3A434D; '
          f'display: flex; align-items: center; justify-content: center; overflow: hidden;">'
          f'<span style="position: absolute; left: 16px; top: 16px; width: 28px; height: 28px; border-left: 3px solid #FFFFFF; border-top: 3px solid #FFFFFF;"></span>'
          f'<span style="position: absolute; right: 16px; top: 16px; width: 28px; height: 28px; border-right: 3px solid #FFFFFF; border-top: 3px solid #FFFFFF;"></span>'
          f'<span style="position: absolute; left: 16px; bottom: 16px; width: 28px; height: 28px; border-left: 3px solid #FFFFFF; border-bottom: 3px solid #FFFFFF;"></span>'
          f'<span style="position: absolute; right: 16px; bottom: 16px; width: 28px; height: 28px; border-right: 3px solid #FFFFFF; border-bottom: 3px solid #FFFFFF;"></span>'
          f'<span style="font-size: 15px; color: #FFFFFF; text-align: center;">Đặt phiếu giao hàng có chữ ký<br>vào trong khung</span></div>')
    shutter = (f'<span role="button" aria-label="Chụp ảnh" style="display: inline-flex; align-items: center; justify-content: center; width: 68px; height: 68px; '
               f'border-radius: 50%; border: 4px solid {T["primary"]}; box-sizing: border-box;"><span style="width: 52px; height: 52px; border-radius: 50%; '
               f'background: {T["primary"]};"></span></span>')
    controls = row(btn("Thư viện", "ghost", "image", size="lg"), spacer(), shutter, spacer(), btn("Chụp", "ghost", "camera", size="lg"), gap=4)
    shots = row(_thumb("done", "POD 1"), _thumb("uploading", "POD 2", 60), _thumb("failed", "POD 3"), _thumb("queued", "POD 4"), gap=10,
                justify="space-between")
    body = col(
        _seg(["POD", "Phiếu giao", "Biên nhận"], 0),
        vf, controls,
        row(text("Ảnh đã chụp (4)", 15, 600), spacer(), btn("Thử lại ảnh lỗi", "link", "rotate-ccw", size="md"), gap=8),
        shots,
        banner("Mất mạng vẫn chụp được: ảnh lưu trên máy và tự gửi khi có kết nối.", "info", "cloud-off"),
        gap=10)
    return mobile_frame(mobile_header("Chụp POD", "DA-STOP-02", "Gắn vào: Kho Bình Dương · " + TRIP), body,
                        primary_bottom_action("Xong · gắn 4 ảnh vào điểm trả", "DA-STOP-02", "check", trigger="Lưu POD → về điểm dừng"), pad=12, body_gap=10)


# ---------------------------------------------------------------- DA-COD-01 COD input (+ confirm sheet when differs)
def cod_01():
    form = col(
        m_card(row(col(muted("COD dự kiến", 14), _money(12_500_000, 20), gap=0), spacer(), badge("Kho Bình Dương", "primary", "map-pin", size=13), gap=8)),
        _field("Số thực thu", money_input(12_000_000, h=64, fs=28), True),
        row(btn("Bằng số dự kiến", "secondary", size="lg"), muted("Chênh −500.000 đ", 15), gap=12),
        _field("Ghi chú", textarea("Khách trừ phí bốc xếp", "", 48, 15)),
        gap=12)
    sheet_body = col(
        m_card(col(_kv("COD dự kiến", money(12_500_000)), _kv("Thực thu", money(12_000_000)), divider(2),
                   _kv("Chênh lệch", "−" + money(500_000), T["danger"], 17), gap=6), pad=12, extra=f"background: {T['surface-muted']};"),
        _field("Lý do chênh lệch", textarea("Khách trừ 500.000 đ phí bốc xếp, đã báo điều phối", "", 56, 15), True),
        row(_add_tile(56, "Ảnh"), muted("Ảnh biên nhận (không bắt buộc)", 14), gap=10),
        muted("Sau khi lưu, sửa COD phải nhập lý do và hiện số cũ/số mới.", 13),
        gap=10)
    foot = row(btn("Sửa lại", "secondary", size="lg", full=True),
               btn("Xác nhận lưu COD", "primary", "check", to="DA-STOP-02", size="lg", full=True, trigger="Xác nhận COD khác dự kiến → về điểm dừng"), gap=8)
    sheet = bottom_sheet("Số thực thu khác dự kiến", sheet_body, foot, sub="Kiểm tra lại trước khi lưu")
    return mobile_frame(mobile_header("Nhập COD thực thu", "DA-STOP-02", "Kho Bình Dương · " + TRIP), form,
                        primary_bottom_action("Lưu COD", None, "check"), overlay=(sheet, "bottom"))


# ---------------------------------------------------------------- DA-INC-01 Incident report
def inc_01():
    sev = row(*[_chip(s, s == "Trung bình") for s in ["Thấp", "Trung bình", "Cao"]], gap=8,
              extra="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));")
    body = col(
        _field("Loại sự cố", select("Kẹt xe / đường bị chặn", h=48, fs=16), True),
        _field("Mức độ", sev, True),
        _field("Mô tả", textarea("Kẹt xe QL1A đoạn Tân An do tai nạn phía trước, dự kiến trễ khoảng 1 giờ.", "", 80, 15), True),
        _field("Ảnh / chứng từ", row(_thumb("done", "Ảnh sự cố 1", size=72), _thumb("queued", "Ảnh sự cố 2", size=72), _add_tile(72), gap=10)),
        row(a("Đính kèm chứng từ khác", "DA-ATT-01", "Đính kèm chứng từ khác", 15), spacer(),
            a("Chỉ cần tạm dừng?", "DA-STATUS-02", "Chỉ tạm dừng chuyến", 15), gap=8, extra="min-height: 32px;"),
        banner("Lưu offline được: mất mạng vẫn gửi được, sự cố tự đồng bộ khi có kết nối.", "info", "cloud-off"),
        gap=12)
    return mobile_frame(mobile_header("Báo sự cố", "DA-TRIP-01", TRIP + " · gửi cho điều phối"), body,
                        primary_bottom_action("Gửi sự cố", "DA-TRIP-01", "send", trigger="Gửi sự cố → về chuyến"))


# ---------------------------------------------------------------- DA-ATT-01 Attachment upload
def att_01():
    kinds = ["POD", "Phiếu giao hàng", "Biên nhận", "Hóa đơn phí", "Ảnh sự cố", "Khác"]

    def file_row(name, meta, state, pct=None):
        tone, lab = {"done": ("success", "Đã tải lên"), "up": ("info", f"Đang tải {pct}%"), "fail": ("danger", "Lỗi")}[state]
        right = btn("Thử lại", "secondary", "rotate-ccw", size="lg") if state == "fail" else badge(lab, tone, size=13)
        return row(_icon_box("file-text" if name.endswith(".pdf") else "image", tone, 44),
                   col(text(name, 15, 500, extra="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"), muted(meta, 13),
                       progress(pct, "info", 4) if state == "up" else "", gap=2, extra="flex: 1; min-width: 0;"),
                   right, gap=10, extra=f"padding: 8px 0; border-bottom: 1px solid {T['border']};")
    body = col(
        _field("Gắn vào", select("Điểm trả · Kho Bình Dương", h=48, fs=16), True, "Chuyến " + TRIP + " · DH-202609-0001"),
        _field("Loại chứng từ", grid([_chip(k, k == "Hóa đơn phí") for k in kinds], 2, 8), True),
        grid([btn("Chụp ảnh", "secondary", "camera", size="lg", full=True), btn("Thư viện", "secondary", "image", size="lg", full=True),
              btn("Tệp PDF", "secondary", "file-up", size="lg", full=True)], 3, 8),
        col(file_row("bien-nhan-phi-cau-duong.jpg", "1,2 MB · 12:48", "done"),
            file_row("phieu-can-xe-2309.jpg", "2,4 MB · 13:10", "up", 45),
            file_row("phieu-xuat-kho.pdf", "Mất kết nối · 13:12", "fail"), gap=0),
        gap=12)
    return mobile_frame(mobile_header("Upload chứng từ", "DA-TRIP-01", TRIP), body,
                        primary_bottom_action("Lưu chứng từ", "DA-TRIP-01", "check", trigger="Lưu chứng từ → về chuyến"))


# ---------------------------------------------------------------- DA-GPS-01 GPS permission/status
def gps_01():
    body = col(
        banner("Chuyến " + TRIP + " không gửi được vị trí cho điều phối. Bật lại để tiếp tục theo dõi.", "danger", "circle-alert",
               title="Quyền vị trí nền đang tắt."),
        m_section("Quyền trên máy", col(
            _perm("map-pin", "Quyền vị trí", "Chỉ khi dùng app", "danger", "Cần: Luôn cho phép"),
            _perm("locate-fixed", "Vị trí chính xác", "Đang bật", "success"),
            _perm("smartphone", "Tối ưu pin", "Đang hạn chế", "warning", "Tắt để app gửi vị trí nền"), gap=0,
            extra=f"border: 1px solid {T['border']}; border-radius: 8px; overflow: hidden;")),
        m_section("Theo dõi chuyến", m_card(col(
            row(text(TRIP, 15, 600, extra=NW), spacer(), badge("Tracking tạm ngưng", "danger", "pause", size=13), gap=8),
            _kv("Gửi vị trí gần nhất", "23/09 13:42"),
            _kv("Điểm GPS chờ gửi", "12 điểm", T["warning"]),
            gap=6), to="DA-TRIP-01", trigger="Mở chuyến đang chạy", pad=12)),
        a("Xem hàng đợi GPS trong Đồng bộ", "DA-SYNC-01", "Mở hàng đợi GPS", 15),
        m_card(col(text("Khi nào app theo dõi vị trí?", 15, 600),
                   muted("Chỉ khi có chuyến đang chạy — từ lúc bắt đầu đi lấy đến khi hoàn thành chuyến. Ngoài chuyến, app không lấy vị trí.", 14),
                   gap=4), pad=12, extra=f"background: {T['surface-muted']};"),
        gap=12)
    return mobile_frame(mobile_header("Vị trí & GPS", "DA-PROFILE-01", "Theo dõi vị trí nền", right=icon_btn("refresh-cw", "Kiểm tra lại", size="lg")),
                        body, primary_bottom_action("Mở cài đặt vị trí", None, "settings"))


def _perm(ic, label, val, tone, sub=None):
    return row(icon(ic, 22, T["text-muted"]), col(text(label, 16, 500), muted(sub, 13) if sub else "", gap=0), spacer(),
               badge(val, tone, size=13), gap=12,
               extra=f"padding: 12px 16px; min-height: 56px; box-sizing: border-box; background: {T['surface']}; border-bottom: 1px solid {T['border']};")


# ---------------------------------------------------------------- DA-SYNC-01 Offline sync queue
def sync_01():
    use("SyncQueue")

    def item(ic, title, sub, state, to, trig, err=None):
        tone, lab = {"pending": ("warning", "Chờ gửi"), "failed": ("danger", "Lỗi"), "done": ("success", "Đã gửi")}[state]
        head = row(_icon_box(ic, tone, 40), col(text(title, 15, 600), muted(sub, 13), gap=0, extra="flex: 1; min-width: 0;"),
                   badge(lab, tone, size=13), gap=10)
        extra = ""
        if err:
            extra = row(icon("circle-alert", 16, T["danger"]), text(err, 13, 500, T["danger"]), spacer(),
                        btn("Thử lại", "secondary", "rotate-ccw", size="lg"), gap=6)
        inner = col(a_wrap(head, to, trig), extra, gap=8)
        return (f'<div style="padding: 10px 12px; border-bottom: 1px solid {T["border"]}; background: {T["surface"]};">{inner}</div>')
    queue = (f'<div style="border: 1px solid {T["border"]}; border-radius: 8px; overflow: hidden;">'
             + item("route", "Trạng thái: Đang trả hàng", TRIP + " · 13:05", "pending", "DA-TRIP-01", "Mở chuyến của mục trạng thái")
             + item("hand-coins", "COD thực thu 12.000.000 đ", "Kho Bình Dương · 13:12", "pending", "DA-COD-01", "Mở COD đã nhập")
             + item("camera", "Ảnh POD (4 ảnh)", "Kho Bình Dương · 13:15", "failed", "DA-POD-01", "Mở POD lỗi",
                    "Tải lên thất bại (lần 2)")
             + item("locate-fixed", "GPS · 12 điểm", "12:50 – 13:42", "pending", "DA-GPS-01", "Mở trạng thái GPS")
             + item("triangle-alert", "Sự cố: Kẹt xe", "Gửi lúc 10:43", "done", "DA-INC-01", "Mở sự cố đã gửi")
             + '</div>')
    body = col(
        _offline_banner(4),
        row(text("4 mục chờ · 1 lỗi", 16, 600), spacer(), muted("Lần thử cuối 13:44", 14), gap=8),
        queue,
        muted("Dữ liệu được gửi theo đúng thứ tự ghi nhận. Không gỡ app hoặc đăng xuất khi còn mục chờ.", 14),
        gap=12)
    return mobile_frame(mobile_header("Đồng bộ dữ liệu", "DA-PROFILE-01", "Hàng đợi trên máy"), body,
                        primary_bottom_action("Thử lại tất cả", None, "refresh-cw"))


def a_wrap(inner, to, trigger):
    edge(to, trigger)
    return f'<a href="{href(to)}" style="display: block; text-decoration: none; color: inherit;">{inner}</a>'


# ---------------------------------------------------------------- DA-NOTI-01 Notifications
def noti_01():
    use("NotificationItem")

    def n(ic, tone, title, sub, t, to, trig, unread=False):
        dot = f'<span style="width: 8px; height: 8px; border-radius: 50%; background: {T["accent"]}; flex-shrink: 0; margin-top: 8px;"></span>' if unread else '<span style="width: 8px;"></span>'
        inner = row(_icon_box(ic, tone, 40), col(text(title, 15, 600 if unread else 500), muted(sub, 14), subtle(t, 13), gap=0, extra="flex: 1; min-width: 0;"),
                    dot, gap=10, align="flex-start")
        edge(to, trig)
        return (f'<a href="{href(to)}" style="display: block; padding: 12px 14px; text-decoration: none; border-bottom: 1px solid {T["border"]}; '
                f'background: {T["accent-soft"] if unread else T["surface"]};">{inner}</a>')
    lst = (f'<div style="border: 1px solid {T["border"]}; border-radius: 8px; overflow: hidden;">'
           + n("truck", "primary", "Chuyến mới: CX-202609-0002", "Long An → Quận 7 · 15:00 hôm nay", "09:20", "DA-TRIP-01", "Mở chuyến mới được giao", True)
           + n("camera", "warning", "Yêu cầu bổ sung POD", "Điều phối cần ảnh phiếu giao tại Kho Bình Dương", "13:20", "DA-STOP-02", "Mở điểm dừng cần xử lý", True)
           + n("hand-coins", "warning", "Nhắc COD", "Thu 12.500.000 đ tại Kho Bình Dương, nộp trong 2 ngày", "12:00", "DA-MONEY-01", "Mở khoản COD", True)
           + n("clock", "info", "Thay đổi chuyến " + TRIP, "Giờ trả dự kiến đổi 13:00 → 13:30", "11:05", "DA-TRIP-01", "Mở chuyến thay đổi")
           + n("triangle-alert", "neutral", "Điều phối đã nhận sự cố Kẹt xe", "Lê Thu Vân: cứ chạy tiếp, đã báo khách", "10:50", "DA-TRIP-01", "Mở chuyến có sự cố")
           + '</div>')
    body = col(_seg(["Tất cả", "Chưa đọc (3)"], 0), row(text("Hôm nay", 15, 600), gap=0), lst, gap=12)
    header = mobile_header("Thông báo", right=btn("Đọc hết", "link", "check", size="lg"))
    return mobile_frame(header, body, _nav(2))


# ---------------------------------------------------------------- DA-MONEY-01 Driver wallet
def money_01():
    use("DriverWallet")

    def tile(label, v, sub, tone=None):
        return m_card(col(muted(label, 14), _money(v, 18, TONES[tone][1] if tone else None), muted(sub, 13), gap=0), pad=12)
    tiles = grid([tile("Thưởng chuyến", 1_500_000, "3 chuyến tháng 9", "success"), tile("Tạm ứng chuyến", 2_000_000, "Chờ đối soát", "warning"),
                  tile("Ứng lương", 0, "Chưa có khoản ứng"), tile("COD đang giữ", 0, "Chưa thu hôm nay")], 2, 8)

    def line(left, sub, right, rtone=None, to=None, trig=None):
        inner = row(col(left, muted(sub, 13), gap=0, extra="flex: 1; min-width: 0;"), text(right, 15, 600, TONES[rtone][1] if rtone else None, NUM + " white-space: nowrap;"),
                    icon("chevron-right", 18, T["text-subtle"]) if to else "", gap=8)
        css = f"display: block; padding: 10px 14px; min-height: 52px; box-sizing: border-box; border-bottom: 1px solid {T['border']}; background: {T['surface']}; text-decoration: none; color: inherit;"
        if to:
            edge(to, trig)
            return f'<a href="{href(to)}" style="{css}">{inner}</a>'
        return f'<div style="{css}">{inner}</div>'
    box = lambda *ls: f'<div style="border: 1px solid {T["border"]}; border-radius: 8px; overflow: hidden;">{"".join(ls)}</div>'
    body = col(
        tiles,
        banner("Công ty cần hoàn cho bạn <b>800.000 đ</b> phí cầu đường chi trước (PC-202609-0001).", "info", "wallet"),
        m_section("Thưởng theo chuyến", box(
            line(text(TRIP, 15, 600, extra=NW), "Đang chạy · tạm tính", "+" + money(500_000), "success", "DA-TRIP-01", "Mở chuyến có thưởng"),
            line(text("2 chuyến đã hoàn thành", 15, 500), "CX-202609-0008, CX-202609-0009", "+" + money(1_000_000), "success", "DA-HIST-01", "Xem lịch sử chuyến"))),
        m_section("Tạm ứng & COD", box(
            line(text("Tạm ứng chuyến " + TRIP, 15, 500), "PC-202609-0004 · 22/09/2026", money(2_000_000), "warning"),
            line(text("Nộp COD cho kế toán", 15, 500), "PT-202608-0014 · 28/08/2026 · Đã xác nhận", money(20_000_000)))),
        muted("Chỉ hiện các khoản của bạn. Số chính thức theo bảng lương đã duyệt.", 13),
        gap=12)
    return mobile_frame(mobile_header("Thưởng & khoản ứng", "DA-PROFILE-01", "Tháng 09/2026 · Nguyễn Văn Tài"), body)


# ---------------------------------------------------------------- DA-HIST-01 Trip history
def hist_01():
    def h_card(code_, date_, route, st_, pod, cod, bonus):
        use("TripCard")
        return m_card(col(
            row(text(code_, 15, 600, extra=NW), spacer(), _st(st_), gap=8),
            text(route, 16, 600),
            row(_meta("calendar", date_), _meta("camera", pod), gap=14),
            row(muted(cod, 14), spacer(), text(bonus, 15, 600, T["success"] if bonus.startswith("+") else T["text-muted"], NUM), gap=8),
            gap=4), to="DA-TRIP-01", trigger=f"Mở chuyến {code_} (chỉ xem)", pad=12)
    body = col(
        _seg(["Tháng 9", "Tháng 8", "Tháng 7"], 0),
        row(text("2 hoàn thành · 1 đã hủy", 15, 600), spacer(), text("Thưởng " + money(1_000_000), 15, 600, T["success"], NUM), gap=8),
        h_card("CX-202609-0009", "19/09/2026", "Bao bì Hưng Lợi → Quận 12", "Hoàn thành", "2 ảnh POD", "Không thu COD", "+" + money(500_000)),
        h_card("CX-202609-0008", "16/09/2026", "Kho Cần Thơ → Quận Bình Tân", "Hoàn thành", "3 ảnh POD", "COD 15.000.000 đ · đã nộp", "+" + money(500_000)),
        h_card("CX-202609-0007", "05/09/2026", "Nhà máy Long An → Quận 9", "Đã hủy", "0 ảnh", "Hủy bởi điều phối", "Không thưởng"),
        gap=10)
    return mobile_frame(mobile_header("Lịch sử chuyến", "DA-PROFILE-01", "Chuyến đã hoàn thành/hủy"), body)


# ---------------------------------------------------------------- DA-PROFILE-01 Profile
def profile_01():
    card = m_card(row(avatar("NT", 56, "primary"),
                      col(text("Nguyễn Văn Tài", 18, 600), text("0900 000 001", 16, 500, extra=NW), muted("DRV-A-001 · BTA Demo Transport", 13), gap=0),
                      gap=14), pad=16)
    info = m_card(col(_kv("Xe thường chạy", "51C-123.45"), _kv("Trạng thái", "Hoạt động", T["success"]), gap=6), pad=12)
    group = lambda *rs: f'<div style="border: 1px solid {T["border"]}; border-radius: 8px; overflow: hidden;">{"".join(rs)}</div>'
    body = col(
        card, info,
        group(list_row("wallet", "Thưởng & khoản ứng của tôi", to="DA-MONEY-01"),
              list_row("history", "Lịch sử chuyến", to="DA-HIST-01"),
              list_row("refresh-cw", "Đồng bộ dữ liệu", "2 chờ", to="DA-SYNC-01"),
              list_row("locate-fixed", "Vị trí & GPS", "Thiếu quyền", to="DA-GPS-01")),
        group(list_row("key", "Đổi mật khẩu", sub="Tùy phương thức đăng nhập (chờ chốt)"),
              list_row("log-out", "Đăng xuất", to="DA-AUTH-02", danger=True, sub="Còn 2 mục chưa đồng bộ", trigger="Đăng xuất → Đăng nhập")),
        subtle("BTA Tài xế 1.0.0 · phase 1", 13),
        gap=12)
    return mobile_frame(mobile_header("Tài khoản"), body, _nav(3))


# ---------------------------------------------------------------- register
M_AUTH, M_HOME, M_TRIP, M_ACT, M_SYNC, M_ACC = ("Đăng nhập", "Hôm nay & lịch chuyến", "Chuyến & điểm dừng",
                                                "Trạng thái · POD · COD · Sự cố", "Đồng bộ & GPS", "Tài khoản & tiền")
C = dict(platform="da", roles=ROLES, w=W, h=H)
OFFLINE = "Hiển thị dữ liệu cache gần nhất + OfflineBanner; thao tác ghi vào hàng đợi (DA-SYNC-01)."

register(
    Screen(id="DA-AUTH-01", name="Splash/kiểm tra phiên", module=M_AUTH, route="DriverSplashRoute", render=auth_01, pattern="auth", **C,
           purpose="Khởi động app: kiểm tra phiên đăng nhập, số mục offline chờ đồng bộ; tự chuyển Home hoặc Login.",
           api=["driverMe"],
           data=["session.token", "driver.name", "merchant.name", "syncQueue.pendingCount"],
           actions=[("Tự động → DA-HOME-01", "phiên hợp lệ, driver active"), ("Tự động → DA-AUTH-02", "chưa đăng nhập / hết hạn / driver inactive")],
           states={"loading": "Logo + progress, tối đa ~3 giây rồi điều hướng", "offline": "Có token cache → vào Home với dữ liệu cache; không token → Login",
                   "error": "Token bị thu hồi → Login với thông báo 'Phiên đã hết hạn'"},
           notes=["Không hiện status bar giả; Flutter splash native + màn Flutter kiểm tra phiên.",
                  "Nếu còn mục chờ đồng bộ thì giữ nguyên hàng đợi, không xóa khi phiên hết hạn."]),
    Screen(id="DA-AUTH-02", name="Đăng nhập tài xế", module=M_AUTH, route="DriverLoginRoute", render=auth_02, pattern="auth", **C,
           purpose="Tài xế đăng nhập bằng tài khoản do nhà xe cấp (SĐT + mật khẩu hoặc OTP).",
           api=["driverLogin(phone, password) | requestDriverOtp(phone) + verifyDriverOtp(phone, code) — chờ chốt auth", "driverMe"],
           data=["phone", "password | otp", "rememberDevice"],
           actions=[("Đăng nhập", "driver account active"), ("Quên mật khẩu", "public")],
           states={"validation": "SĐT sai định dạng → lỗi inline dưới field", "error": "Sai mật khẩu / tài khoản bị khóa → Banner danger, không nói rõ trường nào sai",
                   "loading": "Nút Đăng nhập loading, disable form", "offline": "Banner 'Cần có mạng để đăng nhập lần đầu'"},
           notes=["PENDING DECISION: phương thức đăng nhập tài xế (mật khẩu hay OTP) chưa chốt — 04-handoff-readiness-review 'Cần chốt driver auth'. UI giữ tab Mật khẩu | Mã OTP; bỏ tab không dùng khi chốt.",
                  "Web Merchant dùng Google login (D-006) — không áp dụng cho tài xế.", "Tài khoản tạo/reset từ WM-DRV-02 (createOrResetDriverAccount)."]),
    Screen(id="DA-AUTH-03", name="Quên mật khẩu", module=M_AUTH, route="DriverForgotPasswordRoute", render=auth_03, pattern="auth", **C,
           purpose="Khôi phục mật khẩu qua SĐT + mã xác thực; hoặc nhờ nhà xe đặt lại.",
           api=["requestDriverPasswordReset(phone)", "verifyDriverOtp(phone, code)", "resetDriverPassword(token, newPassword) — chờ chốt auth"],
           data=["phone", "otp", "newPassword", "resendCountdown"],
           actions=[("Xác nhận & đặt lại mật khẩu", "public, OTP hợp lệ"), ("Quay lại đăng nhập", "public")],
           states={"error": "Mã sai/hết hạn → lỗi inline dưới ô mã", "loading": "Nút primary loading"},
           notes=["Stepper 3 bước: SĐT → mã → mật khẩu mới. Nếu chốt OTP-only thì màn này không cần (chỉ còn 'liên hệ nhà xe').",
                  "OTP input 6 ô, tự nhảy ô, dán được."]),
    Screen(id="DA-HOME-01", name="Trang chủ công việc", module=M_HOME, route="DriverHomeRoute", render=home_01, pattern="mobile", **C,
           purpose="Mở app là biết nên làm gì: chuyến đang chạy/tiếp theo, trạng thái đồng bộ, cảnh báo COD, chuyến hôm nay.",
           api=["driverMe", "driverJobs(filter: {date: today})", "local: syncQueue.count"],
           data=["activeTrip{code, status, route, vehicle, plannedWindow, nextStop, codExpected, openIncident}", "todayTrips[]", "codReminder", "syncStatus", "unreadNotifications"],
           actions=[("Mở chuyến đang chạy", "own trip"), ("Xem tất cả chuyến", "driver"), ("Mở hàng đợi đồng bộ", "driver")],
           states={"empty": "Không có chuyến hôm nay → EmptyState 'Hôm nay chưa có chuyến' + chuyến sắp tới gần nhất",
                   "loading": "Skeleton TripCard", "offline": OFFLINE, "error": "Banner danger + Thử lại"},
           notes=["Primary: có chuyến đang chạy → 'Mở chuyến đang chạy'; chỉ có chuyến sắp tới → 'Xem chuyến'.",
                  "Không có nút nhận việc (phase 1: điều phối giao là tài xế nhận).", "Pull-to-refresh."]),
    Screen(id="DA-JOB-01", name="Danh sách chuyến", module=M_HOME, route="DriverJobListRoute", render=job_01, pattern="list", **C,
           purpose="Danh sách chuyến được giao theo ngày/trạng thái, filter đơn giản.",
           api=["driverJobs(filter: {bucket: TODAY|UPCOMING|RUNNING|DONE})"],
           data=["code", "routeSummary", "plannedWindow", "status", "vehicle.plate", "codExpected", "pendingSyncCount"],
           actions=[("Mở chuyến", "own trip"), ("Xem lịch", "driver")],
           states={"empty": "EmptyState theo filter, ví dụ 'Không có chuyến sắp tới'", "loading": "Skeleton TripCard ×3", "offline": OFFLINE},
           notes=["Filter: Hôm nay · Sắp tới · Đang chạy · Hoàn thành (SegmentedControl 48dp). Không filter phức tạp.",
                  "Không có nút 'nhận việc'.", "Badge sync khi chuyến có mục chờ gửi."]),
    Screen(id="DA-JOB-02", name="Lịch chuyến", module=M_HOME, route="DriverJobCalendarRoute", render=job_02, pattern="mobile", **C,
           purpose="Xem công việc theo lịch tháng/tuần; chọn ngày → danh sách chuyến ngày đó.",
           api=["driverJobs(filter: {from, to})"],
           data=["daysWithTrips{date, statuses[]}", "selectedDay.trips[]"],
           actions=[("Chọn ngày", "driver"), ("Mở chuyến", "own trip")],
           states={"empty": "Ngày không có chuyến → 'Không có chuyến ngày này'", "loading": "Calendar skeleton"},
           notes=["Chấm màu theo trạng thái chuyến trong ngày (accent đang chạy, neutral sắp tới, success hoàn thành, danger hủy).",
                  "Ô ngày 48dp; mặc định chọn hôm nay."]),
    Screen(id="DA-TRIP-01", name="Chi tiết chuyến", module=M_TRIP, route="DriverTripDetailRoute(tripId)", render=trip_01, pattern="detail", **C,
           purpose="Xem chuyến: điểm lấy/trả, hàng, ghi chú, COD, chứng từ, sự cố; hành động chính theo trạng thái.",
           api=["driverTrip(id)"],
           data=["code", "status", "order.code", "route", "vehicle.plate", "plannedWindow", "stops[]", "cargoLines[]", "notes", "codExpected", "attachments.count", "incidents[]", "gps.lastSentAt"],
           actions=[("Primary theo trạng thái", "trip.status own: Đã lên lịch→Bắt đầu đi lấy; Đang đến điểm lấy→Đã đến điểm lấy; Đang lấy hàng→Bắt đầu vận chuyển; Đang vận chuyển→Đến điểm trả; Đang trả hàng→Hoàn thành điểm/chuyến; Tạm dừng→Tiếp tục chuyến"),
                    ("Tạm dừng", "Pause own trip with reason"), ("Báo sự cố", "Report incident own trip"), ("Nhập COD / Upload chứng từ", "own stop")],
           states={"loading": "Skeleton header + sections", "offline": "Mở được chuyến đã cache; thao tác vào hàng đợi",
                   "error": "Chuyến không thuộc tài xế → 'Bạn không có quyền xem chuyến này' + về Home",
                   "readonly": "Chuyến Hoàn thành/Đã hủy (mở từ lịch sử) → ẩn PrimaryBottomAction, chỉ xem"},
           notes=["Header: mã, trạng thái, tuyến, xe, giờ dự kiến. Sections: Điểm lấy/trả (StopCard) · Hàng hóa/ghi chú · COD · Chứng từ/POD · Sự cố.",
                  "Tạm dừng (trạng thái) ≠ Sự cố (bản ghi riêng) — 2 nút tách biệt.", "Tài xế không xem/cập nhật chuyến của tài xế khác."]),
    Screen(id="DA-STOP-01", name="Danh sách điểm dừng", module=M_TRIP, route="DriverStopListRoute(tripId)", render=stop_01, pattern="list", **C,
           purpose="Stops theo thứ tự với loại lấy/trả, địa chỉ, liên hệ, COD, trạng thái; gọi/chỉ đường nhanh.",
           api=["driverTrip(id){stops}"],
           data=["sequence", "type", "location.name", "location.address", "contact.name", "contact.phone", "plannedAt", "arrivedAt", "completedAt", "codExpected", "status"],
           actions=[("Mở điểm dừng", "own trip"), ("Gọi", "tel: contact.phone"), ("Chỉ đường", "mở app bản đồ theo lat/lng")],
           states={"offline": OFFLINE},
           notes=["Stop status: Chưa đến · Đã đến · Hoàn thành · Bỏ qua.", "Gọi/Chỉ đường dùng url_launcher (tel:/geo:)."]),
    Screen(id="DA-STOP-02", name="Chi tiết điểm dừng", module=M_TRIP, route="DriverStopDetailRoute(stopId)", render=stop_02, pattern="detail", **C,
           purpose="Tại điểm: địa chỉ lớn, liên hệ, COD, POD, giờ thực tế; đánh dấu đã đến/hoàn thành/bỏ qua.",
           api=["driverTrip(id){stop}", "driverUpdateStopStatus(input: {stopId, status, reason?, idempotencyKey})"],
           data=["type", "sequence", "location", "contact", "cargoSummary", "codExpected", "codActual", "podCount", "plannedAt", "arrivedAt"],
           actions=[("Đã đến", "Update own stop status"), ("Hoàn thành điểm", "Update own stop status; điểm trả cần ≥1 POD, COD đã nhập nếu có COD dự kiến"),
                    ("Bỏ qua điểm", "reason required (ReasonBottomSheet)"), ("Nhập COD", "Enter COD own stop"), ("Chụp POD", "Upload POD own trip"), ("Gọi / Chỉ đường", "driver")],
           states={"offline": OFFLINE, "validation": "Hoàn thành khi thiếu POD/COD → inline danger 'Cần chụp POD trước khi hoàn thành'"},
           notes=["Mockup ở thời điểm đã đến điểm trả (13:05), chưa nhập COD/POD.", "Địa chỉ 17px, COD 24px — đọc được ngoài trời."]),
    Screen(id="DA-STATUS-01", name="Cập nhật trạng thái chuyến", module=M_ACT, route="DriverStatusUpdateRoute(tripId)", render=status_01, pattern="dialog",
           overlay_of="DA-TRIP-01", **C,
           purpose="Bottom sheet chọn trạng thái hợp lệ tiếp theo, ghi chú, lưu giờ thực tế.",
           api=["driverUpdateTripStatus(input: {tripId, status, note?, reason?, idempotencyKey})"],
           data=["currentStatus", "allowedNextStatuses[]", "note", "actualAt", "lastLocation"],
           actions=[("Xác nhận", "Update own trip status"), ("Chọn Tạm dừng", "→ DA-STATUS-02 (reason required)")],
           states={"offline": "Lưu vào hàng đợi với idempotencyKey + actualAt tại máy; UI cập nhật lạc quan, badge 'chờ gửi'",
                   "error": "Server từ chối (trạng thái đã đổi từ web) → Banner danger + tải lại chuyến"},
           notes=["Chỉ hiện trạng thái hợp lệ tiếp theo; không cho lùi trạng thái (đổi ngược = operation, sensitive).",
                  "Mỗi lần đổi tạo status_history (actor = driver)."]),
    Screen(id="DA-STATUS-02", name="Tạm dừng chuyến", module=M_ACT, route="DriverPauseTripRoute(tripId)", render=status_02, pattern="dialog",
           overlay_of="DA-TRIP-01", **C,
           purpose="ReasonBottomSheet: đặt chuyến Tạm dừng với lý do từ danh mục, ghi chú, ảnh tùy chọn.",
           api=["catalogItems(type: PAUSE_REASON)", "driverUpdateTripStatus(input: {status: PAUSED, reason, note, attachments?})"],
           data=["reasonCode", "note", "photo?", "previousStatus"],
           actions=[("Xác nhận tạm dừng", "Pause own trip with reason — reason required"), ("Báo sự cố", "chuyển sang DA-INC-01")],
           states={"validation": "Chưa chọn lý do → nút Xác nhận disabled", "offline": "Vào hàng đợi"},
           notes=["Lý do: giờ cấm tải, nghỉ đêm, chờ phà, hư xe, kẹt xe, chờ bốc xếp.",
                  "Tạm dừng là trạng thái trip, KHÔNG tạo incident. Tiếp tục → quay về previousStatus (Đang vận chuyển)."]),
    Screen(id="DA-POD-01", name="Chụp POD", module=M_ACT, route="DriverPodCaptureRoute(stopId)", render=pod_01, pattern="mobile", **C,
           purpose="Chụp/chọn nhiều ảnh POD, xem trạng thái upload, retry; gắn đúng điểm trả.",
           api=["POST /uploads/presign", "POST /uploads/confirm (category: POD, entity: ORDER_STOP)"],
           data=["stopId", "category", "photos[{localPath, status: uploaded|uploading|failed|queued, progress}]"],
           actions=[("Chụp / Thư viện", "Upload POD own trip"), ("Thử lại", "driver"), ("Xong", "gắn ảnh vào stop")],
           states={"offline": "Ảnh lưu local, trạng thái 'Chờ mạng', tự upload khi có kết nối", "error": "Thumbnail viền danger + Thử lại",
                   "permission": "Chưa cấp quyền camera → màn giải thích + mở cài đặt"},
           notes=["Nén ảnh trước khi upload (≤ 10 MB).", "POD không được gắn nhầm stop: stopId cố định từ route."]),
    Screen(id="DA-COD-01", name="Nhập COD thực thu", module=M_ACT, route="DriverCodInputRoute(stopId)", render=cod_01, pattern="form", **C,
           purpose="Ghi COD thực thu tại điểm; xác nhận khi khác dự kiến; sửa sau khi lưu phải có lý do (audit).",
           api=["driverSubmitCod(input: {stopId, amount, note, reason?, attachments?})"],
           data=["codExpected", "codActual", "note", "diffReason", "receiptPhoto?", "previousAmount (edit)"],
           actions=[("Lưu COD", "Enter COD actual for own stop"), ("Xác nhận lưu COD khác dự kiến", "reason required"),
                    ("Sửa COD đã lưu", "⚠️ reason required; backend may restrict by time/status")],
           states={"confirm": "Thực thu ≠ dự kiến → bottom sheet so sánh + lý do bắt buộc (mockup)",
                   "edit": "Sửa sau khi lưu: hiện diff Số cũ → Số mới (AuditDiff) + lý do bắt buộc, gửi audit",
                   "offline": "Vào hàng đợi; COD đang giữ cập nhật khi đồng bộ", "validation": "Số âm/rỗng → lỗi inline"},
           notes=["MoneyInput số nguyên VND, bàn phím số, font 28px.", "COD thực thu tăng 'COD đang giữ' của tài xế; nộp lại cho kế toán KHÔNG phải doanh thu.",
                  "Sửa COD 12.000.000 → 11.500.000 không có lý do bị reject (DRV-ACT-003)."]),
    Screen(id="DA-INC-01", name="Báo sự cố", module=M_ACT, route="DriverIncidentReportRoute(tripId)", render=inc_01, pattern="form", **C,
           purpose="Gửi sự cố (loại, mức độ, mô tả, ảnh) cho operation; lưu offline được.",
           api=["catalogItems(type: INCIDENT_TYPE)", "driverReportIncident(input: {tripId, orderId, type, severity, description, attachmentIds})", "POST /uploads/presign"],
           data=["type", "severity: LOW|MEDIUM|HIGH", "description", "attachments[]"],
           actions=[("Gửi sự cố", "Report incident for own trip"), ("Đính kèm chứng từ khác", "→ DA-ATT-01")],
           states={"validation": "Thiếu loại/mô tả → lỗi inline", "offline": "Sự cố + ảnh vào hàng đợi, tự gửi khi có mạng"},
           notes=["Sự cố là bản ghi riêng (incidents) — không đổi trạng thái chuyến. Muốn dừng xe → DA-STATUS-02.",
                  "Operation thấy trên WM-DISPATCH-05 / WM-INC-01."]),
    Screen(id="DA-ATT-01", name="Upload chứng từ", module=M_ACT, route="DriverAttachmentUploadRoute(entity)", render=att_01, pattern="form", **C,
           purpose="Gửi thêm chứng từ (phiếu giao, biên nhận, hóa đơn phí, ảnh sự cố) gắn vào chuyến/điểm/sự cố.",
           api=["POST /uploads/presign", "POST /uploads/confirm (entityType, entityId, category)"],
           data=["entity{type, id, label}", "category", "files[{name, size, status, progress}]"],
           actions=[("Chụp ảnh / Thư viện / PDF", "Upload chứng từ for own trip"), ("Thử lại", "driver"), ("Lưu chứng từ", "driver")],
           states={"offline": "File vào hàng đợi", "error": "Dòng lỗi + Thử lại"},
           notes=["Loại chứng từ: POD, Phiếu giao hàng, Biên nhận, Hóa đơn phí, Ảnh sự cố, Khác.", "JPG/PNG/PDF ≤ 10 MB."]),
    Screen(id="DA-GPS-01", name="Theo dõi vị trí nền", module=M_SYNC, route="DriverGpsPermissionRoute", render=gps_01, pattern="mobile", **C,
           purpose="Trạng thái quyền vị trí & tracking; cảnh báo khi tắt quyền làm chuyến không gửi được vị trí.",
           api=["POST /driver/gps/batch", "local: permission_handler + background location service"],
           data=["permission: always|whileInUse|denied", "preciseLocation", "batteryOptimization", "activeTrip", "lastSentAt", "bufferedPoints"],
           actions=[("Mở cài đặt vị trí", "OS settings"), ("Kiểm tra lại", "driver")],
           states={"ok": "Quyền 'Luôn cho phép' → Banner success 'Đang gửi vị trí'", "off": "Banner danger (mockup)",
                   "no-trip": "Không có chuyến đang chạy → 'Không theo dõi vị trí'"},
           notes=["Chỉ tracking khi có chuyến đang chạy (từ Bắt đầu đi lấy đến Hoàn thành). Không gửi GPS ngoài chuyến.",
                  "GPS buffer offline, gửi bù theo batch; backend kiểm tra driver sở hữu trip."]),
    Screen(id="DA-SYNC-01", name="Đồng bộ offline", module=M_SYNC, route="DriverSyncRoute", render=sync_01, pattern="list", **C,
           purpose="Hàng đợi trạng thái/COD/POD/GPS/sự cố chưa gửi; retry và xem lỗi.",
           api=["local: syncQueue (drift/sqlite)", "replay: driverUpdateTripStatus / driverUpdateStopStatus / driverSubmitCod / uploads / gps batch / driverReportIncident"],
           data=["items[{type, entityLabel, capturedAt, status: pending|failed|done, attempts, error}]"],
           actions=[("Thử lại tất cả", "driver"), ("Thử lại mục lỗi", "driver"), ("Mở mục", "driver")],
           states={"empty": "'Tất cả dữ liệu đã đồng bộ' + thời điểm", "offline": "OfflineBanner (mockup)"},
           notes=["Gửi theo thứ tự ghi nhận (FIFO) với idempotencyKey.", "Không cho đăng xuất mất dữ liệu: cảnh báo khi còn mục chờ."]),
    Screen(id="DA-NOTI-01", name="Thông báo", module=M_HOME, route="DriverNotificationsRoute", render=noti_01, pattern="list", **C,
           purpose="Chuyến mới, thay đổi chuyến, yêu cầu xử lý, cảnh báo COD; mở chuyến/điểm liên quan.",
           api=["notifications(filter: {recipient: me})", "markNotificationRead(id)", "markAllNotificationsRead"],
           data=["type", "title", "body", "createdAt", "read", "target{tripId|stopId}"],
           actions=[("Mở thông báo", "driver"), ("Đọc hết", "driver")],
           states={"empty": "'Chưa có thông báo'", "loading": "Skeleton rows"},
           notes=["Push notification mở thẳng route đích.", "Không hiển thị cảnh báo tài chính công ty."]),
    Screen(id="DA-MONEY-01", name="Thưởng & khoản ứng của tôi", module=M_ACC, route="DriverMoneyRoute", render=money_01, pattern="mobile", **C,
           purpose="Minh bạch khoản liên quan tới tài xế: thưởng chuyến, ứng lương, tạm ứng chuyến, COD đang giữ, lịch sử nộp COD.",
           api=["driverLedger(driverId: me)", "driverJobs(filter: {bonus: true, period})"],
           data=["tripBonuses[]", "salaryAdvances[]", "tripAdvances[]", "codHeld", "codRemittances[]", "reimbursable"],
           actions=[("Mở chuyến", "View own money/bonus/advance summary")],
           states={"empty": "Tháng chưa có khoản → EmptyState", "offline": "Dữ liệu cache + thời điểm cập nhật"},
           notes=["Chỉ dữ liệu của chính tài xế — không hiển thị báo cáo/lợi nhuận công ty.",
                  "Seed: thưởng 1.500.000 đ, tạm ứng 2.000.000 đ (PC-202609-0004), công ty nợ 800.000 đ phí cầu đường (PC-202609-0001)."]),
    Screen(id="DA-HIST-01", name="Lịch sử chuyến", module=M_ACC, route="DriverHistoryRoute", render=hist_01, pattern="list", **C,
           purpose="Xem lại chuyến đã hoàn thành/hủy với POD, COD, thưởng.",
           api=["driverJobs(filter: {status: [COMPLETED, CANCELLED], period})"],
           data=["code", "completedAt", "route", "status", "podCount", "codSummary", "bonus"],
           actions=[("Mở chuyến (chỉ xem)", "own trip")],
           states={"empty": "'Chưa có chuyến trong tháng'"},
           notes=["Mở DA-TRIP-01 ở chế độ read-only."]),
    Screen(id="DA-PROFILE-01", name="Hồ sơ cá nhân", module=M_ACC, route="DriverProfileRoute", render=profile_01, pattern="mobile", **C,
           purpose="Thông tin tài xế, lối vào tiền/lịch sử/đồng bộ/GPS, đổi mật khẩu, đăng xuất.",
           api=["driverMe", "driverLogout"],
           data=["name", "phone", "code", "merchant.name", "defaultVehicle", "status", "syncPendingCount", "gpsPermission"],
           actions=[("Đổi mật khẩu", "tùy auth decision"), ("Đăng xuất", "cảnh báo nếu còn mục chưa đồng bộ")],
           states={"offline": "Đăng xuất bị chặn khi còn mục chờ đồng bộ (confirm bottom sheet)"},
           notes=["Thông tin hồ sơ do nhà xe quản lý (WM-DRV-02); tài xế chỉ xem.", "Đổi mật khẩu phụ thuộc phương thức đăng nhập (chờ chốt)."]),
)
