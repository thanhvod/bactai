"""Web Merchant — Thu chi & Công nợ (WM-FIN-01, WM-PAY-01..04, WM-EXP-01..03, WM-DEBT-01..04, WM-COD-01, WM-ADV-01).

Business rules shown on every money screen (doc/1-BRD/03, 04; doc/4-DESIGN/00 §Tiền):
  - Doanh thu ghi nhận trên đơn hàng; phiếu thu chỉ là tiền vào (không phải doanh thu).
  - Tài xế nộp COD = thu hồi khoản phải thu từ tài xế, KHÔNG phải doanh thu.
  - Phần phiếu thu khách chưa phân bổ = số dư (credit) của khách.
  - Tạm ứng chuyến không phải chi phí cho đến khi đối soát.
  - Bảng kê đã chốt là snapshot, không đổi khi đơn/phiếu thay đổi.
"""
from .. import data as D
from ..core import Screen, register
from ..shells import wm_shell
from ..ui import *  # noqa: F401,F403

ROLES_FIN = ["admin", "accountant", "operation"]
ROOT = ("Thu chi & Công nợ", "WM-FIN-01")

# ---------------------------------------------------------------- local data (extends data.py, same code formats)
# Trip-advance reconciliation of CX-202609-0005 (Trần Minh Lái): advance + 2 costs paid from the advance.
EXTRA_EXPENSES = [
    ("PC-202609-0007", "Tạm ứng chuyến", "Trần Minh Lái · CX-202609-0005", 1_500_000, "21/09/2026", "Công ty", "Đã trả"),
    ("PC-202609-0008", "Phí cầu đường", "CX-202609-0005 · Trần Minh Lái", 180_000, "22/09/2026", "Chi từ tạm ứng", "Chờ đối soát"),
    ("PC-202609-0009", "Bốc xếp", "CX-202609-0005 · Trần Minh Lái", 400_000, "22/09/2026", "Chi từ tạm ứng", "Chờ đối soát"),
]
EXPENSES = D.EXPENSES + EXTRA_EXPENSES

# Expense sub-category -> top-level loại chi (7 loại in WM-EXP-03)
EXP_GROUP = {"Phí cầu đường": "Chi phí chuyến", "Bốc xếp": "Chi phí chuyến", "Chi phí chuyến": "Chi phí chuyến",
             "Nhiên liệu": "Vật tư xe", "Sửa chữa": "Vật tư xe", "Thuê xe ngoài": "Thuê xe ngoài",
             "Tạm ứng chuyến": "Tạm ứng chuyến"}

# Payment -> where the money went (allocation / COD settlement)
PAY_TARGET = {"PT-202609-0001": "→ DH-202608-0009", "PT-202609-0004": "→ DH-202609-0010",
              "PT-202609-0003": "Đối trừ COD DH-202609-0007", "PT-202609-0002": "Vào số dư khách", "PT-202609-0005": "Không gắn đơn"}

# COD held by Trần Minh Lái (seed: collected 7.500.000, remitted 2.000.000, held 5.500.000)
# order, customer, trip, stop, collected_at, days, cod_actual, remitted, held
COD_ITEMS = [
    ("DH-202609-0007", "Kho Thép An Phát", "CX-202609-0007", "Công trình Quận 7", "19/09/2026 16:40", 4, 3_000_000, 2_000_000, 1_000_000),
    ("DH-202609-0008", "Nông sản Đồng Tháp Xanh", "CX-202609-0008", "Kho Thủ Đức", "21/09/2026 11:15", 2, 4_500_000, 0, 4_500_000),
]

PAY_TYPE = {"Khách trả": ("accent", "building-2"), "Tài xế nộp COD": ("primary", "hand-coins"), "Thu khác": ("neutral", "receipt")}


def _d(s):
    dd, mm, yy = s.split("/")
    return (int(yy), int(mm), int(dd))


def _ptype(t):
    tone, ic = PAY_TYPE[t]
    return badge(t, tone, ic, outline=True)


def _pay_status(p):
    if p[1] == "Tài xế nộp COD":
        return badge("Đã đối trừ COD", "success")
    return status(p[7], "fin")


def _payer(p, size=13):
    name = p[2]
    if p[1] == "Khách trả":
        return a(name, "WM-CUS-05", f"Mở công nợ khách {name}", size, 500)
    if p[1] == "Tài xế nộp COD":
        return a(name, "WM-DRV-05", f"Mở sổ công nợ tài xế {name}", size, 500)
    return text(name, size, 500)


def _exp_status(e):
    if e[6] == "Chờ đối soát":
        return badge("Chờ đối soát", "info")
    if e[1] == "Tạm ứng chuyến" and e[6] == "Đã trả":
        return row(status("Đã trả", "fin"), badge("Chờ đối soát", "info") if e[0] in ("PC-202609-0004", "PC-202609-0007") else "", gap=4)
    return status(e[6], "fin")


def _cash_out(e):
    """Tiền thực sự ra khỏi quỹ/tài khoản công ty."""
    if e[6] == "Đã trả" and e[5] == "Công ty":
        return num(money(e[3]), weight=600, color=T["danger"])
    why = {"Tài xế chi trước": "chờ hoàn tài xế", "Chi từ tạm ứng": "trừ vào tạm ứng"}.get(e[5], "chưa trả")
    return col(muted("—"), subtle(why, 11), gap=0, extra="align-items: flex-end;")


def _section(n, title, body, right="", sub=None):
    head = row(f'<span style="display: inline-flex; width: 22px; height: 22px; border-radius: 50%; background: {T["primary-soft"]}; '
               f'color: {T["primary"]}; font-size: 12px; font-weight: 700; align-items: center; justify-content: center; flex-shrink: 0;">{n}</span>',
               col(h("sm", title), muted(sub, 12) if sub else "", gap=0), spacer(), right, gap=8)
    return panel(None, col(head, body, gap=14))


def _picker(value, sub, ic="building-2"):
    use("EntityPicker")
    return (f'<div style="display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 10px; box-sizing: border-box; border: 1px solid {T["border-control"]}; '
            f'border-radius: 4px; background: {T["surface"]};">{icon(ic, 16, T["text-muted"])}'
            f'<div style="display: flex; flex-direction: column; flex-grow: 1; min-width: 0;">{text(value, 14, 500)}{subtle(sub, 11)}</div>'
            f'{icon("chevron-down", 16, T["text-muted"])}</div>')


def _impact(rows_):
    """Before → after preview lines: [(label, before, after, tone)]"""
    out = []
    for lab, before, after, tone in rows_:
        c = TONES[tone][1] if tone else T["text"]
        out.append(col(muted(lab, 12), row(num(before, 13, 400, T["text-muted"]), icon("arrow-right", 14, T["text-subtle"]),
                                          num(after, 14, 600, c), gap=6), gap=2))
    return col(*out, gap=10)


def _check(ok, label, detail, tone=None):
    tone = tone or ("success" if ok else "warning")
    ic = "circle-check" if ok else "triangle-alert"
    return row(icon(ic, 16, TONES[tone][1]), col(text(label, 13, 500), subtle(detail, 12), gap=0), gap=8, align="flex-start")


def _entity_header(crumbs, code_, badges, sub, meta, actions):
    use("EntityHeader")
    head = row(col(row(h("display", code_), *badges, gap=10), sub, subtle(meta, 12), gap=4), spacer(), actions, align="flex-start")
    return col(breadcrumb(crumbs), head, gap=12)


def _kpis(*items):
    return grid(list(items), len(items), 12)


