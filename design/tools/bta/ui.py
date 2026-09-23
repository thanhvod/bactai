"""BTA UI primitives — HTML with inline styles built from design tokens.

Each helper maps 1:1 to a component the real apps must implement
(see design/COMPONENTS.md). Helpers call `use("<Component>")` so every
screen spec lists the components it needs, and link helpers call `edge()`
so navigation is extracted automatically.
"""
from __future__ import annotations

import json
import os

from .core import edge, esc, href, money, use

# ---------------------------------------------------------------- tokens
T = {
    "background": "#F7F8FA", "surface": "#FFFFFF", "surface-muted": "#F1F4F7",
    "border": "#DDE3EA", "border-strong": "#C3CCD6", "border-control": "#828D99",
    "text": "#17202A", "text-muted": "#5B6673", "text-subtle": "#66717D",
    "primary": "#0F766E", "primary-hover": "#115E59", "primary-foreground": "#FFFFFF",
    "accent": "#2563EB", "success": "#15803D", "warning": "#B45309", "danger": "#B91C1C",
    "info": "#1D4ED8", "danger-hover": "#991B1B",
    "neutral-soft": "#EEF1F4", "primary-soft": "#E6F3F1", "accent-soft": "#EEF3FE",
    "success-soft": "#EDF7F0", "warning-soft": "#FEF5EB", "danger-soft": "#FBEAEA", "info-soft": "#E8EEFB",
    "chart-1": "#0d9488", "chart-2": "#2a78d6", "chart-3": "#eb6834", "chart-4": "#4a3aa7",
}
SH_POP = "0 4px 12px rgba(23,32,42,0.10)"
SH_DIALOG = "0 12px 32px rgba(23,32,42,0.16)"
FONT = "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
NUM = "font-variant-numeric: tabular-nums;"

TONES = {
    "neutral": (T["neutral-soft"], T["text-muted"]),
    "primary": (T["primary-soft"], T["primary"]),
    "accent": (T["accent-soft"], T["accent"]),
    "success": (T["success-soft"], T["success"]),
    "warning": (T["warning-soft"], T["warning"]),
    "danger": (T["danger-soft"], T["danger"]),
    "info": (T["info-soft"], T["info"]),
}

# Status -> tone tables (from the design system README)
ORDER_STATUS = {"Nháp": "neutral", "Chờ xác nhận": "warning", "Đã xác nhận": "info", "Đã xếp xe": "primary",
                "Đang thực hiện": "accent", "Hoàn thành": "success", "Đã hủy": "danger"}
TRIP_STATUS = {"Đã lên lịch": "neutral", "Đang đến điểm lấy": "info", "Đang lấy hàng": "info",
               "Đang vận chuyển": "accent", "Tạm dừng": "warning", "Đang trả hàng": "primary",
               "Hoàn thành": "success", "Đã hủy": "danger"}
FIN_STATUS = {"Đã thu": "success", "Đã trả": "success", "Còn nợ": "warning", "Quá hạn": "danger",
              "Chưa phân bổ": "info", "Đã chốt": "primary", "Đã hủy": "danger", "Chưa trả": "warning",
              "Nháp": "neutral", "Chờ duyệt": "warning", "Đã duyệt": "primary", "Đã gửi": "info",
              "Phân bổ một phần": "info", "Đã phân bổ": "success", "Trả về": "danger"}

_ICONS = json.load(open(os.path.join(os.path.dirname(__file__), "lucide_icons.json"), encoding="utf-8"))

# Business icon names (design system "Icon" section) -> lucide
ICON_ALIAS = {
    "dashboard": "layout-dashboard", "orders": "package", "dispatch": "route", "customers": "building-2",
    "drivers": "id-card", "vehicles": "truck", "suppliers": "store", "finance": "wallet", "payroll": "banknote",
    "reports": "chart-column", "settings": "settings", "cod": "hand-coins", "pickup": "package-check",
    "dropoff": "map-pin", "incident": "triangle-alert", "timeline": "history", "attachment": "paperclip",
    "more": "ellipsis", "warning": "triangle-alert", "sync": "refresh-cw", "offline": "wifi-off",
    "gps": "locate-fixed", "pod": "camera", "payment-in": "receipt", "expense": "receipt-text",
    "debt": "scale", "statement": "file-text", "advance": "coins", "home": "house", "jobs": "calendar-days",
    "notifications": "bell", "account": "user", "money": "wallet", "pause": "pause", "call": "phone",
}


def icon(name: str, size: int = 16, color: str = "currentColor", stroke: float = 2) -> str:
    n = ICON_ALIAS.get(name, name)
    inner = _ICONS[n]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" '
            f'fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round" '
            f'aria-hidden="true" style="flex-shrink: 0;">{inner}</svg>')


def st(**kw) -> str:
    return "; ".join(f"{k.replace('_', '-')}: {v}" for k, v in kw.items()) + ";"


# ---------------------------------------------------------------- text
def text(s, size=14, weight=400, color=None, extra="") -> str:
    return (f'<span style="font-size: {size}px; font-weight: {weight}; color: {color or T["text"]}; '
            f'line-height: 1.5; {extra}">{s}</span>')


def muted(s, size=13) -> str:
    return text(s, size, 400, T["text-muted"])


def subtle(s, size=12) -> str:
    return text(s, size, 400, T["text-subtle"])


def num(s, size=13, weight=400, color=None) -> str:
    return text(s, size, weight, color, NUM + " white-space: nowrap;")


def code(s, size=13, to=None, trigger=None) -> str:
    """Document code (DH-202609-0001) — tabular, links to detail when `to` is set."""
    if to:
        edge(to, trigger or f"Mở {s}")
        return (f'<a href="{href(to)}" style="font-size: {size}px; font-weight: 500; color: {T["accent"]}; '
                f'text-decoration: none; {NUM} white-space: nowrap;">{s}</a>')
    return num(s, size, 500)


def a(label, to, trigger=None, size=13, weight=500, kind="action") -> str:
    edge(to, trigger or label, kind)
    return (f'<a href="{href(to)}" style="font-size: {size}px; font-weight: {weight}; color: {T["accent"]}; '
            f'text-decoration: none; white-space: nowrap;">{label}</a>')


