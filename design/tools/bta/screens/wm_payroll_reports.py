"""Web Merchant — Lương (WM-PAYROLL-01 … 05) và Báo cáo (WM-RPT-01 … 08).

Business rules: doc/1-BRD/04-nghiep-vu-luong-tai-xe.md
  Thực lãnh = lương cố định (snapshot) + thưởng theo đơn − ứng lương − giảm trừ.
  Operation tạo bảng lương → gửi duyệt → Giám đốc (admin) duyệt/trả về → kế toán xuất & đánh dấu đã trả.
  COD tài xế giữ và chi phí tài xế chi trước KHÔNG đi qua bảng lương (sổ công nợ tài xế riêng).
Seed: BL-202609-0001, tháng 09/2026, Chờ duyệt (doc/3-TECHNICAL/SEED-SCENARIOS.md §10).
"""
from .. import data as D
from ..core import Screen, edge, href, register
from ..shells import wm_shell
from ..ui import *  # noqa: F401,F403

ROLES_ALL = ["admin", "operation", "accountant"]
PERIOD = "01/09/2026 – 30/09/2026"
RANGE = "01/09 – 30/09/2026"

# Payroll lines of BL-202609-0001 (from D.PAYROLL_LINES): name, id, salary, bonus, advance, deduction, net, anomaly
LINES = [
    ("Nguyễn Văn Tài", "DRV-A-001", 10_000_000, 1_500_000, 2_000_000, 0, 9_500_000, 2, 1),
    ("Trần Minh Lái", "DRV-A-002", 11_000_000, 2_000_000, 0, 500_000, 12_500_000, 2, 0),
    ("Lê Hoàng Phúc", "DRV-A-004", 10_500_000, 800_000, 0, 0, 11_300_000, 1, 0),
]
TOT = dict(salary=31_500_000, bonus=4_300_000, adv=2_000_000, ded=500_000, net=33_300_000)
for _l, _d in zip(LINES, D.PAYROLL_LINES):  # keep in sync with shared seed
    assert _l[0] == _d[0] and _l[6] == _d[5]


def _neg(v):
    return "−" + money(v) if v else money(0)


def _step_no(n):
    return (f'<span style="display: inline-flex; width: 22px; height: 22px; border-radius: 50%; background: {T["primary-soft"]}; '
            f'color: {T["primary"]}; font-size: 12px; font-weight: 700; align-items: center; justify-content: center; flex-shrink: 0;">{n}</span>')


def _section(n, title, body, right="", sub=None):
    return panel(None, col(row(_step_no(n), col(h("sm", title), muted(sub, 12) if sub else "", gap=0), spacer(), right, gap=8), body, gap=14))


# ================================================================ LƯƠNG
# ---------------------------------------------------------------- WM-PAYROLL-01
def payroll_01():
    cols = [("Mã bảng lương", "left", "150px"), ("Kỳ lương", "left"), ("Trạng thái", "left"), ("Số tài xế", "right"),
            ("Tổng thực lãnh", "right"), ("Người tạo", "left"), ("Người duyệt", "left"), ("Thanh toán", "left"), ("", "right", "44px")]

    def who(name, when):
        return col(text(name, 13, 500), subtle(when, 12), gap=0)

    rows = [
        [code("BL-202609-0001", to="WM-PAYROLL-02", trigger="Click mã bảng lương → chi tiết"),
         col(text("Tháng 09/2026", 13, 600), muted(PERIOD, 12), gap=0), status("Chờ duyệt", "fin"), num("3"),
         num(money(33_300_000), weight=600), who("Lê Thu Vân", "22/09/2026 16:20"), muted("Chờ Trần Hải duyệt"), muted("—"), row_menu()],
        [code("BL-202608-0002", to="WM-PAYROLL-02", trigger="Click mã bảng lương → chi tiết"),
         col(text("Tháng 08/2026 · bổ sung", 13, 600), muted("Thưởng đơn hoàn thành muộn", 12), gap=0), status("Đã duyệt", "fin"), num("1"),
         num(money(900_000), weight=600), who("Lê Thu Vân", "12/09/2026 09:40"), who("Trần Hải", "15/09/2026 08:05"),
         badge("Chưa trả", "warning"), row_menu()],
        [code("BL-202608-0001", to="WM-PAYROLL-02", trigger="Click mã bảng lương → chi tiết"),
         col(text("Tháng 08/2026", 13, 600), muted("01/08/2026 – 31/08/2026", 12), gap=0), status("Đã trả", "fin"), num("3"),
         num(money(31_850_000), weight=600), who("Lê Thu Vân", "31/08/2026 17:10"), who("Trần Hải", "02/09/2026 09:30"),
         col(text("05/09/2026", 13, extra=NUM), subtle("Phan Ngọc Mai", 12), gap=0), row_menu()],
    ]
    kpis = grid([
        kpi("Chờ duyệt", "1", "BL-202609-0001 · " + money(33_300_000), "warning", "clock", to="WM-PAYROLL-02", trigger="KPI Chờ duyệt → bảng lương"),
        kpi("Đã duyệt, chưa trả", money(900_000), "1 bảng lương · BL-202608-0002", None, "circle-check"),
        kpi("Đã trả kỳ 08/2026", money(31_850_000), "3 tài xế · trả 05/09/2026", "success", "banknote"),
        kpi("Kỳ lương hiện tại", "Tháng 09/2026", "Theo tháng dương lịch · chốt 30/09", None, "calendar"),
    ], 4, 16)
    content = col(
        page_header("Bảng lương", "Lương kỳ = lương cố định + thưởng theo đơn − ứng lương − giảm trừ",
                    row(btn("Báo cáo bảng lương", "secondary", "chart-column", to="WM-RPT-08", trigger="Mở báo cáo bảng lương"),
                        btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất Excel"),
                        btn("Tạo bảng lương", "primary", "plus", to="WM-PAYROLL-03", trigger="Tạo bảng lương"), gap=8)),
        banner("Bảng lương <b>BL-202609-0001</b> (tháng 09/2026) đang chờ Giám đốc duyệt. Sau khi duyệt, kế toán mới xuất và chi trả.", "warning",
               action=btn("Xem và duyệt", "secondary", size="sm", to="WM-PAYROLL-05", trigger="Banner: Xem và duyệt")),
        kpis,
        filter_bar("Tìm mã bảng lương, tài xế…", ["Tất cả", "Nháp", "Chờ duyệt", "Đã duyệt", "Đã trả", "Trả về"],
                   right=row(muted("Kỳ lương theo tháng dương lịch", 12), a("Cài đặt kỳ lương", "WM-SET-01", "Mở cài đặt kỳ lương", 12), gap=6),
                   date="Năm 2026", selects=["Người tạo: Tất cả"]),
        table(cols, rows, footer=pagination("1–3", 3)),
        subtle("Kế toán chỉ xem và xuất; operation tạo và gửi duyệt; chỉ Admin/Giám đốc được duyệt hoặc trả về.", 12),
        gap=16)
    return wm_shell("payroll", content)


# ---------------------------------------------------------------- shared payroll detail frame (BL-202609-0001)
def payroll_header():
    use("EntityHeader")
    actions = row(
        btn("Timeline", "secondary", "history", to="WM-SHELL-07", trigger="Mở Timeline drawer"),
        btn("Xuất", "secondary", "download", to="WM-SHELL-05", trigger="Xuất bảng lương / phiếu lương"),
        btn("Trả về", "danger-outline", "undo-2", to="WM-SHELL-08", trigger="Trả về (sensitive, lý do bắt buộc)"),
        btn("Duyệt", "primary", "check", to="WM-PAYROLL-05", trigger="Duyệt bảng lương"),
        gap=8)
    head = row(
        col(row(h("display", "BL-202609-0001"), status("Chờ duyệt", "fin"), badge("1 cảnh báo dữ liệu", "warning", "triangle-alert"), gap=10),
            row(text("Bảng lương tháng 09/2026", 14, 500), muted("·"), text(PERIOD, 14, extra=NUM), muted("·"), text("3 tài xế", 14), gap=8),
            subtle("Tạo 22/09/2026 16:20 bởi Lê Thu Vân · Gửi duyệt 22/09/2026 17:05 · Người duyệt: Trần Hải (Admin)", 12), gap=4),
        spacer(), actions, align="flex-start")
    strip = summary_strip([("Lương cố định (snapshot)", money(TOT["salary"])), ("Thưởng theo đơn", money(TOT["bonus"], sign=True), "success"),
                           ("Ứng lương", _neg(TOT["adv"]), "warning"), ("Giảm trừ", _neg(TOT["ded"]), "danger"),
                           ("Tổng thực lãnh", money(TOT["net"]), "primary"), ("So với kỳ 08/2026", "+" + money(1_450_000))])
    return col(breadcrumb([("Lương", "WM-PAYROLL-01"), ("BL-202609-0001", None)]), head, strip, gap=12)


def _workflow():
    steps = stepper(["Nháp", "Chờ duyệt", "Đã duyệt", "Đã trả"], 1)
    right = row(btn("Gửi duyệt", "secondary", "send", size="sm", disabled=True), btn("Đánh dấu đã trả", "secondary", "banknote", size="sm", disabled=True),
                subtle("Đánh dấu đã trả khả dụng sau khi duyệt (Admin/Kế toán)", 12), gap=8)
    return row(f'<div style="width: 460px;">{steps}</div>', spacer(), right, gap=16,
               extra=f"padding: 10px 16px; background: {T['surface']}; border: 1px solid {T['border']}; border-radius: 8px;")


