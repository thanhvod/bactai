"""Web Merchant — Cài đặt (WM-ORG-01, WM-USER-01..03, WM-RBAC-01, WM-SET-01, WM-SET-02, WM-CAT-01)."""
from .. import data as D
from ..core import Screen, register
from ..shells import wm_shell
from ..ui import *  # noqa: F401,F403

ADMIN_ONLY = ["admin"]
SETTINGS_CRUMB = ("Cài đặt", "WM-ORG-01")

# Seed users + one locked account (extra) so the lock/unlock state is visible.
USERS = D.USERS + [{"name": "Vũ Thị Bích", "email": "bich.vu@bta-demo.test", "role": "Kế toán", "status": "Đã khóa", "joined": "05/08/2026", "extra": True}]
USER_META = {  # last login, invited by
    "admin@bta-demo.test": ("23/09/2026 08:02", "Tạo nhà xe"),
    "operation@bta-demo.test": ("23/09/2026 10:44", "Trần Hải"),
    "accountant@bta-demo.test": ("22/09/2026 17:31", "Trần Hải"),
    "huy.do@bta-demo.test": ("Chưa đăng nhập", "Trần Hải"),
    "bich.vu@bta-demo.test": ("02/09/2026 16:20", "Trần Hải"),
}
ROLE_TONE = {"Admin": "primary", "Operation": "info", "Kế toán": "accent"}
USER_STATUS_TONE = {"Hoạt động": "success", "Chờ chấp nhận": "warning", "Đã khóa": "danger"}
ROLE_DESC = {
    "Admin": "Chủ nhà xe/giám đốc. Toàn quyền merchant: cài đặt, nhân viên, duyệt bảng lương, thao tác nhạy cảm.",
    "Operation": "Vận hành: tạo đơn, điều phối xe/tài xế, cập nhật trạng thái, sự cố, tạo nháp bảng lương.",
    "Kế toán": "Thu chi, phân bổ thanh toán, công nợ, bảng kê, COD tài xế nộp, xuất/đánh dấu trả lương.",
}


def _initials(name):
    parts = name.split()
    return (parts[-2][0] + parts[-1][0]).upper() if len(parts) > 1 else parts[0][:2].upper()


def _num_section(n, title, body, right="", sub=None):
    head = row(f'<span style="display: inline-flex; width: 22px; height: 22px; border-radius: 50%; background: {T["primary-soft"]}; '
               f'color: {T["primary"]}; font-size: 12px; font-weight: 700; align-items: center; justify-content: center; flex-shrink: 0;">{n}</span>',
               col(h("sm", title), muted(sub, 12) if sub else "", gap=0), spacer(), right, gap=8)
    return col(head, body, gap=12)


def _logo_preview(size=88):
    return (f'<div role="img" aria-label="Logo nhà xe" style="width: {size}px; height: {size}px; border-radius: 8px; border: 1px solid {T["border"]}; '
            f'background: {T["surface-muted"]}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">{logo(False, int(size * 0.55))}</div>')


# ---------------------------------------------------------------- WM-ORG-01 Hồ sơ nhà xe
def org_01():
    company = panel("Thông tin doanh nghiệp", col(
        row(field("Tên nhà xe (hiển thị)", input_("BTA Demo Transport"), True, width="50%"),
            field("Mã merchant", input_("M-DEMO-A", disabled=True, mono=True), hint="Hệ thống cấp, không sửa được", width="25%"),
            field("Mã số thuế", input_("0316 789 245", mono=True), width="25%"), gap=12, align="flex-start"),
        row(field("Tên pháp lý (in trên chứng từ)", input_("Công ty TNHH Vận tải BTA Demo"), width="50%"),
            field("Loại hình", select("Vận tải hàng hóa đường bộ"), width="50%"), gap=12), gap=14))
    address = panel("Địa chỉ trụ sở", col(
        field("Địa chỉ", input_("Số 48 Quốc lộ 1A, phường Bình Hưng Hòa B"), True),
        row(field("Tỉnh/thành phố", select("TP. Hồ Chí Minh"), True, width="34%"),
            field("Quận/huyện", select("Quận Bình Tân"), width="33%"),
            field("Bãi xe chính", input_("Bãi xe An Lạc, Bình Tân"), width="33%"), gap=12), gap=14))
    contact = panel("Liên hệ", col(
        row(field("Người đại diện", input_("Trần Hải"), True, width="50%"),
            field("Chức vụ", input_("Giám đốc"), width="50%"), gap=12),
        row(field("Số điện thoại", input_("0283 7654 321", mono=True), True, width="34%"),
            field("Hotline điều phối", input_("0909 123 456", mono=True), hint="In trên phiếu giao hàng, phiếu điều xe", width="33%"),
            field("Email", input_("lienhe@bta-demo.test"), width="33%"), gap=12, align="flex-start"), gap=14))
    logo_p = panel("Logo", col(
        row(_logo_preview(), col(text("logo-bta-demo.png", 13, 500), subtle("256 × 256 px · 18 KB · cập nhật 01/08/2026", 12),
                                 row(btn("Đổi logo", "secondary", "upload", size="sm"), btn("Xóa", "ghost", "trash-2", size="sm"), gap=6), gap=4), gap=14),
        upload_zone("Kéo thả logo mới vào đây hoặc", 88).replace("JPG, PNG, PDF · tối đa 10 MB", "PNG, JPG · tối đa 2 MB"),
        subtle("PNG hoặc JPG, nền trong suốt nếu có, tối thiểu 200 × 200 px. Logo in trên phiếu giao hàng, bảng kê, bảng lương.", 12), gap=12))
    doc_preview = panel("Hiển thị trên chứng từ", col(
        f'<div style="padding: 12px; border: 1px solid {T["border"]}; border-radius: 6px; background: {T["surface"]};">'
        + row(logo(False, 30), col(text("CÔNG TY TNHH VẬN TẢI BTA DEMO", 12, 700), subtle("Số 48 QL1A, P. Bình Hưng Hòa B, Q. Bình Tân, TP.HCM", 11),
                                  subtle("MST 0316 789 245 · Hotline 0909 123 456", 11), gap=0), gap=10, align="flex-start") + '</div>',
        a("Xem mẫu in", "WM-SHELL-05", "Mở preview mẫu in"), gap=10), sub="Tiêu đề phiếu giao hàng, bảng kê công nợ")
    history = panel("Lịch sử thay đổi", timeline([
        ("20/09/2026 09:15", "Trần Hải", "Sửa hotline điều phối <b>0909 000 111 → 0909 123 456</b>", None, "accent"),
        ("01/08/2026 08:30", "Trần Hải", "Tạo nhà xe <b>BTA Demo Transport</b>", None, "primary")]),
        a("Xem tất cả", "WM-SHELL-07", "Mở Timeline hồ sơ nhà xe"))
    left = col(company, address, contact, gap=16, extra="flex: 2; min-width: 0;")
    right = col(logo_p, doc_preview, history, gap=16, extra="flex: 1; min-width: 0;")
    content = col(
        page_header("Hồ sơ nhà xe", "Thông tin doanh nghiệp dùng trên chứng từ, phiếu in và hồ sơ gửi khách",
                    row(btn("Hủy", "secondary"), btn("Lưu thay đổi", "primary", "check"), gap=8),
                    crumbs=[SETTINGS_CRUMB, ("Hồ sơ nhà xe", None)]),
        row(left, right, gap=16, align="flex-start"), gap=16)
    return wm_shell("settings", content, h=1020, child="WM-ORG-01")