def h(level: str, s) -> str:
    sizes = {"display": (24, 32), "lg": (20, 28), "md": (18, 26), "sm": (16, 24)}
    fs, lh = sizes[level]
    tag = {"display": "h1", "lg": "h2", "md": "h2", "sm": "h3"}[level]
    return f'<{tag} style="margin: 0; font-size: {fs}px; line-height: {lh}px; font-weight: 600; color: {T["text"]};">{s}</{tag}>'


def row(*children, gap=8, align="center", justify="flex-start", wrap=False, extra="") -> str:
    return (f'<div style="display: flex; flex-direction: row; gap: {gap}px; align-items: {align}; '
            f'justify-content: {justify}; {"flex-wrap: wrap;" if wrap else ""} {extra}">{"".join(children)}</div>')


def col(*children, gap=8, extra="") -> str:
    return f'<div style="display: flex; flex-direction: column; gap: {gap}px; {extra}">{"".join(children)}</div>'


def grid(children, cols=2, gap=16, extra="") -> str:
    return (f'<div style="display: grid; grid-template-columns: repeat({cols}, minmax(0, 1fr)); gap: {gap}px; {extra}">'
            f'{"".join(children)}</div>')


def spacer() -> str:
    return '<div style="flex-grow: 1;"></div>'


def divider(margin=0) -> str:
    return f'<div style="height: 1px; background: {T["border"]}; margin: {margin}px 0;"></div>'


# ---------------------------------------------------------------- badges & buttons
def badge(label, tone=None, ic=None, outline=False, size=12) -> str:
    use("StatusBadge")
    if tone is None:
        tone = ORDER_STATUS.get(label) or TRIP_STATUS.get(label) or FIN_STATUS.get(label) or "neutral"
    bg, fg = TONES[tone]
    if outline:
        bg_css, border = T["surface"], f"1px solid {fg}"
    else:
        bg_css, border = bg, f"1px solid {bg}"
    ic_html = icon(ic, 12, fg) if ic else ""
    return (f'<span style="display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 4px; '
            f'background: {bg_css}; border: {border}; color: {fg}; font-size: {size}px; line-height: 18px; font-weight: 600; '
            f'white-space: nowrap;">{ic_html}{label}</span>')


def status(label, group="order") -> str:
    table = {"order": ORDER_STATUS, "trip": TRIP_STATUS, "fin": FIN_STATUS}[group]
    tone = table.get(label, "neutral")
    ic = {"Đã chốt": "lock", "Tạm dừng": "pause", "Quá hạn": "alarm-clock"}.get(label)
    return badge(label, tone, ic, outline=(label == "Đã hủy" and group == "fin"))


_BTN = {
    "primary": (T["primary"], T["primary-foreground"], T["primary"]),
    "secondary": (T["surface"], T["text"], T["border-control"]),
    "ghost": ("transparent", T["text"], "transparent"),
    "danger": (T["danger"], T["primary-foreground"], T["danger"]),
    "danger-outline": (T["surface"], T["danger"], T["danger"]),
    "link": ("transparent", T["accent"], "transparent"),
}


def btn(label="", variant="secondary", ic=None, to=None, trigger=None, size="md", full=False,
        icon_only=False, aria=None, disabled=False, kind="action") -> str:
    use("Button")
    bg, fg, bd = _BTN[variant]
    hgt = {"sm": 30, "md": 36, "lg": 48}[size]
    fs = {"sm": 13, "md": 14, "lg": 16}[size]
    pad = "0" if icon_only else ("0 10px" if size == "sm" else "0 14px" if size == "md" else "0 20px")
    wid = f"width: {hgt}px;" if icon_only else ("width: 100%;" if full else "")
    op = "opacity: 0.5;" if disabled else ""
    css = (f"display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: {hgt}px; {wid} "
           f"padding: {pad}; box-sizing: border-box; border-radius: 6px; background: {bg}; color: {fg}; "
           f"border: 1px solid {bd}; font-family: inherit; font-size: {fs}px; font-weight: 600; text-decoration: none; "
           f"white-space: nowrap; cursor: pointer; {op}")
    inner = (icon(ic, 18 if size == "lg" else 16, fg) if ic else "") + ("" if icon_only else label)
    al = f' aria-label="{esc(aria or label)}"' if (icon_only or aria) else ""
    if to:
        edge(to, trigger or (aria or label), kind)
        return f'<a href="{href(to)}"{al} style="{css}">{inner}</a>'
    dis = " disabled" if disabled else ""
    return f'<button type="button"{al}{dis} style="{css}">{inner}</button>'


def icon_btn(ic, aria, to=None, variant="ghost", size="md", trigger=None) -> str:
    use("IconButton")
    return btn("", variant, ic, to=to, trigger=trigger or aria, size=size, icon_only=True, aria=aria)


def kbd(s) -> str:
    return (f'<span style="font-size: 11px; font-weight: 500; color: {T["text-muted"]}; border: 1px solid {T["border"]}; '
            f'border-radius: 4px; padding: 0 5px; background: {T["surface"]}; white-space: nowrap;">{s}</span>')


def avatar(initials, size=28, tone="neutral") -> str:
    bg, fg = TONES[tone]
    return (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: {size}px; height: {size}px; '
            f'border-radius: 50%; background: {bg}; color: {fg}; font-size: {max(11, size // 2.6):.0f}px; font-weight: 600; flex-shrink: 0;">{initials}</span>')


def logo(with_text=True, size=28) -> str:
    use("Logo")
    mark = (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: {size}px; height: {size}px; '
            f'border-radius: 6px; background: {T["primary"]};">{icon("truck", int(size * 0.6), "#FFFFFF")}</span>')
    if not with_text:
        return mark
    return row(mark, text("BTA", int(size * 0.62), 700), gap=8)


# ---------------------------------------------------------------- form controls
def _control(inner, width="100%", h=36, error=False, disabled=False, bg=None) -> str:
    bd = T["danger"] if error else T["border-control"]
    return (f'<div style="display: flex; align-items: center; gap: 8px; height: {h}px; width: {width}; box-sizing: border-box; '
            f'padding: 0 10px; border: 1px solid {bd}; border-radius: 4px; background: {bg or (T["surface-muted"] if disabled else T["surface"])};">{inner}</div>')