def _lines_table():
    cols = [("Tài xế", "left"), ("Lương cố định (snapshot)", "right"), ("Thưởng theo đơn", "right"), ("Ứng lương", "right"),
            ("Giảm trừ", "right"), ("Thực lãnh", "right"), ("Bất thường", "left"), ("", "right", "70px")]
    rows = []
    for name, did, sal, bon, adv, ded, net, n_trips, _ in LINES:
        if name == "Trần Minh Lái":
            anom = col(badge("Giữ COD 5.500.000 đ", "warning", "hand-coins"), subtle("Không trừ vào lương", 11), gap=2)
        elif name == "Nguyễn Văn Tài":
            anom = col(badge("Chuyến đang chạy", "info"), subtle("CX-202609-0001 chưa có thưởng", 11), gap=2)
        else:
            anom = muted("—")
        rows.append([
            col(a(name, "WM-PAYROLL-04", "Click dòng → chi tiết dòng lương", 13, 600), subtle(f"{did} · {n_trips} đơn có thưởng", 12), gap=0),
            num(money(sal)), num(money(bon, sign=True), color=T["success"] if bon else T["text-muted"]),
            num(_neg(adv), color=T["warning"] if adv else T["text-muted"]),
            col(num(_neg(ded), color=T["danger"] if ded else T["text-muted"]), subtle("Đền hàng hỏng", 11) if ded else "", gap=0, extra="align-items: flex-end;"),
            num(money(net), 14, 700), anom, a("Chi tiết", "WM-PAYROLL-04", "Mở chi tiết dòng lương")])
    return table(cols, rows, total_row=["Tổng 3 tài xế", money(TOT["salary"]), money(TOT["bonus"], sign=True), _neg(TOT["adv"]),
                                        _neg(TOT["ded"]), money(TOT["net"]), "", ""])


def _payroll_body():
    lines = panel("Dòng lương tài xế", _lines_table(),
                  row(muted("Snapshot lúc tạo 22/09/2026 16:20 — đổi lương tài xế sau đó không làm thay đổi bảng này.", 12), gap=6),
                  body_pad=False)
    warn = warning_panel("Dữ liệu cần kiểm tra (không chặn duyệt)", [
        "Trần Minh Lái đang giữ COD 5.500.000 đ quá 4 ngày — COD không trừ vào lương, cần tạo phiếu thu COD.",
        "CX-202609-0001 (Nguyễn Văn Tài) đang vận chuyển — thưởng chưa nhập, sẽ vào kỳ sau nếu hoàn thành sau 30/09.",
        "Phạm Văn Dự ngừng hoạt động từ 15/08/2026 — không đưa vào bảng lương kỳ này.",
    ], row(a("Xem COD tài xế", "WM-COD-01", "Mở COD tài xế đang giữ"), a("Mở chuyến CX-202609-0001", "WM-TRIP-01", "Mở chuyến đang chạy"), gap=16))
    sources = panel("Nguồn dữ liệu", dl([
        ("Lương cố định", col(text("Lịch sử lương cố định theo tài xế", 13), a("Xem lịch sử lương", "WM-DRV-04", "Mở lịch sử lương cố định", 12), gap=0)),
        ("Thưởng theo đơn", col(text("5 đơn hoàn thành trong kỳ", 13), muted("Operation nhập tay trên từng chuyến", 12), gap=0)),
        ("Ứng lương", col(text("1 phiếu chi ứng lương", 13), a("PC-202609-0007", "WM-EXP-02", "Mở phiếu chi ứng lương", 12), gap=0)),
        ("Giảm trừ", col(text("1 dòng nhập tay + lý do", 13), a("Danh mục lý do giảm trừ", "WM-CAT-01", "Mở danh mục lý do giảm trừ", 12), gap=0)),
    ], cols=2), sub="Không tính: tạm ứng chuyến, chi phí tài xế chi trước, COD")
    activity = panel("Hoạt động gần đây", timeline([
        ("22/09 17:05", "Lê Thu Vân", "Gửi duyệt → <b>Chờ duyệt</b>", None, "warning"),
        ("22/09 16:48", "Lê Thu Vân", "Thêm giảm trừ 500.000 đ cho Trần Minh Lái", "Đền 2 bao xi măng rách – DH-202609-0010", "danger"),
        ("22/09 16:20", "Lê Thu Vân", "Tạo bảng lương nháp từ dữ liệu gốc (3 tài xế)", None, "neutral"),
    ]), a("Xem tất cả", "WM-SHELL-07", "Mở Timeline"))
    return col(lines, warn, row(col(sources, gap=16, extra="flex: 1; min-width: 0;"), col(activity, gap=16, extra="flex: 1; min-width: 0;"),
                                gap=16, align="flex-start"), gap=16)


def payroll_detail(overlay=None, h_=1180):
    content = col(payroll_header(), _workflow(),
                  tabs(["Dòng lương", "Chứng từ", "Timeline"], 0, {"Timeline": "WM-SHELL-07"}, counts={"Dòng lương": 3}),
                  _payroll_body(), gap=16)
    return wm_shell("payroll", content, h=h_, overlay=overlay)


def payroll_02():
    return payroll_detail()


# ---------------------------------------------------------------- WM-PAYROLL-03 Tạo bảng lương
def payroll_03():
    period = _section(1, "Kỳ lương", row(
        field("Kỳ lương", select("Tháng 09/2026"), True, width="22%"),
        field("Từ ngày – đến ngày", input_(PERIOD, disabled=True, mono=True), hint="Theo cài đặt kỳ lương của nhà xe", width="26%"),
        field("Mã bảng lương", input_("Tự sinh: BL-202609-0001", disabled=True), width="22%"),
        field("Ghi chú", input_("Lương tháng 9, trả ngày 05/10"), width="30%"), gap=12, align="flex-start"),
        a("Cài đặt kỳ lương", "WM-SET-01", "Mở cài đặt kỳ lương", 12))

    d_cols = [("", "left", "28px"), ("Tài xế", "left"), ("Trạng thái", "left"), ("Lương cố định áp dụng", "right"), ("Hiệu lực từ", "left"),
              ("Đơn hoàn thành trong kỳ", "right"), ("Ghi chú", "left")]
    d_rows = [
        [checkbox(checked=True), col(a("Nguyễn Văn Tài", "WM-DRV-02", "Mở tài xế", 13, 600), subtle("DRV-A-001", 12), gap=0), badge("Hoạt động", "success"),
         num(money(10_000_000)), num("01/08/2026"), num("2"), muted("1 chuyến đang chạy")],
        [checkbox(checked=True), col(a("Trần Minh Lái", "WM-DRV-02", "Mở tài xế", 13, 600), subtle("DRV-A-002", 12), gap=0), badge("Hoạt động", "success"),
         num(money(11_000_000)), num("01/09/2026"), num("2"), muted("Tăng lương từ 10.500.000 đ")],
        [checkbox(checked=True), col(a("Lê Hoàng Phúc", "WM-DRV-02", "Mở tài xế", 13, 600), subtle("DRV-A-004", 12), gap=0), badge("Hoạt động", "success"),
         num(money(10_500_000)), num("01/08/2026"), num("1"), muted("—")],
        [checkbox(checked=False), col(text("Phạm Văn Dự", 13, 600, T["text-muted"]), subtle("DRV-A-003", 12), gap=0), badge("Ngừng hoạt động", "neutral"),
         num(money(9_500_000), color=T["text-muted"]), num("01/08/2026"), num("0"), muted("Ngừng từ 15/08/2026")],
    ]
    drivers = _section(2, "Tài xế", table(d_cols, d_rows, compact=True),
                       row(text("Đã chọn 3/4", 13, 600), btn("Chọn tất cả đang hoạt động", "ghost", size="sm"), gap=8),
                       sub="Lương cố định lấy theo lịch sử lương có hiệu lực trong kỳ")

    def src(ic, title, value, sub, link):
        return (f'<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border: 1px solid {T["border"]}; '
                f'border-radius: 6px; background: {T["surface-muted"]};">'
                + row(icon(ic, 16, T["text-muted"]), muted(title, 12), gap=6)
                + text(value, 16, 600, extra=NUM) + muted(sub, 12) + link + '</div>')
    sources = row(
        src("history", "Lịch sử lương cố định", money(31_500_000), "3 tài xế · snapshot khi tạo", a("Xem lịch sử lương", "WM-DRV-04", "Mở lịch sử lương cố định", 12)),
        src("route", "Thưởng theo chuyến/đơn", money(4_300_000), "5 đơn hoàn thành 01/09 – 30/09", a("Xem chuyến CX-202609-0005", "WM-TRIP-01", "Mở chuyến có thưởng", 12)),
        src("coins", "Ứng lương", money(2_000_000), "1 phiếu chi PC-202609-0007", a("Xem phiếu chi", "WM-EXP-02", "Mở phiếu chi ứng lương", 12)),
        src("minus", "Giảm trừ", money(0), "Thêm sau khi tạo, kèm lý do", a("Danh mục lý do", "WM-CAT-01", "Mở danh mục lý do giảm trừ", 12)),
        gap=12, align="stretch")
    p_cols = [("Tài xế", "left"), ("Lương cố định", "right"), ("Thưởng theo đơn", "right"), ("Ứng lương", "right"), ("Giảm trừ", "right"), ("Thực lãnh dự kiến", "right")]
    p_rows = [[text(n, 13, 600), num(money(s)), num(money(b, sign=True), color=T["success"]), num(_neg(a_), color=T["warning"] if a_ else T["text-muted"]),
               num(money(0), color=T["text-muted"]), num(money(s + b - a_), weight=700)] for n, _i, s, b, a_, _d, _n, _t, _x in LINES]
    preview = _section(3, "Xem trước dữ liệu gốc", col(
        sources,
        table(p_cols, p_rows, compact=True, total_row=["Tổng", money(31_500_000), money(4_300_000, sign=True), _neg(2_000_000), money(0), money(33_800_000)]),
        warning_panel("Lưu ý trước khi tạo", [
            "CX-202609-0001 của Nguyễn Văn Tài chưa hoàn thành — thưởng chưa được tính vào kỳ này.",
            "Tạm ứng chuyến PC-202609-0004 (2.000.000 đ) không trừ lương — đối soát riêng tại Tạm ứng chuyến.",
        ], a("Mở tạm ứng chuyến", "WM-ADV-01", "Mở tạm ứng chuyến & đối soát")),
        gap=12), sub="Hệ thống cộng dồn từ dữ liệu gốc; kế toán không tính tay")
    content = col(
        page_header("Tạo bảng lương", "Chọn kỳ và tài xế → xem trước → tạo bảng lương nháp, sau đó thêm giảm trừ và gửi duyệt",
                    row(btn("Hủy", "secondary", to="WM-PAYROLL-01", trigger="Hủy tạo bảng lương"),
                        btn("Tạo bảng lương nháp", "primary", "check", to="WM-PAYROLL-02", trigger="Tạo → chi tiết bảng lương"), gap=8),
                    crumbs=[("Lương", "WM-PAYROLL-01"), ("Tạo bảng lương", None)]),
        period, drivers, preview, gap=14)
    return wm_shell("payroll", content, h=1300)


