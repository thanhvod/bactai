import 'package:flutter/material.dart';
import '../components/glowfox_logo.dart';
import '../theme/glowfox_shell_style.dart';
import 'glowfox_shell_header.dart';
import 'glowfox_shell_widgets.dart';

/// Full-screen auth layout shell.
///
/// Dark charcoal background, fixed header (logo + right widget), white rounded sheet below.
class GFAuthShell extends StatelessWidget {
  const GFAuthShell({
    super.key,
    required this.child,
    this.locale = 'EN',
    this.onLocaleTap,
    this.headerRight,
  });

  /// Scrollable sheet content — wrap in SingleChildScrollView yourself.
  final Widget child;

  /// Display label for the language pill, e.g. 'EN', 'VI'.
  /// Ignored when [headerRight] is set.
  final String locale;

  /// Callback when the language pill is tapped.
  /// Receives the pill's [BuildContext] so callers can compute screen position.
  /// Ignored when [headerRight] is set.
  final Function(BuildContext)? onLocaleTap;

  /// Optional custom widget for the header right side.
  /// When set, replaces the default language pill.
  final Widget? headerRight;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GFShellStyle.background,
      body: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Header ──────────────────────────────────────────────────────
            GFShellHeader(
              horizontalPadding: 24,
              leading: const GFLogo(size: 28),
              trailing: headerRight ?? GFLanguagePill(locale: locale, onTap: onLocaleTap),
            ),
            // ── White sheet ──────────────────────────────────────────────────
            Expanded(
              child: GFShellSheet(child: child),
            ),
          ],
        ),
      ),
    );
  }
}
