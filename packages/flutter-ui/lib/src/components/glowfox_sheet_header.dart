import 'package:flutter/material.dart';

/// Page/section heading inside a white sheet: large title + subtitle + optional trailing.
///
/// Used at the top of white-card content (merchant select, form sheets, etc.).
class GFSheetHeader extends StatelessWidget {
  const GFSheetHeader({
    super.key,
    required this.title,
    required this.subtitle,
    this.trailing,
    this.titleSubtitleGap = 1.0,
  });

  final String title;
  final String subtitle;

  /// Optional widget aligned to the right of the title (e.g. an add button).
  final Widget? trailing;

  /// Vertical gap between title and subtitle. Defaults to 1px.
  final double titleSubtitleGap;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF111111),
                  height: 1.2,
                ),
              ),
            ),
            if (trailing != null) ...[
              const SizedBox(width: 12),
              trailing!,
            ],
          ],
        ),
        SizedBox(height: titleSubtitleGap),
        Text(
          subtitle,
          style: const TextStyle(
            fontSize: 14,
            color: Color(0xFF707070),
            height: 1.4,
          ),
        ),
      ],
    );
  }
}
