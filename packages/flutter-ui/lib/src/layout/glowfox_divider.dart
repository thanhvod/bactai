import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_spacing.dart';

class GFDivider extends StatelessWidget {
  const GFDivider({super.key, this.indent, this.label});

  final double? indent;
  final String? label;

  @override
  Widget build(BuildContext context) {
    if (label != null) {
      return Row(
        children: [
          Expanded(child: Divider(indent: indent, color: GFColors.border)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: GFSpacing.sm),
            child: Text(label!, style: const TextStyle(color: GFColors.textTertiary, fontSize: 12)),
          ),
          const Expanded(child: Divider(color: GFColors.border)),
        ],
      );
    }
    return Divider(indent: indent, endIndent: indent, color: GFColors.border, thickness: 1, height: 1);
  }
}
