import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_radius.dart';
import '../theme/glowfox_spacing.dart';
import '../theme/glowfox_typography.dart';
import 'glowfox_button.dart';

class GFDialog extends StatelessWidget {
  const GFDialog({
    super.key,
    required this.title,
    required this.content,
    this.actions,
    this.icon,
  });

  final String title;
  final Widget content;
  final List<Widget>? actions;
  final Widget? icon;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: GFRadius.xl),
      child: Padding(
        padding: const EdgeInsets.all(GFSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (icon != null) ...[
              icon!,
              const SizedBox(height: GFSpacing.md),
            ],
            Text(title, style: GFTypography.h3),
            const SizedBox(height: GFSpacing.sm),
            content,
            if (actions != null) ...[
              const SizedBox(height: GFSpacing.xl),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: actions!
                    .expand((a) => [a, const SizedBox(width: GFSpacing.sm)])
                    .toList()
                  ..removeLast(),
              ),
            ],
          ],
        ),
      ),
    );
  }

  static Future<T?> show<T>({
    required BuildContext context,
    required String title,
    required Widget content,
    List<Widget>? actions,
    Widget? icon,
  }) {
    return showDialog<T>(
      context: context,
      builder: (_) => GFDialog(title: title, content: content, actions: actions, icon: icon),
    );
  }
}