# ---------------------------------------------------------------- WM-PAYROLL-04 Chi tiết dòng lương (Nguyễn Văn Tài)
def payroll_04():
    use("EntityHeader")
    head = row(
        avatar("NT", 44, "primary"),
        col(row(h("display", "Nguyễn Văn Tài"), status("Chờ duyệt", "fin"), gap=10),
            row(a("DRV-A-001 · Hồ sơ tài xế", "WM-DRV-02", "Mở tài xế", 14), muted("·"), text("0900 000 001", 14, extra=NUM), muted("·"),
                text("Dòng lương BL-202609-0001 · tháng 09/2026", 14), gap=8), gap=2),
        spacer(),
        row(btn("In phiếu lương", "secondary", "printer", to="WM-SHELL-05", trigger="In phiếu lương"),
            btn("Quay lại bảng lương", "secondary", "arrow-left", to="WM-PAYROLL-02", trigger="Quay lại chi tiết bảng lương"), gap=8),
        gap=14, align="flex-start")
    strip = summary_strip([("Lương cố định (snapshot)", money(10_000_000)), ("Thưởng theo đơn", money(1_500_000, sign=True), "success"),
                           ("Ứng lương", _neg(2_000_000), "warning"), ("Giảm trừ", money(0)), ("Thực lãnh", money(9_500_000), "primary")])

    cols = [("Khoản", "left", "110px"), ("Diễn giải", "left"), ("Chứng từ / nguồn", "left"), ("Số tiền", "right")]
    rows = [
        [badge("Lương cố định", "neutral"), col(text("Lương cố định áp dụng trong kỳ", 13), subtle("Hiệu lực từ 01/08/2026 · snapshot 22/09", 12), gap=0),
         a("Lịch sử lương", "WM-DRV-04", "Mở lịch sử lương cố định"), num(money(10_000_000), weight=600)],
        [badge("Thưởng", "success"), col(text("Phú Mỹ → Long Thành", 13), subtle("Hoàn thành 08/09/2026", 12), gap=0),
         col(code("CX-202609-0007", to="WM-TRIP-01", trigger="Mở chuyến có thưởng"), code("DH-202609-0005", 12, to="WM-ORD-02", trigger="Mở đơn hàng"), gap=0),
         num(money(700_000, sign=True), color=T["success"])],
        [badge("Thưởng", "success"), col(text("Cần Thơ → Long An", 13), subtle("Hoàn thành 17/09/2026", 12), gap=0),
         col(code("CX-202609-0009", to="WM-TRIP-01", trigger="Mở chuyến có thưởng"), code("DH-202609-0007", 12, to="WM-ORD-02", trigger="Mở đơn hàng"), gap=0),
         num(money(800_000, sign=True), color=T["success"])],
        [badge("Ứng lương", "warning"), col(text("Tài xế ứng lương giữa kỳ", 13), subtle("10/09/2026 · tiền mặt · Phan Ngọc Mai", 12), gap=0),
         code("PC-202609-0007", to="WM-EXP-02", trigger="Mở phiếu chi ứng lương"), num(_neg(2_000_000), color=T["warning"])],
        [badge("Giảm trừ", "danger"), muted("Chưa có khoản giảm trừ trong kỳ"), muted("—"), num(money(0), color=T["text-muted"])],
    ]
    comp = panel("Các khoản cấu thành", table(cols, rows, total_row=["Thực lãnh", "", "", money(9_500_000)]),
                 sub="Lương cố định + thưởng theo đơn − ứng lương − giảm trừ", body_pad=False)
    excluded = panel("Không tính vào lương", col(
        row(col(row(code("PC-202609-0001", to="WM-EXP-02", trigger="Mở phiếu chi tài xế chi trước"), badge("Chưa trả", "warning"), gap=8),
                muted("Phí cầu đường tài xế chi trước · công ty hoàn qua phiếu chi, bất kỳ lúc nào", 12), gap=0), spacer(), num(money(800_000), 13, 600), gap=12),
        divider(),
        row(col(row(code("PC-202609-0004", to="WM-ADV-01", trigger="Mở đối soát tạm ứng chuyến"), badge("Chờ đối soát", "info"), gap=8),
                muted("Tạm ứng chuyến CX-202609-0001 · đối soát riêng, không trừ lương", 12), gap=0), spacer(), num(money(2_000_000), 13, 600), gap=12),
        divider(),
        row(muted("Số dư sổ đối chiếu: công ty nợ tài xế 800.000 đ", 12), spacer(), a("Mở sổ công nợ tài xế", "WM-DRV-05", "Mở sổ công nợ tài xế", 12), gap=8),
        gap=10), sub="Theo sổ công nợ tài xế, độc lập với kỳ lương")
    left = col(comp, excluded, gap=16, extra="flex: 3; min-width: 0;")

    add = panel("Thêm giảm trừ", col(
        banner("Bảng lương đang <b>Chờ duyệt</b>: chỉ sửa khi Giám đốc trả về Nháp.", "info"),
        field("Lý do giảm trừ", select("Đền hàng hỏng"), True, hint="Danh mục lý do có thể tự thêm"),
        field("Số tiền", money_input(None), True),
        field("Gắn đơn/chuyến (tùy chọn)", select("", "Chọn đơn hoặc chuyến trong kỳ")),
        field("Diễn giải", textarea("", "Ví dụ: 2 bao gạo rách khi giao tại Bình Dương", 56), True, hint="Lưu vào Timeline cùng người thêm"),
        row(spacer(), btn("Lưu giảm trừ", "primary", "plus", size="sm", disabled=True), gap=8),
        gap=12))
    dispute = panel("Phản hồi của tài xế", col(
        row(icon("message-square", 16, T["text-muted"]), muted("Chưa có phản hồi hay tranh chấp cho dòng lương này.", 13), gap=8),
        subtle("Khi tài xế phản hồi, operation ghi nhận tại đây và điều chỉnh bằng khoản giảm trừ/thưởng khi bảng lương về Nháp.", 12), gap=6))
    hist = panel("Lịch sử dòng lương", timeline([
        ("22/09 16:20", "Lê Thu Vân", "Tạo dòng lương từ dữ liệu gốc: 2 thưởng, 1 ứng lương", None, "neutral"),
        ("10/09 14:15", "Phan Ngọc Mai", "Chi ứng lương PC-202609-0007 · 2.000.000 đ", None, "warning"),
    ]))
    right = col(add, dispute, hist, gap=16, extra="width: 400px; flex-shrink: 0;")
    content = col(breadcrumb([("Lương", "WM-PAYROLL-01"), ("BL-202609-0001", "WM-PAYROLL-02"), ("Nguyễn Văn Tài", None)]),
                  head, strip, row(left, right, gap=16, align="flex-start"), gap=16)
    return wm_shell("payroll", content, h=1240)


# ---------------------------------------------------------------- WM-PAYROLL-05 Duyệt bảng lương (dialog)
def payroll_05():
    tot = table([("Khoản", "left"), ("Kỳ 08/2026", "right"), ("Kỳ 09/2026", "right"), ("Chênh lệch", "right")], [
        [text("Lương cố định", 13), num(money(31_500_000)), num(money(31_500_000)), muted("0 đ")],
        [text("Thưởng theo đơn", 13), num(money(2_850_000)), num(money(4_300_000)), num("+" + money(1_450_000), color=T["success"])],
        [text("Ứng lương", 13), num(_neg(1_500_000)), num(_neg(2_000_000)), num("−" + money(500_000), color=T["warning"])],
        [text("Giảm trừ", 13), num(_neg(1_000_000)), num(_neg(500_000)), num("+" + money(500_000), color=T["success"])],
    ], compact=True, total_row=["Tổng thực lãnh", money(31_850_000), money(33_300_000), "+" + money(1_450_000)])
    body = col(
        dl([("Bảng lương", code("BL-202609-0001")), ("Kỳ", num("Tháng 09/2026")), ("Số tài xế", num("3")),
            ("Người tạo · gửi duyệt", text("Lê Thu Vân · 22/09 17:05", 14, extra=NUM))], cols=4),
        tot,
        col(text("Thay đổi cần lưu ý", 13, 600),
            row(icon("minus", 14, T["danger"]), muted("Trần Minh Lái: giảm trừ 500.000 đ — đền 2 bao xi măng rách (DH-202609-0010)", 13), gap=6),
            row(icon("triangle-alert", 14, T["warning"]), muted("Trần Minh Lái đang giữ COD 5.500.000 đ — không trừ lương", 13), gap=6),
            row(icon("trending-up", 14, T["text-muted"]), muted("Trần Minh Lái tăng lương cố định 10.500.000 → 11.000.000 đ từ 01/09", 13), gap=6), gap=4),
        row(field("Người duyệt", input_("Trần Hải · Admin", disabled=True), width="40%"),
            field("Thời điểm", input_("23/09/2026 14:30", disabled=True, mono=True), width="30%"), gap=12),
        field("Ghi chú duyệt / lý do trả về", textarea("", "Tùy chọn khi duyệt · bắt buộc khi trả về (lưu vào Timeline)", 64),
              hint="Trả về đưa bảng lương về Nháp để operation sửa; lý do bắt buộc."),
        gap=14)
    foot = (btn("Hủy", "secondary", to="WM-PAYROLL-02", trigger="Đóng dialog")
            + btn("Trả về", "danger-outline", "undo-2", to="WM-PAYROLL-02", trigger="Trả về (lý do bắt buộc) → Nháp")
            + btn("Duyệt bảng lương", "primary", "check", to="WM-PAYROLL-02", trigger="Duyệt → Đã duyệt"))
    dlg = dialog("Duyệt bảng lương", body, foot, 640, "Sau khi duyệt, kế toán mới xuất và chi trả. Hủy duyệt là thao tác nhạy cảm.", close_to="WM-PAYROLL-02")
    return payroll_detail(overlay=(dlg, "center"))