# ---------------------------------------------------------------- WM-USER-01 Danh sách nhân viên
def _user_rows(selected_email=None):
    rows = []
    for u in USERS:
        last, inviter = USER_META[u["email"]]
        me = u["email"] == "admin@bta-demo.test"
        name_cell = row(avatar(_initials(u["name"]), 32, ROLE_TONE[u["role"]]),
                        col(row(a(u["name"], "WM-USER-02", "Click tên nhân viên → chi tiết", 13, 600), badge("Bạn", "neutral") if me else "", gap=6),
                            muted(u["email"], 12), gap=0), gap=10)
        st_ = u["status"]
        if me:
            act = subtle("Không tự khóa", 12)
        elif st_ == "Chờ chấp nhận":
            act = row(btn("Gửi lại lời mời", "ghost", "send", size="sm"), gap=4)
        elif st_ == "Đã khóa":
            act = btn("Mở khóa", "ghost", "lock-open", size="sm")
        else:
            act = btn("Khóa", "ghost", "lock", size="sm")
        rows.append([name_cell, badge(u["role"], ROLE_TONE[u["role"]]),
                     badge(st_, USER_STATUS_TONE[st_], "lock" if st_ == "Đã khóa" else None),
                     num(last) if last[0].isdigit() else muted(last),
                     col(num(u["joined"]), subtle(f"Mời bởi: {inviter}", 12), gap=0),
                     row(act, row_menu(), gap=4, justify="flex-end")])
    return rows


def _user_list_content():
    cols = [("Nhân viên", "left"), ("Vai trò", "left"), ("Trạng thái", "left"), ("Đăng nhập gần nhất", "left"),
            ("Ngày tham gia", "left"), ("", "right", "200px")]
    strip = summary_strip([("Tổng nhân viên", "5"), ("Hoạt động", "3", "success"), ("Chờ chấp nhận lời mời", "1", "warning"),
                           ("Đã khóa", "1", "danger"), ("Admin", "1")])
    return col(
        page_header("Nhân viên", "Người dùng Web Merchant của BTA Demo Transport. Tài xế quản lý riêng ở mục Tài xế.",
                    row(btn("Vai trò & quyền", "secondary", "shield-check", to="WM-RBAC-01", trigger="Mở ma trận vai trò"),
                        btn("Mời nhân viên", "primary", "user-plus", to="WM-USER-03", trigger="Mời nhân viên"), gap=8),
                    crumbs=[SETTINGS_CRUMB, ("Nhân viên", None)]),
        strip,
        filter_bar("Tìm tên, email…", ["Tất cả", "Hoạt động", "Chờ chấp nhận", "Đã khóa"], selects=["Vai trò: Tất cả"]),
        table(cols, _user_rows(), footer=pagination("1–5", 5)),
        row(icon("info", 16, T["text-muted"]), muted("Nhân viên đăng nhập bằng tài khoản Google đúng email được mời. Khóa tài khoản sẽ chặn truy cập ngay, dữ liệu và lịch sử vẫn giữ nguyên.", 13), gap=8),
        gap=16)


def user_01():
    return wm_shell("settings", _user_list_content(), child="WM-USER-01")


# ---------------------------------------------------------------- WM-USER-02 Chi tiết nhân viên
EXTRA_PERMS_OP = [  # (label, granted, needs_reason)
    ("Hủy đơn", True, True),
    ("Override cảnh báo trùng lịch", True, True),
    ("Sửa giá đơn đã xác nhận", False, True),
    ("Sửa đơn hoàn thành", False, True),
    ("Đổi trạng thái hoàn thành ngược", False, True),
    ("Xem tài chính", True, False),
    ("Tạo phiếu thu", False, False),
    ("Sửa/hủy phiếu chi", False, True),
]


def user_02():
    u = D.USERS[1]  # Lê Thu Vân · Operation
    head = row(
        row(avatar("TV", 48, "info"),
            col(row(h("display", u["name"]), badge("Operation", "info"), badge("Hoạt động", "success"), gap=10),
                row(muted(u["email"], 14), muted("·"), muted("Đăng nhập Google", 14), gap=8), gap=2), gap=14),
        spacer(),
        row(btn("Timeline", "secondary", "history", to="WM-SHELL-07", trigger="Mở Timeline nhân viên"),
            btn("Khóa tài khoản", "danger-outline", "lock"),
            btn("Lưu thay đổi", "primary", "check"), gap=8), align="center")
    strip = summary_strip([("Vai trò", "Operation"), ("Quyền cấp thêm", "3 / 8", "warning"), ("Ngày tham gia", "03/08/2026"),
                           ("Đăng nhập gần nhất", "23/09/2026 10:44"), ("Merchant truy cập", "1")])
    profile = panel("Hồ sơ", col(
        row(field("Họ tên", input_(u["name"]), True, width="50%"), field("Email Google", input_(u["email"], disabled=True), hint="Đổi email = mời lại tài khoản mới", width="50%"), gap=12, align="flex-start"),
        row(field("Số điện thoại", input_("0908 765 432", mono=True), width="50%"), field("Chức danh", input_("Điều phối viên"), width="50%"), gap=12), gap=12))

    def role_opt(name, on):
        return (f'<div style="flex: 1; padding: 10px 12px; border-radius: 6px; border: 1px solid {T["primary"] if on else T["border-control"]}; '
                f'background: {T["primary-soft"] if on else T["surface"]};">{radio(name, on)}</div>')
    perms = []
    for lab, granted, reason in EXTRA_PERMS_OP:
        perms.append(row(checkbox(lab, granted), badge("Cần lý do", "warning", "pencil") if reason else "", gap=8))
    role_p = panel("Vai trò & quyền", col(
        row(role_opt("Admin", False), role_opt("Operation", True), role_opt("Kế toán", False), gap=8, align="stretch"),
        muted(ROLE_DESC["Operation"], 13),
        divider(),
        row(text("Quyền cấp thêm", 14, 600), muted("Các quyền đánh dấu “Cần cấp thêm” của vai trò Operation", 12), gap=8),
        grid(perms, 2, 10),
        subtle("Đổi vai trò hoặc cấp/thu hồi quyền được ghi vào Timeline với người thực hiện và thời điểm. Có hiệu lực từ lần tải trang kế tiếp của nhân viên.", 12),
        gap=12), a("Xem quyền của vai trò", "WM-RBAC-01", "Xem quyền của vai trò → ma trận"))
    access = panel("Merchant truy cập", table(
        [("Nhà xe", "left"), ("Vai trò", "left"), ("Trạng thái", "left"), ("Từ ngày", "left")],
        [[col(text("BTA Demo Transport", 13, 600), subtle("M-DEMO-A", 12), gap=0), badge("Operation", "info"), badge("Hoạt động", "success"), num("03/08/2026")]],
        compact=True), body_pad=False, sub="Chỉ hiển thị nhà xe bạn quản trị")
    activity = panel("Nhật ký hoạt động", timeline([
        ("23/09/2026 10:44", "Lê Thu Vân", "Đăng nhập Web Merchant", None, "neutral"),
        ("23/09/2026 09:12", "Lê Thu Vân", "Gán xe <b>51C-123.45</b> cho chuyến CX-202609-0002 — bỏ qua cảnh báo gần trùng lịch 1 giờ",
         "Khách xác nhận lùi giờ nhận hàng tại Long An", "warning"),
        ("20/09/2026 16:10", "Lê Thu Vân", "Sửa giá cước DH-202609-0001 <b>12.000.000 đ → 12.500.000 đ</b>", "Khách thêm bốc xếp", "warning"),
        ("15/09/2026 08:30", "Trần Hải", "Cấp thêm quyền <b>Hủy đơn</b>, <b>Override cảnh báo trùng lịch</b>", "Phụ trách điều phối ca sáng", "accent"),
        ("03/08/2026 09:00", "Trần Hải", "Mời với vai trò <b>Operation</b> · chấp nhận 03/08/2026", None, "primary")]),
        a("Xem tất cả", "WM-SHELL-07", "Mở Timeline đầy đủ"))
    left = col(profile, role_p, gap=16, extra="flex: 3; min-width: 0;")
    right = col(access, activity, gap=16, extra="flex: 2; min-width: 0;")
    content = col(breadcrumb([SETTINGS_CRUMB, ("Nhân viên", "WM-USER-01"), (u["name"], None)]), head, strip,
                  row(left, right, gap=16, align="flex-start"), gap=16)
    return wm_shell("settings", content, h=1060, child="WM-USER-01")


