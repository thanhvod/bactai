import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_radius.dart';
import '../theme/glowfox_spacing.dart';
import '../theme/glowfox_typography.dart';

class GFSheet extends StatelessWidget {
  const GFSheet({
    super.key,
    required this.child,
    this.title,
    this.description,
    this.footer,
    this.initialChildSize = 0.6,
    this.maxChildSize = 0.95,
    this.minChildSize = 0.3,
  });

  final Widget child;
  final String? title;
  final String? description;
  final Widget? footer;
  final double initialChildSize;
  final double maxChildSize;
  final double minChildSize;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: initialChildSize,
      maxChildSize: maxChildSize,
      minChildSize: minChildSize,
      builder: (context, scrollController) => Container(
        decoration: const BoxDecoration(
          color: GFColors.surface,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(GFRadius.lgValue),
            topRight: Radius.circular(GFRadius.lgValue),
          ),
        ),
        child: Column(
          children: [
            _Handle(),
            if (title != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  GFSpacing.base, GFSpacing.sm, GFSpacing.base, 0,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title!, style: GFTypography.h3),
                    if (description != null) ...[
                      const SizedBox(height: 4),
                      Text(description!, style: GFTypography.body.copyWith(color: GFColors.textSecondary)),
                    ],
                  ],
                ),
              ),
            Expanded(
              child: SingleChildScrollView(
                controller: scrollController,
                padding: const EdgeInsets.all(GFSpacing.base),
                child: child,
              ),
            ),
            if (footer != null)
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(GFSpacing.base),
                  child: footer!,
                ),
              ),
          ],
        ),
      ),
    );
  }

  static Future<T?> show<T>({
    required BuildContext context,
    required Widget child,
    String? title,
    String? description,
    Widget? footer,
    double initialChildSize = 0.6,
    double maxChildSize = 0.95,
    bool isDismissible = true,
  }) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: true,
      isDismissible: isDismissible,
      backgroundColor: Colors.transparent,
      builder: (_) => GFSheet(
        title: title,
        description: description,
        footer: footer,
        initialChildSize: initialChildSize,
        maxChildSize: maxChildSize,
        child: child,
      ),
    );
  }
}

class _Handle extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Container(
        width: 36,
        height: 4,
        decoration: BoxDecoration(
          color: GFColors.borderStrong,
          borderRadius: GFRadius.full,
        ),
      ),
    );
  }
}