# ================================================================ BÁO CÁO
def rpt_frame(title, sub, body, h_=960, selects=(), search="Tìm…", chips=(), actions=""):
    header = page_header(title, sub, row(actions, btn("Xuất Excel", "secondary", "download", to="WM-SHELL-05", trigger="Xuất Excel"), gap=8),
                         crumbs=[("Báo cáo", "WM-RPT-01"), (title, None)])
    fb = filter_bar(search, chips, date=RANGE, selects=selects)
    return wm_shell("reports", col(header, fb, body, gap=16), h=h_)


def _pad_svg(html, w, h_, extra):
    """line_chart puts the last x label on the right edge; widen the viewBox so it is not cut off."""
    return html.replace(f'width="{w}" height="{h_}" viewBox="0 0 {w} {h_}"', f'width="{w + extra}" height="{h_}" viewBox="0 0 {w + extra} {h_}"')


def _pct(v):
    return f"{v:.1f}".replace(".", ",") + "%"


# ---------------------------------------------------------------- WM-RPT-01 Trung tâm báo cáo
def _report_card(to, ic, title, desc, stat_label, stat_value, tone=None):
    edge(to, f"Mở báo cáo {title}")
    color = TONES[tone][1] if tone else T["text"]
    inner = (row(f'<span style="display: inline-flex; padding: 8px; border-radius: 6px; background: {T["primary-soft"]};">{icon(ic, 18, T["primary"])}</span>',
                 col(text(title, 14, 600), muted(desc, 12), gap=0), gap=12, align="flex-start")
             + divider()
             + row(col(subtle(stat_label, 12), text(stat_value, 16, 600, color, NUM), gap=0), spacer(),
                   text("Mở báo cáo", 13, 600, T["accent"]), icon("chevron-right", 14, T["accent"]), gap=4, align="flex-end"))
    return (f'<a href="{href(to)}" style="display: flex; flex-direction: column; gap: 12px; padding: 16px; background: {T["surface"]}; '
            f'border: 1px solid {T["border"]}; border-radius: 8px; text-decoration: none; min-width: 0;">{inner}</a>')


def rpt_01():
    use("ReportCard")

    def group(title, sub, cards):
        return col(row(h("md", title), muted(sub, 13), gap=10, align="baseline"), grid(cards, 3, 16), gap=10)
    content = col(
        page_header("Báo cáo", "Chọn báo cáo; khoảng thời gian áp dụng cho số liệu tóm tắt trên thẻ",
                    row(btn("Dashboard tài chính", "secondary", "layout-dashboard", to="WM-DASH-03", trigger="Mở dashboard tài chính"), gap=8)),
        filter_bar("Tìm báo cáo…", ["Tất cả", "Vận hành", "Tài chính", "Lương"], date=RANGE),
        group("Vận hành", "Xe, tài xế, chuyến", [
            _report_card("WM-RPT-04", "vehicles", "Hiệu suất xe", "Số chuyến, ngày chạy, doanh thu và chi phí theo xe", "Tỷ lệ sử dụng đội xe", "57%"),
            _report_card("WM-RPT-05", "drivers", "Hiệu suất tài xế", "Số chuyến, đúng giờ, thưởng, COD giữ, sự cố", "Chuyến hoàn thành", "35"),
        ]),
        group("Tài chính", "Doanh thu ghi nhận trên đơn; phiếu thu/COD không phải doanh thu", [
            _report_card("WM-RPT-02", "chart-column", "Doanh thu – chi phí – lãi/lỗ", "Theo tuần/tháng, lọc theo khách, xe, tài xế", "Lãi/lỗ tháng 09", money(43_300_000), "success"),
            _report_card("WM-RPT-03", "orders", "Lãi/lỗ theo đơn", "Doanh thu, chi phí chuyến/đơn, thuê ngoài từng đơn", "Đơn lỗ", "1 đơn", "danger"),
            _report_card("WM-RPT-06", "debt", "Công nợ khách", "Tuổi nợ 0–15 / 16–30 / 31–60 / >60 ngày, hạn mức", "Quá hạn", money(27_000_000), "danger"),
            _report_card("WM-RPT-07", "cod", "COD tài xế", "COD đã thu, đã nộp, đang giữ theo tài xế/đơn", "Đang giữ", money(5_500_000), "warning"),
        ]),
        group("Lương", "Bảng lương theo kỳ", [
            _report_card("WM-RPT-08", "payroll", "Báo cáo bảng lương", "Thực lãnh, thưởng, ứng, giảm trừ theo kỳ và tài xế", "Kỳ 09/2026 (chờ duyệt)", money(33_300_000), "warning"),
        ]),
        subtle("Mọi báo cáo dùng chung công thức với màn nghiệp vụ (tab Tài chính đơn, sổ công nợ tài xế) — không có công thức riêng.", 12),
        gap=20)
    return wm_shell("reports", content, h=1060)


# ---------------------------------------------------------------- WM-RPT-02 Doanh thu – chi phí – lãi/lỗ
WEEKS = [("Tuần 1", "01–07/09", 26_900_000, 1_500_000, 16_400_000, 3_200_000),
         ("Tuần 2", "08–14/09", 32_000_000, 2_200_000, 18_900_000, 4_000_000),
         ("Tuần 3", "15–21/09", 39_300_000, 2_200_000, 19_400_000, 8_000_000),
         ("Tuần 4", "22–30/09", 28_800_000, 1_500_000, 13_200_000, 8_000_000)]


def rpt_02():
    labels = [w[0] for w in WEEKS]
    rev = [(w[2] + w[3]) / 1e6 for w in WEEKS]
    cost = [(w[4] + w[5]) / 1e6 for w in WEEKS]
    prof = [r - c for r, c in zip(rev, cost)]
    kpis = grid([kpi("Doanh thu", money(134_400_000), "Giá cước 127.000.000 đ + dịch vụ thêm 7.400.000 đ", None, "trending-up"),
                 kpi("Chi phí", money(91_100_000), "Chi phí chuyến/đơn + thuê xe ngoài", None, "receipt-text"),
                 kpi("Lãi/lỗ", money(43_300_000), "Tăng 8,4% so với tháng 08", "success", "chart-column"),
                 kpi("Biên lợi nhuận", "32,2%", "Tuần 4 tạm tính đến 23/09", None, "percent")], 4, 16)
    charts = row(
        panel("Doanh thu và chi phí theo tuần", bar_chart(labels, [("Doanh thu", rev, "chart-1"), ("Chi phí", cost, "chart-2")], 520, 220),
              extra="flex: 1; min-width: 0;"),
        panel("Lãi/lỗ theo tuần", col(legend([("Lãi/lỗ", prof, "chart-3")]), _pad_svg(line_chart(labels, [("Lãi/lỗ", prof, "chart-3")], 500, 208), 500, 208, 20), gap=6),
              extra="flex: 1; min-width: 0;"),
        gap=16, align="stretch")
    cols = [("Tuần", "left"), ("Giá cước", "right"), ("Dịch vụ thêm", "right"), ("Doanh thu", "right"), ("Chi phí chuyến/đơn", "right"),
            ("Thuê xe ngoài", "right"), ("Lãi/lỗ", "right"), ("Biên", "right")]
    rows = []
    for (lab, rng, fr, ad, tc, out) in WEEKS:
        r, c = fr + ad, tc + out
        rows.append([col(text(lab, 13, 600), muted(rng, 12), gap=0), num(money(fr)), num(money(ad)), num(money(r), weight=600),
                     num(money(tc)), num(money(out)), num(money(r - c), weight=600, color=T["success"]), num(_pct((r - c) / r * 100))])
    table_w = panel("Số liệu theo tuần", table(cols, rows, compact=True, total_row=["Tháng 09/2026", money(127_000_000), money(7_400_000), money(134_400_000),
                                                                                 money(67_900_000), money(23_200_000), money(43_300_000), "32,2%"]),
                    body_pad=False, sub="Bảng dữ liệu của biểu đồ")
    cus = [("Công ty Gạo Miền Tây", 6, 42_500_000, 27_100_000), ("Kho Thép An Phát", 3, 35_000_000, 26_800_000),
           ("Vật liệu Xây dựng Phú Mỹ", 5, 30_500_000, 20_300_000), ("Nông sản Đồng Tháp Xanh", 2, 15_000_000, 9_000_000),
           ("Bao bì Hưng Lợi", 3, 11_400_000, 7_900_000)]
    c_rows = [[a(n, "WM-CUS-02", "Mở khách hàng", 13, 600), num(str(k)), num(money(r)), num(money(c)), num(money(r - c), weight=600, color=T["success"]),
               num(_pct((r - c) / r * 100)), a("Xem đơn", "WM-RPT-03", "Lãi/lỗ theo đơn của khách")] for n, k, r, c in cus]
    by_cus = panel("Theo khách hàng", table([("Khách hàng", "left"), ("Số đơn", "right"), ("Doanh thu", "right"), ("Chi phí", "right"), ("Lãi/lỗ", "right"),
                                             ("Biên", "right"), ("", "right")], c_rows, compact=True),
                   subtle("Doanh thu ghi nhận trên đơn (không gồm phiếu thu, COD tài xế nộp)", 12), body_pad=False)
    body = col(kpis, charts, table_w, by_cus, gap=16)
    return rpt_frame("Doanh thu – chi phí – lãi/lỗ", "Doanh thu = giá cước + dịch vụ thêm của đơn; chi phí = chi phí chuyến/đơn + thuê ngoài", body, 1420,
                     selects=["Nhóm theo: Tuần", "Khách hàng: Tất cả", "Xe: Tất cả", "Tài xế: Tất cả"], search="Tìm mã đơn…")