# ---------------------------------------------------------------- WM-USER-03 Mời nhân viên (drawer)
def _role_card(name, on, extra=""):
    bd = T["primary"] if on else T["border-control"]
    bg = T["primary-soft"] if on else T["surface"]
    return (f'<div style="padding: 10px 12px; border-radius: 6px; border: 1px solid {bd}; background: {bg}; display: flex; flex-direction: column; gap: 6px;">'
            f'{radio(name, on, ROLE_DESC[name])}{extra}</div>')


def user_03():
    extra_perms = col(
        subtle("Quyền cấp thêm (tùy chọn)", 12),
        row(checkbox("Hủy đơn", False), checkbox("Override cảnh báo trùng lịch", False), checkbox("Xem tài chính", False), gap=14, wrap=True),
        gap=6, extra="padding-left: 24px;")
    body = col(
        _num_section(1, "Tài khoản Google", col(
            field("Email Google", input_("huy.do@bta-demo.test", prefix_ic="mail"), True, hint="Nhân viên đăng nhập bằng Google với đúng email này. Không dùng mật khẩu."),
            row(field("Họ tên", input_("Đỗ Quang Huy"), True, width="55%"), field("Số điện thoại", input_("0912 345 678", mono=True), width="45%"), gap=12), gap=12)),
        _num_section(2, "Vai trò", col(
            _role_card("Admin", False),
            _role_card("Operation", True, extra_perms),
            _role_card("Kế toán", False), gap=8), right=a("Xem ma trận quyền", "WM-RBAC-01", "Xem ma trận quyền")),
        _num_section(3, "Ghi chú", textarea("Điều phối ca chiều, phụ trách tuyến miền Tây", h=48)),
        banner("Lời mời hiệu lực 7 ngày. Nhân viên ở trạng thái “Chờ chấp nhận” cho tới lần đăng nhập đầu tiên.", "info"),
        gap=16)
    foot = (btn("Hủy", "secondary", to="WM-USER-01", trigger="Hủy → quay lại danh sách")
            + btn("Gửi lời mời", "primary", "send", to="WM-USER-01", trigger="Gửi lời mời → danh sách (Chờ chấp nhận)"))
    dr = drawer("Mời nhân viên", body, foot, 560, "BTA Demo Transport · M-DEMO-A", close_to="WM-USER-01")
    return wm_shell("settings", _user_list_content(), child="WM-USER-01", overlay=(dr, "right"))


# ---------------------------------------------------------------- WM-RBAC-01 Vai trò & phân quyền
Y, N, X = "y", "n", "x"  # allowed, denied, needs extra grant
RBAC = [
    ("Dữ liệu nền", [
        ("Xem dashboard", Y, Y, Y, False, "Thẻ hiển thị theo vai trò"),
        ("Quản lý hồ sơ & cài đặt nhà xe", Y, N, N, False, "Ảnh hưởng toàn merchant"),
        ("Quản lý nhân viên & vai trò", Y, N, N, False, ""),
        ("Quản lý danh mục dùng chung", Y, Y, X, False, "Kế toán xem; sửa khi được cấp"),
        ("Tạo/sửa khách hàng", Y, Y, Y, False, "Kế toán cập nhật thông tin hóa đơn/liên hệ"),
        ("Ngừng hoạt động khách hàng", Y, X, N, True, "Cần lý do khi khách còn đơn"),
        ("Tạo/sửa tài xế, xe", Y, Y, N, False, ""),
        ("Quản lý lịch sử lương cố định", Y, X, N, False, ""),
        ("Tạo/reset tài khoản app tài xế", Y, Y, N, False, ""),
        ("Tạo/sửa nhà cung cấp", Y, Y, Y, False, ""),
    ]),
    ("Đơn & điều phối", [
        ("Xem đơn/chuyến", Y, Y, Y, False, ""),
        ("Tạo đơn, sửa đơn nháp", Y, Y, X, False, ""),
        ("Sửa giá đơn đã xác nhận", Y, X, N, True, ""),
        ("Hủy đơn/chuyến", Y, X, N, True, ""),
        ("Sửa đơn đã hoàn thành", Y, X, N, True, ""),
        ("Tạo/sửa điểm dừng, hàng hóa, dịch vụ thêm", Y, Y, X, False, "Cần lý do nếu đơn đã xác nhận"),
        ("Tạo chuyến, gán xe/tài xế", Y, Y, N, False, ""),
        ("Bỏ qua cảnh báo trùng lịch", Y, X, N, True, ""),
        ("Cập nhật trạng thái chuyến/điểm trên web", Y, Y, N, False, "Cần lý do khi hủy/tạm dừng"),
        ("Đổi trạng thái hoàn thành ngược", Y, X, N, True, ""),
        ("Quản lý sự cố", Y, Y, X, False, "Đóng sự cố kèm ghi chú"),
    ]),
    ("Tài chính", [
        ("Xem tài chính, sổ thu chi", Y, X, Y, False, ""),
        ("Tạo phiếu chi", Y, Y, Y, False, ""),
        ("Sửa/hủy phiếu chi", Y, X, Y, True, ""),
        ("Đánh dấu phiếu chi đã trả", Y, N, Y, False, ""),
        ("Tạo phiếu thu", Y, X, Y, False, ""),
        ("Sửa/hủy phiếu thu", Y, N, Y, True, ""),
        ("Phân bổ thanh toán vào đơn", Y, N, Y, False, ""),
        ("Tạo, chốt bảng kê công nợ", Y, N, Y, False, ""),
        ("Hủy bảng kê công nợ", Y, N, Y, True, ""),
        ("Xem công nợ nhà cung cấp", Y, X, Y, False, ""),
        ("Ghi nhận tài xế nộp COD", Y, N, Y, False, ""),
        ("Đối soát tạm ứng chuyến", Y, Y, Y, False, "Cần lý do nếu điều chỉnh"),
    ]),
    ("Lương", [
        ("Xem bảng lương", Y, Y, Y, False, ""),
        ("Tạo nháp, gửi duyệt bảng lương", Y, Y, N, False, ""),
        ("Sửa dòng lương nháp", Y, Y, N, False, "Cần lý do với giảm trừ"),
        ("Duyệt bảng lương", Y, N, N, False, "Ghi chú tùy chọn"),
        ("Trả về/hủy bảng lương đã duyệt", Y, N, N, True, ""),
        ("Đánh dấu đã trả lương, xuất bảng lương", Y, N, Y, False, ""),
    ]),
]


