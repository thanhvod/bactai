import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_radius.dart';

enum GFIconButtonVariant { ghost, outline, filled }

class GFIconButton extends StatelessWidget {
  const GFIconButton({
    super.key,
    required this.icon,
    this.onPressed,
    this.variant = GFIconButtonVariant.ghost,
    this.size = 40.0,
    this.tooltip,
  });

  final Widget icon;
  final VoidCallback? onPressed;
  final GFIconButtonVariant variant;
  final double size;
  final String? tooltip;

  @override
  Widget build(BuildContext context) {
    Widget button = SizedBox(
      width: size,
      height: size,
      child: switch (variant) {
        GFIconButtonVariant.ghost => IconButton(
            onPressed: onPressed,
            icon: icon,
            style: IconButton.styleFrom(
              shape: RoundedRectangleBorder(borderRadius: GFRadius.md),
            ),
          ),
        GFIconButtonVariant.outline => IconButton(
            onPressed: onPressed,
            icon: icon,
            style: IconButton.styleFrom(
              side: const BorderSide(color: GFColors.border),
              shape: RoundedRectangleBorder(borderRadius: GFRadius.md),
            ),
          ),
        GFIconButtonVariant.filled => IconButton(
            onPressed: onPressed,
            icon: icon,
            style: IconButton.styleFrom(
              backgroundColor: GFColors.primary,
              foregroundColor: GFColors.white,
              shape: RoundedRectangleBorder(borderRadius: GFRadius.md),
            ),
          ),
      },
    );

    if (tooltip != null) {
      button = Tooltip(message: tooltip!, child: button);
    }
    return button;
  }
}