# ---------------------------------------------------------------- WM-RPT-03 Lãi/lỗ theo đơn
def rpt_03():
    data = [
        ("DH-202609-0002", "Kho Thép An Phát", "Long An → Q.7, Thủ Đức", "Đã xếp xe", 35_000_000, 3_200_000, 8_000_000),
        ("DH-202609-0009", "Công ty Gạo Miền Tây", "Cần Thơ → Q. Bình Tân", "Hoàn thành", 15_000_000, 4_600_000, 0),
        ("DH-202609-0001", "Công ty Gạo Miền Tây", "Cần Thơ → Bình Dương", "Đang thực hiện", 12_500_000, 800_000, 0),
        ("DH-202609-0005", "Vật liệu Xây dựng Phú Mỹ", "Phú Mỹ → Long Thành", "Hoàn thành", 12_000_000, 3_900_000, 0),
        ("DH-202609-0011", "Nông sản Đồng Tháp Xanh", "Đồng Tháp → Thủ Đức", "Đã xác nhận", 8_200_000, 0, 0),
        ("DH-202609-0010", "Vật liệu Xây dựng Phú Mỹ", "Phú Mỹ → Biên Hòa", "Hoàn thành", 6_500_000, 2_100_000, 0),
        ("DH-202609-0012", "Bao bì Hưng Lợi", "Bình Dương → Q. Tân Phú", "Chờ xác nhận", 4_800_000, 0, 0),
        ("DH-202609-0004", "Kho Thép An Phát", "Long An → Q.9", "Đã hủy", 0, 1_000_000, 0),
    ]
    cols = [("Mã đơn", "left", "140px"), ("Khách hàng · Tuyến", "left"), ("Trạng thái", "left"), ("Doanh thu", "right"),
            ("Chi phí chuyến/đơn", "right"), ("Thuê ngoài", "right"), ("Lãi/lỗ", "right"), ("Biên", "right")]
    rows, sel = [], None
    tr = tc = to_ = 0
    for i, (c, cus, route, stt, rev, cost, out) in enumerate(data):
        p = rev - cost - out
        tr, tc, to_ = tr + rev, tc + cost, to_ + out
        pc = T["danger"] if p < 0 else T["success"]
        note = subtle("Tạm tính · chưa có chi phí", 11) if cost == 0 and out == 0 else (subtle("Tạm ứng chưa đối soát không tính", 11) if c == "DH-202609-0001" else "")
        if p < 0:
            sel = i
        rows.append([code(c, to="WM-ORD-02", trigger="Click mã đơn → chi tiết đơn"), col(text(cus, 13, 500), muted(route, 12), gap=0), status(stt),
                     num(money(rev)), num(money(cost)), num(money(out)),
                     col(num(money(p) if p >= 0 else "−" + money(-p), weight=700, color=pc), note, gap=0, extra="align-items: flex-end;"),
                     num(_pct(p / rev * 100) if rev else "—", color=T["danger"] if p < 0 else None)])
    body = col(
        summary_strip([("Số đơn", "8"), ("Doanh thu", money(tr)), ("Chi phí chuyến/đơn", money(tc)), ("Thuê ngoài", money(to_)),
                       ("Lãi/lỗ", money(tr - tc - to_), "success"), ("Đơn lỗ", "1", "danger")]),
        table(cols, rows, selected=sel, total_row=["Tổng", "", "", money(tr), money(tc), money(to_), money(tr - tc - to_), _pct((tr - tc - to_) / tr * 100)],
              footer=pagination("1–8", 38)),
        row(icon("info", 14, T["text-muted"]), subtle("Lãi/lỗ đơn = tổng thu khách − chi phí chuyến/đơn − thuê ngoài; bằng đúng số ở tab Tài chính đơn. "
                                                       "Tạm ứng chuyến chỉ tính khi đã đối soát.", 12), gap=6),
        gap=16)
    return rpt_frame("Lãi/lỗ theo đơn", "Từng đơn: doanh thu, chi phí chuyến/đơn, thuê xe ngoài và lãi/lỗ", body, 1000,
                     selects=["Khách hàng: Tất cả", "Trạng thái: Tất cả"], search="Tìm mã đơn, khách…",
                     chips=["Tất cả", "Đơn lỗ", "Biên < 20%", "Có thuê ngoài", "Tạm tính"])


# ---------------------------------------------------------------- WM-RPT-04 Hiệu suất xe
def rpt_04():
    vs = [("51C-123.45", "Tải thùng · 8 tấn", "Đang chạy", 14, 18, 48_600_000, 3_300_000, 22_400_000),
          ("51D-678.90", "Mui bạt · 15 tấn", "Đang chạy", 12, 17, 44_800_000, 2_500_000, 20_100_000),
          ("51C-456.78", "Tải thùng · 10 tấn", "Sẵn sàng", 9, 12, 23_400_000, 0, 9_600_000),
          ("51H-111.22", "Xe lạnh · 5 tấn", "Bảo dưỡng", 3, 5, 9_600_000, 4_200_000, 3_800_000)]
    tone = {"Đang chạy": "accent", "Sẵn sàng": "success", "Bảo dưỡng": "warning"}
    rows = []
    for plate, typ, stt, trips, days, rev, vcost, tcost in vs:
        util = round(days / 23 * 100)
        p = rev - vcost - tcost
        rows.append([col(a(plate, "WM-VEH-02", "Mở chi tiết xe", 13, 600), muted(typ, 12), gap=0), badge(stt, tone[stt]), num(str(trips)),
                     col(num(f"{days}/23 ngày"), f'<div style="width: 90px;">{progress(util, "warning" if util < 30 else "primary", 4)}</div>', gap=4),
                     num(money(rev)), num(money(vcost)), num(money(tcost)), num(money(p), weight=700, color=T["success"])])
    tbl = panel("So sánh xe", table([("Xe", "left"), ("Trạng thái", "left"), ("Chuyến", "right"), ("Ngày chạy (tỷ lệ sử dụng)", "left"),
                                     ("Doanh thu liên quan", "right"), ("Chi phí xe", "right"), ("Chi phí chuyến", "right"), ("Lãi gộp", "right")],
                                    rows, compact=False, total_row=["4 xe", "", "38", "52/92 ngày", money(126_400_000), money(10_000_000), money(55_900_000), money(60_500_000)]),
                body_pad=False, sub="Chi phí xe: nhiên liệu, sửa chữa, bảo dưỡng gắn biển số")
    chart = panel("Doanh thu và chi phí theo xe", bar_chart([v[0] for v in vs], [("Doanh thu liên quan", [v[5] / 1e6 for v in vs], "chart-1"),
                                                                                 ("Chi phí (xe + chuyến)", [(v[6] + v[7]) / 1e6 for v in vs], "chart-2")], 1080, 220))
    body = col(
        grid([kpi("Xe hoạt động", "3/4", "51H-111.22 đang bảo dưỡng", None, "vehicles"),
              kpi("Tổng chuyến xe nhà", "38", "Thuê ngoài: 1 chuyến · 8.000.000 đ", None, "route"),
              kpi("Tỷ lệ sử dụng", "57%", "52/92 ngày-xe", None, "gauge"),
              kpi("Lãi gộp xe nhà", money(60_500_000), None, "success", "chart-column")], 4, 16),
        chart, tbl,
        subtle("Doanh thu liên quan chia theo chuyến của xe. Đơn thuê xe ngoài không gắn xe nhà — xem công nợ nhà cung cấp.", 12),
        gap=16)
    return rpt_frame("Hiệu suất xe", "Số chuyến, ngày chạy, doanh thu và chi phí theo từng xe", body, 1180,
                     selects=["Loại xe: Tất cả", "Trạng thái: Tất cả"], search="Tìm biển số…")


# ---------------------------------------------------------------- WM-RPT-05 Hiệu suất tài xế
def rpt_05():
    ds = [("Nguyễn Văn Tài", "DRV-A-001", "51C-123.45", 13, 92, 1_500_000, 0, 1, 45_200_000),
          ("Trần Minh Lái", "DRV-A-002", "51D-678.90", 12, 100, 2_000_000, 5_500_000, 0, 44_800_000),
          ("Lê Hoàng Phúc", "DRV-A-004", "51C-456.78", 10, 90, 800_000, 0, 0, 27_000_000),
          ("Phạm Văn Dự", "DRV-A-003", "—", 0, None, 0, 0, 0, 0)]
    rows = []
    for name, did, veh, trips, ontime, bonus, cod, inc, rev in ds:
        inactive = trips == 0
        cod_c = (col(a(money(cod), "WM-DRV-06", "Mở COD tài xế đang giữ", 13, 600), badge("Quá ngưỡng 5 triệu", "warning"), gap=2, extra="align-items: flex-end;")
                 if cod else num(money(0), color=T["text-muted"]))
        inc_c = a("1 đang mở", "WM-INC-01", "Mở sự cố") if inc else muted("0")
        rows.append([col(a(name, "WM-DRV-02", "Mở chi tiết tài xế", 13, 600), subtle(f"{did} · xe {veh}" if veh != "—" else did, 12), gap=0),
                     badge("Ngừng hoạt động", "neutral") if inactive else badge("Hoạt động", "success"),
                     num(str(trips)), num(f"{ontime}%" if ontime is not None else "—", color=T["warning"] if ontime and ontime < 95 else None),
                     num(money(rev)), num(money(bonus)), cod_c, inc_c])
    tbl = panel("So sánh tài xế", table([("Tài xế", "left"), ("Trạng thái", "left"), ("Chuyến hoàn thành", "right"), ("Đúng giờ", "right"),
                                         ("Doanh thu liên quan", "right"), ("Thưởng theo đơn", "right"), ("COD đang giữ", "right"), ("Sự cố", "left")], rows,
                                        total_row=["4 tài xế", "", "35", "94%", money(117_000_000), money(4_300_000), money(5_500_000), "1"]), body_pad=False)
    chart = panel("Doanh thu liên quan theo tài xế", bar_chart([d[0] for d in ds[:3]], [("Doanh thu liên quan", [d[8] / 1e6 for d in ds[:3]], "chart-1")], 1080, 200),
                  sub="Tài xế đang hoạt động; số liệu chi tiết ở bảng bên dưới")
    body = col(chart, tbl,
               subtle("Đúng giờ = chuyến hoàn thành trước giờ trả dự kiến. COD đang giữ lấy từ sổ công nợ tài xế; không trừ vào lương.", 12), gap=16)
    return rpt_frame("Hiệu suất tài xế", "Số chuyến, đúng giờ, thưởng, COD đang giữ và sự cố theo tài xế", body, 1000,
                     selects=["Trạng thái: Tất cả", "Xe: Tất cả"], search="Tìm tài xế…")