def _perm_cell(v, locked=False, granted=None):
    """Checkbox state for the matrix: allowed (checked), denied (empty), needs extra grant (indeterminate + badge)."""
    use("PermissionMatrix")
    if v == Y:
        c = T["text-muted"] if locked else T["primary"]
        box = (f'<span aria-label="Được phép" style="display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 4px; '
               f'background: {c}; border: 1px solid {c};">{icon("check", 12, "#FFFFFF", 3)}</span>')
        return box
    if v == N:
        return (f'<span aria-label="Không được phép" style="display: inline-flex; width: 16px; height: 16px; border-radius: 4px; box-sizing: border-box; '
                f'border: 1px solid {T["border-strong"]}; background: {T["surface-muted"]};"></span>')
    box = (f'<span aria-label="Cần cấp thêm" style="display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 4px; '
           f'box-sizing: border-box; border: 1px solid {T["warning"]}; background: {T["warning-soft"]};">'
           f'<span style="width: 8px; height: 2px; border-radius: 1px; background: {T["warning"]};"></span></span>')
    return row(box, badge("Cần cấp thêm", "warning"), subtle(granted, 12) if granted else "", gap=6, justify="center")


GRANTED = {("Hủy đơn/chuyến", 1): "1 người", ("Bỏ qua cảnh báo trùng lịch", 1): "1 người", ("Xem tài chính, sổ thu chi", 1): "1 người"}


def rbac_01():
    cols = [("Thao tác", "left"), ("Admin", "center", "130px"), ("Operation", "center", "250px"), ("Kế toán", "center", "250px"), ("Ghi chú", "left", "280px")]
    rows = []
    group_rows = []
    for gname, items in RBAC:
        group_rows.append(len(rows))
        rows.append([text(gname, 12, 700, T["text-muted"], "text-transform: uppercase; letter-spacing: 0.04em;"), "", "", "", ""])
        for lab, ad, op, ac, reason, note in items:
            rows.append([row(text(lab, 13, 500), badge("Cần lý do", "danger", "pencil") if reason else "", gap=8),
                         _perm_cell(ad, locked=True), _perm_cell(op, granted=GRANTED.get((lab, 1))), _perm_cell(ac),
                         muted(note, 12) if note else ""])
    tbl = table(cols, rows, compact=True)
    # tint the group header rows (surface-muted), like a DataTable row group
    for gi in group_rows:
        lab = rows[gi][0]
        i = tbl.index(lab)
        j = tbl.rfind('<tr style="background: ', 0, i)
        tbl = tbl[:j] + f'<tr style="background: {T["surface-muted"]};">' + tbl[tbl.index(">", j) + 1:]

    def role_card(name, count, users):
        return (f'<div style="display: flex; flex-direction: column; gap: 8px; padding: 14px 16px; background: {T["surface"]}; border: 1px solid {T["border"]}; border-radius: 8px;">'
                + row(badge(name, ROLE_TONE[name]), spacer(), a(f"{count} nhân viên", "WM-USER-01", f"Xem nhân viên vai trò {name}"), gap=8)
                + muted(ROLE_DESC[name], 13) + subtle(users, 12) + '</div>')
    cards = grid([role_card("Admin", 1, "Trần Hải"), role_card("Operation", 2, "Lê Thu Vân · Đỗ Quang Huy (chờ chấp nhận)"),
                  role_card("Kế toán", 2, "Phan Ngọc Mai · Vũ Thị Bích (đã khóa)")], 3, 16)
    legend_ = row(row(_perm_cell(Y), muted("Được phép", 13), gap=6), row(_perm_cell(N), muted("Không được phép", 13), gap=6),
                  row(_perm_cell(X), muted("chỉ khi Admin cấp cho từng nhân viên", 13), gap=6),
                  row(badge("Cần lý do", "danger", "pencil"), muted("mở hộp xác nhận, bắt buộc nhập lý do, ghi Timeline", 13), gap=6),
                  gap=20, wrap=True, extra=f"padding: 10px 12px; background: {T['surface-muted']}; border: 1px solid {T['border']}; border-radius: 8px;")
    content = col(
        page_header("Vai trò & phân quyền", "Ma trận quyền theo vai trò. Thiếu quyền thì nút bị ẩn hoặc khóa.",
                    row(btn("Xem hộp xác nhận lý do", "secondary", "pencil", to="WM-SHELL-08", trigger="Xem mẫu Sensitive action modal"),
                        btn("Cấp quyền cho nhân viên", "primary", "user-cog", to="WM-USER-02", trigger="Cấp quyền cho nhân viên → chi tiết nhân viên"), gap=8),
                    crumbs=[SETTINGS_CRUMB, ("Vai trò & phân quyền", None)]),
        cards,
        banner("Vai trò hệ thống cố định trong phase 1. Quyền “Cần cấp thêm” được bật/tắt cho từng nhân viên tại Chi tiết nhân viên.", "info",
               action=a("Danh sách nhân viên", "WM-USER-01", "Mở danh sách nhân viên")),
        legend_,
        tbl,
        gap=16)
    return wm_shell("settings", content, h=2300, child="WM-RBAC-01")


