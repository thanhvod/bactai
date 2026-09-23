"""Core registry + render context for BTA screen mockups.

Every screen is a `Screen` object. While a screen renders, `CTX` collects:
  - edges      : navigation links (from -> to, trigger label, kind)
  - components : design-system component names used on the screen
The build script turns this into navigation.json, per-screen specs and flow docs.
"""
from __future__ import annotations

import html as _html
from dataclasses import dataclass, field
from typing import Callable

PLATFORMS = {
    "wm": {"name": "Web Merchant", "phase": 1, "kind": "web", "stack": "React + Vite + Tailwind + shadcn/Radix (apps/web)"},
    "da": {"name": "App Tài xế", "phase": 1, "kind": "mobile", "stack": "Flutter + Bloc/Cubit (apps/driver-app)"},
    "ma": {"name": "App Merchant", "phase": 2, "kind": "mobile", "stack": "Flutter (apps/merchant-app, phase 2)"},
    "cw": {"name": "Web Khách hàng", "phase": 3, "kind": "web", "stack": "React + Vite (apps/customer-web, phase 3)"},
}


@dataclass
class Screen:
    id: str
    name: str
    platform: str  # wm | da | ma | cw
    module: str  # module / sidebar group label (Vietnamese)
    route: str  # web path or Flutter route name
    render: Callable[[], str]
    pattern: str = "page"  # list | detail | form | dashboard | drawer | dialog | auth | mobile | report | board
    purpose: str = ""
    roles: list = field(default_factory=list)
    api: list = field(default_factory=list)  # GraphQL operations
    data: list = field(default_factory=list)  # key data fields shown
    actions: list = field(default_factory=list)  # (label, permission/guard note)
    states: dict = field(default_factory=dict)  # loading/empty/error/offline notes
    notes: list = field(default_factory=list)  # implementation notes
    w: int = 1440
    h: int = 960
    overlay_of: str | None = None  # screen id underneath when this is a drawer/modal
    # filled by build
    edges: list = field(default_factory=list)
    components: list = field(default_factory=list)
    html: str = ""


REGISTRY: dict[str, Screen] = {}


def register(*screens: Screen):
    for s in screens:
        if s.id in REGISTRY:
            raise ValueError(f"duplicate screen id {s.id}")
        REGISTRY[s.id] = s


class Ctx:
    def __init__(self, sid: str):
        self.sid = sid
        self.edges: list[dict] = []
        self.components: list[str] = []

    def use(self, name: str):
        if name not in self.components:
            self.components.append(name)

    def edge(self, to: str, trigger: str, kind: str = "action"):
        key = (to, trigger, kind)
        if key not in {(e["to"], e["trigger"], e["kind"]) for e in self.edges}:
            self.edges.append({"from": self.sid, "to": to, "trigger": trigger, "kind": kind})


CTX = Ctx("-")


def set_ctx(sid: str) -> Ctx:
    global CTX
    CTX = Ctx(sid)
    return CTX


def use(name: str):
    CTX.use(name)


def edge(to: str, trigger: str, kind: str = "action"):
    CTX.edge(to, trigger, kind)


def href(to: str) -> str:
    """Artboard link. build.py rewrites `.dc.html` -> `.html` for standalone previews."""
    return f"{to}.dc.html"


def esc(s) -> str:
    return _html.escape(str(s), quote=True)


def money(v: int | None, sign: bool = False) -> str:
    if v is None:
        return "—"
    s = f"{abs(v):,}".replace(",", ".") + " đ"
    if v < 0:
        return "−" + s
    if sign and v > 0:
        return "+" + s
    return s