def input_(value="", placeholder="", width="100%", prefix_ic=None, suffix=None, error=False, disabled=False,
           align="left", h=36, fs=14, mono=False) -> str:
    use("TextField")
    ph = f'<span style="color: {T["text-subtle"]}; font-size: {fs}px;">{placeholder}</span>'
    val = (f'<span style="flex-grow: 1; color: {T["text"]}; font-size: {fs}px; text-align: {align}; '
           f'{NUM if mono else ""} white-space: nowrap; overflow: hidden;">{value}</span>') if value else \
        f'<span style="flex-grow: 1; text-align: {align};">{ph}</span>'
    pre = icon(prefix_ic, 16, T["text-muted"]) if prefix_ic else ""
    suf = f'<span style="color: {T["text-muted"]}; font-size: 13px;">{suffix}</span>' if suffix else ""
    return _control(pre + val + suf, width, h, error, disabled)


def money_input(v=None, width="100%", error=False, h=36, fs=14) -> str:
    use("MoneyInput")
    val = f"{v:,}".replace(",", ".") if v is not None else ""
    inner = (f'<span style="flex-grow: 1; text-align: right; font-size: {fs}px; {NUM} color: {T["text"] if val else T["text-subtle"]};">'
             f'{val or "0"}</span><span style="color: {T["text-muted"]}; font-size: 13px;">đ</span>')
    return _control(inner, width, h, error)


def select(value="", placeholder="Chọn", width="100%", h=36, fs=14) -> str:
    use("Select")
    v = (f'<span style="flex-grow: 1; font-size: {fs}px; color: {T["text"] if value else T["text-subtle"]}; white-space: nowrap; overflow: hidden;">'
         f'{value or placeholder}</span>')
    return _control(v + icon("chevron-down", 16, T["text-muted"]), width, h)


def date_input(value="", width="100%", placeholder="dd/mm/yyyy") -> str:
    use("DateField")
    v = (f'<span style="flex-grow: 1; font-size: 14px; {NUM} color: {T["text"] if value else T["text-subtle"]};">'
         f'{value or placeholder}</span>')
    return _control(v + icon("calendar", 16, T["text-muted"]), width)


def textarea(value="", placeholder="", h=72, fs=14) -> str:
    use("Textarea")
    v = value or f'<span style="color: {T["text-subtle"]};">{placeholder}</span>'
    return (f'<div style="box-sizing: border-box; min-height: {h}px; padding: 8px 10px; border: 1px solid {T["border-control"]}; '
            f'border-radius: 4px; background: {T["surface"]}; font-size: {fs}px; line-height: 22px; color: {T["text"]};">{v}</div>')


def checkbox(label="", checked=False, size=16) -> str:
    use("Checkbox")
    box = (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: {size}px; height: {size}px; '
           f'border-radius: 4px; border: 1px solid {T["primary"] if checked else T["border-control"]}; '
           f'background: {T["primary"] if checked else T["surface"]}; flex-shrink: 0;">'
           f'{icon("check", size - 4, "#FFFFFF", 3) if checked else ""}</span>')
    if not label:
        return box
    return f'<label style="display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: {T["text"]};">{box}{label}</label>'


def radio(label, checked=False, sub=None) -> str:
    use("RadioGroup")
    dot = (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; '
           f'border-radius: 50%; border: 1px solid {T["primary"] if checked else T["border-control"]}; background: {T["surface"]}; flex-shrink: 0;">'
           f'{"<span style=" + chr(34) + "width: 8px; height: 8px; border-radius: 50%; background: " + T["primary"] + ";" + chr(34) + "></span>" if checked else ""}</span>')
    lab = text(label, 14, 500 if checked else 400) + (f'<br>{muted(sub, 12)}' if sub else "")
    return f'<label style="display: inline-flex; align-items: flex-start; gap: 8px;">{dot}<span>{lab}</span></label>'


def radio_cards(options, active=0) -> str:
    use("RadioGroup")
    items = []
    for i, (lab, sub) in enumerate(options):
        on = i == active
        items.append(f'<div style="flex: 1; padding: 10px 12px; border-radius: 6px; border: 1px solid {T["primary"] if on else T["border-control"]}; '
                     f'background: {T["primary-soft"] if on else T["surface"]};">{radio(lab, on, sub)}</div>')
    return row(*items, gap=8, align="stretch")


def switch(on=True, label="", sub=None) -> str:
    use("Switch")
    track = (f'<span style="display: inline-flex; align-items: center; width: 36px; height: 20px; border-radius: 10px; padding: 2px; '
             f'box-sizing: border-box; background: {T["primary"] if on else T["border-control"]}; justify-content: {"flex-end" if on else "flex-start"}; flex-shrink: 0;">'
             f'<span style="width: 16px; height: 16px; border-radius: 50%; background: #FFFFFF;"></span></span>')
    if not label:
        return track
    lab = col(text(label, 14, 500), muted(sub, 12) if sub else "", gap=0)
    return row(lab, spacer(), track, gap=12, extra="width: 100%;")


def field(label, control, required=False, hint=None, error=None, width=None) -> str:
    use("FormField")
    req = f'<span style="color: {T["danger"]};"> *</span>' if required else ""
    lab = f'<label style="font-size: 13px; font-weight: 500; color: {T["text-muted"]};">{label}{req}</label>'
    extra = ""
    if error:
        extra = row(icon("circle-alert", 14, T["danger"]), text(error, 12, 500, T["danger"]), gap=4)
    elif hint:
        extra = subtle(hint, 12)
    w = f"width: {width};" if width else ""
    return f'<div style="display: flex; flex-direction: column; gap: 4px; {w}">{lab}{control}{extra}</div>'