# ---------------------------------------------------------------- WM-SET-01 Cài đặt vận hành
def set_01():
    payroll = panel("Kỳ lương", col(
        radio_cards([("Theo tháng", "Ngày 01 → cuối tháng"), ("Tùy chỉnh", "Ví dụ ngày 05 → 04 tháng sau")], 0),
        row(field("Ngày bắt đầu kỳ", select("01", width="100%"), hint="Chỉ dùng khi chọn tùy chỉnh", width="50%"),
            field("Hạn tạo bảng lương", input_("3", suffix="ngày sau kỳ", align="right"), width="50%"), gap=12, align="flex-start"),
        row(muted("Kỳ hiện tại", 13), spacer(), num("01/09/2026 – 30/09/2026", 13, 600), gap=8,
            extra=f"padding: 8px 10px; background: {T['surface-muted']}; border-radius: 6px;"),
        subtle("Đổi kỳ lương áp dụng từ kỳ kế tiếp. Bảng lương đã tạo không thay đổi.", 12), gap=12),
        a("Mở bảng lương", "WM-PAYROLL-01", "Xem bảng lương"), sub="Dùng khi tạo bảng lương tài xế")
    dispatch = panel("Điều phối", col(
        row(field("Ngưỡng gần trùng lịch", input_("2", suffix="giờ", align="right"), True, hint="Hai chuyến cùng xe/tài xế cách nhau dưới 2 giờ sẽ cảnh báo", width="50%"),
            field("Thời gian dự kiến mặc định", input_("6", suffix="giờ/chuyến", align="right"), width="50%"), gap=12, align="flex-start"),
        divider(),
        switch(True, "Cảnh báo trùng lịch xe", "Áp dụng ngay"),
        switch(True, "Cảnh báo trùng lịch tài xế", "Áp dụng ngay"),
        subtle("Cảnh báo không chặn gán chuyến. Bỏ qua cảnh báo cần quyền và lý do.", 12), gap=12),
        a("Xem cảnh báo lịch", "WM-DISPATCH-03", "Mở cảnh báo lịch"), sub="Dùng ở bảng điều phối, lịch xe/tài xế")
    cod = panel("COD tài xế đang giữ", col(
        row(field("Ngưỡng số tiền", money_input(5_000_000), True, hint="Cảnh báo khi tài xế giữ từ mức này", width="50%"),
            field("Ngưỡng số ngày", input_("2", suffix="ngày", align="right"), True, hint="Cảnh báo khi giữ COD quá số ngày", width="50%"), gap=12, align="flex-start"),
        divider(),
        switch(True, "Hiện cảnh báo trên dashboard và thông báo", "Áp dụng ngay"),
        gap=12), a("Xem COD tài xế", "WM-COD-01", "Mở COD tài xế đang giữ"), sub="Cảnh báo nội bộ, không gửi cho tài xế")
    debt = panel("Công nợ khách hàng", col(
        row(field("Số ngày công nợ mặc định", input_("15", suffix="ngày", align="right"), True, hint="Gợi ý hạn thanh toán khi tạo đơn", width="50%"),
            field("Hạn mức nợ mặc định cho khách mới", money_input(None), hint="Để trống = không giới hạn", width="50%"), gap=12, align="flex-start"),
        divider(),
        switch(True, "Cảnh báo khách vượt hạn mức khi tạo đơn", "Áp dụng ngay · cảnh báo mềm, không chặn"),
        switch(True, "Cảnh báo khách có đơn quá hạn", "Áp dụng ngay"),
        gap=12), a("Xem công nợ khách", "WM-DEBT-01", "Mở công nợ khách"), sub="Khách hàng có thể đặt riêng số ngày và hạn mức")
    history = panel("Lịch sử thay đổi", timeline([
        ("18/09/2026 14:05", "Trần Hải", "Ngưỡng COD số tiền <b>3.000.000 đ → 5.000.000 đ</b>", "Tuyến miền Tây COD lớn, giảm cảnh báo nhiễu", "accent"),
        ("10/09/2026 09:20", "Trần Hải", "Bật <b>Cảnh báo khách có đơn quá hạn</b>", None, "neutral"),
        ("01/08/2026 08:30", "Hệ thống", "Khởi tạo cài đặt mặc định khi tạo nhà xe", None, "primary")]),
        a("Xem tất cả", "WM-SHELL-07", "Mở Timeline cài đặt"))
    impact = panel("Ảnh hưởng", col(
        row(icon("banknote", 16, T["text-muted"]), muted("Kỳ lương → tạo bảng lương BL-", 13), gap=8),
        row(icon("route", 16, T["text-muted"]), muted("Ngưỡng trùng lịch → điều phối, lịch xe/tài xế", 13), gap=8),
        row(icon("hand-coins", 16, T["text-muted"]), muted("Ngưỡng COD → COD tài xế, dashboard, thông báo", 13), gap=8),
        row(icon("scale", 16, T["text-muted"]), muted("Công nợ → hạn thanh toán đơn, cảnh báo khách", 13), gap=8), gap=10))
    save_bar = row(icon("circle-alert", 16, T["warning"]), text("1 thay đổi chưa lưu: ngưỡng gần trùng lịch", 13, 500), spacer(),
                   btn("Hủy thay đổi", "secondary"), btn("Lưu cài đặt", "primary", "check"), gap=10,
                   extra=f"padding: 10px 14px; background: {T['surface']}; border: 1px solid {T['border']}; border-radius: 8px;")
    left = col(grid([payroll, dispatch, cod, debt], 2, 16), save_bar, gap=16, extra="flex: 3; min-width: 0;")
    right = col(impact, history, gap=16, extra="flex: 1; min-width: 0;")
    content = col(
        page_header("Cài đặt vận hành", "Ngưỡng cảnh báo và mặc định áp dụng cho toàn nhà xe. Chỉ Admin được sửa.",
                    crumbs=[SETTINGS_CRUMB, ("Cài đặt vận hành", None)]),
        row(left, right, gap=16, align="flex-start"), gap=16)
    return wm_shell("settings", content, h=1040, child="WM-SET-01")


# ---------------------------------------------------------------- WM-SET-02 Cấu hình mã tự động
NUMBERING = [  # label, prefix, next, issued this month, used at (screen, label), edited
    ("Đơn hàng", "DH", "DH-202609-0013", 12, ("WM-ORD-01", "Đơn hàng")),
    ("Chuyến xe", "CX", "CX-202609-0007", 6, ("WM-DISPATCH-01", "Điều phối")),
    ("Phiếu thu", "PT", "PT-202609-0006", 5, ("WM-PAY-01", "Phiếu thu")),
    ("Phiếu chi", "PC", "PC-202609-0007", 6, ("WM-EXP-01", "Phiếu chi")),
    ("Bảng lương", "BL", "BL-202609-0002", 1, ("WM-PAYROLL-01", "Bảng lương")),
    ("Bảng kê công nợ", "BK", "BK-202609-0003", 2, ("WM-DEBT-03", "Bảng kê")),
]


