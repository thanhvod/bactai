import 'package:flutter/material.dart';
import 'glowfox_theme_data.dart';

/// Provides the GlowFox theme to the widget tree.
///
/// Wrap your app root or a subtree with [GFTheme] to apply GlowFox tokens.
class GFTheme extends StatelessWidget {
  const GFTheme({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Theme(data: GFThemeData.light(), child: child);
  }

  static ThemeData of(BuildContext context) => Theme.of(context);
}