def segmented(items, active=0, links=None, size="md") -> str:
    use("SegmentedControl")
    out = []
    for i, it in enumerate(items):
        on = i == active
        css = (f"display: inline-flex; align-items: center; gap: 6px; height: {30 if size == 'md' else 40}px; padding: 0 12px; border-radius: 4px; "
               f"font-size: 13px; font-weight: {600 if on else 500}; text-decoration: none; "
               f"background: {T['surface'] if on else 'transparent'}; color: {T['text'] if on else T['text-muted']}; "
               f"{'box-shadow: 0 1px 2px rgba(23,32,42,0.12);' if on else ''}")
        lab = it if isinstance(it, str) else row(icon(it[1], 14), it[0], gap=6)
        if links and links[i] and not on:
            edge(links[i], f"Chuyển sang {it if isinstance(it, str) else it[0]}")
            out.append(f'<a href="{href(links[i])}" style="{css}">{lab}</a>')
        else:
            out.append(f'<span style="{css}">{lab}</span>')
    return (f'<div style="display: inline-flex; gap: 2px; padding: 3px; border-radius: 6px; background: {T["surface-muted"]}; '
            f'border: 1px solid {T["border"]};">{"".join(out)}</div>')


# ---------------------------------------------------------------- layout blocks
def panel(title=None, body="", actions="", pad=16, sub=None, extra="", body_pad=True) -> str:
    head = ""
    if title:
        head = (f'<div style="display: flex; align-items: center; gap: 8px; padding: 12px {pad}px; border-bottom: 1px solid {T["border"]};">'
                f'{col(h("sm", title), muted(sub, 12) if sub else "", gap=0)}{spacer()}{actions}</div>')
    bp = f"padding: {pad}px;" if body_pad else ""
    return (f'<section style="background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px; {extra}">'
            f'{head}<div style="{bp}">{body}</div></section>')


def dl(items, cols=2, gap=12) -> str:
    """Definition list: [(label, value_html)]"""
    use("DescriptionList")
    cells = []
    for lab, val in items:
        cells.append(f'<div style="display: flex; flex-direction: column; gap: 2px;">{muted(lab, 12)}'
                     f'<div style="font-size: 14px; color: {T["text"]};">{val}</div></div>')
    return grid(cells, cols, gap)


def kpi(label, value, sub=None, tone=None, ic=None, to=None, trigger=None) -> str:
    use("KpiCard")
    color = TONES[tone][1] if tone else T["text"]
    head = row(icon(ic, 16, T["text-muted"]) if ic else "", muted(label, 13), gap=6)
    body = (f'{head}<div style="font-size: 24px; line-height: 32px; font-weight: 600; color: {color}; {NUM}">{value}</div>'
            f'{muted(sub, 12) if sub else ""}')
    css = (f"display: flex; flex-direction: column; gap: 4px; padding: 14px 16px; background: {T['surface']}; "
           f"border: 1px solid {T['border']}; border-radius: 8px; text-decoration: none; min-width: 0;")
    if to:
        edge(to, trigger or f"Click KPI {label}")
        return f'<a href="{href(to)}" style="{css}">{body}</a>'
    return f'<div style="{css}">{body}</div>'


def summary_strip(items) -> str:
    """Money/status summary strip: [(label, value, tone)]"""
    use("SummaryStrip")
    cells = []
    for i, it in enumerate(items):
        lab, val = it[0], it[1]
        tone = it[2] if len(it) > 2 else None
        color = TONES[tone][1] if tone else T["text"]
        bl = f"border-left: 1px solid {T['border']};" if i else ""
        cells.append(f'<div style="flex: 1; padding: 10px 16px; {bl} display: flex; flex-direction: column; gap: 2px;">'
                     f'{muted(lab, 12)}<span style="font-size: 16px; font-weight: 600; color: {color}; {NUM} white-space: nowrap;">{val}</span></div>')
    return (f'<div style="display: flex; background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px;">'
            f'{"".join(cells)}</div>')


def tabs(items, active=0, links=None, counts=None) -> str:
    use("Tabs")
    out = []
    for i, lab in enumerate(items):
        on = i == active
        cnt = ""
        if counts and counts.get(lab) is not None:
            cnt = (f'<span style="font-size: 11px; font-weight: 600; padding: 0 6px; border-radius: 9px; '
                   f'background: {T["primary-soft"] if on else T["neutral-soft"]}; color: {T["primary"] if on else T["text-muted"]};">{counts[lab]}</span>')
        css = (f"display: inline-flex; align-items: center; gap: 6px; padding: 10px 2px; margin-bottom: -1px; font-size: 14px; "
               f"font-weight: {600 if on else 500}; color: {T['primary'] if on else T['text-muted']}; text-decoration: none; "
               f"border-bottom: 2px solid {T['primary'] if on else 'transparent'}; white-space: nowrap;")
        target = links.get(lab) if isinstance(links, dict) else None
        if target and not on:
            edge(target, f"Tab {lab}")
            out.append(f'<a href="{href(target)}" style="{css}">{lab}{cnt}</a>')
        else:
            out.append(f'<span style="{css}">{lab}{cnt}</span>')
    return (f'<nav aria-label="Tabs" style="display: flex; gap: 24px; border-bottom: 1px solid {T["border"]};">'
            f'{"".join(out)}</nav>')


def breadcrumb(items) -> str:
    """items: [(label, target|None)]"""
    use("Breadcrumb")
    out = []
    for i, (lab, to) in enumerate(items):
        if i:
            out.append(icon("chevron-right", 14, T["text-subtle"]))
        if to:
            out.append(a(lab, to, f"Breadcrumb {lab}", 13, 500, "nav"))
        else:
            out.append(muted(lab, 13))
    return f'<nav aria-label="Breadcrumb" style="display: flex; align-items: center; gap: 6px;">{"".join(out)}</nav>'


def page_header(title, sub=None, actions="", crumbs=None) -> str:
    use("PageHeader")
    top = breadcrumb(crumbs) if crumbs else ""
    return col(top, row(col(h("display", title), muted(sub, 14) if sub else "", gap=2), spacer(), actions, gap=8, align="flex-end"), gap=8)


