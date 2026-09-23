#!/usr/bin/env python3
"""Build all BTA screen mockups + implementation specs.

Usage:
  python3 design/tools/build.py                 # writes repo outputs under design/
  python3 design/tools/build.py --canvas DIR    # also writes Design-canvas files to DIR/project/

Outputs (repo):
  design/mockups/*.html            standalone clickable HTML per screen (+ index.html, flows)
  design/spec/screens.json         every screen: meta, route, roles, api, data, actions, states, components, edges
  design/spec/navigation.json      navigation graph (from -> to, trigger, kind)
  design/spec/routes.web.ts        route constants for apps/web and apps/customer-web
  design/spec/routes.mobile.dart   route names for Flutter apps
  design/screens/<platform>/<ID>.md  per-screen implementation spec
  design/flows/<FLOW>.md           business flows with mermaid diagrams
  design/SCREEN-INDEX.md           index of every screen
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from bta import core  # noqa: E402
from bta.core import PLATFORMS, REGISTRY, set_ctx  # noqa: E402
from bta.flows import FLOWS  # noqa: E402
from bta.screens import load_all  # noqa: E402
from bta import ui as U  # noqa: E402

DESIGN = os.path.dirname(HERE)
FONT_LINK = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap"
PLATFORM_ORDER = ["wm", "da", "ma", "cw"]
MODULE_ORDER = {
    "wm": ["Auth & onboarding", "Khung chung", "Dashboard", "Đơn hàng", "Điều phối", "Khách hàng", "Tài xế", "Xe", "Nhà cung cấp",
           "Thu chi & Công nợ", "Lương", "Báo cáo", "Cài đặt"],
}
HELMET_STYLE = ("body{margin:0;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F7F8FA;color:#17202A}"
                "a{color:#2563EB}a:hover{color:#1D4ED8}")


# ---------------------------------------------------------------- render
def render_all():
    load_all()
    for s in REGISTRY.values():
        ctx = set_ctx(s.id)
        s.html = s.render()
        s.edges = ctx.edges
        s.components = ctx.components
        m = re.search(r'width: (\d+)px; height: (\d+)px;', s.html)
        if m and (int(m.group(1)), int(m.group(2))) != (s.w, s.h):
            raise SystemExit(f"{s.id}: root size {m.group(1)}x{m.group(2)} != declared {s.w}x{s.h}")


def validate():
    known = set(REGISTRY) | {f["id"] for f in FLOWS} | {"Main"}
    missing = defaultdict(list)
    for s in REGISTRY.values():
        for e in s.edges:
            if e["to"] not in known:
                missing[e["to"]].append(s.id)
    for f in FLOWS:
        for _, sid, _ in f["steps"]:
            if sid and sid not in REGISTRY:
                missing[sid].append(f["id"])
    return missing


# ---------------------------------------------------------------- overview + flow artboards
def sorted_screens(platform):
    order = MODULE_ORDER.get(platform, [])
    items = [s for s in REGISTRY.values() if s.platform == platform]
    mods = []
    for s in items:
        if s.module not in mods:
            mods.append(s.module)
    mods.sort(key=lambda m: order.index(m) if m in order else 100 + mods.index(m))
    by = {m: [s for s in items if s.module == m] for m in mods}
    return by


def render_main():
    set_ctx("Main")
    T = U.T
    blocks = []
    for p in PLATFORM_ORDER:
        by = sorted_screens(p)
        if not by:
            continue
        meta = PLATFORMS[p]
        count = sum(len(v) for v in by.values())
        mods = []
        for m, ss in by.items():
            chips = []
            for s in ss:
                core.edge(s.id, "Mở màn hình từ bản đồ", "index")
                chips.append(f'<a href="{core.href(s.id)}" style="display: flex; flex-direction: column; gap: 0; padding: 6px 10px; border: 1px solid {T["border"]}; '
                             f'border-radius: 6px; background: {T["surface"]}; text-decoration: none;">'
                             f'<span style="font-size: 11px; font-weight: 600; color: {T["primary"]}; {U.NUM}">{s.id}</span>'
                             f'<span style="font-size: 13px; color: {T["text"]};">{s.name}</span></a>')
            mods.append(U.col(U.text(f"{m} · {len(ss)}", 13, 600, T["text-muted"]), U.grid(chips, 4, 8), gap=8))
        blocks.append(U.panel(None, U.col(
            U.row(U.h("lg", meta["name"]), U.badge(f"Phase {meta['phase']}", "primary"), U.badge(f"{count} màn", "neutral"), U.spacer(),
                  U.muted(meta["stack"], 13), gap=10),
            U.grid(mods, 2, 20), gap=16), pad=20))
    flow_chips = []
    for f in FLOWS:
        core.edge(f["id"], "Mở flow", "index")
        flow_chips.append(f'<a href="{core.href(f["id"])}" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid {T["border"]}; '
                          f'border-radius: 6px; background: {T["surface"]}; text-decoration: none;">{U.icon("route", 16, T["primary"])}'
                          f'<span style="display: flex; flex-direction: column;"><span style="font-size: 11px; font-weight: 600; color: {T["primary"]};">{f["id"]}</span>'
                          f'<span style="font-size: 13px; color: {T["text"]};">{f["name"]}</span></span></a>')
    total = len(REGISTRY)
    edges = sum(len([e for e in s.edges if e["kind"] != "nav"]) for s in REGISTRY.values())
    head = U.col(
        U.row(U.logo(True, 36), U.spacer(), U.badge("Design system BTA", "primary"), gap=12),
        U.h("display", "BTA — Bản đồ màn hình & luồng liên kết"),
        U.muted(f"{total} màn hình trên 4 platform · {edges} liên kết thao tác · {len(FLOWS)} luồng nghiệp vụ. "
                "Bấm Play rồi click vào mã màn hình, nút hoặc link trong từng màn để đi theo luồng. "
                "Spec implement: design/SCREEN-INDEX.md, design/spec/navigation.json.", 14),
        gap=10)
    legend = U.row(U.badge("action", "accent"), U.muted("nút / link thao tác", 12), U.badge("nav", "neutral"), U.muted("sidebar, bottom nav, topbar", 12),
                   U.badge("back", "neutral"), U.muted("quay lại", 12), gap=8)
    body = U.col(head, legend, U.panel("Luồng nghiệp vụ", U.grid(flow_chips, 3, 8), pad=16), *blocks, gap=20)
    W, H = 1600, 3900
    return U.page_root(f'<div style="padding: 40px; display: flex; flex-direction: column; gap: 20px;">{body}</div>', W, H), W, H


def render_flow(f):
    set_ctx(f["id"])
    T = U.T
    actor_tone = {"User": "neutral", "System": "neutral", "Operation": "primary", "Driver": "accent", "Accountant": "info",
                  "Admin": "warning", "Customer": "success"}
    cards = []
    n = len(f["steps"])
    for i, (actor, sid, action) in enumerate(f["steps"]):
        if sid:
            s = REGISTRY.get(sid)
            core.edge(sid, f"Bước {i + 1}", "flow")
            title = (f'<a href="{core.href(sid)}" style="font-size: 12px; font-weight: 700; color: {T["primary"]}; text-decoration: none; {U.NUM}">{sid}</a>'
                     f'<span style="font-size: 14px; font-weight: 600; color: {T["text"]};">{s.name if s else "(chưa có)"}</span>'
                     f'<span style="font-size: 12px; color: {T["text-subtle"]}; {U.NUM}">{s.route if s else ""}</span>')
        else:
            title = f'<span style="font-size: 12px; font-weight: 700; color: {T["text-muted"]};">API / hệ thống</span>'
        cards.append(f'<div style="width: 250px; flex-shrink: 0; display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; background: {T["surface"]}; '
                     f'border: 1px solid {T["border-strong"] if sid else T["border"]}; border-radius: 8px; {"border-style: dashed;" if not sid else ""}">'
                     f'{U.row(U.text(str(i + 1), 12, 700, T["text-muted"]), U.badge(actor, actor_tone.get(actor, "neutral")), gap=6)}{title}'
                     f'<span style="font-size: 13px; color: {T["text"]}; line-height: 19px;">{action}</span></div>')
        if i < n - 1:
            cards.append(f'<div style="display: flex; align-items: center; flex-shrink: 0;">{U.icon("arrow-right", 22, T["text-subtle"])}</div>')
    per_row = 5
    rows_html = []
    chunk = []
    count = 0
    for c in cards:
        chunk.append(c)
        if 'width: 250px' in c:
            count += 1
        if count == per_row and 'width: 250px' in c:
            rows_html.append(U.row(*chunk, gap=10, align="stretch"))
            chunk, count = [], 0
    if chunk:
        rows_html.append(U.row(*chunk, gap=10, align="stretch"))
    nrows = len(rows_html)
    W = 1520
    H = 200 + nrows * 230
    back = U.btn("Bản đồ màn hình", "secondary", "arrow-left", to="Main", trigger="Về bản đồ", kind="back")
    body = U.col(U.row(U.col(U.text(f["id"], 13, 700, T["primary"]), U.h("display", f["name"]), U.muted(f"Nguồn: doc/2-PRD/{f['source']}", 13), gap=4),
                       U.spacer(), back, align="flex-start"),
                 *rows_html, gap=24)
    return U.page_root(f'<div style="padding: 40px; display: flex; flex-direction: column;">{body}</div>', W, H), W, H


# ---------------------------------------------------------------- writers
def dc_html(title, body, w, h):
    return f"""<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>{core.esc(title)}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="{FONT_LINK}">