# ---------------------------------------------------------------- WM-RPT-06 Công nợ khách
def _stack_bar(parts, total):
    segs = "".join(f'<div style="width: {v / total * 100:.2f}%; background: {T[tok]};"></div>' for _l, v, tok in parts if v)
    return (f'<div style="display: flex; height: 14px; border-radius: 4px; overflow: hidden; background: {T["neutral-soft"]};">{segs}</div>')


def rpt_06():
    cs = [("Vật liệu Xây dựng Phú Mỹ", "CUS-A-005", 60_000_000, 52_500_000, 12_000_000, 0, 0, 12_000_000, 0, "Vượt hạn mức"),
          ("Kho Thép An Phát", "CUS-A-002", 200_000_000, 35_000_000, 0, 0, 0, 0, 0, None),
          ("Công ty Gạo Miền Tây", "CUS-A-001", 100_000_000, 12_500_000, 15_000_000, 0, 0, 15_000_000, 0, "Quá hạn"),
          ("Nông sản Đồng Tháp Xanh", "CUS-A-004", 80_000_000, 8_200_000, 0, 0, 0, 0, 0, None),
          ("Bao bì Hưng Lợi", "CUS-A-003", 50_000_000, 0, 0, 0, 0, 0, 3_000_000, None)]
    rows = []
    for name, cid, lim, b1, b2, b3, b4, od, credit, warn in cs:
        tot = b1 + b2 + b3 + b4
        w = badge(warn, "danger" if warn == "Quá hạn" else "warning") if warn else ""
        cell = lambda v: num(money(v)) if v else muted("—")
        rows.append([col(row(a(name, "WM-CUS-05", "Mở công nợ khách", 13, 600), w, gap=6), subtle(f"{cid} · hạn mức {money(lim)}", 12), gap=0),
                     num(money(tot), weight=600), cell(b1), cell(b2), cell(b3), cell(b4),
                     num(money(od), weight=600, color=T["danger"]) if od else muted("—"),
                     num(money(credit), color=T["info"]) if credit else muted("—"),
                     a("Tạo bảng kê", "WM-DEBT-03", "Tạo bảng kê cho khách") if tot else ""])
    parts = [("0–15 ngày", 108_200_000, "chart-1"), ("16–30 ngày", 27_000_000, "chart-2"), ("31–60 ngày", 0, "chart-3"), ("> 60 ngày", 0, "chart-4")]
    aging = panel("Cơ cấu tuổi nợ", col(
        _stack_bar(parts, 135_200_000),
        row(*[row(f'<span style="width: 10px; height: 10px; border-radius: 2px; background: {T[tok]};"></span>', muted(l, 12),
                  text(money(v), 13, 600, extra=NUM), gap=6) for l, v, tok in parts], gap=28), gap=10))
    tbl = table([("Khách hàng", "left"), ("Tổng nợ", "right"), ("0–15 ngày", "right"), ("16–30 ngày", "right"), ("31–60 ngày", "right"), ("> 60 ngày", "right"),
                 ("Quá hạn", "right"), ("Số dư có", "right"), ("", "right")], rows,
                total_row=["5 khách", money(135_200_000), money(108_200_000), money(27_000_000), "—", "—", money(27_000_000), money(3_000_000), ""])
    body = col(
        grid([kpi("Tổng phải thu", money(135_200_000), "4 khách còn nợ", None, "debt"),
              kpi("Quá hạn", money(27_000_000), "2 khách · lâu nhất 10 ngày", "danger", "alarm-clock", to="WM-DEBT-01", trigger="KPI Quá hạn → công nợ khách tổng hợp"),
              kpi("Vượt hạn mức", "1 khách", "Phú Mỹ: 64.500.000 / 60.000.000 đ", "warning", "triangle-alert"),
              kpi("Số dư có (khách trả trước)", money(3_000_000), "Chưa phân bổ · Bao bì Hưng Lợi", "info", "wallet")], 4, 16),
        aging, tbl,
        row(icon("info", 14, T["text-muted"]), subtle("Tuổi nợ tính từ ngày hoàn thành đơn; quá hạn tính theo hạn thanh toán của từng đơn. Số dư có không trừ tự động vào nợ.", 12), gap=6),
        gap=16)
    return rpt_frame("Công nợ khách", "Tuổi nợ, quá hạn, hạn mức và số dư có theo khách", body, 960,
                     selects=["Khách hàng: Tất cả"], search="Tìm khách…", chips=["Tất cả", "Quá hạn", "Vượt hạn mức", "Có số dư có"],
                     actions=btn("Công nợ tổng hợp", "secondary", "scale", to="WM-DEBT-01", trigger="Mở công nợ khách tổng hợp"))


# ---------------------------------------------------------------- WM-RPT-07 COD tài xế
def rpt_07():
    drows = [
        [col(a("Trần Minh Lái", "WM-DRV-06", "Mở COD tài xế đang giữ", 13, 600), subtle("DRV-A-002 · 0900 000 002", 12), gap=0),
         num(money(7_500_000)), num(money(2_000_000), color=T["success"]), num(money(5_500_000), 14, 700, T["warning"]),
         badge("Giữ 4 ngày", "danger", "alarm-clock"), badge("Quá ngưỡng 5 triệu", "warning"),
         btn("Tạo phiếu thu COD", "secondary", "receipt", size="sm", to="WM-PAY-03", trigger="Tạo phiếu thu COD")],
        [col(a("Nguyễn Văn Tài", "WM-DRV-06", "Mở COD tài xế đang giữ", 13, 600), subtle("DRV-A-001 · COD dự kiến DH-202609-0001", 12), gap=0),
         num(money(0)), num(money(0)), num(money(0), color=T["text-muted"]), muted("—"), muted("Chưa đến điểm trả"), ""],
        [col(a("Lê Hoàng Phúc", "WM-DRV-06", "Mở COD tài xế đang giữ", 13, 600), subtle("DRV-A-004", 12), gap=0),
         num(money(3_200_000)), num(money(3_200_000), color=T["success"]), num(money(0), color=T["text-muted"]), muted("—"), badge("Đã nộp đủ", "success"), ""],
    ]
    by_drv = panel("Theo tài xế", table([("Tài xế", "left"), ("COD đã thu", "right"), ("Đã nộp", "right"), ("Đang giữ", "right"), ("Tuổi giữ", "left"),
                                         ("Cảnh báo", "left"), ("", "right")], drows,
                                        total_row=["3 tài xế", money(10_700_000), money(5_200_000), money(5_500_000), "", "", ""]), body_pad=False)
    orows = [
        [code("DH-202609-0006", to="WM-ORD-02", trigger="Mở đơn"), text("Trần Minh Lái", 13), num("19/09/2026 16:40"), num(money(7_500_000)),
         col(code("PT-202609-0003", to="WM-PAY-02", trigger="Mở phiếu thu COD"), subtle("21/09 · 2.000.000 đ", 11), gap=0),
         num(money(5_500_000), weight=700, color=T["warning"]), badge("4 ngày", "danger")],
        [code("DH-202609-0008", to="WM-ORD-02", trigger="Mở đơn"), text("Lê Hoàng Phúc", 13), num("21/09/2026 11:20"), num(money(3_200_000)),
         col(code("PT-202609-0006", to="WM-PAY-02", trigger="Mở phiếu thu COD"), subtle("22/09 · 3.200.000 đ", 11), gap=0), num(money(0), color=T["text-muted"]), badge("Đã nộp", "success")],
    ]
    by_order = panel("Theo đơn", table([("Đơn", "left"), ("Tài xế", "left"), ("Thu lúc", "left"), ("COD thực thu", "right"), ("Phiếu thu COD", "left"),
                                        ("Còn giữ", "right"), ("Tuổi", "left")], orows, compact=True), body_pad=False)
    parts = [("0–2 ngày", 0, "chart-1"), ("3–7 ngày", 5_500_000, "chart-2"), ("> 7 ngày", 0, "chart-3")]
    aging = panel("Tuổi COD đang giữ", col(_stack_bar(parts, 5_500_000),
                                           row(*[row(f'<span style="width: 10px; height: 10px; border-radius: 2px; background: {T[tok]};"></span>', muted(l, 12),
                                                     text(money(v), 13, 600, extra=NUM), gap=6) for l, v, tok in parts], gap=28), gap=10),
                  sub="Ngưỡng cảnh báo: 5.000.000 đ hoặc 2 ngày")
    body = col(
        banner("COD tài xế nộp về là <b>thu hồi phải thu từ tài xế</b>, không phải doanh thu. Doanh thu đã ghi nhận trên đơn.", "info"),
        grid([kpi("COD đã thu trong kỳ", money(10_700_000), "2 đơn", None, "cod"),
              kpi("Đã nộp", money(5_200_000), "2 phiếu thu COD", "success", "receipt"),
              kpi("Đang giữ", money(5_500_000), "1 tài xế", "warning", "hand-coins", to="WM-COD-01", trigger="KPI Đang giữ → COD tài xế đang giữ"),
              kpi("Quá ngưỡng", "1", "Trần Minh Lái · 4 ngày", "danger", "alarm-clock")], 4, 16),
        aging, by_drv, by_order, gap=16)
    return rpt_frame("COD tài xế", "COD đã thu, đã nộp và đang giữ theo tài xế, đơn và tuổi giữ", body, 1100,
                     selects=["Tài xế: Tất cả"], search="Tìm tài xế, mã đơn…",
                     actions=btn("COD đang giữ", "secondary", "hand-coins", to="WM-COD-01", trigger="Mở COD tài xế đang giữ"))


