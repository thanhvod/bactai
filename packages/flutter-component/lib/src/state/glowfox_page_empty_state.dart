import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// Full-page empty state with circular icon container, title, description,
/// and an optional action widget.
///
/// Usage:
/// ```dart
/// GFPageEmptyState(
///   icon: Icons.store_outlined,
///   title: 'Bạn chưa có cửa hàng nào',
///   description: 'Quản lý các chi nhánh, cửa hàng của bạn',
///   action: GFButton(onPressed: onTap, child: Text('Tạo cửa hàng')),
/// )
/// ```
class GFPageEmptyState extends StatelessWidget {
  const GFPageEmptyState({
    super.key,
    required this.title,
    required this.description,
    this.icon = Icons.inbox_outlined,
    this.iconSize = 36,
    this.containerSize = 80,
    this.action,
    this.padding,
  });

  final String title;
  final String description;

  /// Icon displayed inside the circular container.
  /// Defaults to [Icons.inbox_outlined] as a generic empty state indicator.
  final IconData icon;

  final double iconSize;
  final double containerSize;

  /// Optional action widget shown below the description (e.g. a CTA button).
  final Widget? action;

  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: padding ?? const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: containerSize,
              height: containerSize,
              decoration: const BoxDecoration(
                color: GFColors.surfaceVariant,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: iconSize,
                color: GFColors.textTertiary,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w600,
                color: GFColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              description,
              style: const TextStyle(
                fontSize: 14,
                color: GFColors.textSecondary,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            if (action != null) ...[
              const SizedBox(height: 28),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}
