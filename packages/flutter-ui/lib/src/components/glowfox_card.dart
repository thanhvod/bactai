import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_radius.dart';
import '../theme/glowfox_spacing.dart';

class GFCard extends StatelessWidget {
  const GFCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.margin,
    this.color,
    this.borderColor,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? margin;
  final Color? color;
  final Color? borderColor;

  @override
  Widget build(BuildContext context) {
    Widget content = Container(
      padding: padding ?? const EdgeInsets.all(GFSpacing.base),
      decoration: BoxDecoration(
        color: color ?? GFColors.surface,
        borderRadius: GFRadius.lg,
        border: Border.all(color: borderColor ?? GFColors.border),
      ),
      child: child,
    );

    if (margin != null) {
      content = Padding(padding: margin!, child: content);
    }

    if (onTap != null) {
      content = InkWell(
        onTap: onTap,
        borderRadius: GFRadius.lg,
        child: content,
      );
    }

    return content;
  }
}
