import 'package:flutter/material.dart';

import '../theme/glowfox_shell_style.dart';

/// Shared fixed-height header row used across all app shells (auth, merchant select, dashboard).
///
/// Does NOT include SafeArea — the parent scaffold/column handles that.
/// All shells share [height] so the header line is visually consistent.
class GFShellHeader extends StatelessWidget {
  const GFShellHeader({
    super.key,
    required this.leading,
    this.trailing,
    this.horizontalPadding = 20.0,
  });

  /// The content body height (excluding SafeArea).
  static const double height = GFShellStyle.headerHeight;

  /// Left-side widget (logo, logomark + merchant name, etc.).
  /// Expands to fill available space before [trailing].
  final Widget leading;

  /// Right-side widget (language pill, user icon button, etc.).
  final Widget? trailing;

  /// Horizontal padding on both sides. Defaults to 20px.
  final double horizontalPadding;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(child: leading),
            if (trailing != null) ...[
              const SizedBox(width: 8),
              trailing!,
            ],
          ],
        ),
      ),
    );
  }
}
