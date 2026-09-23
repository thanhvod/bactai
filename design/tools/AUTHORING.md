# Authoring BTA screen mockups

Mockups are generated from Python so every screen stays on the BTA design system, and every link is extracted into the navigation spec.

```
design/tools/
  build.py              # python3 design/tools/build.py [--allow-missing] [--canvas DIR]
  check_mockups.js      # OUT=/tmp/shots node design/tools/check_mockups.js <IDs...>  (clipping check + PNG)
  bta/core.py           # Screen dataclass, register(), edge()/use() context
  bta/ui.py             # primitives (tokens T, badge, btn, table, field, panel, drawer, dialog, charts…)
  bta/shells.py         # wm_shell, mobile_frame/mobile_header/bottom_nav/…, cw_shell
  bta/data.py           # seed data (doc/3-TECHNICAL/SEED-SCENARIOS.md)
  bta/flows.py          # business flows
  bta/screens/*.py      # one module per platform/module group — each calls register(Screen(...))
```

## Rules

1. **Screen IDs, names, routes** come from `doc/2-PRD/01-danh-sach-man-hinh.md` and `doc/2-PRD/05-route-map.md`. Do not invent IDs.
2. **Links = navigation spec.** Use `btn(..., to="ID")`, `a(label, "ID")`, `code(text, to="ID")`, `kpi(..., to="ID")`, `tabs(..., links={...})`,
   `menu([...])`, `list_row(..., to=)`, `m_card(..., to=)`, `mobile_header(back_to=)`, `drawer/dialog(close_to=)`. Each call records an edge
   (`trigger` label = what the user clicks). Every link target must be an existing screen ID. Link every outgoing relation listed in the
   "Liên kết" column of 01-danh-sach-man-hinh.md plus the obvious ones (breadcrumb, back, cancel, save → detail).
3. **Design system BTA only**: colors from `T[...]`, status badges via `status(label, "order"|"trip"|"fin")` or `badge(label, tone)`.
   Money via `money(int)` + `num()` (tabular, right aligned in tables). Codes: `DH-202609-0001`, `CX-…`, `PT-…`, `PC-…`, `BL-…`, `BK-…`.
   Dates `23/09/2026 14:30`. Vietnamese copy, sentence case, no emoji, no marketing copy, no gradients, radius ≤ 8px, no card-in-card.
4. **Patterns**: list = `page_header` → `filter_bar` → `table` → `pagination`; detail = `breadcrumb` → `banner`? → entity header + `summary_strip`
   → `tabs` (Tổng quan · nghiệp vụ · Tài chính · Chứng từ · Timeline); form = page or `drawer` with numbered sections; sensitive actions =
   `sensitive_modal`; drawers/modals are drawn over their base page via `wm_shell(..., overlay=(html, "right"|"center"|"top"|"topright"))`
   and the Screen gets `pattern="drawer"|"dialog"`, `overlay_of="<base ID>"`.
5. **Sizes**: web 1440 × h (h default 960; increase for long pages, keep content inside). Mobile 390 × 844 (Flutter dp). The root size is
   produced by the shell from `w`/`h`; pass the same `h` to the shell and to `Screen(h=...)` (build fails on mismatch).
6. **Driver app**: body ≥ 14px (use 15–16 for key data), tap targets ≥ 48px (`btn(size="lg")`), primary action full width at bottom via
   `primary_bottom_action`, confirmations via `bottom_sheet` in `mobile_frame(overlay=(sheet, "bottom"))`, offline via `sync_status`.
7. Fill `Screen(purpose, roles, api, data, actions, states, notes)` from the PRD docs (07-api-contract-map, 08-permission-matrix,
   03-detailed-task-specs). These become the implementation spec in `design/screens/<platform>/<ID>.md`.
8. After editing: `python3 design/tools/build.py --allow-missing` then `node design/tools/check_mockups.js <your IDs>`; fix every
   `clipped-*` issue (tables too wide → merge columns into two-line cells; page too tall → raise `h`). Look at the PNGs.
