/// Shared GlowFox password policy — kept in sync with the backend
/// `assertMerchantPasswordPolicy` (sys-api) and the web
/// `isSpaMerchantPasswordPolicyMet`.
///
/// Rule: at least 8 characters, including both a letter and a digit.
abstract final class GFPasswordPolicy {
  const GFPasswordPolicy._();

  /// Minimum length required.
  static const int minLength = 8;

  static final RegExp _letter = RegExp(r'\p{L}', unicode: true);
  static final RegExp _digit = RegExp(r'\d');

  /// True when [password] satisfies the policy.
  static bool isMet(String password) {
    return password.length >= minLength &&
        _letter.hasMatch(password) &&
        _digit.hasMatch(password);
  }

  /// Convenience negation for pre-submit guards.
  static bool isTooWeak(String password) => !isMet(password);
}