def filter_bar(search="Tìm kiếm", chips=(), right="", active_chip=0, date=None, selects=()) -> str:
    use("FilterBar")
    parts = [input_("", search, "280px", "search", h=32)]
    if date:
        parts.append(_control(icon("calendar", 16, T["text-muted"]) + text(date, 13, 400, extra=NUM), "auto", 32))
    for s in selects:
        parts.append(_control(text(s, 13) + icon("chevron-down", 14, T["text-muted"]), "auto", 32))
    ch = []
    for i, c in enumerate(chips):
        on = i == active_chip
        ch.append(f'<span style="display: inline-flex; align-items: center; height: 28px; padding: 0 10px; border-radius: 14px; font-size: 13px; '
                  f'font-weight: {600 if on else 500}; border: 1px solid {T["primary"] if on else T["border-control"]}; '
                  f'background: {T["primary-soft"] if on else T["surface"]}; color: {T["primary"] if on else T["text"]}; white-space: nowrap;">{c}</span>')
    if ch:
        use("FilterChip")
    return (f'<div style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: {T["surface-muted"]}; '
            f'border: 1px solid {T["border"]}; border-radius: 8px; flex-wrap: wrap;">{"".join(parts)}'
            f'<div style="display: flex; gap: 6px; flex-wrap: wrap;">{"".join(ch)}</div>{spacer()}{right}</div>')


def table(columns, rows, selected=None, footer=None, checkbox_col=False, compact=False, max_h=None, empty=None,
          total_row=None) -> str:
    """columns: [(label, align, width)] ; rows: [[cell_html,...]]"""
    use("DataTable")
    rh = 40 if compact else 44
    th = []
    if checkbox_col:
        th.append(f'<th style="width: 36px; padding: 0 0 0 12px; background: {T["surface-muted"]}; border-bottom: 1px solid {T["border"]};">{checkbox()}</th>')
    for c in columns:
        lab, al = c[0], (c[1] if len(c) > 1 else "left")
        w = f"width: {c[2]};" if len(c) > 2 and c[2] else ""
        th.append(f'<th scope="col" style="{w} text-align: {al}; padding: 0 10px; height: 36px; font-size: 12px; font-weight: 600; '
                  f'color: {T["text-muted"]}; background: {T["surface-muted"]}; border-bottom: 1px solid {T["border"]}; white-space: nowrap;">{lab}</th>')
    trs = []
    for ri, r in enumerate(rows):
        sel = selected is not None and ri in (selected if isinstance(selected, (list, tuple, set)) else [selected])
        bg = T["accent-soft"] if sel else T["surface"]
        tds = []
        if checkbox_col:
            tds.append(f'<td style="padding: 0 0 0 12px; border-bottom: 1px solid {T["border"]};">{checkbox(checked=sel)}</td>')
        for ci, cell in enumerate(r):
            al = columns[ci][1] if len(columns[ci]) > 1 else "left"
            tds.append(f'<td style="text-align: {al}; padding: 0 10px; height: {rh}px; font-size: 13px; color: {T["text"]}; '
                       f'border-bottom: 1px solid {T["border"]}; white-space: nowrap; {NUM if al == "right" else ""}">{cell}</td>')
        trs.append(f'<tr style="background: {bg};">{"".join(tds)}</tr>')
    if total_row:
        tds = []
        if checkbox_col:
            tds.append(f'<td style="background: {T["surface-muted"]};"></td>')
        for ci, cell in enumerate(total_row):
            al = columns[ci][1] if len(columns[ci]) > 1 else "left"
            tds.append(f'<td style="text-align: {al}; padding: 0 12px; height: 40px; font-size: 13px; font-weight: 600; '
                       f'background: {T["surface-muted"]}; {NUM} white-space: nowrap;">{cell}</td>')
        trs.append(f'<tr>{"".join(tds)}</tr>')
    body = "".join(trs)
    if not rows and empty:
        body = f'<tr><td colspan="{len(columns) + (1 if checkbox_col else 0)}" style="padding: 0;">{empty}</td></tr>'
    foot = f'<div style="border-top: 1px solid {T["border"]}; padding: 8px 12px;">{footer}</div>' if footer else ""
    mh = f"max-height: {max_h}px; overflow: hidden;" if max_h else ""
    return (f'<div style="background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 6px; overflow: hidden;">'
            f'<div style="overflow-x: auto; {mh}"><table style="width: 100%; border-collapse: collapse; font-family: inherit;">'
            f'<thead><tr>{"".join(th)}</tr></thead><tbody>{body}</tbody></table></div>{foot}</div>')


def pagination(shown="1–10", total=128, per=20, pages=None) -> str:
    use("Pagination")
    return row(muted(f"Hiển thị {shown} trên {total}", 13), spacer(), muted(f"{per} / trang", 13),
               icon_btn("chevron-left", "Trang trước", variant="secondary", size="sm"),
               text("1", 13, 600, extra=f"padding: 0 8px;"), muted(f"/ {pages or max(1, -(-total // per))}", 13),
               icon_btn("chevron-right", "Trang sau", variant="secondary", size="sm"), gap=8)


def row_menu() -> str:
    use("Menu")
    return icon_btn("ellipsis", "Thao tác")


def empty_state(ic, msg, action="", sub=None, pad=40) -> str:
    use("EmptyState")
    return (f'<div style="display: flex; flex-direction: column; align-items: center; gap: 10px; padding: {pad}px 16px; text-align: center;">'
            f'{icon(ic, 32, T["text-subtle"], 1.5)}{text(msg, 14, 600)}{muted(sub, 13) if sub else ""}{action}</div>')


def banner(msg, tone="warning", ic=None, action="", title=None) -> str:
    use("Banner")
    bg, fg = TONES[tone]
    ic = ic or {"warning": "triangle-alert", "danger": "circle-alert", "info": "info", "success": "circle-check", "primary": "lock"}.get(tone, "info")
    t = text(title, 14, 600, fg) + " " if title else ""
    return (f'<div role="status" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 6px; '
            f'background: {bg}; border: 1px solid {fg}33;">{icon(ic, 18, fg)}<div style="flex-grow: 1; font-size: 13px; color: {T["text"]};">{t}{msg}</div>{action}</div>')


