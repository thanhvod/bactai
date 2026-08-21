import 'package:flutter/material.dart';

import '../components/glowfox_logo.dart';
import '../theme/glowfox_shell_style.dart';

/// White rounded sheet placed below the dark shell header.
///
/// Wrap the page content of any dark-shell screen in this so the corner
/// radius and background stay consistent everywhere.
class GFShellSheet extends StatelessWidget {
  const GFShellSheet({
    super.key,
    required this.child,
    this.color = GFShellStyle.sheetColor,
  });

  final Widget child;

  /// Sheet background. Defaults to white; settings-style screens may use grey.
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: color,
        borderRadius: GFShellStyle.sheetBorderRadius,
      ),
      child: child,
    );
  }
}

/// Language pill for the dark header (globe icon + locale code + chevron).
class GFLanguagePill extends StatelessWidget {
  const GFLanguagePill({super.key, required this.locale, this.onTap});

  /// Display label, e.g. 'EN', 'VI'.
  final String locale;

  /// Receives the pill's [BuildContext] so callers can compute screen position.
  final Function(BuildContext)? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap != null ? () => onTap!(context) : null,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.white.withValues(alpha: 0.28)),
          borderRadius: BorderRadius.circular(20),
          color: Colors.white.withValues(alpha: 0.07),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.language_rounded, size: 14, color: Colors.white.withValues(alpha: 0.85)),
            const SizedBox(width: 4),
            Text(
              locale.toUpperCase(),
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.9),
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: 2),
            Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: Colors.white.withValues(alpha: 0.65)),
          ],
        ),
      ),
    );
  }
}

/// Circular user icon button for the dark header — opens the account dropdown.
class GFUserIconButton extends StatelessWidget {
  const GFUserIconButton({super.key, required this.onTap});

  /// Receives the button's [BuildContext] so callers can anchor a dropdown.
  final Function(BuildContext) onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onTap(context),
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.28),
            width: 1,
          ),
          color: Colors.white.withValues(alpha: 0.07),
        ),
        child: const Icon(
          Icons.person_outline_rounded,
          color: Colors.white,
          size: 18,
        ),
      ),
    );
  }
}

/// GlowFox logomark + selected merchant name + chevron for the dark header.
/// Tapping opens the merchant switcher.
class GFMerchantSwitcherButton extends StatelessWidget {
  const GFMerchantSwitcherButton({
    super.key,
    required this.merchantName,
    required this.onTap,
    this.showLogoMark = true,
  });

  final String merchantName;
  final VoidCallback onTap;

  /// Set false on screens that render their own leading widget (e.g. back arrow).
  final bool showLogoMark;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (showLogoMark) ...[
          const GFLogoMark(size: 26),
          const SizedBox(width: 10),
        ],
        Expanded(
          child: GestureDetector(
            onTap: onTap,
            behavior: HitTestBehavior.opaque,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  child: Text(
                    merchantName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      letterSpacing: -0.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 3),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  color: Colors.white.withValues(alpha: 0.85),
                  size: 18,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
