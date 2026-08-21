/// Shared GlowFox phone-number length policy for the finalized country list.
///
/// Validates the number of digits in the national significant number (i.e.
/// after the country dial code and an optional domestic trunk `0`) against a
/// per-country range. Keep this table in sync with the web `phone-policy.ts`
/// and the country list in `glowfox_email_phone_field.dart`.
abstract final class GFPhonePolicy {
  const GFPhonePolicy._();

  /// dialCode → (minLength, maxLength) of the national significant number.
  static const Map<String, (int, int)> _lengthByDial = {
    '84': (9, 10), // Việt Nam
    '1': (10, 10), // United States
    '86': (11, 11), // China
    '65': (8, 8), // Singapore
    '66': (8, 9), // Thailand
    '62': (9, 12), // Indonesia
    '60': (9, 10), // Malaysia
    '81': (10, 10), // Japan
    '82': (9, 10), // South Korea
  };

  /// Known dial codes, longest first so `+8x` never matches before `+8xx`.
  static const List<String> _dialCodesLongestFirst = [
    '84', '86', '65', '66', '62', '60', '81', '82', '1',
  ];

  /// True when [value] starts with `+` (phone mode of the email/phone field).
  static bool looksLikePhone(String value) => value.trim().startsWith('+');

  /// Validates an E.164-like value `+{dialCode}{number}`.
  ///
  /// Returns false for unknown country codes or an out-of-range length.
  static bool isValidE164(String value) {
    final digits = value.trim().replaceAll(RegExp(r'\D'), '');
    if (!value.trim().startsWith('+') || digits.isEmpty) return false;

    String? dial;
    for (final code in _dialCodesLongestFirst) {
      if (digits.startsWith(code)) {
        dial = code;
        break;
      }
    }
    if (dial == null) return false;

    var national = digits.substring(dial.length);
    // Domestic trunk prefix (all countries here except the US use a leading 0).
    if (dial != '1' && national.startsWith('0')) {
      national = national.substring(1);
    }

    if (dial == '84') {
      // VN numbering plan: mobile = 9 digits starting 3/5/7/8/9,
      // landline = 10 digits starting 2. A bare length range would accept
      // non-existent numbers like 9883434543 (10 digits starting with 9).
      return RegExp(r'^(2\d{9}|[35789]\d{8})$').hasMatch(national);
    }

    final range = _lengthByDial[dial];
    if (range == null) return false;
    return national.length >= range.$1 && national.length <= range.$2;
  }

  /// Convenience: a phone value whose length is invalid for its country.
  static bool isInvalidLength(String value) => !isValidE164(value);

  /// Normalizes an E.164-like value by dropping the domestic trunk `0` after
  /// the dial code — `+840909012175` → `+84909012175`.
  ///
  /// Returns the trimmed input unchanged when it does not start with `+` or
  /// the dial code is not in the supported list.
  static String normalizeE164(String value) {
    final trimmed = value.trim();
    if (!trimmed.startsWith('+')) return trimmed;
    final digits = trimmed.replaceAll(RegExp(r'\D'), '');
    for (final code in _dialCodesLongestFirst) {
      if (digits.startsWith(code)) {
        var national = digits.substring(code.length);
        if (code != '1' && national.startsWith('0')) {
          national = national.substring(1);
        }
        return '+$code$national';
      }
    }
    return trimmed;
  }
}