def warning_panel(title, items, action="", tone="warning") -> str:
    use("WarningPanel")
    bg, fg = TONES[tone]
    lis = "".join(f'<li style="font-size: 13px; line-height: 20px; color: {T["text"]};">{it}</li>' for it in items)
    return (f'<div role="alert" style="display: flex; gap: 10px; padding: 12px 14px; border-radius: 8px; background: {bg}; border: 1px solid {fg}55;">'
            f'{icon("triangle-alert", 18, fg)}<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 4px;">'
            f'{text(title, 14, 600, fg)}<ul style="margin: 0; padding-left: 18px;">{lis}</ul>'
            f'{"<div style=" + chr(34) + "margin-top: 6px;" + chr(34) + ">" + action + "</div>" if action else ""}</div></div>')


def due(days_overdue=None, due_date="", paid=False) -> str:
    use("DueIndicator")
    if paid:
        return badge("Đã thu", "success")
    if days_overdue and days_overdue > 0:
        return row(num(due_date, 13), badge(f"Quá hạn {days_overdue} ngày", "danger", "alarm-clock"), gap=6)
    return row(num(due_date, 13), muted("còn hạn", 12), gap=6) if due_date else muted("—")


def timeline(entries) -> str:
    """entries: [(time, actor, action_html, reason|None, tone)]"""
    use("Timeline")
    out = []
    for i, e in enumerate(entries):
        t, actor, act = e[0], e[1], e[2]
        reason = e[3] if len(e) > 3 else None
        tone = e[4] if len(e) > 4 else "neutral"
        dot_c = TONES[tone][1] if tone != "neutral" else T["border-strong"]
        line = "" if i == len(entries) - 1 else f'<div style="position: absolute; left: 5px; top: 16px; bottom: -8px; width: 2px; background: {T["border"]};"></div>'
        rs = (f'<div style="margin-top: 4px; padding: 6px 10px; border-radius: 4px; background: {T["surface-muted"]}; font-size: 13px; color: {T["text"]};">'
              f'{text("Lý do: ", 13, 600)}{reason}</div>') if reason else ""
        out.append(f'<div style="position: relative; display: flex; gap: 12px; padding-bottom: 16px;">{line}'
                   f'<div style="width: 12px; height: 12px; margin-top: 4px; border-radius: 50%; background: {T["surface"]}; border: 3px solid {dot_c}; box-sizing: border-box; flex-shrink: 0;"></div>'
                   f'<div style="flex-grow: 1; display: flex; flex-direction: column; gap: 2px;">'
                   f'{row(text(actor, 13, 600), subtle(t, 12), gap=8)}<div style="font-size: 13px; color: {T["text"]}; line-height: 20px;">{act}</div>{rs}</div></div>')
    return f'<div>{"".join(out)}</div>'


def diff(label, before, after) -> str:
    use("AuditDiff")
    return (f'<div style="display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 2px 8px; padding: 8px 10px; border-radius: 4px; '
            f'border: 1px solid {T["border"]}; font-size: 13px;">'
            f'<span style="color: {T["text-muted"]}; grid-column: 1 / 3; font-weight: 600;">{label}</span>'
            f'<span style="color: {T["text-muted"]};">Trước</span><span style="{NUM} text-decoration: line-through; color: {T["text-muted"]};">{before}</span>'
            f'<span style="color: {T["text-muted"]};">Sau</span><span style="{NUM} font-weight: 600;">{after}</span></div>')


def attachment_list(items, to=None) -> str:
    """items: [(name, kind, meta, ic)]"""
    use("AttachmentList")
    cells = []
    for it in items:
        name, kind, meta = it[0], it[1], it[2]
        ic = it[3] if len(it) > 3 else ("image" if name.endswith((".jpg", ".png")) else "file-text")
        thumb = (f'<div style="width: 44px; height: 44px; border-radius: 4px; background: {T["surface-muted"]}; border: 1px solid {T["border"]}; '
                 f'display: flex; align-items: center; justify-content: center; flex-shrink: 0;">{icon(ic, 20, T["text-muted"])}</div>')
        nm = a(name, to, f"Xem chứng từ {name}") if to else text(name, 13, 500)
        cells.append(row(thumb, col(nm, row(badge(kind, "neutral"), subtle(meta, 12), gap=6), gap=2), spacer(),
                         icon_btn("download", f"Tải {name}"), gap=10,
                         extra=f"padding: 8px; border: 1px solid {T['border']}; border-radius: 6px; background: {T['surface']};"))
    return col(*cells, gap=8)


def upload_zone(msg="Kéo thả file vào đây hoặc", h=96) -> str:
    use("AttachmentUploader")
    return (f'<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; height: {h}px; '
            f'border: 1px dashed {T["border-strong"]}; border-radius: 8px; background: {T["surface-muted"]};">'
            f'{icon("cloud-upload", 22, T["text-muted"])}{row(muted(msg, 13), text("chọn file", 13, 600, T["accent"]), gap=4)}'
            f'{subtle("JPG, PNG, PDF · tối đa 10 MB", 12)}</div>')


def stepper(steps, active=0) -> str:
    use("Stepper")
    out = []
    for i, s in enumerate(steps):
        done, on = i < active, i == active
        c = T["primary"] if (done or on) else T["border-strong"]
        dot = (f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; '
               f'background: {T["primary"] if done else (T["primary-soft"] if on else T["surface"])}; border: 1px solid {c}; '
               f'font-size: 12px; font-weight: 600; color: {"#FFFFFF" if done else (T["primary"] if on else T["text-muted"])};">'
               f'{icon("check", 14, "#FFFFFF", 3) if done else i + 1}</span>')
        out.append(row(dot, text(s, 13, 600 if on else 500, T["text"] if (on or done) else T["text-muted"]), gap=8))
        if i < len(steps) - 1:
            out.append(f'<div style="flex: 1; height: 1px; background: {T["primary"] if done else T["border-strong"]}; min-width: 24px;"></div>')
    return row(*out, gap=10)


def progress(pct, tone="primary", h=6) -> str:
    return (f'<div style="height: {h}px; border-radius: {h}px; background: {T["neutral-soft"]}; overflow: hidden;">'
            f'<div style="width: {pct}%; height: 100%; background: {TONES[tone][1]};"></div></div>')


