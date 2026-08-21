import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// Standard skeleton loading for list screens.
class GFSkeletonList extends StatelessWidget {
  const GFSkeletonList({super.key, this.itemCount = 6, this.hasAvatar = false});

  final int itemCount;
  final bool hasAvatar;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(GFSpacing.base),
      physics: const NeverScrollableScrollPhysics(),
      // Skeleton không tự cuộn mà luôn được nhúng vào layout khác — nhiều chỗ
      // là vùng cao vô hạn (SingleChildScrollView, Column trong sliver) nên
      // phải shrinkWrap, nếu không viewport sẽ throw "unbounded height".
      shrinkWrap: true,
      itemCount: itemCount,
      separatorBuilder: (_, __) => const SizedBox(height: GFSpacing.sm),
      itemBuilder: (_, __) => _SkeletonItem(hasAvatar: hasAvatar),
    );
  }
}

class _SkeletonItem extends StatelessWidget {
  const _SkeletonItem({required this.hasAvatar});

  final bool hasAvatar;

  @override
  Widget build(BuildContext context) {
    return GFCard(
      child: Row(
        children: [
          if (hasAvatar) ...[
            const GFSkeleton(width: 40, height: 40, borderRadius: BorderRadius.all(Radius.circular(20))),
            const SizedBox(width: GFSpacing.md),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                GFSkeleton(width: double.infinity * 0.6, height: 14),
                const SizedBox(height: GFSpacing.sm),
                const GFSkeleton(width: 100, height: 12),
              ],
            ),
          ),
          const SizedBox(width: GFSpacing.md),
          const GFSkeleton(width: 60, height: 28),
        ],
      ),
    );
  }
}
