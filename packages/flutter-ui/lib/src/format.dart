/// Định dạng tiền/ngày giờ theo design: `1.250.000 đ`, `23/09/2026 14:30`.
class BtaFormat {
  BtaFormat._();

  static String vnd(num? value, {bool withUnit = true}) {
    final v = (value ?? 0).round();
    final negative = v < 0;
    final digits = v.abs().toString();
    final buf = StringBuffer();
    for (var i = 0; i < digits.length; i++) {
      if (i > 0 && (digits.length - i) % 3 == 0) buf.write('.');
      buf.write(digits[i]);
    }
    final s = '${negative ? '-' : ''}$buf';
    return withUnit ? '$s đ' : s;
  }

  static String _p(int n) => n.toString().padLeft(2, '0');

  static String date(DateTime? d) {
    if (d == null) return '';
    final l = d.toLocal();
    return '${_p(l.day)}/${_p(l.month)}/${l.year}';
  }

  static String time(DateTime? d) {
    if (d == null) return '';
    final l = d.toLocal();
    return '${_p(l.hour)}:${_p(l.minute)}';
  }

  static String dateTime(DateTime? d) => d == null ? '' : '${date(d)} ${time(d)}';

  /// "07:00 – 15:00" hoặc "07:00" nếu thiếu end.
  static String timeWindow(DateTime? start, DateTime? end) {
    if (start == null) return '';
    return end == null ? time(start) : '${time(start)} – ${time(end)}';
  }
}