def partner_card(name, code_, lines, to=None) -> str:
    use("PartnerCard")
    nm = a(name, to, f"Mở {name}", 14, 600) if to else text(name, 14, 600)
    return col(row(avatar("".join(w[0] for w in name.split()[-2:]).upper(), 32, "primary"), col(nm, subtle(code_, 12), gap=0), gap=10),
               *[row(muted(k, 12), spacer(), text(v, 13, 500, extra=NUM), gap=8) for k, v in lines], gap=6)


# ---------------------------------------------------------------- charts (simple SVG)
def bar_chart(labels, series, w=560, h=220, fmt=lambda v: f"{v:.0f}", unit="triệu") -> str:
    """series: [(name, [values], token)]"""
    use("BarChart")
    maxv = max(max(s[1]) for s in series) * 1.15
    pl, pb, pt = 44, 24, 8
    iw, ih = w - pl - 8, h - pb - pt
    n, k = len(labels), len(series)
    gw = iw / n
    bw = min(18, (gw * 0.7) / k)
    parts = []
    for i in range(5):
        y = pt + ih - ih * i / 4
        v = maxv * i / 4
        parts.append(f'<line x1="{pl}" x2="{w - 8}" y1="{y:.1f}" y2="{y:.1f}" stroke="{T["border"]}" stroke-width="1"></line>')
        parts.append(f'<text x="{pl - 6}" y="{y + 4:.1f}" text-anchor="end" font-size="11" fill="{T["text-muted"]}">{fmt(v)}</text>')
    for j, (name, vals, tok) in enumerate(series):
        for i, v in enumerate(vals):
            bh = ih * v / maxv
            x = pl + gw * i + (gw - bw * k) / 2 + j * bw
            parts.append(f'<rect x="{x:.1f}" y="{pt + ih - bh:.1f}" width="{bw - 2:.1f}" height="{bh:.1f}" rx="2" fill="{T[tok]}"></rect>')
    for i, lab in enumerate(labels):
        parts.append(f'<text x="{pl + gw * i + gw / 2:.1f}" y="{h - 6}" text-anchor="middle" font-size="11" fill="{T["text-muted"]}">{lab}</text>')
    svg = f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Biểu đồ cột">{"".join(parts)}</svg>'
    return col(legend(series), svg, subtle(f"Đơn vị: {unit} đ", 11), gap=6)


def line_chart(labels, series, w=560, h=200, unit="triệu") -> str:
    use("LineChart")
    allv = [v for s in series for v in s[1]]
    lo, hi = min(0, min(allv)), max(allv) * 1.15
    pl, pb, pt = 44, 24, 8
    iw, ih = w - pl - 12, h - pb - pt
    n = len(labels)

    def xy(i, v):
        return pl + iw * i / (n - 1), pt + ih - ih * (v - lo) / (hi - lo)

    parts = []
    for i in range(5):
        v = lo + (hi - lo) * i / 4
        y = pt + ih - ih * i / 4
        parts.append(f'<line x1="{pl}" x2="{w - 12}" y1="{y:.1f}" y2="{y:.1f}" stroke="{T["border"]}" stroke-width="1"></line>')
        parts.append(f'<text x="{pl - 6}" y="{y + 4:.1f}" text-anchor="end" font-size="11" fill="{T["text-muted"]}">{v:.0f}</text>')
    for name, vals, tok in series:
        pts = " ".join(f"{xy(i, v)[0]:.1f},{xy(i, v)[1]:.1f}" for i, v in enumerate(vals))
        parts.append(f'<polyline points="{pts}" fill="none" stroke="{T[tok]}" stroke-width="2"></polyline>')
        for i, v in enumerate(vals):
            x, y = xy(i, v)
            parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3" fill="{T["surface"]}" stroke="{T[tok]}" stroke-width="2"></circle>')
    for i, lab in enumerate(labels):
        parts.append(f'<text x="{xy(i, 0)[0]:.1f}" y="{h - 6}" text-anchor="middle" font-size="11" fill="{T["text-muted"]}">{lab}</text>')
    svg = f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Biểu đồ đường">{"".join(parts)}</svg>'
    return col(legend(series) if len(series) > 1 else "", svg, subtle(f"Đơn vị: {unit} đ", 11), gap=6)


def legend(series) -> str:
    return row(*[row(f'<span style="width: 10px; height: 10px; border-radius: 2px; background: {T[s[2]]};"></span>', muted(s[0], 12), gap=6)
                 for s in series], gap=16)


# ---------------------------------------------------------------- overlays
def scrim(base_html, overlay_html, w, h, align="right") -> str:
    """Render `base_html` dimmed with an overlay (drawer right / dialog center / sheet bottom)."""
    pos = {"right": "justify-content: flex-end; align-items: stretch;",
           "center": "justify-content: center; align-items: center;",
           "bottom": "justify-content: center; align-items: flex-end;",
           "top": "justify-content: center; align-items: flex-start; padding-top: 72px;"}[align]
    return (f'<div style="position: relative; width: {w}px; height: {h}px; overflow: hidden;">{base_html}'
            f'<div style="position: absolute; inset: 0; background: rgba(23,32,42,0.40); display: flex; {pos} box-sizing: border-box;">'
            f'{overlay_html}</div></div>')


def drawer(title, body, footer="", width=480, sub=None, close_to=None) -> str:
    use("Drawer")
    close = icon_btn("x", "Đóng", to=close_to, trigger="Đóng") if close_to else icon_btn("x", "Đóng")
    ft = (f'<div style="display: flex; gap: 8px; justify-content: flex-end; padding: 12px 20px; border-top: 1px solid {T["border"]}; '
          f'background: {T["surface"]};">{footer}</div>') if footer else ""
    return (f'<aside role="dialog" aria-label="{esc(title)}" style="width: {width}px; height: 100%; background: {T["surface"]}; box-shadow: {SH_DIALOG}; '
            f'display: flex; flex-direction: column;">'
            f'<div style="display: flex; align-items: flex-start; gap: 8px; padding: 16px 20px; border-bottom: 1px solid {T["border"]};">'
            f'{col(h("md", title), muted(sub, 13) if sub else "", gap=2)}{spacer()}{close}</div>'
            f'<div style="flex-grow: 1; overflow: hidden; padding: 20px; display: flex; flex-direction: column; gap: 16px;">{body}</div>{ft}</aside>')


