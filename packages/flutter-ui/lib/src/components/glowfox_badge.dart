import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_radius.dart';
import '../theme/glowfox_typography.dart';

enum GFBadgeVariant { primary, secondary, success, warning, error, info, neutral, dark }

class GFBadge extends StatelessWidget {
  const GFBadge({super.key, required this.label, this.variant = GFBadgeVariant.primary});

  final String label;
  final GFBadgeVariant variant;

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = _colors();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(color: bg, borderRadius: GFRadius.full),
      child: Text(label, style: GFTypography.labelSm.copyWith(color: fg)),
    );
  }

  (Color bg, Color fg) _colors() => switch (variant) {
        GFBadgeVariant.primary => (GFColors.primaryLight, GFColors.primaryDark),
        GFBadgeVariant.secondary => (GFColors.surfaceVariant, GFColors.textSecondary),
        GFBadgeVariant.success => (GFColors.successLight, GFColors.success),
        GFBadgeVariant.warning => (GFColors.warningLight, GFColors.warning),
        GFBadgeVariant.error => (GFColors.errorLight, GFColors.error),
        GFBadgeVariant.info => (GFColors.infoLight, GFColors.info),
        GFBadgeVariant.neutral => (GFColors.border, GFColors.textPrimary),
        // Nền đen chữ trắng — mốc do admin GlowFox ghi (ADMIN_NOTE…).
        GFBadgeVariant.dark => (GFColors.charcoal, Colors.white),
      };
}
