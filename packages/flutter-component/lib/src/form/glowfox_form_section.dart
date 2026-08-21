import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// Groups form fields under a labelled section with a card border.
class GFFormSection extends StatelessWidget {
  const GFFormSection({
    super.key,
    required this.children,
    this.title,
    this.description,
  });

  final List<Widget> children;
  final String? title;
  final String? description;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title != null) ...[
          Text(title!, style: GFTypography.label.copyWith(color: GFColors.textSecondary)),
          const SizedBox(height: GFSpacing.sm),
        ],
        if (description != null) ...[
          Text(description!, style: GFTypography.bodySm),
          const SizedBox(height: GFSpacing.sm),
        ],
        GFCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: children
                .expand((child) => [
                      Padding(
                        padding: const EdgeInsets.all(GFSpacing.base),
                        child: child,
                      ),
                      if (child != children.last)
                        const GFDivider(),
                    ])
                .toList(),
          ),
        ),
      ],
    );
  }
}
