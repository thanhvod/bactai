"""Platform shells: Web Merchant AppShell, mobile frames (driver / merchant app), customer web shell."""
from __future__ import annotations

from .core import edge, href, use
from .ui import (FONT, NUM, T, TONES, avatar, badge, btn, col, h, icon, icon_btn, kbd, logo, muted, page_root, row,
                 spacer, subtle, text)

# ---------------------------------------------------------------- Web Merchant
WM_NAV = [
    ("dashboard", "Dashboard", "WM-DASH-01", [("Tổng quan", "WM-DASH-01"), ("Vận hành", "WM-DASH-02"), ("Tài chính", "WM-DASH-03")]),
    ("orders", "Đơn hàng", "WM-ORD-01", []),
    ("dispatch", "Điều phối", "WM-DISPATCH-01", [("Bảng điều phối", "WM-DISPATCH-01"), ("Lịch xe/tài xế", "WM-DISPATCH-02"),
                                                 ("Cảnh báo lịch", "WM-DISPATCH-03"), ("Vị trí xe", "WM-DISPATCH-04"), ("Sự cố", "WM-DISPATCH-05")]),
    ("customers", "Khách hàng", "WM-CUS-01", []),
    ("drivers", "Tài xế", "WM-DRV-01", []),
    ("vehicles", "Xe", "WM-VEH-01", []),
    ("suppliers", "Nhà cung cấp", "WM-SUP-01", []),
    ("finance", "Thu chi & Công nợ", "WM-FIN-01", [("Sổ thu chi", "WM-FIN-01"), ("Phiếu thu", "WM-PAY-01"), ("Phiếu chi", "WM-EXP-01"),
                                                   ("Công nợ khách", "WM-DEBT-01"), ("Công nợ NCC", "WM-DEBT-02"), ("Bảng kê công nợ", "WM-DEBT-03"),
                                                   ("COD tài xế", "WM-COD-01"), ("Tạm ứng chuyến", "WM-ADV-01")]),
    ("payroll", "Lương", "WM-PAYROLL-01", []),
    ("reports", "Báo cáo", "WM-RPT-01", []),
    ("settings", "Cài đặt", "WM-ORG-01", [("Hồ sơ nhà xe", "WM-ORG-01"), ("Nhân viên", "WM-USER-01"), ("Vai trò & quyền", "WM-RBAC-01"),
                                         ("Cài đặt vận hành", "WM-SET-01"), ("Mã tự động", "WM-SET-02"), ("Danh mục", "WM-CAT-01")]),
]
NAV_BADGES = {"dispatch": ("3", "warning"), "finance": ("5", "danger"), "payroll": ("1", "warning")}


def _nav_item(ic, label, to, on, badge_=None, child=False):
    fg = T["primary"] if on else (T["text-muted"] if child else T["text"])
    bg = T["primary-soft"] if on else "transparent"
    pad = "0 10px 0 36px" if child else "0 10px"
    hgt = 32 if child else 36
    b = ""
    if badge_:
        bgc, fgc = TONES[badge_[1]]
        b = f'<span style="margin-left: auto; font-size: 11px; font-weight: 700; padding: 0 6px; border-radius: 9px; background: {bgc}; color: {fgc};">{badge_[0]}</span>'
    ic_html = "" if child else icon(ic, 18, fg)
    edge(to, f"Sidebar: {label}", "nav")
    cur = ' aria-current="page"' if on else ""
    return (f'<a href="{href(to)}"{cur} style="display: flex; align-items: center; gap: 10px; height: {hgt}px; padding: {pad}; border-radius: 6px; '
            f'background: {bg}; color: {fg}; font-size: {13 if child else 14}px; font-weight: {600 if on else 500}; text-decoration: none;">{ic_html}{label}{b}</a>')


def sidebar(active: str, child: str | None):
    use("Sidebar")
    items = []
    for ic, label, to, children in WM_NAV:
        on_group = ic == active
        items.append(_nav_item(ic, label, to, on_group and not children, NAV_BADGES.get(ic)))
        if on_group and children:
            for clab, cto in children:
                items.append(_nav_item(None, clab, cto, cto == child, child=True))
    merchant = (f'<a href="{href("WM-AUTH-03")}" style="display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid {T["border"]}; '
                f'border-radius: 6px; text-decoration: none;">{avatar("BD", 28, "primary")}'
                f'<span style="display: flex; flex-direction: column; flex-grow: 1; min-width: 0;">{text("BTA Demo Transport", 13, 600, extra="white-space: nowrap;")}{subtle("M-DEMO-A · Admin", 11)}</span>'
                f'{icon("chevron-down", 16, T["text-muted"])}</a>')
    edge("WM-AUTH-03", "Merchant switcher", "nav")
    return (f'<aside aria-label="Điều hướng chính" style="width: 260px; flex-shrink: 0; height: 100%; box-sizing: border-box; background: {T["surface"]}; '
            f'border-right: 1px solid {T["border"]}; display: flex; flex-direction: column; gap: 12px; padding: 14px 12px;">'
            f'<div style="padding: 2px 6px 6px;">{logo(True, 28)}</div>{merchant}'
            f'<nav style="display: flex; flex-direction: column; gap: 2px;">{"".join(items)}</nav>{spacer()}'
            f'<div style="padding: 8px 10px; border-radius: 6px; background: {T["surface-muted"]};">{subtle("Phase 1 · v0.1", 11)}</div></aside>')


