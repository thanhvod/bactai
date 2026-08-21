/// Shared GlowFox email validation.
///
/// Cố ý giữ ở mức "đủ chặt để bắt lỗi gõ nhầm", không cố khớp RFC 5322 —
/// email có hợp lệ thật hay không thì chỉ việc gửi thư mới biết được.
abstract final class GFEmailPolicy {
  const GFEmailPolicy._();

  /// local@domain.tld — không khoảng trắng, đúng một `@`, tld tối thiểu 2 ký tự.
  static final RegExp _pattern = RegExp(
    r"^[\w.!#$%&'*+/=?^`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$",
  );

  static bool isValid(String value) {
    final trimmed = value.trim();
    if (trimmed.isEmpty || trimmed.length > 254) return false;
    return _pattern.hasMatch(trimmed);
  }

  /// Dùng cho ô email không bắt buộc: rỗng = hợp lệ.
  static bool isValidOrEmpty(String value) =>
      value.trim().isEmpty || isValid(value);
}
