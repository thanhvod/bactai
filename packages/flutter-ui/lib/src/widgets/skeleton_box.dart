import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

/// Ô loading (không animation phức tạp).
class SkeletonBox extends StatelessWidget {
  const SkeletonBox({super.key, this.width, this.height = 14, this.radius = BtaRadius.sm});
  final double? width;
  final double height;
  final double radius;

  @override
  Widget build(BuildContext context) => Container(
        width: width,
        height: height,
        decoration: BoxDecoration(color: BtaColors.surfaceMuted, borderRadius: BorderRadius.circular(radius)),
      );
}

/// Skeleton thẻ chuyến/điểm dừng.
class SkeletonCard extends StatelessWidget {
  const SkeletonCard({super.key, this.lines = 3});
  final int lines;
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(BtaSpace.s4),
        decoration: BoxDecoration(color: BtaColors.surface, border: Border.all(color: BtaColors.border), borderRadius: BorderRadius.circular(BtaRadius.lg)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (var i = 0; i < lines; i++) ...[
              SkeletonBox(width: i == 0 ? 120 : (i.isEven ? 220 : double.infinity)),
              if (i < lines - 1) const SizedBox(height: BtaSpace.s2),
            ],
          ],
        ),
      );
}