def topbar(role="Admin"):
    use("Topbar")
    use("QuickSearch")
    use("NotificationBell")
    edge("WM-SHELL-03", "Quick search (Ctrl K)", "nav")
    edge("WM-SHELL-02", "Chuông thông báo", "nav")
    search = (f'<a href="{href("WM-SHELL-03")}" style="display: flex; align-items: center; gap: 8px; width: 420px; height: 34px; padding: 0 10px; '
              f'box-sizing: border-box; border: 1px solid {T["border-control"]}; border-radius: 6px; background: {T["surface"]}; text-decoration: none;">'
              f'{icon("search", 16, T["text-muted"])}<span style="flex-grow: 1; font-size: 13px; color: {T["text-subtle"]}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Tìm mã đơn, mã chuyến, khách, tài xế, xe, phiếu…</span>'
              f'{kbd("Ctrl K")}</a>')
    bell = (f'<a href="{href("WM-SHELL-02")}" aria-label="Thông báo (6 chưa đọc)" style="position: relative; display: inline-flex; align-items: center; justify-content: center; '
            f'width: 36px; height: 36px; border-radius: 6px; text-decoration: none;">{icon("bell", 18, T["text"])}'
            f'<span style="position: absolute; top: 3px; right: 2px; min-width: 16px; height: 16px; padding: 0 4px; box-sizing: border-box; border-radius: 8px; '
            f'background: {T["danger"]}; color: #FFFFFF; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center;">6</span></a>')
    user = row(avatar("TH", 30, "accent"), col(text("Trần Hải", 13, 600), subtle(role, 11), gap=0), icon("chevron-down", 14, T["text-muted"]), gap=8)
    return (f'<header style="height: 56px; flex-shrink: 0; box-sizing: border-box; display: flex; align-items: center; gap: 12px; padding: 0 24px; '
            f'background: {T["surface"]}; border-bottom: 1px solid {T["border"]};">{search}{spacer()}'
            f'{icon_btn("circle-alert", "Trợ giúp")}{bell}<div style="width: 1px; height: 24px; background: {T["border"]};"></div>{user}</header>')


def wm_shell(active: str, content: str, w=1440, h=960, child=None, overlay=None, role="Admin", pad=24, gap=16):
    """AppShell: sidebar + topbar + content. `overlay` = (html, align) to draw a drawer/dialog over the page."""
    use("AppShell")
    main = (f'<main style="flex-grow: 1; min-width: 0; overflow: hidden; padding: {pad}px; box-sizing: border-box; '
            f'display: flex; flex-direction: column; gap: {gap}px;">{content}</main>')
    inner = (f'<div style="display: flex; width: 100%; height: 100%;">{sidebar(active, child)}'
             f'<div style="flex-grow: 1; min-width: 0; display: flex; flex-direction: column;">{topbar(role)}{main}</div></div>')
    if overlay:
        ov, align = overlay
        pos = {"right": "justify-content: flex-end; align-items: stretch;",
               "center": "justify-content: center; align-items: center;",
               "top": "justify-content: center; align-items: flex-start; padding-top: 64px;",
               "topright": "justify-content: flex-end; align-items: flex-start; padding: 52px 150px 0 0;"}[align]
        dim = "rgba(23,32,42,0.40)" if align != "topright" else "rgba(23,32,42,0.08)"
        inner += (f'<div style="position: absolute; inset: 0; background: {dim}; display: flex; {pos} box-sizing: border-box;">{ov}</div>')
    return page_root(inner, w, h)


# ---------------------------------------------------------------- Mobile (Flutter apps)
DA_TABS = [("home", "Hôm nay", "DA-HOME-01"), ("jobs", "Chuyến", "DA-JOB-01"), ("notifications", "Thông báo", "DA-NOTI-01"),
           ("account", "Tài khoản", "DA-PROFILE-01")]
MA_TABS = [("dashboard", "Tổng quan", "MA-HOME-01"), ("orders", "Đơn/Chuyến", "MA-ORD-01"), ("finance", "Tài chính", "MA-FIN-01"),
           ("reports", "Báo cáo", "MA-RPT-01"), ("account", "Tài khoản", "MA-PROFILE-01")]