def set_02():
    cols = [("Loại chứng từ · Dùng ở", "left"), ("Định dạng · Đếm lại", "left"),
            ("Mã tiếp theo", "left"), ("Đã cấp T9", "right"), ("", "right", "60px")]
    rows = []
    for lab, pre, nxt, cnt, (to, where) in NUMBERING:
        rows.append([col(row(badge(pre, "neutral"), text(lab, 13, 600), gap=8), a(where, to, f"Mở danh sách {where}", 12), gap=0),
                     col(num(f"{pre}-YYYYMM-0000", 13), subtle("Đếm lại theo tháng", 12), gap=0),
                     num(nxt, 13, 600), num(str(cnt)), icon_btn("pencil", f"Sửa định dạng {lab}")])
    tbl = table(cols, rows, selected=2)
    edit = panel("Sửa định dạng: Phiếu thu", col(
        row(field("Tiền tố", input_("PT", mono=True), True, hint="2–4 ký tự in hoa", width="35%"),
            field("Ký tự phân cách", select("-"), width="30%"),
            field("Phần thời gian", select("YYYYMM"), width="35%"), gap=12, align="flex-start"),
        row(field("Số chữ số", select("4"), width="35%"), field("Đếm lại", select("Mỗi tháng"), width="65%"), gap=12),
        col(muted("Xem trước", 12), row(num("PT-202609-0006", 20, 700), badge("Mã tiếp theo", "info"), gap=10),
            subtle("Tháng 10/2026 bắt đầu từ PT-202610-0001", 12), gap=4,
            extra=f"padding: 12px; background: {T['surface-muted']}; border-radius: 6px;"),
        warning_panel("Lưu ý khi đổi định dạng", ["Chỉ áp dụng cho chứng từ tạo sau khi lưu; mã đã cấp giữ nguyên.",
                                                  "Không sửa hoặc lùi số đếm đã cấp để tránh trùng mã.",
                                                  "Mã được đếm riêng cho từng nhà xe."]),
        row(spacer(), btn("Hủy", "secondary"), btn("Lưu định dạng", "primary", "check"), gap=8), gap=14),
        sub="Thay đổi ghi vào Timeline cài đặt")
    info = panel("Quy tắc", col(
        row(icon("hash", 16, T["text-muted"]), muted("Mã do hệ thống cấp khi lưu chứng từ, người dùng không nhập tay.", 13), gap=8, align="flex-start"),
        row(icon("calendar", 16, T["text-muted"]), muted("YYYYMM theo ngày tạo chứng từ, không theo ngày nghiệp vụ.", 13), gap=8, align="flex-start"),
        row(icon("shield-check", 16, T["text-muted"]), muted("Mã đã cấp không tái sử dụng kể cả khi chứng từ bị hủy.", 13), gap=8, align="flex-start"),
        gap=10))
    content = col(
        page_header("Cấu hình mã tự động", "Định dạng mã cho đơn, chuyến, phiếu thu/chi, bảng lương, bảng kê. Chỉ Admin được sửa.",
                    row(btn("Xem lịch sử", "secondary", "history", to="WM-SHELL-07", trigger="Mở Timeline cấu hình mã"), gap=8),
                    crumbs=[SETTINGS_CRUMB, ("Mã tự động", None)]),
        row(col(tbl, info, gap=16, extra="flex: 3; min-width: 0;"), col(edit, gap=16, extra="flex: 2; min-width: 0;"), gap=16, align="flex-start"),
        gap=16)
    return wm_shell("settings", content, h=960, child="WM-SET-02")


# ---------------------------------------------------------------- WM-CAT-01 Danh mục dùng chung
CAT_TYPES = [("Loại chi phí", 8, "receipt-text"), ("Dịch vụ thêm", 5, "plus"), ("Loại hàng", 7, "package"),
             ("Lý do tạm dừng", 6, "pause"), ("Lý do giảm trừ", 4, "minus"), ("Loại chứng từ", 8, "paperclip"),
             ("Loại sự cố", 7, "triangle-alert")]
EXPENSE_TYPES = [  # code, name, applies to, default, used count, active
    ("NHIEN_LIEU", "Nhiên liệu", "Xe · Chuyến", True, 42, True),
    ("CAU_DUONG", "Phí cầu đường", "Chuyến", True, 38, True),
    ("BOC_XEP", "Bốc xếp", "Đơn · Chuyến", True, 15, True),
    ("THUE_XE", "Thuê xe ngoài", "Đơn · Nhà cung cấp", True, 6, True),
    ("SUA_CHUA", "Sửa chữa, bảo dưỡng", "Xe · Nhà cung cấp", True, 9, True),
    ("LUU_CA", "Lưu ca xe", "Chuyến", False, 3, True),
    ("CHI_KHAC", "Chi phí chuyến khác", "Đơn · Chuyến", True, 4, True),
    ("RUA_XE", "Rửa xe", "Xe", False, 2, False),
]


def cat_01():
    items = []
    for i, (lab, cnt, ic) in enumerate(CAT_TYPES):
        on = i == 0
        fg = T["primary"] if on else T["text"]
        items.append(f'<div style="display: flex; align-items: center; gap: 10px; height: 38px; padding: 0 10px; border-radius: 6px; '
                     f'background: {T["primary-soft"] if on else "transparent"};">{icon(ic, 16, fg)}{text(lab, 13, 600 if on else 500, fg)}'
                     f'<span style="margin-left: auto; font-size: 12px; font-weight: 600; color: {T["text-muted"]}; {NUM}">{cnt}</span></div>')
    types = panel(None, col(subtle("LOẠI DANH MỤC", 11), *items, gap=2), pad=8, extra="width: 240px; flex-shrink: 0;")
    use("SegmentedControl")
    cols = [("", "left", "28px"), ("Mã", "left"), ("Tên hiển thị", "left"), ("Áp dụng cho", "left"), ("Nguồn", "left"),
            ("Đang dùng", "right"), ("Hoạt động", "left"), ("", "right", "90px")]
    rows = []
    for code_, name, applies, default, used, active in EXPENSE_TYPES:
        rows.append([icon("grip-vertical", 16, T["text-subtle"]), num(code_, 12, 500, T["text-muted"]),
                     text(name, 13, 600, None if active else T["text-muted"]), muted(applies),
                     badge("Mặc định", "neutral") if default else badge("Nhà xe thêm", "primary"),
                     num(f"{used} phiếu"), row(switch(active), muted("Đang dùng" if active else "Ngừng", 12), gap=8),
                     row(btn("Sửa", "ghost", "pencil", size="sm"), row_menu(), gap=2, justify="flex-end")])
    new_row = row(field("Mã", input_("PHI_BEN_BAI", mono=True), True, width="22%"), field("Tên hiển thị", input_("Phí bến bãi"), True, width="30%"),
                  field("Áp dụng cho", select("Chuyến"), width="22%"), spacer(),
                  btn("Hủy", "secondary", size="sm"), btn("Thêm", "primary", "check", size="sm"), gap=10, align="flex-end",
                  extra=f"padding: 12px; border: 1px solid {T['accent']}; border-radius: 6px; background: {T['accent-soft']};")
    main = col(
        row(col(h("md", "Loại chi phí"), muted("Dùng khi tạo phiếu chi và chi phí đơn/chuyến", 13), gap=0), spacer(),
            a("Xem nơi sử dụng: Tạo phiếu chi", "WM-EXP-03", "Mở form phiếu chi dùng danh mục"), gap=12, align="flex-end"),
        filter_bar("Tìm mã, tên…", ["Tất cả", "Đang dùng", "Ngừng"]),
        new_row,
        table(cols, rows, footer=row(muted("8 mục · 7 đang dùng", 13), spacer(), subtle("Kéo để sắp xếp thứ tự hiển thị trong form", 12), gap=8)),
        row(icon("info", 16, T["text-muted"]),
            muted("Mục ngừng hoạt động không hiện trong form mới; phiếu cũ vẫn hiển thị đúng tên. Mục đã dùng không xóa được, chỉ ngừng hoạt động.", 13), gap=8),
        gap=14, extra="flex-grow: 1; min-width: 0;")
    content = col(
        page_header("Danh mục dùng chung", "Danh mục riêng của nhà xe, dùng ở đơn hàng, điều phối, thu chi và lương",
                    row(btn("Thêm mục", "primary", "plus"), gap=8),
                    crumbs=[SETTINGS_CRUMB, ("Danh mục", None)]),
        row(types, main, gap=16, align="flex-start"), gap=16)
    return wm_shell("settings", content, h=960, child="WM-CAT-01")


