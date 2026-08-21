import 'package:flutter/material.dart';

import '../theme/glowfox_colors.dart';
import '../theme/glowfox_typography.dart';

/// Informational banner with an optional trailing action.
///
/// Shared pattern for "viewing mode" notices — e.g. "Bạn đang xem tài sản
/// đã xóa." with an exit action that returns to the normal list.
///
/// ```dart
/// GFInfoBanner(
///   message: l10n.assets_deleted_banner,
///   tone: GFInfoBannerTone.error,
///   actionLabel: l10n.common_exit,
///   onAction: exitDeletedMode,
/// )
/// ```
enum GFInfoBannerTone { info, error }

class GFInfoBanner extends StatelessWidget {
  const GFInfoBanner({
    super.key,
    required this.message,
    this.tone = GFInfoBannerTone.info,
    this.actionLabel,
    this.actionIcon = Icons.logout_rounded,
    this.onAction,
  });

  final String message;
  final GFInfoBannerTone tone;

  /// Trailing action label (e.g. "Thoát"). Hidden when null.
  final String? actionLabel;
  final IconData actionIcon;
  final VoidCallback? onAction;

  Color get _accent =>
      tone == GFInfoBannerTone.error ? GFColors.error : GFColors.info;
  Color get _accentLight =>
      tone == GFInfoBannerTone.error ? GFColors.errorLight : GFColors.infoLight;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 6, 6, 6),
      decoration: BoxDecoration(
        color: _accentLight.withValues(alpha: 0.45),
        border: Border.all(color: _accentLight),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline_rounded, size: 18, color: GFColors.textPrimary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: GFTypography.bodySm.copyWith(
                color: GFColors.textPrimary,
                fontWeight: FontWeight.w400,
              ),
            ),
          ),
          if (actionLabel != null) ...[
            const SizedBox(width: 8),
            GestureDetector(
              onTap: onAction,
              behavior: HitTestBehavior.opaque,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: GFColors.surface,
                  border: Border.all(color: _accentLight),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(actionIcon, size: 15, color: _accent),
                    const SizedBox(width: 4),
                    Text(
                      actionLabel!,
                      style: GFTypography.bodySm.copyWith(
                        fontWeight: FontWeight.w700,
                        color: _accent,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