def bottom_nav(tabs, active_idx, badges=None):
    use("BottomNav")
    out = []
    for i, (ic, lab, to) in enumerate(tabs):
        on = i == active_idx
        c = T["primary"] if on else T["text-muted"]
        b = ""
        if badges and badges.get(i):
            b = (f'<span style="position: absolute; top: 4px; left: 50%; margin-left: 6px; min-width: 16px; height: 16px; padding: 0 4px; box-sizing: border-box; '
                 f'border-radius: 8px; background: {T["danger"]}; color: #FFFFFF; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center;">{badges[i]}</span>')
        edge(to, f"Bottom nav: {lab}", "nav")
        cur = ' aria-current="page"' if on else ""
        out.append(f'<a href="{href(to)}"{cur} style="position: relative; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; '
                   f'height: 64px; text-decoration: none; color: {c};">{icon(ic, 22, c)}'
                   f'<span style="font-size: 12px; font-weight: {600 if on else 500};">{lab}</span>{b}</a>')
    return (f'<nav aria-label="Điều hướng" style="display: flex; flex-shrink: 0; background: {T["surface"]}; border-top: 1px solid {T["border"]}; padding-bottom: 12px;">'
            f'{"".join(out)}</nav>')


def mobile_header(title, back_to=None, sub=None, right="", back_label="Quay lại"):
    use("MobileHeader")
    back = ""
    if back_to:
        edge(back_to, back_label, "back")
        back = (f'<a href="{href(back_to)}" aria-label="{back_label}" style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; '
                f'margin-left: -10px; text-decoration: none;">{icon("arrow-left", 22, T["text"])}</a>')
    return (f'<header style="display: flex; align-items: center; gap: 6px; min-height: 60px; padding: 8px 16px; box-sizing: border-box; flex-shrink: 0; '
            f'background: {T["surface"]}; border-bottom: 1px solid {T["border"]};">{back}'
            f'<div style="display: flex; flex-direction: column; flex-grow: 1; min-width: 0;">'
            f'<span style="font-size: 18px; line-height: 24px; font-weight: 600; color: {T["text"]};">{title}</span>'
            f'{"<span style=" + chr(34) + "font-size: 13px; color: " + T["text-muted"] + ";" + chr(34) + ">" + sub + "</span>" if sub else ""}</div>{right}</header>')


def mobile_frame(header, body, bottom="", w=390, h=844, bg=None, overlay=None, body_gap=12, pad=16):
    """Phone frame 390x844 (logical px == Flutter dp). No fake status bar."""
    inner = (f'<div style="display: flex; flex-direction: column; width: 100%; height: 100%;">{header}'
             f'<div style="flex-grow: 1; overflow: hidden; padding: {pad}px; box-sizing: border-box; display: flex; flex-direction: column; gap: {body_gap}px;">{body}</div>'
             f'{bottom}</div>')
    if overlay:
        ov, align = overlay
        pos = {"bottom": "justify-content: flex-end; align-items: stretch; flex-direction: column;",
               "center": "justify-content: center; align-items: center; padding: 20px;"}[align]
        inner += f'<div style="position: absolute; inset: 0; background: rgba(23,32,42,0.45); display: flex; {pos} box-sizing: border-box;">{ov}</div>'
    return page_root(inner, w, h, bg or T["background"])


def primary_bottom_action(label, to=None, ic=None, secondary="", variant="primary", trigger=None):
    use("PrimaryBottomAction")
    return (f'<div style="display: flex; flex-direction: column; gap: 8px; padding: 12px 16px 24px; background: {T["surface"]}; border-top: 1px solid {T["border"]}; flex-shrink: 0;">'
            f'{secondary}{btn(label, variant, ic, to=to, size="lg", full=True, trigger=trigger)}</div>')


def bottom_sheet(title, body, footer="", sub=None):
    use("BottomSheet")
    return (f'<div role="dialog" aria-label="{title}" style="background: {T["surface"]}; border-radius: 8px 8px 0 0; padding: 8px 16px 24px; display: flex; flex-direction: column; gap: 14px;">'
            f'<div style="align-self: center; width: 40px; height: 4px; border-radius: 2px; background: {T["border-strong"]};"></div>'
            f'{col(text(title, 18, 600), muted(sub, 14) if sub else "", gap=2)}{body}{footer}</div>')


def m_card(body, to=None, trigger=None, extra="", pad=14):
    css = (f"display: flex; flex-direction: column; gap: 8px; padding: {pad}px; background: {T['surface']}; border: 1px solid {T['border']}; "
           f"border-radius: 8px; text-decoration: none; color: {T['text']}; {extra}")
    if to:
        edge(to, trigger or "Mở")
        return f'<a href="{href(to)}" style="{css}">{body}</a>'
    return f'<div style="{css}">{body}</div>'


