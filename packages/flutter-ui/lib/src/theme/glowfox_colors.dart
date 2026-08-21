import 'package:flutter/material.dart';

/// GlowFox brand colour palette.
///
/// All colour usage in components goes through these tokens.
/// Do not hard-code hex values in screens or feature code.
abstract final class GFColors {
  // --- Brand ---
  static const Color primary = Color(0xFF000000);
  static const Color primaryLight = Color(0xFFF3F4F6);
  static const Color primaryDark = Color(0xFF111111);

  // --- Neutral ---
  static const Color white = Color(0xFFFFFFFF);
  static const Color background = Color(0xFFF9FAFB);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF3F4F6);
  static const Color border = Color(0xFFE5E7EB);
  static const Color borderStrong = Color(0xFFD1D5DB);

  /// Viền mờ hơn [border] — cho mục chưa chọn trong danh sách lựa chọn, để mục
  /// đang chọn (viền đen) nổi bật hẳn.
  static const Color borderSubtle = Color(0xFFF0F1F3);

  // --- Text ---
  static const Color textPrimary = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textTertiary = Color(0xFF9CA3AF);
  static const Color textDisabled = Color(0xFFD1D5DB);
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // --- Semantic ---
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFD1FAE5);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFFDBEAFE);

  // --- Interactive ---
  static const Color focusRing = Color(0xFF000000);
  static const Color overlay = Color(0x80000000); // 50% black
  static const Color shimmerBase = Color(0xFFE5E7EB);
  static const Color shimmerHighlight = Color(0xFFF9FAFB);

  // --- Auth shell ---
  static const Color authShell = Color(0xFF050807); // dark charcoal page bg
  static const Color charcoal = Color(0xFF111111);  // near-black CTA
  static const Color textMuted = Color(0xFF707070); // muted subtitle

  // --- Avatar ---
  /// Default avatar background (slate-600). Text on top: white.
  static const Color avatarBg = Color(0xFF475569);
  static const Color avatarFg = Color(0xFFFFFFFF);
}