def dialog(title, body, footer="", width=520, sub=None, close_to=None, danger=False) -> str:
    use("Dialog")
    close = icon_btn("x", "Đóng", to=close_to, trigger="Đóng") if close_to else icon_btn("x", "Đóng")
    ic = f'<span style="display: inline-flex; padding: 8px; border-radius: 6px; background: {T["danger-soft"]};">{icon("triangle-alert", 18, T["danger"])}</span>' if danger else ""
    return (f'<div role="dialog" aria-label="{esc(title)}" style="width: {width}px; background: {T["surface"]}; border-radius: 8px; box-shadow: {SH_DIALOG}; '
            f'display: flex; flex-direction: column;">'
            f'<div style="display: flex; align-items: flex-start; gap: 12px; padding: 18px 20px 8px;">{ic}'
            f'{col(h("md", title), muted(sub, 13) if sub else "", gap=2)}{spacer()}{close}</div>'
            f'<div style="padding: 8px 20px 16px; display: flex; flex-direction: column; gap: 14px;">{body}</div>'
            f'<div style="display: flex; gap: 8px; justify-content: flex-end; padding: 12px 20px; border-top: 1px solid {T["border"]};">{footer}</div></div>')


def popover(body, width=360, extra="") -> str:
    use("Popover")
    return (f'<div style="width: {width}px; background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px; '
            f'box-shadow: {SH_POP}; {extra}">{body}</div>')


def sensitive_modal(action, affected, warning, reason="", confirm="Xác nhận", back_to=None, confirm_to=None, width=520) -> str:
    """SensitiveActionModal — action + affected data + warning + required reason."""
    use("SensitiveActionModal")
    body = col(
        f'<div style="font-size: 14px; color: {T["text"]};">{action}</div>',
        affected,
        banner(warning, "warning"),
        field("Lý do", textarea(reason, "Nhập lý do thao tác (bắt buộc, lưu vào timeline)", 80), required=True,
              hint="Lý do được ghi vào Timeline/Audit cùng người thực hiện và thời điểm."),
        gap=12)
    foot = btn("Quay lại", "secondary", to=back_to, trigger="Quay lại") + btn(confirm, "danger", "check", to=confirm_to, trigger=confirm)
    return dialog("Xác nhận thao tác nhạy cảm", body, foot, width, close_to=back_to, danger=True)


def menu(items, width=220) -> str:
    """items: [(label, icon, target|None, danger?)] or '-' for divider"""
    use("Menu")
    out = []
    for it in items:
        if it == "-":
            out.append(divider(4))
            continue
        lab, ic, to = it[0], it[1], it[2]
        dang = len(it) > 3 and it[3]
        c = T["danger"] if dang else T["text"]
        inner = row(icon(ic, 16, c), text(lab, 13, 500, c), gap=8)
        css = f"display: block; padding: 7px 10px; border-radius: 4px; text-decoration: none;"
        if to:
            edge(to, lab)
            out.append(f'<a href="{href(to)}" style="{css}">{inner}</a>')
        else:
            out.append(f'<div style="{css}">{inner}</div>')
    return popover(f'<div style="padding: 4px;">{"".join(out)}</div>', width)


# ---------------------------------------------------------------- misc
def page_root(inner, w, h, bg=None) -> str:
    return (f'<div style="width: {w}px; height: {h}px; overflow: hidden; position: relative; box-sizing: border-box; '
            f'background: {bg or T["background"]}; font-family: {FONT}; color: {T["text"]}; font-size: 14px; line-height: 22px;">{inner}</div>')


def map_placeholder(w="100%", h=320, pins=(), label="Bản đồ") -> str:
    """Neutral map canvas: grid + labelled pins; the real app uses a map SDK (Google Maps / Mapbox)."""
    use("MapView")
    pin_html = []
    for x, y, lab, tone in pins:
        c = TONES[tone][1]
        pin_html.append(f'<div style="position: absolute; left: {x}%; top: {y}%; transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; gap: 2px;">'
                        f'<span style="padding: 1px 6px; border-radius: 4px; background: {T["surface"]}; border: 1px solid {c}; font-size: 11px; font-weight: 600; color: {c}; white-space: nowrap;">{lab}</span>'
                        f'{icon("map-pin", 22, c, 2.2)}</div>')
    roads = (f'<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; inset: 0;">'
             f'<path d="M0 70 C 25 60, 40 75, 60 50 S 90 30, 100 35" stroke="{T["border-strong"]}" stroke-width="1.2" fill="none"></path>'
             f'<path d="M20 0 C 25 30, 35 50, 30 100" stroke="{T["border-strong"]}" stroke-width="0.8" fill="none"></path>'
             f'<path d="M70 0 C 65 40, 80 60, 75 100" stroke="{T["border"]}" stroke-width="0.8" fill="none"></path>'
             f'<path d="M0 30 L 100 20" stroke="{T["border"]}" stroke-width="0.6" fill="none"></path></svg>')
    return (f'<div role="img" aria-label="{label}" style="position: relative; width: {w}; height: {h}px; border-radius: 8px; overflow: hidden; '
            f'background: #EEF2EF; border: 1px solid {T["border"]};">{roads}{"".join(pin_html)}'
            f'<div style="position: absolute; right: 8px; bottom: 8px; padding: 2px 6px; border-radius: 4px; background: {T["surface"]}; font-size: 11px; color: {T["text-muted"]};">{label}</div></div>')


def photo_placeholder(w="100%", h=120, label="Ảnh") -> str:
    return (f'<div role="img" aria-label="{label}" style="width: {w}; height: {h}px; border-radius: 6px; background: {T["neutral-soft"]}; '
            f'border: 1px solid {T["border"]}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">'
            f'{icon("image", 24, T["text-subtle"], 1.5)}{subtle(label, 11)}</div>')


def skeleton(w="100%", h=12) -> str:
    use("Skeleton")
    return f'<div style="width: {w}; height: {h}px; border-radius: 4px; background: {T["neutral-soft"]};"></div>'


__all__ = [n for n in dir() if not n.startswith("_")] + ["money", "edge", "use", "href", "esc"]