# ---------------------------------------------------------------- WM-RPT-08 Báo cáo bảng lương
def rpt_08():
    prow = lambda c, per, stt, n, s, b, ad, de, net, paid: [
        code(c, to="WM-PAYROLL-02", trigger="Mở chi tiết bảng lương"), text(per, 13, 500), status(stt, "fin"), num(str(n)), num(money(s)),
        num(money(b, sign=True)), num(_neg(ad)), num(_neg(de)), num(money(net), weight=700), paid]
    periods = panel("Theo kỳ lương", table([("Mã bảng lương", "left"), ("Kỳ", "left"), ("Trạng thái", "left"), ("Tài xế", "right"), ("Lương cố định", "right"),
                                            ("Thưởng", "right"), ("Ứng", "right"), ("Giảm trừ", "right"), ("Thực lãnh", "right"), ("Ngày trả", "left")], [
        prow("BL-202609-0001", "Tháng 09/2026", "Chờ duyệt", 3, 31_500_000, 4_300_000, 2_000_000, 500_000, 33_300_000, muted("—")),
        prow("BL-202608-0002", "08/2026 · bổ sung", "Đã duyệt", 1, 0, 900_000, 0, 0, 900_000, badge("Chưa trả", "warning")),
        prow("BL-202608-0001", "Tháng 08/2026", "Đã trả", 3, 31_500_000, 2_850_000, 1_500_000, 1_000_000, 31_850_000, num("05/09/2026")),
    ], compact=True), body_pad=False)
    names = [l[0] for l in LINES]
    chart = panel("Cấu thành lương theo tài xế · kỳ 09/2026", bar_chart(names, [
        ("Lương cố định", [l[2] / 1e6 for l in LINES], "chart-1"), ("Thưởng", [l[3] / 1e6 for l in LINES], "chart-2"),
        ("Ứng", [l[4] / 1e6 for l in LINES], "chart-3"), ("Giảm trừ", [l[5] / 1e6 for l in LINES], "chart-4")], 1080, 220, fmt=lambda v: f"{v:.1f}".replace(".", ",")),
        )
    drows = [[col(a(n, "WM-DRV-02", "Mở tài xế", 13, 600), subtle(did, 12), gap=0), num(money(s)), num(money(b, sign=True)), num(_neg(ad)), num(_neg(de)),
              num(money(net), weight=700), a("Phiếu lương", "WM-SHELL-05", "Xuất phiếu lương tài xế")]
             for n, did, s, b, ad, de, net, _t, _x in LINES]
    drv = panel("Theo tài xế · kỳ 09/2026", table([("Tài xế", "left"), ("Lương CĐ", "right"), ("Thưởng", "right"), ("Ứng", "right"), ("Giảm trừ", "right"),
                                                   ("Thực lãnh", "right"), ("", "right")], drows, compact=True,
                                                  total_row=["Tổng", money(TOT["salary"]), money(TOT["bonus"], sign=True), _neg(TOT["adv"]), _neg(TOT["ded"]), money(TOT["net"]), ""]),
                a("Mở BL-202609-0001", "WM-PAYROLL-02", "Mở bảng lương kỳ 09"), body_pad=False)
    body = col(
        grid([kpi("Thực lãnh kỳ 09/2026", money(33_300_000), "Chờ duyệt · 3 tài xế", "warning", "payroll"),
              kpi("Đã chi lương 2026", money(31_850_000), "1 kỳ đã trả", "success", "banknote"),
              kpi("Đã duyệt chưa trả", money(900_000), "BL-202608-0002", None, "clock"),
              kpi("Thưởng theo đơn kỳ 09", money(4_300_000), "+50,9% so với kỳ 08", None, "trending-up")], 4, 16),
        periods,
        drv, chart,
        subtle("Số liệu lấy từ snapshot của từng bảng lương; bảng lương Nháp không tính vào tổng đã chi.", 12),
        gap=16)
    return rpt_frame("Báo cáo bảng lương", "Thực lãnh, thưởng, ứng lương và giảm trừ theo kỳ và theo tài xế", body, 1320,
                     selects=["Kỳ lương: 2026", "Trạng thái: Tất cả", "Tài xế: Tất cả"], search="Tìm mã bảng lương, tài xế…",
                     actions=btn("Xuất phiếu lương", "secondary", "printer", to="WM-SHELL-05", trigger="Xuất phiếu lương hàng loạt"))


# ================================================================ register
P = dict(platform="wm", module="Lương", roles=ROLES_ALL)
R = dict(platform="wm", module="Báo cáo", roles=ROLES_ALL)
RPT_STATES = {"loading": "Skeleton KPI + chart + bảng", "empty": "EmptyState 'Không có dữ liệu trong khoảng thời gian đã chọn' + đổi khoảng thời gian",
              "error": "Banner danger 'Không tải được báo cáo' + Thử lại"}
RPT_NOTES = ["Filter (date range, khách/xe/tài xế) lưu vào query string để chia sẻ link.",
             "Breadcrumb quay về /reports. Xuất Excel mở WM-SHELL-05 với cùng filter.",
             "Report query dùng chung công thức với màn nghiệp vụ (order finance, driver ledger) — không có công thức riêng."]
CHART_NOTE = "Chart: tối đa 4 series, màu chart-1..chart-4 theo thứ tự cố định; luôn có bảng dữ liệu đi kèm; tooltip hiển thị số tiền đầy đủ."