def m_badge(label, tone=None, ic=None):
    return badge(label, tone, ic, size=13)


def sync_status(state="ok", pending=0, to=None):
    use("SyncStatus")
    if state == "ok":
        bg, fg, ic, msg = T["success-soft"], T["success"], "cloud", "Đã đồng bộ · 14:32"
    elif state == "pending":
        bg, fg, ic, msg = T["warning-soft"], T["warning"], "refresh-cw", f"{pending} mục chờ đồng bộ"
    else:
        bg, fg, ic, msg = T["danger-soft"], T["danger"], "wifi-off", f"Mất kết nối · {pending} mục lưu trên máy"
    inner = row(icon(ic, 18, fg), text(msg, 14, 600, fg), spacer(), text("Xem", 14, 600, T["accent"]) if to else "", gap=8)
    css = f"display: block; padding: 10px 12px; border-radius: 6px; background: {bg}; text-decoration: none;"
    if to:
        edge(to, "Mở hàng đợi đồng bộ")
        return f'<a href="{href(to)}" style="{css}">{inner}</a>'
    return f'<div style="{css}">{inner}</div>'


def list_row(ic, label, value="", to=None, sub=None, danger=False, trigger=None):
    use("ListRow")
    c = T["danger"] if danger else T["text"]
    inner = row(icon(ic, 22, T["danger"] if danger else T["text-muted"]),
                col(text(label, 16, 500, c), muted(sub, 13) if sub else "", gap=0), spacer(),
                text(value, 14, 500, T["text-muted"], NUM) if value else "",
                icon("chevron-right", 18, T["text-subtle"]) if to else "", gap=12)
    css = f"display: block; padding: 12px 16px; min-height: 56px; box-sizing: border-box; background: {T['surface']}; border-bottom: 1px solid {T['border']}; text-decoration: none;"
    if to:
        edge(to, trigger or label)
        return f'<a href="{href(to)}" style="{css}">{inner}</a>'
    return f'<div style="{css}">{inner}</div>'


def m_section(title, body="", action=""):
    return col(row(text(title, 15, 600), spacer(), action, gap=8), body, gap=8)


# ---------------------------------------------------------------- Customer Web
CW_NAV = [("Tìm nhà xe", "CW-HOME-01"), ("Booking của tôi", "CW-BOOK-02"), ("Đơn hàng", "CW-ORD-01"), ("Bảng kê", "CW-DEBT-01")]


def cw_shell(active_idx, content, w=1440, h=960, logged_in=True, overlay=None):
    use("CustomerShell")
    links = []
    for i, (lab, to) in enumerate(CW_NAV):
        on = i == active_idx
        edge(to, f"Top nav: {lab}", "nav")
        links.append(f'<a href="{href(to)}" style="font-size: 14px; font-weight: {600 if on else 500}; color: {T["primary"] if on else T["text"]}; text-decoration: none; '
                     f'padding: 18px 0; border-bottom: 2px solid {T["primary"] if on else "transparent"};">{lab}</a>')
    if logged_in:
        edge("CW-NOTI-01", "Chuông thông báo", "nav")
        edge("CW-PROFILE-01", "Menu tài khoản", "nav")
        right = (f'<a href="{href("CW-NOTI-01")}" aria-label="Thông báo" style="display: inline-flex; padding: 8px; text-decoration: none;">{icon("bell", 18, T["text"])}</a>'
                 f'<a href="{href("CW-PROFILE-01")}" style="display: flex; align-items: center; gap: 8px; text-decoration: none;">{avatar("HL", 30, "accent")}{text("Bao bì Hưng Lợi", 13, 600)}</a>')
    else:
        edge("CW-AUTH-01", "Đăng nhập", "nav")
        right = btn("Đăng nhập", "secondary", "log-in", to="CW-AUTH-01")
    header = (f'<header style="height: 60px; flex-shrink: 0; display: flex; align-items: center; gap: 32px; padding: 0 48px; background: {T["surface"]}; '
              f'border-bottom: 1px solid {T["border"]};">{logo(True, 28)}<nav style="display: flex; gap: 24px;">{"".join(links) if logged_in else ""}</nav>{spacer()}{right}</header>')
    body = (f'<div style="flex-grow: 1; overflow: hidden; display: flex; justify-content: center;">'
            f'<main style="width: 1200px; max-width: 100%; padding: 28px 0; box-sizing: border-box; display: flex; flex-direction: column; gap: 20px;">{content}</main></div>')
    inner = f'<div style="display: flex; flex-direction: column; width: 100%; height: 100%;">{header}{body}</div>'
    if overlay:
        inner += f'<div style="position: absolute; inset: 0; background: rgba(23,32,42,0.40); display: flex; justify-content: center; align-items: center;">{overlay}</div>'
    return page_root(inner, w, h)