# ---------------------------------------------------------------- WM-FIN-01 Sổ thu chi
def fin_01():
    entries = []
    for p in D.PAYMENTS:
        entries.append(("in", p[5], p))
    for e in EXPENSES:
        entries.append(("out", e[4], e))
    entries.sort(key=lambda x: _d(x[1]), reverse=True)
    rows = []
    for kind, date, x in entries:
        if kind == "in":
            rows.append([col(code(x[0], to="WM-PAY-02", trigger="Mở chi tiết phiếu thu"), subtle(date, 11), gap=0),
                         col(row(badge("Thu", "success", "arrow-down"), text(x[1], 13, 500), gap=6),
                             subtle("Thu hồi — không phải doanh thu", 11) if x[1] == "Tài xế nộp COD" else subtle(x[6], 11), gap=0),
                         col(_payer(x), subtle(PAY_TARGET.get(x[0], ""), 11), gap=0),
                         _pay_status(x), num(money(x[3])),
                         num(money(x[3]), weight=600, color=T["success"]), muted("—"), muted("P. N. Mai", 12)])
        else:
            grp = EXP_GROUP.get(x[1], x[1])
            rows.append([col(code(x[0], to="WM-EXP-02", trigger="Mở chi tiết phiếu chi"), subtle(date, 11), gap=0),
                         col(row(badge("Chi", "danger", "arrow-up"), text(grp, 13, 500), gap=6),
                             subtle(x[1] + (" · " + x[5] if x[5] != "Công ty" else ""), 11) if x[1] != grp else subtle(x[5], 11), gap=0),
                         col(text(x[2].split(" · ")[0], 13, 500), subtle(" · ".join(x[2].split(" · ")[1:]), 11), gap=0),
                         _exp_status(x), num(money(x[3])), muted("—"), _cash_out(x),
                         muted("L. T. Vân" if x[1] in ("Phí cầu đường", "Bốc xếp", "Thuê xe ngoài") else "P. N. Mai", 12)])
    cols = [("Mã phiếu · Ngày", "left", "132px"), ("Loại", "left"), ("Đối tượng · Gắn với", "left"), ("Trạng thái", "left"),
            ("Số tiền phiếu", "right"), ("Tiền vào", "right"), ("Tiền ra", "right"), ("Người tạo", "left")]
    total = ["Tổng kỳ (14 phiếu)", "", "", "", "", money(17_700_000), money(8_700_000), ""]

    create_menu = menu([("Phiếu thu · Khách trả", "receipt", "WM-PAY-03"), ("Phiếu thu · Tài xế nộp COD", "hand-coins", "WM-PAY-03"),
                        ("Phiếu thu · Thu khác", "plus", "WM-PAY-03"), "-",
                        ("Phiếu chi · Chi phí/NCC", "receipt-text", "WM-EXP-03"), ("Phiếu chi · Tạm ứng chuyến", "coins", "WM-EXP-03")], 260)
    create = (f'<div style="position: relative;">{btn("Tạo phiếu", "primary", "plus")}'
              f'<div style="position: absolute; top: 42px; right: 0; z-index: 5;">{create_menu}</div></div>')
    content = col(
        page_header("Sổ thu chi", "Mọi phiếu thu và phiếu chi của nhà xe. Tiền vào/ra là dòng tiền thực, không phải doanh thu/chi phí.",
                    row(btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất sổ thu chi"), create, gap=8)),
        _kpis(kpi("Tiền vào tháng 9", money(17_700_000), "Khách trả 14,5 tr · COD nộp 2 tr · Thu khác 1,2 tr", "success", "arrow-down",
                  to="WM-PAY-01", trigger="KPI tiền vào → danh sách phiếu thu"),
              kpi("Tiền ra tháng 9", money(8_700_000), "Đã chi từ quỹ/tài khoản", "danger", "arrow-up", to="WM-EXP-01", trigger="KPI tiền ra → phiếu chi"),
              kpi("Chi phí chưa trả", money(11_300_000), "NCC 10,5 tr · hoàn tài xế 0,8 tr", "warning", "clock", to="WM-DEBT-02", trigger="KPI chưa trả → công nợ NCC"),
              kpi("Phiếu thu chưa phân bổ", money(3_000_000), "1 phiếu · đang là số dư khách", "info", "scale", to="WM-PAY-02", trigger="KPI chưa phân bổ → PT-202609-0002")),
        filter_bar("Tìm mã phiếu, khách, tài xế, NCC…", ["Tất cả", "Phiếu thu", "Phiếu chi", "Chưa trả", "Chưa phân bổ", "Chờ đối soát"],
                   date="01/09 – 30/09/2026", selects=["Loại", "Người tạo"]),
        banner("Tiền vào gồm " + text("2.000.000 đ tài xế nộp COD", 13, 600) + " — là thu hồi tiền tài xế giữ hộ, không cộng vào doanh thu. "
               "Khoản chi tài xế chi trước hoặc chi từ tạm ứng chưa làm giảm quỹ.", "info",
               action=a("Xem doanh thu – chi phí", "WM-RPT-02", "Mở báo cáo doanh thu/chi phí/lãi lỗ")),
        table(cols, rows, footer=pagination("1–14", 14), total_row=total, compact=True),
        gap=16)
    return wm_shell("finance", content, h=1100, child="WM-FIN-01")


# ---------------------------------------------------------------- WM-PAY-01 Danh sách phiếu thu
def pay_01():
    rows = []
    sel = None
    for i, p in enumerate(sorted(D.PAYMENTS, key=lambda p: _d(p[5]), reverse=True)):
        c, t, payer, amt, unalloc, date, method, stt = p
        if t == "Khách trả":
            alloc_c = num(money(amt - unalloc), color=T["success"] if amt - unalloc else T["text-muted"])
            left = num(money(unalloc), weight=600, color=T["info"]) if unalloc else num(money(0), color=T["text-muted"])
        else:
            alloc_c, left = muted("—"), muted("—")
        act = btn("Phân bổ", "secondary", "list-checks", size="sm", to="WM-PAY-04", trigger="Phân bổ phiếu thu") if unalloc else row_menu()
        if unalloc:
            sel = i
        rows.append([col(code(c, to="WM-PAY-02", trigger="Click mã phiếu → chi tiết"), subtle(date, 11), gap=0), _ptype(t),
                     col(_payer(p), subtle(PAY_TARGET.get(c, ""), 11), gap=0), muted(method),
                     num(money(amt), weight=600), alloc_c, left, _pay_status(p), act])
    cols = [("Mã phiếu · Ngày thu", "left", "150px"), ("Loại thu", "left"), ("Người nộp · Phân bổ", "left"), ("Hình thức", "left"),
            ("Số tiền", "right"), ("Đã phân bổ", "right"), ("Còn treo", "right"), ("Trạng thái", "left"), ("", "right", "96px")]
    content = col(
        page_header("Phiếu thu", "Tiền khách trả, tài xế nộp COD và các khoản thu khác",
                    row(btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất danh sách phiếu thu"),
                        btn("Tạo phiếu thu", "primary", "plus", to="WM-PAY-03", trigger="Tạo phiếu thu"), gap=8),
                    crumbs=[ROOT, ("Phiếu thu", None)]),
        _kpis(kpi("Khách trả", money(14_500_000), "3 phiếu · phân bổ vào đơn", None, "building-2"),
              kpi("Tài xế nộp COD", money(2_000_000), "Thu hồi — không tính doanh thu", "primary", "hand-coins", to="WM-COD-01", trigger="KPI COD → COD tài xế đang giữ"),
              kpi("Thu khác", money(1_200_000), "Thanh lý, hoàn tiền…", None, "receipt"),
              kpi("Còn treo (chưa phân bổ)", money(3_000_000), "= số dư khách Bao bì Hưng Lợi", "info", "scale", to="WM-DEBT-01", trigger="KPI còn treo → công nợ khách")),
        filter_bar("Tìm mã phiếu, người nộp, nội dung CK…", ["Tất cả", "Khách trả", "Tài xế nộp COD", "Thu khác", "Còn treo"],
                   date="01/09 – 30/09/2026", selects=["Hình thức"]),
        table(cols, rows, selected=sel, footer=pagination("1–5", 5), compact=False,
              total_row=["Tổng 5 phiếu", "", "", "", money(17_700_000), money(11_500_000), money(3_000_000), "", ""]),
        row(icon("info", 14, T["text-muted"]), subtle("Còn treo = số tiền phiếu khách trả chưa phân bổ vào đơn, được ghi vào số dư của khách. "
                                                      "Phiếu tài xế nộp COD đối trừ COD đang giữ, không phân bổ vào đơn.", 12), gap=6),
        gap=16)
    return wm_shell("finance", content, h=900, child="WM-PAY-01")


# ---------------------------------------------------------------- WM-PAY-02 Chi tiết phiếu thu
def pay_02():
    actions = row(btn("Timeline", "secondary", "history", to="WM-SHELL-07", trigger="Mở Timeline drawer"),
                  btn("In phiếu thu", "secondary", "printer", to="WM-SHELL-05", trigger="In phiếu thu"),
                  btn("Sửa", "secondary", "pencil", to="WM-SHELL-08", trigger="Sửa phiếu thu (sensitive, cần lý do)"),
                  btn("Hủy phiếu", "danger-outline", "x", to="WM-SHELL-08", trigger="Hủy phiếu thu (sensitive, cần lý do)"),
                  btn("Phân bổ vào đơn", "primary", "list-checks", to="WM-PAY-04", trigger="Phân bổ vào đơn"), gap=8)
    header = _entity_header([ROOT, ("Phiếu thu", "WM-PAY-01"), ("PT-202609-0002", None)], "PT-202609-0002",
                            [status("Chưa phân bổ", "fin"), _ptype("Khách trả")],
                            row(a("Bao bì Hưng Lợi", "WM-CUS-02", "Mở khách hàng", 14), muted("·"), text("Chuyển khoản · 18/09/2026", 14), gap=8),
                            "Tạo 18/09/2026 09:12 bởi Phan Ngọc Mai · Cập nhật 18/09/2026 09:12", actions)
    strip = summary_strip([("Số tiền phiếu", money(3_000_000)), ("Đã phân bổ", money(0)), ("Chưa phân bổ", money(3_000_000), "info"),
                           ("Số dư khách hiện tại", money(3_000_000), "info"), ("Tác động doanh thu", "Không")])
    info = panel("Thông tin phiếu thu", dl([
        ("Loại thu", "Khách trả"), ("Người nộp", "Bao bì Hưng Lợi (CUS-A-003)"),
        ("Số tiền", num(money(3_000_000), 14, 600)), ("Ngày thu", num("18/09/2026")),
        ("Hình thức", "Chuyển khoản"), ("Tài khoản nhận", num("Vietcombank ···· 6789")),
        ("Nội dung chuyển khoản", "HUNG LOI TT CUOC T9"), ("Ghi chú", "Khách trả trước cho đơn tháng 9")], cols=4))
    alloc = panel("Phân bổ vào đơn", col(
        banner("3.000.000 đ chưa phân bổ đang nằm trong <b>số dư của khách</b>. Phân bổ vào đơn khi khách xác nhận trả cho đơn nào.", "info"),
        table([("Mã đơn", "left"), ("Tuyến", "left"), ("Ngày phân bổ", "left"), ("Người phân bổ", "left"), ("Số tiền", "right")], [],
              empty=empty_state("list-checks", "Chưa phân bổ vào đơn nào", btn("Phân bổ vào đơn", "secondary", "list-checks", size="sm", to="WM-PAY-04",
                                                                          trigger="Empty state: phân bổ"), "Có 1 đơn của khách có thể nhận phân bổ.", 20),
              compact=True), gap=12),
        a("Xem công nợ khách", "WM-CUS-05", "Mở công nợ khách"), sub="Một phiếu có thể phân bổ vào nhiều đơn của cùng khách")
    credit = panel("Lịch sử số dư khách", table([("Ngày", "left"), ("Nguồn", "left"), ("Biến động", "right"), ("Số dư sau", "right")],
                                                [[num("18/09/2026 09:12"), code("PT-202609-0002"), num(money(3_000_000, True), weight=600, color=T["success"]),
                                                  num(money(3_000_000), weight=600)],
                                                 [num("05/09/2026 10:30"), muted("Đầu kỳ"), muted("—"), num(money(0))]], compact=True), body_pad=False)
    left = col(info, alloc, credit, gap=16, extra="flex: 2; min-width: 0;")
    right = col(
        panel("Khách hàng", partner_card("Bao bì Hưng Lợi", "CUS-A-003", [("Còn nợ", money(0)), ("Số dư (credit)", money(3_000_000)),
                                                                        ("Hạn mức", money(50_000_000)), ("Đơn có thể phân bổ", "DH-202609-0012")], to="WM-CUS-02")),
        panel("Chứng từ", attachment_list([("UNC_VCB_180926.pdf", "Ủy nhiệm chi", "182 KB · 18/09 09:10", "file-text")], to="WM-SHELL-06"),
              btn("Tải lên", "ghost", "upload", size="sm")),
        panel("Audit", timeline([("18/09/2026 09:12", "Phan Ngọc Mai", "Tạo phiếu thu <b>3.000.000 đ</b> · Chuyển khoản", None, "success"),
                                 ("18/09/2026 09:12", "Hệ thống", "Ghi <b>+3.000.000 đ</b> vào số dư khách Bao bì Hưng Lợi", None, "info")]),
              a("Xem tất cả", "WM-SHELL-07", "Mở Timeline")),
        gap=16, extra="flex: 1; min-width: 0;")
    content = col(header, strip, tabs(["Tổng quan", "Phân bổ", "Chứng từ", "Timeline"], 0, {"Timeline": "WM-SHELL-07"},
                                      counts={"Phân bổ": 0, "Chứng từ": 1}),
                  row(left, right, gap=16, align="flex-start"), gap=16)
    return wm_shell("finance", content, h=1140, child="WM-PAY-01")


# ---------------------------------------------------------------- WM-PAY-03 Tạo phiếu thu (loại = Tài xế nộp COD)
def pay_03():
    kind = _section(1, "Loại thu", col(
        radio_cards([("Khách trả", "Tiền khách thanh toán — phân bổ vào đơn, dư vào số dư khách"),
                     ("Tài xế nộp COD", "Thu hồi COD tài xế đang giữ — không phải doanh thu"),
                     ("Thu khác", "Thanh lý, hoàn tạm ứng, thu hộ khác")], 1), gap=10))
    payer = _section(2, "Người nộp", row(
        field("Tài xế", _picker("Trần Minh Lái", "DRV-A-002 · 0900 000 002 · Đang giữ COD 5.500.000 đ", "id-card"), True, width="60%"),
        col(muted("Sổ công nợ tài xế", 12), a("Mở sổ công nợ Trần Minh Lái", "WM-DRV-05", "Mở sổ công nợ tài xế"), gap=4), gap=16, align="flex-end"),
        sub="Loại Khách trả: chọn khách hàng. Loại Tài xế nộp COD: chọn tài xế.")
    cod_rows = []
    for o, cus, trip, stop, at, days, actual, remitted, held in COD_ITEMS:
        cod_rows.append([col(code(o, to="WM-ORD-07", trigger="Mở tài chính đơn"), subtle(cus, 11), gap=0),
                         col(code(trip, to="WM-TRIP-01", trigger="Mở chuyến"), a(stop, "WM-STOP-01", "Mở điểm dừng", 11, 400), gap=0),
                         col(num(at, 12), badge(f"Giữ {days} ngày", "danger" if days > 2 else "warning"), gap=2),
                         num(money(actual)), num(money(remitted), color=T["text-muted"]), num(money(held), weight=600),
                         money_input(held, "132px", h=32, fs=13)])
    cod = _section(3, "Khoản COD được nộp", col(
        table([("Đơn · Khách", "left"), ("Chuyến · Điểm trả", "left"), ("Thu lúc · Giữ", "left"), ("COD thực thu", "right"),
               ("Đã nộp", "right"), ("Còn giữ", "right"), ("Nộp lần này", "right", "150px")], cod_rows, selected=[0, 1], checkbox_col=True, compact=False,
              total_row=["2 khoản", "", "", money(7_500_000), money(2_000_000), money(5_500_000), money(5_500_000)]),
        subtle("Nộp một phần được — phần còn lại tiếp tục tính COD đang giữ và tuổi giữ tiền.", 12), gap=8),
        right=a("Chọn thêm từ COD đang giữ", "WM-COD-01", "Mở danh sách COD tài xế đang giữ"))
    amount = _section(4, "Số tiền, ngày & hình thức", col(
        row(field("Số tiền thu", money_input(5_500_000), True, hint="Bằng tổng “Nộp lần này”", width="30%"),
            field("Ngày thu", date_input("23/09/2026"), True, width="22%"),
            field("Hình thức", segmented(["Tiền mặt", "Chuyển khoản"], 0), True, width="26%"),
            field("Người nhận tiền", select("Phan Ngọc Mai"), width="22%"), gap=12, align="flex-start"),
        field("Ghi chú", textarea("Nộp tiền mặt tại văn phòng sau chuyến CX-202609-0008", h=40)), gap=12))
    docs = _section(5, "Chứng từ", col(upload_zone(h=76),
                                       attachment_list([("bien_nhan_nop_COD_230926.jpg", "Biên nhận", "1,2 MB · vừa tải lên", "image")]), gap=10),
                    sub="Không bắt buộc")
    form = col(kind, payer, cod, amount, docs, gap=14, extra="flex: 1; min-width: 0;")
    side = col(
        panel("Sau khi lưu", col(
            _impact([("COD Trần Minh Lái đang giữ", money(5_500_000), money(0), "success"),
                     ("Doanh thu", "Không đổi", "Không đổi", None),
                     ("Công nợ khách", "Không đổi", "Không đổi", None)]),
            divider(),
            text("Vì sao không tính doanh thu?", 13, 600),
            muted("Doanh thu đã ghi nhận trên đơn DH-202609-0007, DH-202609-0008. Tiền tài xế nộp chỉ chuyển từ tay tài xế về công ty.", 12),
            gap=10)),
        banner("Trần Minh Lái đang giữ <b>5.500.000 đ</b>, vượt ngưỡng 5.000.000 đ và quá 2 ngày.", "danger"),
        panel("Loại Khách trả", col(muted("Chọn khách → nhập số tiền → lưu. Sau khi lưu mở chi tiết phiếu để phân bổ vào đơn; "
                                          "phần chưa phân bổ vào số dư khách.", 12),
                                    a("Phân bổ phiếu có sẵn", "WM-PAY-04", "Mở phân bổ payment"), gap=6)),
        gap=16, extra="width: 320px; flex-shrink: 0;")
    content = col(
        page_header("Tạo phiếu thu", "Ghi nhận tiền vào: khách trả, tài xế nộp COD hoặc thu khác",
                    row(btn("Hủy", "secondary", to="WM-PAY-01", trigger="Hủy tạo phiếu thu"),
                        btn("Lưu & tạo tiếp", "secondary"),
                        btn("Lưu phiếu thu", "primary", "check", to="WM-PAY-02", trigger="Lưu → chi tiết phiếu thu"), gap=8),
                    crumbs=[ROOT, ("Phiếu thu", "WM-PAY-01"), ("Tạo phiếu thu", None)]),
        row(form, side, gap=16, align="flex-start"), gap=16)
    return wm_shell("finance", content, h=1320, child="WM-PAY-01")


# ---------------------------------------------------------------- WM-PAY-04 Phân bổ payment
def pay_04():
    header = page_header("Phân bổ phiếu thu PT-202609-0002", "Bao bì Hưng Lợi · Chuyển khoản 18/09/2026 · phân bổ thủ công vào đơn của cùng khách",
                         row(btn("Hủy", "secondary", to="WM-PAY-02", trigger="Hủy phân bổ → chi tiết phiếu"),
                             btn("Xác nhận phân bổ", "primary", "check", to="WM-PAY-02", trigger="Xác nhận phân bổ → chi tiết phiếu"), gap=8),
                         crumbs=[ROOT, ("Phiếu thu", "WM-PAY-01"), ("PT-202609-0002", "WM-PAY-02"), ("Phân bổ", None)])
    strip = summary_strip([("Tổng tiền phiếu", money(3_000_000)), ("Đã phân bổ trước đó", money(0)),
                           ("Phân bổ lần này", money(3_000_000), "primary"), ("Còn lại → số dư khách", money(0), "success")])
    rows = [
        [col(code("DH-202609-0012", to="WM-ORD-07", trigger="Mở tài chính đơn"), subtle("Bình Dương → Q. Tân Phú", 11), gap=0),
         status("Chờ xác nhận"), num("21/09/2026"), due(None, "30/09/2026"), num(money(4_800_000)), num(money(0), color=T["text-muted"]),
         num(money(4_800_000), weight=600, color=T["warning"]), money_input(3_000_000, "140px", h=32, fs=13), num(money(1_800_000), weight=600)],
        [col(code("DH-202609-0003", to="WM-ORD-02", trigger="Mở đơn nháp"), subtle("Bình Dương → Q.12", 11), gap=0),
         status("Nháp"), num("12/09/2026"), muted("—"), num(money(3_600_000), color=T["text-muted"]), muted("—"), muted("—"),
         col(input_("", "Đơn nháp", "140px", disabled=True, h=32), gap=0), muted("—")],
        [col(code("DH-202608-0021", to="WM-ORD-07", trigger="Mở tài chính đơn"), subtle("Bình Dương → Q.12", 11), gap=0),
         status("Hoàn thành"), num("24/08/2026"), due(paid=True), num(money(3_200_000), color=T["text-muted"]), num(money(3_200_000), color=T["success"]),
         num(money(0), color=T["text-muted"]), col(input_("", "Đã đủ tiền", "140px", disabled=True, h=32), gap=0), muted("—")],
    ]
    cols = [("Đơn · Tuyến", "left"), ("Trạng thái", "left"), ("Ngày đơn", "left"), ("Hạn thanh toán", "left"), ("Tổng tiền", "right"),
            ("Đã thu", "right"), ("Còn nợ", "right"), ("Phân bổ", "right", "160px"), ("Còn nợ sau", "right")]
    orders = panel("Đơn của khách", col(
        row(input_("", "Tìm mã đơn…", "240px", "search", h=32), switch(True, ""), text("Hiện đơn đã đủ tiền", 13), spacer(),
            btn("Tự điền theo hạn cũ nhất", "ghost", "list-filter", size="sm"), btn("Xóa số đã nhập", "ghost", "rotate-ccw", size="sm"), gap=8),
        table(cols, rows, selected=0, total_row=["Tổng", "", "", "", money(11_600_000), money(3_200_000), money(4_800_000), money(3_000_000), money(1_800_000)]),
        gap=12), sub="Chỉ đơn của Bao bì Hưng Lợi · đơn nháp/đã hủy không nhận phân bổ")
    checks = panel("Kiểm tra trước khi lưu", col(
        _check(True, "Không vượt tiền phiếu", "Phân bổ 3.000.000 / còn lại 3.000.000 đ"),
        _check(True, "Không phân bổ vào đơn đã đủ tiền", "DH-202608-0021 đã thu đủ — khóa ô nhập"),
        _check(True, "Khách không có đơn quá hạn", "Nếu có: gợi ý phân bổ đơn quá hạn trước"),
        gap=10))
    preview = panel("Xem trước sau phân bổ", _impact([
        ("Số dư khách Bao bì Hưng Lợi", money(3_000_000), money(0), "success"),
        ("Còn nợ DH-202609-0012", money(4_800_000), money(1_800_000), "warning"),
        ("Còn lại của phiếu", money(3_000_000), money(0), None)]))
    warn = warning_panel("Lưu ý", ["DH-202609-0012 đang <b>Chờ xác nhận</b>. Nếu đơn bị hủy, cần gỡ phân bổ để tiền quay về số dư khách.",
                                   "Nếu phân bổ vượt còn nợ của đơn, hệ thống chặn — phần dư để lại trong số dư khách."],
                         a("Xem công nợ khách", "WM-CUS-05", "Mở công nợ khách"))
    side = col(preview, checks, warn, gap=16, extra="width: 340px; flex-shrink: 0;")
    content = col(header, strip, row(col(orders, gap=16, extra="flex: 1; min-width: 0;"), side, gap=16, align="flex-start"), gap=16)
    return wm_shell("finance", content, h=960, child="WM-PAY-01")


# ---------------------------------------------------------------- WM-EXP-01 Danh sách phiếu chi
def exp_01():
    rows = []
    for e in sorted(EXPENSES, key=lambda e: _d(e[4]), reverse=True):
        c, t, target, amt, date, payer, stt = e
        grp = EXP_GROUP.get(t, t)
        parts = target.split(" · ")
        rows.append([col(code(c, to="WM-EXP-02", trigger="Click mã phiếu → chi tiết"), subtle(date, 11), gap=0),
                     col(text(grp, 13, 500), subtle(t if t != grp else "—", 11), gap=0),
                     col(text(parts[0], 13, 500), subtle(" · ".join(parts[1:]), 11), gap=0),
                     col(text(payer, 13), subtle("Hoàn tài xế" if payer == "Tài xế chi trước" else "", 11), gap=0),
                     num(money(amt), weight=600), _exp_status(e), row_menu()])
    cols = [("Mã phiếu · Ngày", "left", "150px"), ("Loại chi", "left"), ("Gắn với (NCC/đơn/chuyến/xe/tài xế)", "left"),
            ("Ai chi", "left"), ("Số tiền", "right"), ("Trạng thái", "left"), ("", "right", "44px")]
    content = col(
        page_header("Phiếu chi", "Chi phí chuyến, thuê xe ngoài, vật tư xe, hoàn ứng, ứng lương, tạm ứng chuyến và chi khác",
                    row(btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất danh sách phiếu chi"),
                        btn("Tạo phiếu chi", "primary", "plus", to="WM-EXP-03", trigger="Tạo phiếu chi"), gap=8),
                    crumbs=[ROOT, ("Phiếu chi", None)]),
        _kpis(kpi("Chi phí ghi nhận tháng 9", money(17_080_000), "Không gồm tạm ứng chuyến", None, "receipt-text"),
              kpi("Chưa trả NCC", money(10_500_000), "2 NCC · 2 phiếu", "warning", "store", to="WM-DEBT-02", trigger="KPI chưa trả NCC → công nợ NCC"),
              kpi("Chờ hoàn tài xế", money(800_000), "Tài xế chi trước · 1 phiếu", "warning", "id-card", to="WM-EXP-02", trigger="KPI hoàn tài xế → PC-202609-0001"),
              kpi("Tạm ứng chờ đối soát", money(3_500_000), "2 chuyến", "info", "coins", to="WM-ADV-01", trigger="KPI tạm ứng → đối soát")),
        filter_bar("Tìm mã phiếu, NCC, đơn, chuyến, xe…", ["Tất cả", "Chưa trả", "Hoàn tài xế", "Có NCC", "Tạm ứng", "Đã hủy"],
                   date="01/09 – 30/09/2026", selects=["Loại chi", "NCC"]),
        table(cols, rows, footer=pagination("1–9", 9), total_row=["Tổng 9 phiếu", "", "", "", money(20_580_000), "", ""]),
        row(icon("info", 14, T["text-muted"]), subtle("Tạm ứng chuyến là tiền đưa trước cho tài xế, chỉ thành chi phí khi đối soát. "
                                                      "Khoản gắn NCC chưa trả được cộng vào công nợ NCC.", 12), gap=6),
        gap=16)
    return wm_shell("finance", content, h=1060, child="WM-EXP-01")


# ---------------------------------------------------------------- WM-EXP-02 Chi tiết phiếu chi
def exp_02():
    actions = row(btn("Timeline", "secondary", "history", to="WM-SHELL-07", trigger="Mở Timeline drawer"),
                  btn("Sửa", "secondary", "pencil", to="WM-SHELL-08", trigger="Sửa phiếu chi (sensitive, cần lý do)"),
                  btn("Hủy phiếu", "danger-outline", "x", to="WM-SHELL-08", trigger="Hủy phiếu chi (sensitive, cần lý do)"),
                  btn("Đánh dấu đã trả", "primary", "check"), gap=8)
    header = _entity_header([ROOT, ("Phiếu chi", "WM-EXP-01"), ("PC-202609-0001", None)], "PC-202609-0001",
                            [status("Chưa trả", "fin"), badge("Hoàn tài xế", "warning", "id-card", outline=True)],
                            row(text("Chi phí chuyến · Phí cầu đường", 14), muted("·"), code("CX-202609-0001", 14, "WM-TRIP-01", "Mở chuyến"),
                                muted("·"), text("23/09/2026", 14), gap=8),
                            "Tạo 23/09/2026 11:05 bởi Lê Thu Vân (từ khai báo app tài xế)", actions)
    strip = summary_strip([("Số tiền", money(800_000)), ("Ai chi trước", "Tài xế"), ("Công ty còn nợ tài xế", money(800_000), "warning"),
                           ("Tính vào chi phí đơn", "DH-202609-0001"), ("Lãi/lỗ đơn tạm tính", money(11_700_000), "success")])
    info = panel("Thông tin phiếu chi", dl([
        ("Loại chi", "Chi phí chuyến"), ("Danh mục", "Phí cầu đường"), ("Số tiền", num(money(800_000), 14, 600)), ("Ngày chi", num("23/09/2026")),
        ("Ai chi trước", "Tài xế Nguyễn Văn Tài"), ("Hoàn cho tài xế", "Có · chưa hoàn"), ("Hình thức hoàn", "Chưa chọn"),
        ("Ghi chú", "BOT Cần Thơ – Mỹ Thuận, 2 lượt")], cols=4))
    links = panel("Gắn với", table([("Đối tượng", "left"), ("Mã / tên", "left"), ("Ảnh hưởng", "left")], [
        [muted("Đơn hàng"), code("DH-202609-0001", to="WM-ORD-07", trigger="Mở tài chính đơn"), muted("Cộng vào chi phí đơn → giảm lãi/lỗ")],
        [muted("Chuyến"), code("CX-202609-0001", to="WM-TRIP-01", trigger="Mở chuyến"), muted("Chi phí chuyến")],
        [muted("Xe"), a("51C-123.45", "WM-VEH-02", "Mở chi tiết xe"), muted("Lịch sử chi phí xe")],
        [muted("Tài xế"), a("Nguyễn Văn Tài", "WM-DRV-05", "Mở sổ công nợ tài xế"), muted("Công ty nợ tài xế 800.000 đ")],
        [muted("Nhà cung cấp"), muted("—"), muted("Không vào công nợ NCC")]], compact=True), body_pad=False)
    pay = panel("Hoàn tiền cho tài xế", col(
        banner("Tài xế đã chi trước bằng tiền riêng. Công ty hoàn bất kỳ lúc nào, không chờ kỳ lương.", "warning"),
        row(field("Ngày trả", date_input("23/09/2026"), True, width="25%"), field("Hình thức", segmented(["Tiền mặt", "Chuyển khoản"], 1), True, width="35%"),
            field("Người chi", select("Phan Ngọc Mai"), width="25%"), gap=12, align="flex-start"),
        row(subtle("Đánh dấu đã trả: trạng thái → Đã trả, sổ công nợ tài xế giảm 800.000 đ.", 12), spacer(),
            btn("Đánh dấu đã trả", "primary", "check", size="sm"), gap=8), gap=12), sub="Quyền: admin, kế toán")
    left = col(info, links, pay, gap=16, extra="flex: 2; min-width: 0;")
    right = col(
        panel("Tài xế", partner_card("Nguyễn Văn Tài", "DRV-A-001", [("Công ty nợ tài xế", money(800_000)), ("COD đang giữ", money(0)),
                                                                   ("Tạm ứng chờ đối soát", money(2_000_000))], to="WM-DRV-02")),
        panel("Chứng từ", attachment_list([("bien_lai_BOT_1.jpg", "Biên lai", "420 KB · app tài xế", "image"),
                                           ("bien_lai_BOT_2.jpg", "Biên lai", "398 KB · app tài xế", "image")], to="WM-SHELL-06"),
              btn("Tải lên", "ghost", "upload", size="sm")),
        panel("Audit", timeline([("23/09/2026 11:05", "Lê Thu Vân", "Tạo phiếu chi <b>800.000 đ</b> · Tài xế chi trước", None, "accent"),
                                 ("23/09/2026 10:58", "Nguyễn Văn Tài", "Khai báo phí cầu đường trên app, 2 ảnh biên lai", None, "neutral")]),
              a("Xem tất cả", "WM-SHELL-07", "Mở Timeline")),
        gap=16, extra="flex: 1; min-width: 0;")
    content = col(header, strip, tabs(["Tổng quan", "Chứng từ", "Timeline"], 0, {"Timeline": "WM-SHELL-07"}, counts={"Chứng từ": 2}),
                  row(left, right, gap=16, align="flex-start"), gap=16)
    return wm_shell("finance", content, h=1180, child="WM-EXP-01")


# ---------------------------------------------------------------- WM-EXP-03 Tạo phiếu chi
EXP_TYPES = [("Chi phí chuyến", "Cầu đường, bốc xếp, lưu ca", "route"), ("Thuê xe ngoài", "Chành/xe thuê, luôn gắn đơn", "truck"),
             ("Vật tư xe", "Xăng dầu, lốp, sửa chữa", "wrench"), ("Hoàn ứng", "Hoàn chi phí tài xế chi trước", "undo-2"),
             ("Ứng lương", "Trừ vào bảng lương kỳ", "banknote"), ("Tạm ứng chuyến", "Đưa trước, đối soát sau chuyến", "coins"),
             ("Chi khác", "Văn phòng, phí ngân hàng…", "receipt-text")]
LINK_RULES = [("Chi phí chuyến", "Chuyến", "Đơn, xe, tài xế (tự điền)"), ("Thuê xe ngoài", "Đơn, NCC", "Chuyến"),
              ("Vật tư xe", "Xe", "NCC"), ("Hoàn ứng", "Tài xế, phiếu gốc", "—"), ("Ứng lương", "Tài xế", "Kỳ lương"),
              ("Tạm ứng chuyến", "Chuyến, tài xế", "—"), ("Chi khác", "—", "NCC")]


def exp_03():
    use("RadioGroup")
    cards = []
    for i, (lab, sub, ic) in enumerate(EXP_TYPES):
        on = i == 0
        cards.append(f'<div style="display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 6px; '
                     f'border: 1px solid {T["primary"] if on else T["border-control"]}; background: {T["primary-soft"] if on else T["surface"]};">'
                     f'{icon(ic, 18, T["primary"] if on else T["text-muted"])}{radio(lab, on, sub)}</div>')
    kind = _section(1, "Loại chi", grid(cards, 4, 8))
    link = _section(2, "Gắn với", col(
        row(field("Chuyến", _picker("CX-202609-0001", "Cần Thơ → Bình Dương · Đang vận chuyển", "route"), True, width="50%"),
            field("Nhà cung cấp", _picker("Không chọn", "Tùy chọn — khoản NCC chưa trả vào công nợ NCC", "store"), width="50%"), gap=12),
        row(field("Đơn hàng", input_("DH-202609-0001 · Công ty Gạo Miền Tây", disabled=True)),
            field("Xe", input_("51C-123.45", disabled=True)), field("Tài xế", input_("Nguyễn Văn Tài", disabled=True)), gap=12),
        subtle("Đơn, xe, tài xế tự điền theo chuyến. Trường bắt buộc đổi theo loại chi.", 12), gap=12),
        sub="Chi phí chuyến: bắt buộc chuyến")
    amount = _section(3, "Danh mục, số tiền & ngày", row(
        field("Danh mục chi", select("Phí cầu đường"), True, width="30%"), field("Số tiền", money_input(800_000), True, width="25%"),
        field("Ngày chi", date_input("23/09/2026"), True, width="20%"), field("Ghi chú", input_("BOT Cần Thơ – Mỹ Thuận, 2 lượt"), width="25%"),
        gap=12, align="flex-start"))
    who = _section(4, "Ai chi trước", col(
        radio_cards([("Công ty chi", "Chọn trạng thái Đã trả / Chưa trả"), ("Tài xế chi trước", "Công ty nợ tài xế, hoàn sau"),
                     ("Chi từ tạm ứng chuyến", "Trừ vào tạm ứng khi đối soát")], 1),
        row(checkbox("Hoàn cho tài xế", True), muted("Trạng thái ban đầu:", 13), badge("Chưa trả", "warning"), spacer(),
            subtle("Ghi vào sổ công nợ tài xế Nguyễn Văn Tài", 12), gap=10), gap=12))
    docs = _section(5, "Chứng từ", col(upload_zone(h=76), attachment_list([("bien_lai_BOT_1.jpg", "Biên lai", "420 KB", "image"),
                                                                            ("bien_lai_BOT_2.jpg", "Biên lai", "398 KB", "image")]), gap=10),
                    sub="Không bắt buộc")
    form = col(kind, link, amount, who, docs, gap=14, extra="flex: 1; min-width: 0;")
    rules = table([("Loại chi", "left"), ("Bắt buộc", "left"), ("Tùy chọn", "left")],
                  [[text(t, 12, 600 if t == "Chi phí chuyến" else 400), text(r, 12), subtle(o, 11)] for t, r, o in LINK_RULES], compact=True,
                  selected=0)
    side = col(
        panel("Sau khi lưu", _impact([("Chi phí đơn DH-202609-0001", money(0), money(800_000), "danger"),
                                      ("Lãi/lỗ tạm tính đơn", money(12_500_000), money(11_700_000), "success"),
                                      ("Công ty nợ tài xế Nguyễn Văn Tài", money(0), money(800_000), "warning")])),
        panel("Trường gắn theo loại chi", rules, body_pad=False),
        gap=16, extra="width: 340px; flex-shrink: 0;")
    content = col(
        page_header("Tạo phiếu chi", "Ghi nhận khoản chi và gắn đúng đơn/chuyến/xe/NCC/tài xế",
                    row(btn("Hủy", "secondary", to="WM-EXP-01", trigger="Hủy tạo phiếu chi"), btn("Lưu & tạo tiếp", "secondary"),
                        btn("Lưu phiếu chi", "primary", "check", to="WM-EXP-02", trigger="Lưu → chi tiết phiếu chi"), gap=8),
                    crumbs=[ROOT, ("Phiếu chi", "WM-EXP-01"), ("Tạo phiếu chi", None)]),
        row(form, side, gap=16, align="flex-start"), gap=16)
    return wm_shell("finance", content, h=1240, child="WM-EXP-01")


# ---------------------------------------------------------------- WM-DEBT-01 Công nợ khách tổng hợp
# code, receivable, paid, overdue_days_max, open_orders
DEBT_EXTRA = {"CUS-A-001": (47_500_000, 20_000_000, 10, 2), "CUS-A-002": (35_000_000, 0, 0, 1), "CUS-A-003": (0, 0, 0, 0),
              "CUS-A-004": (8_200_000, 0, 0, 1), "CUS-A-005": (71_000_000, 6_500_000, 8, 4)}


def debt_01():
    rows = []
    for c in sorted(D.CUSTOMERS, key=lambda c: -c["debt"]):
        rec, paid, od_days, n_open = DEBT_EXTRA[c["id"]]
        pct = round(c["debt"] * 100 / c["limit"])
        tone = "danger" if pct > 100 else "warning" if pct >= 80 else "primary"
        warn = []
        if c["overdue"]:
            warn.append(badge(f"Quá hạn {od_days} ngày", "danger", "alarm-clock"))
        if pct > 100:
            warn.append(badge("Vượt hạn mức", "danger"))
        if c["credit"]:
            warn.append(badge("Có số dư", "info"))
        rows.append([col(a(c["name"], "WM-CUS-05", "Mở công nợ khách", 13, 600), subtle(f'{c["id"]} · {n_open} đơn còn nợ · {c["days"]} ngày', 11), gap=0),
                     num(money(rec)), num(money(paid), color=T["success"] if paid else T["text-muted"]),
                     num(money(c["debt"]), weight=600, color=T["warning"] if c["debt"] else T["text-muted"]),
                     num(money(c["overdue"]), weight=600 if c["overdue"] else 400, color=T["danger"] if c["overdue"] else T["text-muted"]),
                     num(money(c["credit"]), color=T["info"] if c["credit"] else T["text-muted"]),
                     col(progress(min(pct, 100), tone), subtle(f'{pct}% · {c["limit"] // 1_000_000} tr', 11), gap=2, extra="width: 104px;"),
                     row(*warn, gap=4) if warn else muted("—"),
                     row(icon_btn("receipt", "Ghi nhận thanh toán", to="WM-PAY-03", trigger="Ghi nhận thanh toán cho khách"),
                         icon_btn("file-text", "Tạo bảng kê", to="WM-DEBT-03", trigger="Tạo bảng kê cho khách"), gap=0)])
    cols = [("Khách hàng", "left"), ("Tổng phải thu", "right"), ("Đã thu", "right"), ("Còn nợ", "right"), ("Quá hạn", "right"),
            ("Số dư", "right"), ("Hạn mức", "left"), ("Cảnh báo", "left"), ("", "right", "84px")]
    total = ["Tổng 5 khách", money(161_700_000), money(26_500_000), money(135_200_000), money(27_000_000), money(3_000_000), "", "", ""]
    od = table([("Mã đơn", "left"), ("Khách hàng", "left"), ("Hạn thanh toán", "left"), ("Còn nợ", "right"), ("", "right")], [
        [code("DH-202608-0009", to="WM-ORD-07", trigger="Mở tài chính đơn quá hạn"), text("Công ty Gạo Miền Tây", 13), due(10, "13/09/2026"),
         num(money(15_000_000), weight=600), btn("Ghi thu", "secondary", "plus", size="sm", to="WM-PAY-03", trigger="Ghi thu đơn quá hạn")],
        [code("DH-202609-0005", to="WM-ORD-07", trigger="Mở tài chính đơn quá hạn"), text("Vật liệu Xây dựng Phú Mỹ", 13), due(8, "15/09/2026"),
         num(money(12_000_000), weight=600), btn("Ghi thu", "secondary", "plus", size="sm", to="WM-PAY-03", trigger="Ghi thu đơn quá hạn")]], compact=True)
    content = col(
        page_header("Công nợ khách", "Phải thu theo khách: tổng tiền đơn, đã thu (đã phân bổ), còn nợ, quá hạn, số dư và hạn mức",
                    row(btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất công nợ khách"),
                        btn("Tạo bảng kê", "secondary", "file-text", to="WM-DEBT-03", trigger="Mở bảng kê công nợ"),
                        btn("Ghi nhận thanh toán", "primary", "plus", to="WM-PAY-03", trigger="Tạo phiếu thu khách trả"), gap=8),
                    crumbs=[ROOT, ("Công nợ khách", None)]),
        _kpis(kpi("Còn nợ", money(135_200_000), "5 khách · 9 đơn", "warning", "scale"),
              kpi("Quá hạn", money(27_000_000), "2 đơn · 2 khách", "danger", "alarm-clock"),
              kpi("Số dư khách (chưa phân bổ)", money(3_000_000), "1 khách", "info", "wallet", to="WM-PAY-02", trigger="KPI số dư → phiếu chưa phân bổ"),
              kpi("Vượt hạn mức", "1 khách", "Vật liệu Xây dựng Phú Mỹ · 107%", "danger", "triangle-alert")),
        filter_bar("Tìm khách hàng…", ["Tất cả", "Còn nợ", "Quá hạn", "Vượt hạn mức", "Có số dư"], date="Đến 23/09/2026"),
        table(cols, rows, total_row=total),
        row(icon("info", 14, T["text-muted"]), subtle("Đã thu = tổng phân bổ vào đơn. Số dư là tiền khách đã trả nhưng chưa phân bổ — không tự trừ vào còn nợ; "
                                                      "cảnh báo hạn mức không chặn tạo đơn.", 12), gap=6),
        panel("Đơn quá hạn cần thu", od, a("Xem báo cáo công nợ", "WM-RPT-06", "Mở báo cáo công nợ khách"), body_pad=False),
        gap=16)
    return wm_shell("finance", content, h=1060, child="WM-DEBT-01")


# ---------------------------------------------------------------- WM-DEBT-02 Công nợ NCC
def debt_02():
    buckets = {"SUP-A-001": (8_000_000, 0, 0, 0, "1 ngày", 1), "SUP-A-002": (2_500_000, 0, 0, 0, "3 ngày", 1), "SUP-A-003": (0, 0, 0, 0, "—", 0)}
    rows = []
    for s in D.SUPPLIERS:
        b0, b1, b2, b3, oldest, n = buckets[s["id"]]
        z = lambda v: num(money(v), weight=600 if v else 400, color=None if v else T["text-muted"])
        rows.append([col(a(s["name"], "WM-SUP-02", "Mở chi tiết NCC", 13, 600), subtle(f'{s["id"]} · {s["type"]}', 11), gap=0),
                     num(money(s["debt"]), weight=600, color=T["warning"] if s["debt"] else T["text-muted"]),
                     z(b0), z(b1), z(b2), z(b3), muted(oldest), num(f"{n} / {s['count']}", color=T["text-muted"]),
                     btn("Trả NCC", "secondary", "check", size="sm", to="WM-EXP-02", trigger="Trả NCC → đánh dấu phiếu chi đã trả") if s["debt"] else badge("Không nợ", "success")])
    cols = [("Nhà cung cấp", "left"), ("Tổng chưa trả", "right"), ("0–15 ngày", "right"), ("16–30 ngày", "right"), ("31–60 ngày", "right"),
            ("Trên 60 ngày", "right"), ("Nợ cũ nhất", "left"), ("Phiếu chưa trả / tổng", "right"), ("", "right", "110px")]
    detail = table([("Mã phiếu · Ngày", "left"), ("NCC", "left"), ("Loại chi · Gắn với", "left"), ("Số tiền", "right"), ("Tuổi nợ", "left"), ("Trạng thái", "left")], [
        [col(code("PC-202609-0003", to="WM-EXP-02", trigger="Mở phiếu chi NCC"), subtle("22/09/2026", 11), gap=0), text("Chành Xe Miền Trung", 13),
         col(text("Thuê xe ngoài", 13), row(code("DH-202609-0002", 11, "WM-ORD-07", "Mở tài chính đơn"), gap=4), gap=0), num(money(8_000_000), weight=600),
         muted("1 ngày"), status("Chưa trả", "fin")],
        [col(code("PC-202609-0002", to="WM-EXP-02", trigger="Mở phiếu chi NCC"), subtle("20/09/2026", 11), gap=0), text("Xăng dầu Minh Phát", 13),
         col(text("Vật tư xe · Nhiên liệu", 13), a("51C-123.45", "WM-VEH-02", "Mở chi tiết xe", 11, 400), gap=0), num(money(2_500_000), weight=600),
         muted("3 ngày"), status("Chưa trả", "fin")]], compact=True, total_row=["Tổng", "", "", money(10_500_000), "", ""])
    content = col(
        page_header("Công nợ nhà cung cấp", "Phải trả = các phiếu chi gắn NCC chưa trả. Trả NCC = đánh dấu phiếu chi đã trả.",
                    row(btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất công nợ NCC"),
                        btn("Tạo phiếu chi", "primary", "plus", to="WM-EXP-03", trigger="Tạo phiếu chi NCC"), gap=8),
                    crumbs=[ROOT, ("Công nợ NCC", None)]),
        _kpis(kpi("Tổng chưa trả NCC", money(10_500_000), "2 NCC · 2 phiếu", "warning", "store"),
              kpi("Quá 30 ngày", money(0), "Không có", None, "alarm-clock"),
              kpi("Đã trả NCC tháng 9", money(4_200_000), "Gara Đại Lộc", "success", "circle-check", to="WM-EXP-01", trigger="KPI đã trả → phiếu chi"),
              kpi("Thuê xe ngoài chưa trả", money(8_000_000), "Gắn đơn DH-202609-0002", None, "truck")),
        filter_bar("Tìm NCC…", ["Tất cả", "Còn nợ", "Vận tải thuê ngoài", "Nhiên liệu", "Sửa chữa"], date="Đến 23/09/2026"),
        table(cols, rows, total_row=["Tổng 3 NCC", money(10_500_000), money(10_500_000), money(0), money(0), money(0), "", "", ""]),
        panel("Phiếu chi chưa trả", detail, sub="Khoản chi không gắn NCC không vào công nợ NCC", body_pad=False),
        gap=16)
    return wm_shell("finance", content, h=900, child="WM-DEBT-02")


# ---------------------------------------------------------------- WM-DEBT-03 Danh sách bảng kê
STATEMENTS = [
    ("BK-202609-0005", "Nông sản Đồng Tháp Xanh", "01/09 – 15/09/2026", 1, 8_200_000, 0, "Đã hủy", "Hủy 18/09 · Sai kỳ, tạo lại"),
    ("BK-202609-0004", "Kho Thép An Phát", "01/09 – 30/09/2026", 1, 35_000_000, 0, "Nháp", "Tạo 23/09 · Phan Ngọc Mai"),
    ("BK-202609-0003", "Công ty Gạo Miền Tây", "01/08 – 22/09/2026", 3, 47_500_000, 20_000_000, "Đã chốt", "Chốt 22/09 16:20 · Phan Ngọc Mai"),
    ("BK-202609-0002", "Vật liệu Xây dựng Phú Mỹ", "01/09 – 15/09/2026", 2, 18_500_000, 6_500_000, "Đã gửi", "Gửi 16/09 · Zalo"),
    ("BK-202609-0001", "Công ty Gạo Miền Tây", "01/08 – 31/08/2026", 2, 35_000_000, 15_000_000, "Đã gửi", "Gửi 02/09 · Email"),
]


def debt_03():
    rows = []
    for c, cus, period, n, tot, paid, stt, meta in STATEMENTS:
        dim = stt == "Đã hủy"
        rows.append([code(c, to="WM-DEBT-04", trigger="Click mã bảng kê → chi tiết"), text(cus, 13, 500, T["text-muted"] if dim else None),
                     num(period), num(str(n), color=T["text-muted"]), num(money(tot), color=T["text-muted"] if dim else None),
                     num(money(paid), color=T["text-muted"]), num(money(tot - paid), weight=600, color=T["text-muted"] if dim else None),
                     status(stt, "fin"), subtle(meta, 12),
                     icon_btn("download", "Tải PDF", to="WM-SHELL-05", trigger="Tải PDF bảng kê") if stt in ("Đã chốt", "Đã gửi") else row_menu()])
    cols = [("Mã bảng kê", "left", "140px"), ("Khách hàng", "left"), ("Kỳ", "left"), ("Số đơn", "right"), ("Tổng tiền", "right"),
            ("Đã thu", "right"), ("Còn lại (snapshot)", "right"), ("Trạng thái", "left"), ("Chốt/gửi", "left"), ("", "right", "44px")]
    create = panel("Tạo bảng kê", row(
        field("Khách hàng", _picker("Kho Thép An Phát", "CUS-A-002 · Còn nợ 35.000.000 đ"), True, width="34%"),
        field("Từ ngày", date_input("01/09/2026"), True, width="16%"), field("Đến ngày", date_input("30/09/2026"), True, width="16%"),
        field("Gồm", select("Đơn còn nợ trong kỳ"), width="20%"),
        btn("Tạo nháp & xem trước", "primary", "file-text", to="WM-DEBT-04", trigger="Tạo bảng kê nháp → chi tiết"), gap=12, align="flex-end"),
        sub="Nháp tính theo dữ liệu hiện tại; khi chốt hệ thống lưu snapshot và tạo PDF")
    content = col(
        page_header("Bảng kê công nợ", "Chốt số liệu công nợ theo kỳ, xuất PDF để gửi khách qua Zalo/email",
                    row(btn("Công nợ khách", "secondary", "scale", to="WM-DEBT-01", trigger="Mở công nợ khách tổng hợp"), gap=8),
                    crumbs=[ROOT, ("Bảng kê công nợ", None)]),
        create,
        filter_bar("Tìm mã bảng kê, khách…", ["Tất cả", "Nháp", "Đã chốt", "Đã gửi", "Đã hủy"], date="Tháng 09/2026"),
        table(cols, rows, footer=pagination("1–5", 5)),
        row(icon("lock", 14, T["text-muted"]), subtle("Bảng kê đã chốt không thay đổi khi đơn/phiếu thu thay đổi sau đó. Hủy bảng kê đã chốt cần lý do.", 12), gap=6),
        gap=16)
    return wm_shell("finance", content, h=860, child="WM-DEBT-03")


# ---------------------------------------------------------------- WM-DEBT-04 Chi tiết bảng kê
def debt_04():
    actions = row(btn("Timeline", "secondary", "history", to="WM-SHELL-07", trigger="Mở Timeline drawer"),
                  btn("Hủy bảng kê", "danger-outline", "x", to="WM-SHELL-08", trigger="Hủy bảng kê đã chốt (sensitive, cần lý do)"),
                  btn("Đánh dấu đã gửi", "secondary", "send"),
                  btn("Tải PDF", "primary", "download", to="WM-SHELL-05", trigger="Tải PDF bảng kê"), gap=8)
    header = _entity_header([ROOT, ("Bảng kê công nợ", "WM-DEBT-03"), ("BK-202609-0003", None)], "BK-202609-0003",
                            [status("Đã chốt", "fin")],
                            row(a("Công ty Gạo Miền Tây", "WM-CUS-05", "Mở công nợ khách", 14), muted("·"), text("Kỳ 01/08/2026 – 22/09/2026", 14), gap=8),
                            "Tạo 22/09/2026 16:05 · Chốt 22/09/2026 16:20 bởi Phan Ngọc Mai · Chưa gửi", actions)
    lock = banner("Đã chốt snapshot 22/09/2026 — không thay đổi khi đơn/phiếu thay đổi.", "primary", "lock",
                  a("So với dữ liệu hiện tại", "WM-CUS-05", "Mở công nợ khách hiện tại"))
    strip = summary_strip([("Tổng tiền đơn", money(47_500_000)), ("Đã thu", money(20_000_000), "success"), ("Còn lại", money(27_500_000), "warning"),
                           ("Quá hạn", money(15_000_000), "danger"), ("Số đơn", "3")])
    lines = [("29/08/2026", "DH-202608-0009", "Cần Thơ → Bình Dương", 20_000_000, 5_000_000, "13/09/2026", 9),
             ("14/09/2026", "DH-202609-0009", "Cần Thơ → Q. Bình Tân", 15_000_000, 15_000_000, "20/09/2026", 0),
             ("20/09/2026", "DH-202609-0001", "Cần Thơ → Bình Dương", 12_500_000, 0, "08/10/2026", 0)]
    rows = []
    for i, (d, c, route, tot, paid, due_, od) in enumerate(lines, 1):
        rows.append([muted(str(i)), num(d), code(c, to="WM-ORD-07", trigger="Mở tài chính đơn (dữ liệu hiện tại)"), text(route, 13),
                     num(money(tot)), num(money(paid), color=T["success"] if paid else T["text-muted"]),
                     num(money(tot - paid), weight=600, color=T["warning"] if tot - paid else T["text-muted"]), num(due_),
                     badge(f"{od} ngày", "danger") if od else (badge("Đã thu đủ", "success") if tot == paid else muted("Còn hạn"))])
    cols = [("#", "left", "32px"), ("Ngày đơn", "left"), ("Mã đơn", "left"), ("Tuyến (điểm đi → điểm đến)", "left"), ("Tổng tiền", "right"),
            ("Đã thu", "right"), ("Còn lại", "right"), ("Hạn thanh toán", "left"), ("Quá hạn", "left")]
    tbl = panel("Dòng bảng kê (snapshot)", table(cols, rows, compact=False,
                                                 total_row=["", "", "", "Tổng", money(47_500_000), money(20_000_000), money(27_500_000), "", ""]),
                subtle("Số ngày quá hạn tính đến ngày chốt 22/09/2026", 12), body_pad=False)
    changes = panel("Khác biệt so với dữ liệu hiện tại", col(
        row(icon("info", 16, T["info"]), col(text("DH-202608-0009: quá hạn nay là 10 ngày (snapshot 9 ngày)", 13),
                                              subtle("Chỉ hiển thị để tham khảo — bảng kê đã chốt giữ nguyên", 12), gap=0), gap=8, align="flex-start"),
        row(icon("circle-check", 16, T["success"]), text("Không có phiếu thu/phân bổ mới từ sau khi chốt", 13), gap=8),
        muted("Cần số liệu mới: tạo bảng kê kỳ mới.", 12), gap=10))
    info = panel("Thông tin", dl([("Khách hàng", "Công ty Gạo Miền Tây"), ("Kỳ", num("01/08 – 22/09/2026")),
                                  ("Người chốt", "Phan Ngọc Mai"), ("Trạng thái gửi", "Chưa gửi")], cols=2))
    pdf = panel("File PDF", attachment_list([("BK-202609-0003.pdf", "Bảng kê", "1 trang · tạo lúc chốt 22/09 16:20", "file-text")], to="WM-SHELL-06"))
    audit = panel("Timeline", timeline([("22/09/2026 16:20", "Phan Ngọc Mai", "Chốt bảng kê · lưu snapshot 3 dòng · tạo PDF", None, "primary"),
                                        ("22/09/2026 16:05", "Phan Ngọc Mai", "Tạo nháp kỳ 01/08 – 22/09/2026", None, "neutral")]))
    content = col(header, lock, strip, tbl,
                  row(col(changes, info, gap=16, extra="flex: 1; min-width: 0;"), col(pdf, audit, gap=16, extra="flex: 1; min-width: 0;"),
                      gap=16, align="flex-start"), gap=16)
    return wm_shell("finance", content, h=1060, child="WM-DEBT-03")


# ---------------------------------------------------------------- WM-COD-01 COD tài xế đang giữ
def cod_01():
    rows = []
    for o, cus, trip, stop, at, days, actual, remitted, held in COD_ITEMS:
        rows.append([col(code(o, to="WM-ORD-07", trigger="Mở tài chính đơn"), subtle(cus, 11), gap=0),
                     col(code(trip, to="WM-TRIP-01", trigger="Mở chuyến"), a(stop, "WM-STOP-01", "Mở điểm dừng", 11, 400), gap=0),
                     num(at), num(money(actual)), num(money(remitted), color=T["text-muted"]), num(money(held), weight=600),
                     badge(f"{days} ngày", "danger" if days > 2 else "warning", "alarm-clock"),
                     badge("Quá 2 ngày", "danger") if days > 2 else badge("Đến ngưỡng", "warning")])
    cols = [("Đơn · Khách", "left"), ("Chuyến · Điểm trả", "left"), ("Thu lúc", "left"), ("COD thực thu", "right"), ("Đã nộp", "right"),
            ("Còn giữ", "right"), ("Đã giữ", "left"), ("Cảnh báo", "left")]
    group_head = row(
        checkbox(checked=True), avatar("TL", 32, "accent"),
        col(row(a("Trần Minh Lái", "WM-DRV-05", "Mở sổ công nợ tài xế", 14, 600), subtle("DRV-A-002 · 0900 000 002", 12), gap=8),
            row(badge("Vượt ngưỡng tiền", "danger", "triangle-alert"), badge("Giữ quá 2 ngày", "danger", "alarm-clock"), gap=6), gap=2),
        spacer(), col(subtle("Đang giữ", 12), num(money(5_500_000), 18, 700, T["danger"]), gap=0, extra="align-items: flex-end;"),
        btn("Tạo phiếu thu COD", "primary", "hand-coins", size="sm", to="WM-PAY-03", trigger="Tạo phiếu thu COD cho tài xế"),
        gap=12, extra=f"padding: 12px 16px; border-bottom: 1px solid {T['border']};")
    group = (f'<section style="background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px; overflow: hidden;">'
             f'{group_head}{table(cols, rows, selected=[0, 1], checkbox_col=True, total_row=["2 khoản", "", "", money(7_500_000), money(2_000_000), money(5_500_000), "", ""])}</section>')
    others = row(icon("circle-check", 16, T["success"]), text("3 tài xế không giữ COD", 13, 500), muted("Nguyễn Văn Tài · Lê Hoàng Phúc · Phạm Văn Dự", 13), spacer(),
                 a("Xem danh sách tài xế", "WM-DRV-01", "Mở danh sách tài xế"), gap=8,
                 extra=f"padding: 12px 16px; background: {T['surface']}; border: 1px solid {T['border']}; border-radius: 8px;")
    recent = panel("Đã nộp gần đây", table([("Mã phiếu", "left"), ("Tài xế", "left"), ("Ngày nộp", "left"), ("Số tiền", "right"), ("Đối trừ", "left")], [
        [code("PT-202609-0003", to="WM-PAY-02", trigger="Mở phiếu thu COD"), text("Trần Minh Lái", 13), num("21/09/2026"),
         num(money(2_000_000), weight=600), muted("DH-202609-0007 (một phần)")]], compact=True),
                   a("Tất cả phiếu thu COD", "WM-PAY-01", "Mở danh sách phiếu thu"), body_pad=False,
                   sub="Phiếu thu loại Tài xế nộp COD — không tính doanh thu")
    content = col(
        page_header("COD tài xế đang giữ", "Tiền COD tài xế đã thu của khách nhưng chưa nộp về công ty",
                    row(btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất COD đang giữ"),
                        btn("Tạo phiếu thu COD (2 khoản)", "primary", "hand-coins", to="WM-PAY-03", trigger="Tạo phiếu thu COD từ khoản đã chọn"), gap=8),
                    crumbs=[ROOT, ("COD tài xế", None)]),
        _kpis(kpi("Tổng COD đang giữ", money(5_500_000), "1 tài xế · 2 khoản", "danger", "hand-coins"),
              kpi("Giữ lâu nhất", "4 ngày", "Ngưỡng cảnh báo 2 ngày", "danger", "alarm-clock"),
              kpi("Đã nộp tháng 9", money(2_000_000), "1 phiếu thu", "success", "circle-check", to="WM-PAY-01", trigger="KPI đã nộp → phiếu thu"),
              kpi("Ngưỡng cảnh báo", money(5_000_000), "hoặc 2 ngày · theo cài đặt", None, "settings", to="WM-SET-01", trigger="Mở cài đặt ngưỡng COD")),
        filter_bar("Tìm tài xế, đơn, chuyến…", ["Tất cả", "Có cảnh báo", "Quá ngày", "Vượt tiền"], selects=["Tài xế"]),
        group, others, recent,
        row(icon("info", 14, T["text-muted"]), subtle("COD đang giữ = COD thực thu tại điểm trả − phiếu thu Tài xế nộp COD. Nộp lại là thu hồi khoản phải thu từ tài xế, không phải doanh thu.", 12), gap=6),
        gap=16)
    return wm_shell("finance", content, h=1000, child="WM-COD-01")


# ---------------------------------------------------------------- WM-ADV-01 Tạm ứng chuyến & đối soát
def adv_01():
    data_rows = [
        ("CX-202609-0005", "DH-202609-0010", "Trần Minh Lái", "PC-202609-0007", 1_500_000, 580_000, "Chờ đối soát", "Tài xế nộp lại", 920_000),
        ("CX-202609-0001", "DH-202609-0001", "Nguyễn Văn Tài", "PC-202609-0004", 2_000_000, 800_000, "Chuyến đang chạy", "Tạm tính nộp lại", 1_200_000),
        ("CX-202608-0021", "DH-202608-0017", "Lê Hoàng Phúc", "PC-202608-0031", 1_000_000, 1_350_000, "Đã đối soát", "Công ty đã hoàn", 350_000),
        ("CX-202608-0018", "DH-202608-0014", "Trần Minh Lái", "PC-202608-0026", 2_000_000, 2_000_000, "Đã đối soát", "Khớp", 0),
    ]
    rows = []
    for trip, order, drv, pc, adv, cost, stt, res, diff_ in data_rows:
        st_b = {"Chờ đối soát": badge("Chờ đối soát", "warning"), "Chuyến đang chạy": status("Đang vận chuyển", "trip"),
                "Đã đối soát": badge("Đã đối soát", "success")}[stt]
        tone = T["warning"] if "nộp" in res else (T["info"] if "hoàn" in res else T["text-muted"])
        rows.append([col(row(code(trip, to="WM-TRIP-01", trigger="Mở chuyến"), muted("·", 11), code(order, 12, "WM-ORD-07", "Mở tài chính đơn"), gap=4),
                         subtle(drv, 11), gap=0),
                     col(num(money(adv)), code(pc, 11, "WM-EXP-02", "Mở phiếu chi tạm ứng") if pc.startswith("PC-202609") else subtle(pc, 11), gap=0,
                         extra="align-items: flex-end;"),
                     num(money(cost)),
                     col(num(money(diff_), weight=600, color=tone), subtle(res, 11), gap=0, extra="align-items: flex-end;"), st_b])
    cols = [("Chuyến · Đơn · Tài xế", "left"), ("Tạm ứng", "right"), ("Chi phí thực tế", "right"), ("Chênh lệch", "right"), ("Trạng thái", "left")]
    left = col(
        filter_bar("Tìm chuyến, tài xế…", ["Tất cả", "Chờ đối soát", "Đang chạy", "Đã đối soát"]),
        table(cols, rows, selected=0, footer=pagination("1–4", 4)),
        row(icon("info", 14, T["text-muted"]), subtle("Tạm ứng không tính vào chi phí/lãi lỗ đơn cho đến khi đối soát; chi phí thực tế là các phiếu chi gắn chuyến.", 12), gap=6),
        gap=12, extra="flex: 1; min-width: 0;")
    costs = table([("Phiếu chi", "left"), ("Khoản", "left"), ("Số tiền", "right")], [
        [code("PC-202609-0008", to="WM-EXP-02", trigger="Mở phiếu chi"), text("Phí cầu đường", 13), num(money(180_000))],
        [code("PC-202609-0009", to="WM-EXP-02", trigger="Mở phiếu chi"), text("Bốc xếp", 13), num(money(400_000))]],
        compact=True, total_row=["", "Chi phí thực tế", money(580_000)])
    body = col(
        dl([("Chuyến", code("CX-202609-0005", to="WM-TRIP-01", trigger="Mở chuyến")), ("Tài xế", a("Trần Minh Lái", "WM-DRV-05", "Mở sổ công nợ tài xế")),
            ("Tuyến", "Phú Mỹ → Biên Hòa"), ("Hoàn thành", num("22/09/2026 10:30"))], cols=2),
        divider(),
        row(muted("Tạm ứng", 13), code("PC-202609-0007", 12, "WM-EXP-02", "Mở phiếu chi tạm ứng"), spacer(), num(money(1_500_000), 14, 600)),
        costs,
        row(btn("Thêm chi phí", "ghost", "plus", size="sm", to="WM-EXP-03", trigger="Thêm phiếu chi cho chuyến"), spacer(), gap=8),
        row(text("Tài xế còn phải nộp lại", 14, 600), spacer(), num(money(920_000), 20, 700, T["warning"]),
            extra=f"padding: 10px 12px; background: {T['warning-soft']}; border-radius: 6px;"),
        field("Cách xử lý chênh lệch", col(
            radio("Tài xế nộp tiền mặt", True, "Tạo phiếu thu Thu khác · hoàn tạm ứng (không phải doanh thu)"),
            radio("Trừ vào bảng lương kỳ 09/2026", False, "Thêm dòng giảm trừ vào BL-202609-0001"),
            radio("Điều chỉnh số liệu", False, "Thao tác nhạy cảm — cần lý do"), gap=8), True),
        gap=12)
    foot = (btn("Đóng", "secondary", to="WM-ADV-01", trigger="Đóng đối soát")
            + btn("Điều chỉnh", "secondary", "pencil", to="WM-SHELL-08", trigger="Điều chỉnh đối soát (sensitive, cần lý do)")
            + btn("Xác nhận & tạo phiếu thu", "primary", "check", to="WM-PAY-03", trigger="Xác nhận đối soát → phiếu thu hoàn tạm ứng"))
    use("Drawer")
    side = (f'<aside aria-label="Đối soát tạm ứng" style="width: 440px; flex-shrink: 0; background: {T["surface"]}; border: 1px solid {T["border"]}; '
            f'border-radius: 8px; display: flex; flex-direction: column;">'
            f'<div style="display: flex; align-items: flex-start; gap: 8px; padding: 14px 20px; border-bottom: 1px solid {T["border"]};">'
            f'{col(h("md", "Đối soát tạm ứng"), muted("CX-202609-0005 · sau chuyến", 13), gap=2)}{spacer()}{icon_btn("x", "Đóng", to="WM-ADV-01", trigger="Đóng")}</div>'
            f'<div style="padding: 16px 20px; display: flex; flex-direction: column; gap: 12px;">{body}</div>'
            f'<div style="display: flex; gap: 8px; justify-content: flex-end; padding: 12px 20px; border-top: 1px solid {T["border"]};">{foot}</div></aside>')
    content = col(
        page_header("Tạm ứng chuyến & đối soát", "Tiền đưa trước cho tài xế theo chuyến, đối chiếu với chi phí thực tế sau chuyến",
                    row(btn("Tạo tạm ứng", "primary", "plus", to="WM-EXP-03", trigger="Tạo phiếu chi tạm ứng chuyến"), gap=8),
                    crumbs=[ROOT, ("Tạm ứng chuyến", None)]),
        _kpis(kpi("Tạm ứng đang mở", money(3_500_000), "2 chuyến", "info", "coins"),
              kpi("Chờ đối soát", "1 chuyến", "CX-202609-0005 · hoàn thành 22/09", "warning", "clock"),
              kpi("Tài xế còn phải nộp", money(920_000), "Tạm tính, chưa gồm chuyến đang chạy", "warning", "arrow-down"),
              kpi("Công ty phải hoàn", money(0), "Không có", None, "arrow-up")),
        row(left, side, gap=16, align="flex-start"), gap=16)
    return wm_shell("finance", content, h=1000, child="WM-ADV-01")


# ---------------------------------------------------------------- registry
C = dict(platform="wm", module="Thu chi & Công nợ")
RA = ["admin", "accountant"]
register(
    Screen(id="WM-FIN-01", name="Sổ thu chi", route="/finance", render=fin_01, pattern="list", h=1100, roles=ROLES_FIN, **C,
           purpose="Sổ chung mọi phiếu thu/phiếu chi: loại, đối tượng, trạng thái, số tiền phiếu và dòng tiền vào/ra thực tế; điểm vào tạo phiếu.",
           api=["payments(filter, sort, first, after)", "expenses(filter, sort, first, after)"],
           data=["code", "date", "direction(IN|OUT)", "type", "counterpart", "linkedEntities", "status", "amount", "cashIn", "cashOut", "createdBy"],
           actions=[("Tạo phiếu thu (menu: khách trả / tài xế nộp COD / thu khác)", "payment.create"),
                    ("Tạo phiếu chi (menu: chi phí/NCC / tạm ứng chuyến)", "expense.create"), ("Xuất Excel", "finance.view")],
           states={"loading": "Skeleton KPI + DataTable skeleton rows", "empty": "EmptyState 'Chưa có phiếu thu/chi trong kỳ' + nút Tạo phiếu",
                   "error": "Banner danger 'Không tải được sổ thu chi' + Thử lại", "forbidden": "Operation chỉ xem một phần (08-permission ⚠️)"},
           notes=["Tiền vào/Tiền ra = dòng tiền thực; phiếu chi Chưa trả, tài xế chi trước hoặc chi từ tạm ứng hiện '—' ở cột Tiền ra.",
                  "Phiếu thu Tài xế nộp COD hiển thị nhãn 'Thu hồi — không phải doanh thu'. Doanh thu chỉ lấy từ đơn (link báo cáo WM-RPT-02).",
                  "Menu 'Tạo phiếu' truyền ?type=CUSTOMER_PAYMENT|DRIVER_COD_REMITTANCE|OTHER sang /finance/payments/new.",
                  "Có thể gộp 2 query ở BFF; sort theo ngày giảm dần; cột tiền tabular-nums, căn phải."]),
    Screen(id="WM-PAY-01", name="Danh sách phiếu thu", route="/finance/payments", render=pay_01, pattern="list", h=900, roles=ROLES_FIN, **C,
           purpose="Danh sách phiếu thu theo loại (khách trả / tài xế nộp COD / thu khác) với số đã phân bổ và còn treo.",
           api=["payments(filter: {type, method, dateRange, hasUnallocated}, sort, first, after)"],
           data=["code", "receivedAt", "type", "payer(customer|driver|text)", "method", "amount", "allocatedAmount", "unallocatedAmount", "status"],
           actions=[("Tạo phiếu thu", "payment.create (operation ⚠️)"), ("Phân bổ", "payment.allocate — admin/kế toán"), ("Xuất Excel", "finance.view")],
           states={"loading": "Skeleton", "empty": "EmptyState 'Chưa có phiếu thu' + Tạo phiếu thu", "error": "Banner danger + Thử lại"},
           notes=["Còn treo = amount − allocated (chỉ loại Khách trả) = số dư khách.", "Loại Tài xế nộp COD: cột phân bổ '—', trạng thái 'Đã đối trừ COD'.",
                  "Chip 'Còn treo' = filter.hasUnallocated=true."]),
    Screen(id="WM-PAY-02", name="Chi tiết phiếu thu", route="/finance/payments/:paymentId", render=pay_02, pattern="detail", h=1140, roles=ROLES_FIN, **C,
           purpose="Thông tin thu, người nộp, phân bổ vào đơn, số dư khách phát sinh, chứng từ và audit.",
           api=["payment(id){allocations, attachments, customer{creditBalance}}", "activityLogs(entityType: PAYMENT_IN, entityId)"],
           data=["code", "type", "payer", "amount", "receivedAt", "method", "bankAccount", "transferNote", "allocations[]", "unallocatedAmount",
                 "creditLedger[]", "attachments[]", "audit[]"],
           actions=[("Phân bổ vào đơn", "payment.allocate"), ("Sửa", "payment.update — sensitive, lý do bắt buộc (WM-SHELL-08)"),
                    ("Hủy phiếu", "payment.cancel — sensitive, lý do bắt buộc (WM-SHELL-08)"), ("In phiếu thu", "finance.view")],
           states={"loading": "Skeleton header + panels", "error": "Không tìm thấy phiếu / không có quyền → EmptyState + quay lại danh sách",
                   "cancelled": "Banner danger 'Phiếu đã hủy' + lý do; ẩn hành động"},
           notes=["Seed PT-202609-0002: 3.000.000 đ chưa phân bổ → số dư khách Bao bì Hưng Lợi.",
                  "Hủy phiếu đã phân bổ: gỡ allocation, còn nợ đơn tăng lại; ghi audit before/after.",
                  "Với phiếu Tài xế nộp COD: thay khối 'Phân bổ vào đơn' bằng 'Khoản COD đã đối trừ'."]),
    Screen(id="WM-PAY-03", name="Tạo phiếu thu", route="/finance/payments/new", render=pay_03, pattern="form", h=1320, roles=ROLES_FIN, **C,
           purpose="Ghi nhận tiền vào: khách trả, tài xế nộp COD (chọn khoản COD cần đối trừ) hoặc thu khác.",
           api=["customers", "drivers", "driverCodHeld(filter: {driverId})", "createPaymentIn(input)"],
           data=["type(CUSTOMER_PAYMENT|DRIVER_COD_REMITTANCE|OTHER)", "customerId|driverId|payerName", "amount", "receivedAt", "method",
                 "receivedBy", "note", "codItems[{stopId, amount}]", "attachments[]"],
           actions=[("Lưu phiếu thu", "payment.create; DRIVER_COD_REMITTANCE cần quyền Record driver COD remittance (admin/kế toán)"),
                    ("Lưu & tạo tiếp", "payment.create")],
           states={"validation": "Số tiền > 0; COD: tổng 'Nộp lần này' = số tiền, mỗi dòng ≤ còn giữ (lỗi inline danger)",
                   "prefill": "Từ WM-COD-01: type=DRIVER_COD_REMITTANCE, driverId, các khoản đã chọn; từ WM-DEBT-01/WM-CUS-05: type=CUSTOMER_PAYMENT, customerId"},
           notes=["Mockup ở trạng thái loại = Tài xế nộp COD (từ WM-COD-01).",
                  "Loại Khách trả: EntityPicker khách, không có bảng COD; sau lưu → WM-PAY-02 để phân bổ (WM-PAY-04), phần chưa phân bổ vào số dư khách.",
                  "Panel 'Sau khi lưu' luôn nói rõ: COD nộp lại không đổi doanh thu, không đổi công nợ khách.",
                  "react-hook-form + zod; MoneyInput số nguyên VND."]),
    Screen(id="WM-PAY-04", name="Phân bổ payment", route="/finance/payments/:paymentId/allocate", render=pay_04, pattern="form", h=960, roles=RA, **C,
           purpose="Phân bổ thủ công một phiếu thu vào nhiều đơn còn nợ của cùng khách; phần còn lại thành số dư khách.",
           api=["payment(id)", "customerDebt(filter: {customerId, openOnly})", "allocatePayment(input: {paymentId, lines[{orderId, amount}]})"],
           data=["payment.amount", "payment.allocatedAmount", "remaining", "orders[{code, status, orderDate, dueDate, total, paid, remaining}]",
                 "lines[{orderId, amount}]", "creditPreview"],
           actions=[("Xác nhận phân bổ", "payment.allocate — admin/kế toán"), ("Tự điền theo hạn cũ nhất", "client-side"), ("Hủy", "—")],
           states={"validation": "Tổng phân bổ > còn lại của phiếu → lỗi inline, chặn lưu; dòng > còn nợ đơn → lỗi inline",
                   "warning": "WarningPanel: khách có nhiều đơn quá hạn (gợi ý phân bổ đơn cũ); đơn đã đủ tiền bị khóa ô nhập",
                   "empty": "Khách không có đơn còn nợ → EmptyState 'Toàn bộ tiền sẽ vào số dư khách'"},
           notes=["Allocation không vượt khách/merchant (backend reject TENANT_SCOPE_VIOLATION/BUSINESS_RULE_VIOLATION).",
                  "Số dư khách = tổng phiếu thu − tổng phân bổ; preview cập nhật khi nhập.",
                  "Sau lưu quay về WM-PAY-02; WM-CUS-05 và WM-ORD-07 phản ánh ngay."]),
    Screen(id="WM-EXP-01", name="Danh sách phiếu chi", route="/finance/expenses", render=exp_01, pattern="list", h=1060, roles=ROLES_FIN, **C,
           purpose="Danh sách khoản chi: loại, đối tượng gắn (NCC/đơn/chuyến/xe/tài xế), ai chi, số tiền, đã trả/chưa trả.",
           api=["expenses(filter: {category, supplierId, status, payer, dateRange}, sort, first, after)"],
           data=["code", "date", "category", "subCategory", "supplier", "order", "trip", "vehicle", "driver", "paidBy", "amount", "status"],
           actions=[("Tạo phiếu chi", "expense.create"), ("Xuất Excel", "finance.view")],
           states={"loading": "Skeleton", "empty": "EmptyState 'Chưa có phiếu chi' + Tạo phiếu chi", "error": "Banner danger + Thử lại"},
           notes=["KPI chi phí ghi nhận không gồm tạm ứng chuyến (tạm ứng chỉ thành chi phí khi đối soát).",
                  "Chip 'Hoàn tài xế' = paidBy=DRIVER & status=UNPAID; 'Có NCC' = supplierId != null."]),
    Screen(id="WM-EXP-02", name="Chi tiết phiếu chi", route="/finance/expenses/:expenseId", render=exp_02, pattern="detail", h=1180, roles=ROLES_FIN, **C,
           purpose="Thông tin chi, đối tượng gắn, ai chi trước, hoàn tài xế, chứng từ, audit; đánh dấu đã trả.",
           api=["expense(id){links, attachments}", "markExpensePaid(id, input)", "updateExpense(id, input, reason)", "cancelExpense(id, reason)",
                "activityLogs(entityType: EXPENSE, entityId)"],
           data=["code", "category", "subCategory", "amount", "date", "paidBy", "reimburseDriver", "status", "order", "trip", "vehicle", "driver",
                 "supplier", "attachments[]", "audit[]"],
           actions=[("Đánh dấu đã trả", "expense.markPaid — admin/kế toán"), ("Sửa", "expense.update — sensitive, lý do (operation ⚠️)"),
                    ("Hủy phiếu", "expense.cancel — sensitive, lý do")],
           states={"loading": "Skeleton", "error": "Không tìm thấy / không có quyền", "paid": "Ẩn form hoàn tiền, hiện 'Đã trả 23/09/2026 · hình thức · người chi'"},
           notes=["Seed PC-202609-0001: phí cầu đường 800.000 đ, tài xế chi trước → công ty nợ tài xế (WM-DRV-05).",
                  "Đánh dấu đã trả giảm công nợ tài xế/NCC; không đổi lãi/lỗ đơn (chi phí đã ghi nhận khi tạo)."]),
    Screen(id="WM-EXP-03", name="Tạo phiếu chi", route="/finance/expenses/new", render=exp_03, pattern="form", h=1240, roles=ROLES_FIN, **C,
           purpose="Ghi khoản chi: chi phí chuyến, thuê xe ngoài, vật tư xe, hoàn ứng, ứng lương, tạm ứng chuyến, chi khác; gắn đối tượng theo loại.",
           api=["trips", "orders", "vehicles", "drivers", "suppliers", "catalogItems(type: EXPENSE_CATEGORY)", "createExpense(input)"],
           data=["category", "subCategory", "tripId", "orderId", "vehicleId", "driverId", "supplierId", "amount", "date", "paidBy(COMPANY|DRIVER|ADVANCE)",
                 "reimburseDriver", "status", "note", "attachments[]"],
           actions=[("Lưu phiếu chi", "expense.create"), ("Lưu & tạo tiếp", "expense.create")],
           states={"validation": "Trường bắt buộc đổi theo loại (bảng 'Trường gắn theo loại chi'); Thuê xe ngoài bắt buộc đơn + NCC",
                   "prefill": "Từ WM-ORD-07 / WM-TRIP-01 / WM-SUP-02 / WM-ADV-01: điền sẵn đơn/chuyến/NCC/loại"},
           notes=["Mockup ở loại Chi phí chuyến, tài xế chi trước (seed PC-202609-0001).",
                  "Chọn chuyến tự điền đơn, xe, tài xế (read-only).", "Tạm ứng chuyến → xuất hiện ở WM-ADV-01; ứng lương → trừ bảng lương kỳ."]),
    Screen(id="WM-DEBT-01", name="Công nợ khách tổng hợp", route="/finance/customer-debt", render=debt_01, pattern="list", h=1060, roles=ROLES_FIN, **C,
           purpose="Phải thu theo khách: tổng phải thu, đã thu, còn nợ, quá hạn, số dư, hạn mức; quét cảnh báo, ghi thu, tạo bảng kê.",
           api=["customerDebt(filter: {asOf, overdueOnly, overLimit, hasCredit})"],
           data=["customer", "receivable", "paid(allocated)", "remaining", "overdueAmount", "maxOverdueDays", "creditBalance", "creditLimit", "openOrders"],
           actions=[("Ghi nhận thanh toán", "payment.create"), ("Tạo bảng kê", "debtStatement.create — admin/kế toán"), ("Xuất Excel", "finance.view")],
           states={"loading": "Skeleton", "empty": "EmptyState 'Không có khách còn nợ'", "error": "Banner danger + Thử lại"},
           notes=["Còn nợ = tổng đơn − tổng phân bổ; không trừ số dư (credit) tự động.",
                  "Vượt hạn mức chỉ cảnh báo, không chặn tạo đơn.", "Click khách → WM-CUS-05 (tab công nợ)."]),
    Screen(id="WM-DEBT-02", name="Công nợ NCC", route="/finance/supplier-debt", render=debt_02, pattern="list", h=900, roles=ROLES_FIN, **C,
           purpose="Phải trả NCC = phiếu chi gắn NCC chưa trả, theo tuổi nợ; trả NCC bằng đánh dấu phiếu chi đã trả.",
           api=["supplierDebt(filter: {asOf})", "expenses(filter: {supplierId, status: UNPAID})"],
           data=["supplier", "unpaidTotal", "aging[0-15, 16-30, 31-60, >60]", "oldestDays", "unpaidCount", "expenses[]"],
           actions=[("Trả NCC (đánh dấu phiếu chi đã trả)", "expense.markPaid — admin/kế toán"), ("Tạo phiếu chi", "expense.create")],
           states={"loading": "Skeleton", "empty": "EmptyState 'Không còn công nợ NCC'", "forbidden": "Operation xem hạn chế (⚠️)"},
           notes=["Khoản chi không gắn NCC không vào công nợ NCC.", "Tuổi nợ tính từ ngày chi."]),
    Screen(id="WM-DEBT-03", name="Danh sách bảng kê công nợ", route="/finance/debt-statements", render=debt_03, pattern="list", h=860, roles=RA, **C,
           purpose="Danh sách bảng kê theo khách/kỳ với tổng nợ snapshot và trạng thái Nháp/Đã chốt/Đã gửi/Đã hủy; tạo bảng kê.",
           api=["debtStatements(filter)", "createDebtStatement(input: {customerId, from, to, scope})"],
           data=["code", "customer", "period", "lineCount", "totalAmount", "paidAmount", "remainingAmount", "status", "finalizedAt", "sentAt"],
           actions=[("Tạo nháp & xem trước", "debtStatement.create — admin/kế toán"), ("Tải PDF (đã chốt/đã gửi)", "finance.view")],
           states={"loading": "Skeleton", "empty": "EmptyState 'Chưa có bảng kê' + form tạo", "validation": "Khách + kỳ bắt buộc; đến ngày ≥ từ ngày"},
           notes=["Trạng thái Đã chốt có icon khóa.", "Bảng kê Nháp tính theo dữ liệu hiện tại; chỉ khi chốt mới snapshot."]),
    Screen(id="WM-DEBT-04", name="Chi tiết bảng kê công nợ", route="/finance/debt-statements/:statementId", render=debt_04, pattern="detail", h=1060, roles=RA, **C,
           purpose="Dòng snapshot các đơn (ngày, mã, tuyến, tổng, đã thu, còn lại, hạn, quá hạn); chốt, đánh dấu đã gửi, tải PDF, hủy.",
           api=["debtStatement(id){lines, pdf}", "finalizeDebtStatement(id)", "markDebtStatementSent(id)", "cancelDebtStatement(id, reason)"],
           data=["code", "customer", "period", "status", "lines[{orderDate, orderCode, route, total, paid, remaining, dueDate, overdueDays}]",
                 "totals", "finalizedAt", "finalizedBy", "pdfAttachment", "diffVsCurrent[]"],
           actions=[("Tải PDF", "finance.view → WM-SHELL-05"), ("Đánh dấu đã gửi", "debtStatement.finalize — admin/kế toán"),
                    ("Hủy bảng kê", "debtStatement.cancel — sensitive, lý do bắt buộc (WM-SHELL-08)"), ("Chốt (khi Nháp)", "debtStatement.finalize")],
           states={"draft": "Banner info 'Nháp — số liệu theo dữ liệu hiện tại' + nút Chốt bảng kê",
                   "finalized": "Banner primary khóa 'Đã chốt snapshot … — không thay đổi khi đơn/phiếu thay đổi'",
                   "cancelled": "Banner danger + lý do hủy; PDF vẫn xem được, gắn nhãn Đã hủy"},
           notes=["Lines là snapshot (debt_statement_lines), không join lại order khi hiển thị.",
                  "PDF tải lại đúng bản đã chốt.", "Khối 'Khác biệt so với dữ liệu hiện tại' chỉ tham khảo."]),
    Screen(id="WM-COD-01", name="COD tài xế đang giữ", route="/finance/cod", render=cod_01, pattern="list", h=1000, roles=ROLES_FIN, **C,
           purpose="COD tài xế đã thu chưa nộp, nhóm theo tài xế, theo đơn/chuyến/điểm, tuổi giữ tiền và cảnh báo; chọn khoản → tạo phiếu thu COD.",
           api=["driverCodHeld(filter: {driverId, warningOnly})", "merchantSettings{codWarningAmount, codWarningDays}"],
           data=["driver", "heldTotal", "items[{order, customer, trip, stop, collectedAt, codActual, remitted, held, daysHeld}]", "warnings"],
           actions=[("Tạo phiếu thu COD", "Record driver COD remittance — admin/kế toán → WM-PAY-03"), ("Xuất Excel", "finance.view")],
           states={"loading": "Skeleton", "empty": "EmptyState 'Chưa có khoản COD chưa nộp'", "error": "Banner danger + Thử lại"},
           notes=["COD held = Σ stop.cod_actual − Σ payment_in DRIVER_COD_REMITTANCE.",
                  "Cảnh báo theo cài đặt merchant: 5.000.000 đ hoặc 2 ngày (WM-SET-01).",
                  "Seed: Trần Minh Lái thu 7.500.000, đã nộp 2.000.000, còn giữ 5.500.000."]),
    Screen(id="WM-ADV-01", name="Tạm ứng chuyến & đối soát", route="/finance/trip-advances", render=adv_01, pattern="list", h=1000, roles=ROLES_FIN, **C,
           purpose="Theo dõi tạm ứng theo chuyến, chi phí thực tế, tài xế còn nộp/được hoàn; đối soát sau chuyến.",
           api=["tripAdvances(filter)", "expenses(filter: {tripId})", "reconcileTripAdvance(input: {tripId, resolution, reason?})"],
           data=["trip", "order", "driver", "advanceExpense", "advanceAmount", "actualCost", "difference", "resolution", "status"],
           actions=[("Tạo tạm ứng", "expense.create (category=TRIP_ADVANCE)"), ("Xác nhận đối soát", "Trip advance reconciliation — admin/operation/kế toán"),
                    ("Điều chỉnh", "sensitive — lý do bắt buộc (WM-SHELL-08)")],
           states={"loading": "Skeleton", "empty": "EmptyState 'Chưa có tạm ứng chuyến'", "running": "Chuyến chưa hoàn thành: chênh lệch tạm tính, khóa nút xác nhận"},
           notes=["Panel đối soát là Drawer (mở khi chọn dòng); mockup hiển thị cạnh danh sách.",
                  "Chênh lệch dương → tài xế nộp lại (phiếu thu Thu khác · hoàn tạm ứng, không phải doanh thu) hoặc trừ lương; âm → công ty hoàn (phiếu chi Hoàn ứng).",
                  "API tripAdvances/reconcileTripAdvance chưa có trong 07-api-contract-map — cần bổ sung."]),
)