C = dict(platform="wm", module="Cài đặt")
register(
    Screen(id="WM-ORG-01", name="Hồ sơ nhà xe", route="/settings/company", render=org_01, pattern="form", h=1020, roles=ADMIN_ONLY, **C,
           purpose="Xem/sửa thông tin doanh nghiệp, địa chỉ, liên hệ và logo của merchant; dữ liệu in trên chứng từ.",
           api=["me{merchant}", "merchant(id)", "updateMerchantProfile(input)", "uploadAttachment(entityType: MERCHANT, kind: LOGO)"],
           data=["code", "displayName", "legalName", "taxCode", "businessType", "address{line, province, district}", "yardName",
                 "representative{name, title}", "phone", "dispatchHotline", "email", "logo{url, size, updatedAt}"],
           actions=[("Lưu thay đổi", "Manage merchant profile/settings — admin"), ("Đổi/xóa logo", "admin"), ("Xem mẫu in", "view"),
                    ("Xem lịch sử", "admin → WM-SHELL-07")],
           states={"loading": "Skeleton form 2 cột", "error": "Banner danger 'Không lưu được hồ sơ' + giữ dữ liệu đã nhập",
                   "validation": "Tên nhà xe, địa chỉ, tỉnh, người đại diện, SĐT bắt buộc; MST 10 hoặc 13 số",
                   "no-permission": "Operation/Kế toán: form read-only, ẩn nút Lưu, banner 'Chỉ Admin được sửa hồ sơ nhà xe'"},
           notes=["Mã merchant do hệ thống cấp, không sửa.", "Logo PNG/JPG ≤ 2 MB, crop vuông; dùng ở header chứng từ (WM-SHELL-05, WM-ORD-09).",
                  "Sửa hồ sơ ghi audit_log (before/after)."]),
    Screen(id="WM-USER-01", name="Danh sách nhân viên", route="/settings/users", render=user_01, pattern="list", roles=ADMIN_ONLY, **C,
           purpose="Tìm/lọc nhân viên merchant theo vai trò/trạng thái; mời nhân viên; khóa/mở tài khoản.",
           api=["merchantUsers(filter{role, status, search}, first, after)", "lockMerchantUser(id)", "unlockMerchantUser(id)", "resendInvite(id)"],
           data=["name", "email", "role", "status (ACTIVE|INVITED|LOCKED)", "lastLoginAt", "joinedAt", "invitedBy"],
           actions=[("Mời nhân viên", "Manage users/roles — admin → WM-USER-03"), ("Khóa / Mở khóa", "admin; không tự khóa chính mình; confirm dialog"),
                    ("Gửi lại lời mời", "admin; chỉ trạng thái Chờ chấp nhận"), ("Vai trò & quyền", "admin → WM-RBAC-01")],
           states={"loading": "DataTable skeleton rows", "empty": "EmptyState 'Chưa có nhân viên khác' + nút 'Mời nhân viên'",
                   "error": "Banner danger + Thử lại", "no-permission": "Non-admin truy cập URL → trang không có quyền"},
           notes=["Khóa user: chặn API ngay (revoke session); giữ dữ liệu/lịch sử.", "Không cho khóa Admin cuối cùng của merchant.",
                  "Row click hoặc tên → /settings/users/:userId."]),
    Screen(id="WM-USER-02", name="Chi tiết nhân viên", route="/settings/users/:userId", render=user_02, pattern="detail", h=1060, roles=ADMIN_ONLY, **C,
           purpose="Hồ sơ nhân viên, vai trò, quyền cấp thêm, merchant access và nhật ký hoạt động/audit.",
           api=["merchantUser(id)", "updateMerchantUser(id, input)", "assignRole(userId, role)", "setUserExtraPermissions(userId, permissions[])",
                "lockMerchantUser(id)", "activityLogs(actorId, first)"],
           data=["name", "email", "phone", "title", "role", "extraPermissions[]", "memberships[{merchant, role, status, since}]", "lastLoginAt", "activity[]"],
           actions=[("Lưu thay đổi (hồ sơ, vai trò, quyền cấp thêm)", "admin; đổi vai trò ghi audit"), ("Khóa tài khoản", "admin; confirm"),
                    ("Xem quyền của vai trò", "→ WM-RBAC-01"), ("Timeline", "→ WM-SHELL-07")],
           states={"loading": "Skeleton header + panels", "error": "Không tìm thấy nhân viên → EmptyState + quay lại danh sách",
                   "locked": "Banner danger 'Tài khoản đã khóa từ …' + nút Mở khóa"},
           notes=["Quyền cấp thêm = các ô 'Cần cấp thêm' (⚠ trong 08-permission-matrix) của vai trò hiện tại; đổi vai trò reset danh sách.",
                  "Không cho hạ vai trò Admin cuối cùng.", "Email Google là định danh đăng nhập (Firebase), không sửa trực tiếp."]),
    Screen(id="WM-USER-03", name="Mời/tạo nhân viên", route="/settings/users/new (drawer)", render=user_03, pattern="drawer", overlay_of="WM-USER-01",
           roles=ADMIN_ONLY, **C,
           purpose="Mời nhân viên bằng email Google với vai trò Admin/Operation/Kế toán và quyền cấp thêm tùy chọn.",
           api=["inviteMerchantUser(input{email, name, phone, role, extraPermissions[], note})"],
           data=["email", "name", "phone", "role", "extraPermissions[]", "note"],
           actions=[("Gửi lời mời", "Manage users/roles — admin → WM-USER-01 (trạng thái Chờ chấp nhận)"), ("Hủy", "→ WM-USER-01")],
           states={"validation": "Email bắt buộc, đúng định dạng, chưa là thành viên merchant (lỗi inline 'Email đã thuộc nhà xe')",
                   "submitting": "Nút Gửi lời mời loading, khóa form"},
           notes=["Đăng nhập chỉ Google (D-006): user mới đăng nhập bằng email được mời thì được gắn vào merchant.",
                  "Lời mời hết hạn 7 ngày; gửi lại từ WM-USER-01."]),
    Screen(id="WM-RBAC-01", name="Vai trò & phân quyền", route="/settings/roles", render=rbac_01, pattern="report", h=2300, roles=ADMIN_ONLY, **C,
           purpose="Ma trận quyền theo vai trò (admin/operation/kế toán) × thao tác, đánh dấu thao tác nhạy cảm cần lý do.",
           api=["roles{key, name, userCount}", "permissionMatrix{action, group, admin, operation, accountant, requiresReason}"],
           data=["group (Dữ liệu nền|Đơn & điều phối|Tài chính|Lương)", "action", "admin|operation|accountant: ALLOWED|DENIED|GRANTABLE", "requiresReason", "grantedUserCount"],
           actions=[("Cấp quyền cho nhân viên", "admin → WM-USER-02"), ("Xem hộp xác nhận lý do", "→ WM-SHELL-08"),
                    ("Xem nhân viên theo vai trò", "→ WM-USER-01?role=")],
           states={"loading": "Skeleton table", "no-permission": "Chỉ Admin truy cập; Kế toán không chỉnh RBAC (MD-002)"},
           notes=["Nguồn: doc/2-PRD/08-permission-matrix.md §3,4,6,7,10. ✅ = checkbox checked, ❌ = ô trống, ⚠ = checkbox indeterminate + badge 'Cần cấp thêm'.",
                  "Phase 1 vai trò cố định (read-only); ô GRANTABLE bật cho từng user ở WM-USER-02.",
                  "Thao tác 'Cần lý do' luôn mở SensitiveActionModal (WM-SHELL-08) và ghi audit reason.",
                  "Backend là nguồn enforce cuối cùng; UI chỉ ẩn/disable."]),
    Screen(id="WM-SET-01", name="Cài đặt vận hành", route="/settings/operations", render=set_01, pattern="form", h=1040, roles=ADMIN_ONLY, **C,
           purpose="Cấu hình kỳ lương, ngưỡng gần trùng lịch, ngưỡng COD (tiền/ngày), công nợ mặc định cho merchant.",
           api=["merchantSettings", "updateMerchantSettings(input)"],
           data=["payrollPeriod{type: MONTHLY|CUSTOM, startDay}", "nearOverlapHours (2)", "defaultTripHours", "overlapWarnVehicle", "overlapWarnDriver",
                 "codWarningAmount (5.000.000)", "codWarningDays (2)", "codDashboardAlert", "defaultDebtDays (15)", "defaultCreditLimit", "warnOverLimit", "warnOverdue"],
           actions=[("Lưu cài đặt", "Manage merchant profile/settings — admin"), ("Bật/tắt Switch", "admin; áp dụng ngay (mutation riêng từng switch, toast)")],
           states={"dirty": "Save bar hiện số thay đổi chưa lưu; rời trang → confirm", "validation": "Ngưỡng > 0; ngày bắt đầu kỳ 1–28",
                   "no-permission": "Non-admin: read-only"},
           notes=["Ngưỡng overlap dùng bởi DIS-002 (WM-DISPATCH-*); ngưỡng COD dùng bởi FIN-006 (WM-COD-01).",
                  "Seed M-DEMO-A: kỳ lương tháng, 2 giờ, 5.000.000 đ / 2 ngày, 15 ngày.", "Sửa ghi audit_log."]),
    Screen(id="WM-SET-02", name="Cấu hình mã tự động", route="/settings/numbering", render=set_02, pattern="form", roles=ADMIN_ONLY, **C,
           purpose="Xem format và counter mã theo loại chứng từ; sửa tiền tố/định dạng nếu được phép.",
           api=["numberSequences{docType, prefix, pattern, resetPeriod, nextValue, issuedThisPeriod}", "updateNumberSequenceFormat(docType, input)"],
           data=["docType (ORDER|TRIP|PAYMENT_IN|EXPENSE|PAYROLL|DEBT_STATEMENT)", "prefix", "separator", "datePart", "digits", "resetPeriod", "nextPreview", "issuedThisPeriod"],
           actions=[("Sửa định dạng", "admin"), ("Lưu định dạng", "admin; áp dụng cho chứng từ mới"), ("Xem lịch sử", "→ WM-SHELL-07")],
           states={"validation": "Tiền tố 2–4 chữ in hoa, không trùng loại khác", "error": "Banner danger nếu lưu lỗi"},
           notes=["number_sequences theo merchant + docType + period; transaction/lock chống trùng (FDN-006).",
                  "Không cho sửa/lùi counter. Mã đã cấp không đổi, không tái sử dụng.",
                  "Bảng kê dùng tiền tố BK theo design system (BRD 09 gợi ý CN-; chốt BK- trên UI)."]),
    Screen(id="WM-CAT-01", name="Danh mục dùng chung", route="/settings/catalogs", render=cat_01, pattern="list",
           roles=["admin", "operation", "accountant"], **C,
           purpose="CRUD danh mục theo merchant: loại chi phí, dịch vụ thêm, loại hàng, lý do tạm dừng, lý do giảm trừ, loại chứng từ, loại sự cố.",
           api=["catalogItems(type)", "createCatalogItem(input)", "updateCatalogItem(id, input)", "deactivateCatalogItem(id)", "reorderCatalogItems(type, ids)"],
           data=["type", "code", "name", "appliesTo", "isDefault", "usageCount", "active", "sortOrder"],
           actions=[("Thêm mục", "Manage catalogs — admin, operation; accountant nếu được cấp"), ("Sửa", "như trên"),
                    ("Bật/tắt hoạt động", "như trên; mục đã dùng chỉ ngừng, không xóa"), ("Kéo sắp xếp", "như trên")],
           states={"loading": "Skeleton list + table", "empty": "EmptyState 'Chưa có mục nào' + nút Thêm mục",
                   "validation": "Mã duy nhất trong loại, tên bắt buộc", "read-only": "Kế toán không được cấp: ẩn Thêm/Sửa, switch disabled"},
           notes=["Danh mục chọn qua ?type= (expense|addon|cargo|pause_reason|deduction_reason|attachment_type|incident_type).",
                  "Seed mặc định khi tạo merchant; inactive không hiện trong form mới nhưng dữ liệu cũ vẫn hiển thị label.",
                  "Nơi dùng: loại chi phí WM-EXP-03, dịch vụ thêm WM-ORD-03/06, loại hàng WM-ORD-05, lý do tạm dừng DA-STATUS-02, lý do giảm trừ WM-PAYROLL-04, loại chứng từ WM-SHELL-06, loại sự cố WM-INC-01/DA-INC-01."]),
)
