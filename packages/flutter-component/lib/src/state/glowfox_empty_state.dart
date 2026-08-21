import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

class GFEmptyState extends StatelessWidget {
  const GFEmptyState({
    super.key,
    required this.title,
    this.description,
    this.icon,
    this.action,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String? description;
  final Widget? icon;
  final Widget? action;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(GFSpacing.xl2),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              IconTheme(
                data: const IconThemeData(size: 48, color: GFColors.textTertiary),
                child: icon!,
              ),
              const SizedBox(height: GFSpacing.base),
            ],
            Text(title, style: GFTypography.h3.copyWith(color: GFColors.textSecondary), textAlign: TextAlign.center),
            if (description != null) ...[
              const SizedBox(height: GFSpacing.sm),
              Text(description!, style: GFTypography.body.copyWith(color: GFColors.textTertiary), textAlign: TextAlign.center),
            ],
            if (action != null || (actionLabel != null && onAction != null)) ...[
              const SizedBox(height: GFSpacing.xl),
              action ??
                  GFButton(
                    onPressed: onAction,
                    child: Text(actionLabel!),
                  ),
            ],
          ],
        ),
      ),
    );
  }
}
