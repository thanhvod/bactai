import 'package:flutter/material.dart';

import 'glowfox_colors.dart';

/// Design tokens for the dark shell layout used on every screen:
/// dark charcoal area on top (header) + white rounded sheet below.
///
/// All shells (auth, merchant select, dashboard, full-screen routes)
/// MUST use these tokens so the layout stays visually consistent.
abstract final class GFShellStyle {
  /// Dark charcoal background behind the header.
  static const Color background = GFColors.authShell;

  /// Content height of the dark header row (excluding SafeArea).
  static const double headerHeight = 60.0;

  /// Corner radius of the white sheet below the header.
  static const double sheetRadius = 32.0;

  /// Top-only rounded corners for the sheet container.
  static const BorderRadius sheetBorderRadius = BorderRadius.only(
    topLeft: Radius.circular(sheetRadius),
    topRight: Radius.circular(sheetRadius),
  );

  /// Default sheet background color.
  static const Color sheetColor = Colors.white;
}