register(
    Screen(id="WM-PAYROLL-01", name="Danh sách bảng lương", route="/payroll", render=payroll_01, pattern="list", **P,
           purpose="Danh sách bảng lương theo kỳ và trạng thái; điểm vào tạo bảng lương và duyệt.",
           api=["payrolls(filter{period, status, createdBy}, first, after)"],
           data=["code", "period{from, to, label}", "status (DRAFT|SUBMITTED|APPROVED|PAID|RETURNED)", "driverCount", "totalNet", "createdBy/createdAt",
                 "approvedBy/approvedAt", "paidAt/paidBy"],
           actions=[("Tạo bảng lương", "payroll.generate (admin, operation)"), ("Xuất Excel", "payroll.export (admin, accountant)"),
                    ("Xem và duyệt", "payroll.approve (admin)")],
           states={"loading": "DataTable skeleton rows", "empty": "EmptyState 'Chưa có bảng lương' + nút 'Tạo bảng lương kỳ này' (ẩn với kế toán)",
                   "error": "Banner danger 'Không tải được bảng lương' + Thử lại"},
           notes=["Chip trạng thái map filter.status. Kỳ lương hiển thị theo cài đặt merchant (WM-SET-01), không hard-code tháng.",
                  "Banner chờ duyệt chỉ hiện với admin; operation thấy 'Đang chờ duyệt'.", "Tiền căn phải, tabular-nums."]),
    Screen(id="WM-PAYROLL-02", name="Chi tiết bảng lương", route="/payroll/:payrollId", render=payroll_02, pattern="detail", h=1180, **P,
           purpose="Kiểm tra từng dòng lương tài xế (snapshot), cảnh báo dữ liệu; gửi duyệt, duyệt, trả về, đánh dấu đã trả, xuất.",
           api=["payroll(id){lines{driver, baseSalary, bonusTotal, advanceTotal, deductionTotal, net, anomalies[]}}", "submitPayroll(id)",
                "returnPayroll(id, reason)", "markPayrollPaid(id)", "activityTimeline(entity: PAYROLL)"],
           data=["code", "status", "period", "createdBy", "submittedAt", "approver", "totals{salary, bonus, advance, deduction, net}", "lines[]",
                 "anomalies[] (COD giữ, chuyến đang chạy, tài xế ngừng hoạt động)"],
           actions=[("Gửi duyệt", "payroll.submit (admin, operation) — chỉ khi Nháp"), ("Duyệt", "payroll.approve (admin) → WM-PAYROLL-05"),
                    ("Trả về / Hủy duyệt", "payroll.return (admin) — sensitive, lý do bắt buộc"),
                    ("Đánh dấu đã trả", "payroll.markPaid (admin, accountant) — chỉ khi Đã duyệt"), ("Xuất", "payroll.export (admin, accountant)")],
           states={"loading": "Skeleton header + strip + bảng", "error": "Không tìm thấy / không có quyền → EmptyState + quay lại danh sách",
                   "draft": "Nháp: hiện 'Gửi duyệt' primary; dòng lương cho thêm giảm trừ",
                   "approved": "Đã duyệt: 'Đánh dấu đã trả' primary; 'Hủy duyệt' trong menu (sensitive)"},
           notes=["Primary action đổi theo trạng thái: Nháp→Gửi duyệt; Chờ duyệt→Duyệt (admin); Đã duyệt→Đánh dấu đã trả.",
                  "Giá trị là snapshot lúc tạo; đổi lương tài xế sau đó không làm thay đổi bảng lương.",
                  "Cảnh báo dữ liệu là WarningPanel, không chặn duyệt. COD tài xế giữ không trừ vào lương."]),
    Screen(id="WM-PAYROLL-03", name="Tạo bảng lương", route="/payroll/new", render=payroll_03, pattern="form", h=1300, **P,
           purpose="Chọn kỳ và tài xế, xem trước dữ liệu gốc (lịch sử lương, thưởng chuyến, ứng lương, giảm trừ) rồi tạo bảng lương nháp.",
           api=["merchantSettings{payrollPeriod}", "drivers(filter{status})", "payrollPreview(input{period, driverIds})", "generatePayroll(input)"],
           data=["period{label, from, to}", "driverIds[]", "preview.lines[{driver, baseSalary, effectiveFrom, bonuses[], advances[], deductions[], netEstimate}]",
                 "warnings[]"],
           actions=[("Tạo bảng lương nháp", "payroll.generate (admin, operation)"), ("Hủy", "—")],
           states={"validation": "Kỳ đã có bảng lương cho tài xế → lỗi inline dưới field Kỳ lương",
                   "empty": "Không có tài xế hoạt động → EmptyState + link Tài xế", "loading": "Preview skeleton khi đổi kỳ/tài xế"},
           notes=["Kỳ lương lấy từ WM-SET-01 (tháng dương lịch, 5→5…).", "Tạm ứng chuyến và chi phí tài xế chi trước không vào bảng lương.",
                  "Sau tạo → /payroll/:payrollId (Nháp)."]),
    Screen(id="WM-PAYROLL-04", name="Chi tiết dòng lương tài xế", route="/payroll/:payrollId/lines/:lineId", render=payroll_04, pattern="detail", h=1240, **P,
           purpose="Các khoản cấu thành lương của một tài xế, drilldown chuyến/đơn/phiếu chi; thêm giảm trừ có lý do; in phiếu lương.",
           api=["payrollLine(id){items[{type, description, sourceRef, date, amount}]}", "addPayrollDeduction(lineId, input{reasonId, amount, refId, note})",
                "driverLedger(driverId)"],
           data=["driver", "baseSalarySnapshot", "items[] (BASE|BONUS|ADVANCE|DEDUCTION)", "net", "excluded[] (chi phí chi trước, tạm ứng chuyến)", "disputes[]"],
           actions=[("Thêm giảm trừ", "payroll.line.update (admin, operation) — chỉ khi Nháp; lý do bắt buộc"),
                    ("In phiếu lương", "payroll.export (admin, accountant)")],
           states={"readonly": "Chờ duyệt/Đã duyệt/Đã trả: form giảm trừ disabled + banner giải thích",
                   "loading": "Skeleton"},
           notes=["Mỗi khoản thưởng link chuyến (WM-TRIP-01) và đơn (WM-ORD-02); ứng lương link phiếu chi (WM-EXP-02).",
                  "Giảm trừ dùng danh mục lý do (WM-CAT-01), ghi Timeline."]),
    Screen(id="WM-PAYROLL-05", name="Duyệt bảng lương", route="/payroll/:payrollId/approve", render=payroll_05, pattern="dialog", h=1180,
           overlay_of="WM-PAYROLL-02", platform="wm", module="Lương", roles=["admin"],
           purpose="Giám đốc/Admin xem tóm tắt tổng tiền và thay đổi so với kỳ trước, rồi duyệt (ghi chú tùy chọn) hoặc trả về (lý do bắt buộc).",
           api=["payroll(id){totals, previousTotals, changes[]}", "approvePayroll(id, reason?)", "returnPayroll(id, reason)"],
           data=["totals vs previous period", "changes[] (giảm trừ, lương cố định thay đổi, cảnh báo)", "approver", "note/reason"],
           actions=[("Duyệt bảng lương", "payroll.approve (admin) — ghi chú tùy chọn"), ("Trả về", "payroll.return (admin) — lý do bắt buộc")],
           states={"validation": "Trả về khi chưa nhập lý do → lỗi inline 'Nhập lý do trả về'"},
           notes=["Duyệt trên App Merchant (MA-PAYROLL-01) ghi audit giống web.", "Sau duyệt: status Đã duyệt, thông báo kế toán."]),

    Screen(id="WM-RPT-01", name="Trung tâm báo cáo", route="/reports", render=rpt_01, pattern="dashboard", h=1060, **R,
           purpose="Danh sách báo cáo theo nhóm Vận hành / Tài chính / Lương, kèm số tóm tắt theo khoảng thời gian.",
           api=["reportSummary(filter{dateRange})"], data=["group", "report", "headlineMetric"],
           actions=[("Mở báo cáo", "report.view")], states=RPT_STATES, notes=["Thẻ báo cáo ẩn theo quyền (kế toán không thấy báo cáo lương nếu không được cấp)."]),
    Screen(id="WM-RPT-02", name="Doanh thu - chi phí - lãi/lỗ", route="/reports/profit", render=rpt_02, pattern="report", h=1420, **R,
           purpose="Doanh thu (giá cước + dịch vụ thêm), chi phí, lãi/lỗ theo thời gian; lọc theo khách/xe/tài xế.",
           api=["reportProfit(filter{dateRange, groupBy, customerId, vehicleId, driverId})"],
           data=["period", "freight", "addons", "revenue", "tripCost", "outsourcedCost", "profit", "margin", "byCustomer[]"],
           actions=[("Xuất Excel", "report.export"), ("Mở khách hàng", "customer.view")], states=RPT_STATES, notes=RPT_NOTES + [CHART_NOTE]),
    Screen(id="WM-RPT-03", name="Lãi/lỗ theo đơn", route="/reports/profit?view=orders", render=rpt_03, pattern="report", h=1000, **R,
           purpose="Lãi/lỗ từng đơn: doanh thu, chi phí chuyến/đơn, thuê ngoài; mở chi tiết đơn.",
           api=["reportProfit(filter{dateRange, groupBy: ORDER, customerId, status})"],
           data=["orderCode", "customer", "route", "status", "revenue", "tripOrderCost", "outsourcedCost", "profit", "margin", "isProvisional"],
           actions=[("Xuất Excel", "report.export"), ("Mở đơn", "order.view")], states=RPT_STATES,
           notes=RPT_NOTES + ["Số lãi/lỗ phải bằng tab Tài chính đơn (WM-ORD-07). Tạm ứng chuyến chỉ tính khi đã đối soát."]),
    Screen(id="WM-RPT-04", name="Hiệu suất xe", route="/reports/vehicles", render=rpt_04, pattern="report", h=1180, **R,
           purpose="So sánh xe: số chuyến, ngày chạy/tỷ lệ sử dụng, doanh thu liên quan, chi phí xe và chuyến.",
           api=["reportVehicles(filter{dateRange, vehicleType, status})"],
           data=["plate", "type", "status", "tripCount", "activeDays", "utilization", "revenue", "vehicleCost", "tripCost", "grossProfit"],
           actions=[("Xuất Excel", "report.export"), ("Mở xe", "vehicle.view")], states=RPT_STATES, notes=RPT_NOTES + [CHART_NOTE]),
    Screen(id="WM-RPT-05", name="Hiệu suất tài xế", route="/reports/drivers", render=rpt_05, pattern="report", h=1000, **R,
           purpose="So sánh tài xế: chuyến hoàn thành, đúng giờ, thưởng theo đơn, COD đang giữ, sự cố.",
           api=["reportDrivers(filter{dateRange, status, vehicleId})"],
           data=["driver", "status", "completedTrips", "onTimeRate", "revenue", "bonusTotal", "codHeld", "incidents"],
           actions=[("Xuất Excel", "report.export"), ("Mở tài xế", "driver.view")], states=RPT_STATES, notes=RPT_NOTES + [CHART_NOTE]),
    Screen(id="WM-RPT-06", name="Công nợ khách", route="/reports/customer-debt", render=rpt_06, pattern="report", h=960, **R,
           purpose="Tuổi nợ theo khách (0–15 / 16–30 / 31–60 / >60 ngày), quá hạn, hạn mức, số dư có; tạo bảng kê.",
           api=["reportCustomerDebt(filter{dateRange, customerId, overdueOnly})"],
           data=["customer", "creditLimit", "totalDebt", "aging{d0_15, d16_30, d31_60, d60p}", "overdue", "creditBalance", "warnings[]"],
           actions=[("Tạo bảng kê", "debtStatement.create (admin, accountant)"), ("Xuất Excel", "report.export")], states=RPT_STATES,
           notes=RPT_NOTES + ["Tuổi nợ tính từ ngày hoàn thành đơn; quá hạn theo hạn thanh toán từng đơn.", CHART_NOTE]),
    Screen(id="WM-RPT-07", name="COD tài xế", route="/reports/cod", render=rpt_07, pattern="report", h=1100, **R,
           purpose="COD đã thu, đã nộp, đang giữ theo tài xế/đơn/tuổi giữ; tạo phiếu thu COD.",
           api=["reportCodHeld(filter{dateRange, driverId})"],
           data=["driver", "codCollected", "codRemitted", "codHeld", "heldDays", "orders[]", "remittancePayments[]"],
           actions=[("Tạo phiếu thu COD", "payment.create (admin, accountant) — loại Tài xế nộp COD"), ("Xuất Excel", "report.export")],
           states=RPT_STATES, notes=RPT_NOTES + ["Số đang giữ phải bằng sổ công nợ tài xế. Phiếu thu COD không phải doanh thu."]),
    Screen(id="WM-RPT-08", name="Báo cáo bảng lương", route="/reports/payroll", render=rpt_08, pattern="report", h=1320, **R,
           purpose="Thực lãnh, thưởng, ứng, giảm trừ theo kỳ và theo tài xế; xuất bảng lương/phiếu lương.",
           api=["reportPayroll(filter{year, status, driverId})"],
           data=["payrollCode", "period", "status", "driverCount", "salary", "bonus", "advance", "deduction", "net", "paidAt", "byDriver[]"],
           actions=[("Xuất Excel", "payroll.export (admin, accountant)"), ("Xuất phiếu lương", "payroll.export (admin, accountant)")],
           states=RPT_STATES, notes=RPT_NOTES + [CHART_NOTE]),
)