<style>{HELMET_STYLE}</style>
</helmet>
{body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
renderVals() {{
return {{}};
}}
}}
</script>
</body>
</html>
"""


def standalone_html(title, body, w, h):
    body = re.sub(r'href="([A-Za-z0-9_-]+)\.dc\.html"', r'href="\1.html"', body)
    return f"""<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width={w}">
<title>{core.esc(title)}</title>
<link rel="stylesheet" href="{FONT_LINK}">
<style>{HELMET_STYLE} body{{background:#E4E8ED}} .frame{{margin:24px auto;width:{w}px;box-shadow:0 1px 3px rgba(23,32,42,.2)}}</style>
</head>
<body>
<div class="frame">{body}</div>
</body>
</html>
"""


def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(content)


def incoming():
    inc = defaultdict(list)
    for s in REGISTRY.values():
        for e in s.edges:
            inc[e["to"]].append(e)
    return inc


def screen_md(s, inc):
    p = PLATFORMS[s.platform]
    L = [f"# {s.id} — {s.name}", "",
         "| Thuộc tính | Giá trị |", "|---|---|",
         f"| Platform | {p['name']} (phase {p['phase']}) — {p['stack']} |",
         f"| Module | {s.module} |", f"| Route | `{s.route}` |", f"| Pattern | `{s.pattern}` |",
         f"| Roles | {', '.join(s.roles) or '—'} |",
         f"| Kích thước mockup | {s.w}×{s.h} |",
         f"| Mockup | [../../mockups/{s.id}.html](../../mockups/{s.id}.html) · canvas artboard `{s.id}.dc.html` |"]
    if s.overlay_of:
        L.append(f"| Overlay trên | [{s.overlay_of}](./{s.overlay_of}.md) (drawer/modal, không cần route riêng) |")
    L += ["", "## Mục đích", "", s.purpose or "—", ""]
    if s.data:
        L += ["## Dữ liệu hiển thị", ""] + [f"- `{d}`" for d in s.data] + [""]
    if s.actions:
        L += ["## Hành động & quyền", "", "| Hành động | Permission / guard |", "|---|---|"]
        L += [f"| {a_[0]} | {a_[1]} |" for a_ in s.actions] + [""]
    act = [e for e in s.edges if e["kind"] != "nav"]
    nav = [e for e in s.edges if e["kind"] == "nav"]
    L += ["## Điều hướng đi (outgoing)", "", "| Trigger | Đích | Route đích | Loại |", "|---|---|---|---|"]
    for e in act + nav:
        t = REGISTRY.get(e["to"])
        route = t.route if t else ""
        name = t.name if t else e["to"]
        L.append(f"| {e['trigger']} | [{e['to']}](../{t.platform}/{e['to']}.md) {name} | `{route}` | {e['kind']} |" if t else
                 f"| {e['trigger']} | {e['to']} | | {e['kind']} |")
    ins = [e for e in inc.get(s.id, []) if e["kind"] != "nav"]
    L += ["", "## Điều hướng đến (incoming)", ""]
    if ins:
        L += ["| Từ | Trigger |", "|---|---|"]
        for e in ins:
            fr = REGISTRY.get(e["from"])
            L.append(f"| [{e['from']}](../{fr.platform}/{e['from']}.md) {fr.name} | {e['trigger']} |" if fr else f"| {e['from']} | {e['trigger']} |")
    else:
        L.append("- Chỉ vào qua điều hướng chính (sidebar / bottom nav) hoặc deep link.")
    L += ["", "## Components (design system)", "", ", ".join(f"`{c}`" for c in s.components), ""]
    if s.api:
        L += ["## API (GraphQL)", ""] + [f"- `{x}`" for x in s.api] + [""]
    L += ["## Trạng thái UI", ""]
    st = dict(s.states)
    defaults = {"loading": "Skeleton (detail) / DataTable loading (list); spinner chỉ trong nút.",
                "empty": "EmptyState: icon line + 1 câu + action tiếp theo nếu có quyền.",
                "error": "Nói rõ lỗi gì, có thử lại được không."}
    if s.platform == "da":
        defaults["offline"] = "Banner nhỏ + SyncStatus; thao tác được xếp hàng đợi, không mất dữ liệu."
    for k, v in defaults.items():
        st.setdefault(k, v)
    L += [f"- **{k}**: {v}" for k, v in st.items()] + [""]
    if s.notes:
        L += ["## Ghi chú implement", ""] + [f"- {n}" for n in s.notes] + [""]
    return "\n".join(L)


def flow_md(f):
    L = [f"# {f['id']} — {f['name']}", "", f"Nguồn: `doc/2-PRD/{f['source']}` · Mockup: [../mockups/{f['id']}.html](../mockups/{f['id']}.html)", "",
         "```mermaid", "flowchart LR"]
    prev = None
    for i, (actor, sid, action) in enumerate(f["steps"]):
        nid = f"S{i + 1}"
        label = f"{i + 1}. {actor}<br/>{sid or 'API'}<br/>{action}".replace('"', "'")
        L.append(f'  {nid}["{label}"]')
        if prev:
            L.append(f"  {prev} --> {nid}")
        prev = nid
    L += ["```", "", "| # | Actor | Màn hình | Route | Hành động |", "|---:|---|---|---|---|"]
    for i, (actor, sid, action) in enumerate(f["steps"]):
        s = REGISTRY.get(sid) if sid else None
        scr = f"[{sid}](../screens/{s.platform}/{sid}.md) {s.name}" if s else "API"
        L.append(f"| {i + 1} | {actor} | {scr} | `{s.route if s else ''}` | {action} |")
    return "\n".join(L) + "\n"


def index_md():
    L = ["# BTA — Screen index", "", "Sinh tự động bởi `python3 design/tools/build.py`. Không sửa tay.", ""]
    for p in PLATFORM_ORDER:
        by = sorted_screens(p)
        if not by:
            continue
        meta = PLATFORMS[p]
        L += [f"## {meta['name']} (phase {meta['phase']})", "", f"Stack: {meta['stack']}", ""]
        for m, ss in by.items():
            L += [f"### {m}", "", "| ID | Màn hình | Route | Pattern | Đi tới |", "|---|---|---|---|---|"]
            for s in ss:
                outs = sorted({e["to"] for e in s.edges if e["kind"] not in ("nav", "back")})
                L.append(f"| [{s.id}](screens/{p}/{s.id}.md) | {s.name} | `{s.route}` | {s.pattern} | {', '.join(outs)} |")
            L.append("")
    L += ["## Flows", ""] + [f"- [{f['id']}](flows/{f['id']}.md) — {f['name']}" for f in FLOWS]
    return "\n".join(L) + "\n"


def usage_md():
    by = defaultdict(list)
    for s in REGISTRY.values():
        for c in s.components:
            by[c].append(s.id)
    L = ["# Component usage", "", "Sinh tự động bởi `design/tools/build.py`. Định nghĩa props: [COMPONENTS.md](COMPONENTS.md).", "",
         "| Component | Số màn | Màn hình |", "|---|---:|---|"]
    for c in sorted(by, key=lambda c: (-len(by[c]), c)):
        ids = by[c]
        L.append(f"| `{c}` | {len(ids)} | {', '.join(ids[:40])}{' …' if len(ids) > 40 else ''} |")
    return "\n".join(L) + "\n"


def routes_ts():
    L = ["// Generated by design/tools/build.py — screen id -> route. Do not edit by hand.", "export const WEB_ROUTES = {"]
    for s in REGISTRY.values():
        if s.platform in ("wm", "cw") and s.route.startswith("/"):
            L.append(f"  '{s.id}': '{s.route.split(' ')[0]}',")
    L.append("} as const;\n")
    return "\n".join(L)


def routes_dart():
    L = ["// Generated by design/tools/build.py — screen id -> route name. Do not edit by hand.", "class BtaRoutes {"]
    for s in REGISTRY.values():
        if s.platform in ("da", "ma"):
            name = re.sub(r"[^A-Za-z0-9]", "_", s.id).lower()
            L.append(f"  static const {name} = '{s.route}';")
    L.append("}\n")
    return "\n".join(L)


# ---------------------------------------------------------------- canvas layout
def canvas_index(boards_meta):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    pages = [{"id": "overview", "name": "Tổng quan & flows"}] + [{"id": p, "name": PLATFORMS[p]["name"]} for p in PLATFORM_ORDER]
    boards, order, notes = {}, [], {}
    # overview page
    x = 0
    main_w, main_h = boards_meta["Main"]
    boards["Main.dc.html"] = {"x": 0, "y": 0, "w": main_w, "h": main_h, "title": "Bản đồ màn hình", "page": "overview", "is_interactive": True}
    order.append("Main.dc.html")
    y = 0
    fx = main_w + 160
    notes["flows"] = {"x": fx, "y": -300, "text": "Luồng nghiệp vụ", "kind": "title1", "maxW": 1520, "page": "overview"}
    for f in FLOWS:
        w, h = boards_meta[f["id"]]
        boards[f"{f['id']}.dc.html"] = {"x": fx, "y": y, "w": w, "h": h, "title": f"{f['id']} · {f['name']}", "page": "overview", "is_interactive": True}
        order.append(f"{f['id']}.dc.html")
        y += h + 120
    for p in PLATFORM_ORDER:
        by = sorted_screens(p)
        per_row = 5 if PLATFORMS[p]["kind"] == "web" else 10
        y = 0
        for m, ss in by.items():
            notes[f"{p}-{re.sub(r'[^a-z0-9]', '', m.lower().encode('ascii', 'ignore').decode()) or 'm'}-{len(notes)}"] = {
                "x": 0, "y": y - 300, "text": f"{m}", "kind": "title1", "maxW": 4000, "page": p}
            x = 0
            row_h = 0
            for i, s in enumerate(ss):
                if i and i % per_row == 0:
                    y += row_h + 120
                    x, row_h = 0, 0
                boards[f"{s.id}.dc.html"] = {"x": x, "y": y, "w": s.w, "h": s.h, "title": f"{s.id} · {s.name}", "page": p, "is_interactive": True}
                order.append(f"{s.id}.dc.html")
                x += s.w + 80
                row_h = max(row_h, s.h)
            y += row_h + 420
    return {"v": 3, "createdOnFiles": {"v": 1, "at": now}, "title": "BTA — Toàn bộ màn hình UI",
            "launch": {"view": "canvas", "page": "overview"}, "pages": pages, "boards": boards, "order": order, "notes": notes,
            "designSystems": [{"title": "BTA", "namespace": "bta", "artifact": "https://claude.ai/code/artifact/7410384a-c39e-4703-a60d-9b656513e40c",
                               "version": "1790138016-10cd", "copiedAt": now}]}


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--canvas", help="write Design canvas files to DIR/project/")
    ap.add_argument("--allow-missing", action="store_true")
    args = ap.parse_args()

    render_all()
    missing = validate()
    if missing:
        print("Missing link targets:")
        for k, v in sorted(missing.items()):
            print(f"  {k} <- {', '.join(sorted(set(v)))}")
        if not args.allow_missing:
            raise SystemExit(1)

    main_html, mw, mh = render_main()
    main_edges = core.CTX.edges
    flows_html = {}
    for f in FLOWS:
        flows_html[f["id"]] = render_flow(f)

    # repo outputs
    mock = os.path.join(DESIGN, "mockups")
    for s in REGISTRY.values():
        write(os.path.join(mock, f"{s.id}.html"), standalone_html(f"{s.id} {s.name}", s.html, s.w, s.h))
        write(os.path.join(DESIGN, "screens", s.platform, f"{s.id}.md"), screen_md(s, incoming()))
    write(os.path.join(mock, "index.html"), standalone_html("BTA — Bản đồ màn hình", main_html, mw, mh))
    write(os.path.join(mock, "Main.html"), standalone_html("BTA — Bản đồ màn hình", main_html, mw, mh))
    for f in FLOWS:
        html, w, h = flows_html[f["id"]]
        write(os.path.join(mock, f"{f['id']}.html"), standalone_html(f"{f['id']} {f['name']}", html, w, h))
        write(os.path.join(DESIGN, "flows", f"{f['id']}.md"), flow_md(f))
    spec = []
    for s in REGISTRY.values():
        spec.append({"id": s.id, "name": s.name, "platform": s.platform, "platformName": PLATFORMS[s.platform]["name"],
                     "phase": PLATFORMS[s.platform]["phase"], "module": s.module, "route": s.route, "pattern": s.pattern,
                     "purpose": s.purpose, "roles": s.roles, "api": s.api, "data": s.data,
                     "actions": [{"label": a_[0], "guard": a_[1]} for a_ in s.actions], "states": s.states, "notes": s.notes,
                     "overlayOf": s.overlay_of, "components": s.components, "size": {"w": s.w, "h": s.h},
                     "mockup": f"design/mockups/{s.id}.html", "spec": f"design/screens/{s.platform}/{s.id}.md"})
    write(os.path.join(DESIGN, "spec", "screens.json"), json.dumps(spec, ensure_ascii=False, indent=2))
    nav = [e for s in REGISTRY.values() for e in s.edges]
    write(os.path.join(DESIGN, "spec", "navigation.json"), json.dumps(
        {"kinds": {"action": "nút/link thao tác trong màn", "nav": "sidebar/topbar/bottom nav", "back": "quay lại",
                   "flow": "bước trong flow", "index": "bản đồ"},
         "edges": nav, "flows": [{"id": f["id"], "name": f["name"], "source": f["source"],
                                  "steps": [{"actor": a_, "screen": s_, "action": t_} for a_, s_, t_ in f["steps"]]} for f in FLOWS]},
        ensure_ascii=False, indent=2))
    write(os.path.join(DESIGN, "spec", "routes.web.ts"), routes_ts())
    write(os.path.join(DESIGN, "spec", "routes.mobile.dart"), routes_dart())
    write(os.path.join(DESIGN, "SCREEN-INDEX.md"), index_md())
    write(os.path.join(DESIGN, "COMPONENT-USAGE.md"), usage_md())

    # canvas outputs
    if args.canvas:
        proj = os.path.join(args.canvas, "project")
        meta = {"Main": (mw, mh)}
        write(os.path.join(proj, "Main.dc.html"), dc_html("BTA — Bản đồ màn hình", main_html, mw, mh))
        for f in FLOWS:
            html, w, h = flows_html[f["id"]]
            meta[f["id"]] = (w, h)
            write(os.path.join(proj, f"{f['id']}.dc.html"), dc_html(f"{f['id']} {f['name']}", html, w, h))
        for s in REGISTRY.values():
            write(os.path.join(proj, f"{s.id}.dc.html"), dc_html(f"{s.id} {s.name}", s.html, s.w, s.h))
        write(os.path.join(proj, "canvas.json"), json.dumps(canvas_index(meta), ensure_ascii=False, indent=1))
    by_p = defaultdict(int)
    for s in REGISTRY.values():
        by_p[s.platform] += 1
    print(f"screens: {len(REGISTRY)} {dict(by_p)} | edges: {len(nav)} | flows: {len(FLOWS)}")


if __name__ == "__main__":
    main()
