import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

/// Banner thông tin theo tone: đã chốt, offline, GPS tắt, lỗi tải...
class BtaBanner extends StatelessWidget {
  const BtaBanner({super.key, required this.message, this.tone = BtaTone.info, this.icon, this.actionLabel, this.onAction, this.dense = false});

  final String message;
  final BtaTone tone;
  final IconData? icon;
  final String? actionLabel;
  final VoidCallback? onAction;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final c = BtaToneColors.of(tone);
    return Container(
      padding: EdgeInsets.symmetric(horizontal: BtaSpace.s4, vertical: dense ? BtaSpace.s2 : BtaSpace.s3),
      decoration: BoxDecoration(color: c.bg, borderRadius: BorderRadius.circular(dense ? 0 : BtaRadius.md)),
      child: Row(
        children: [
          Icon(icon ?? _defaultIcon(tone), size: 18, color: c.fg),
          const SizedBox(width: BtaSpace.s2),
          Expanded(child: Text(message, style: BtaText.bodySm.copyWith(color: c.fg, fontWeight: FontWeight.w500))),
          if (actionLabel != null)
            TextButton(onPressed: onAction, style: TextButton.styleFrom(foregroundColor: c.fg, minimumSize: const Size(48, 40)), child: Text(actionLabel!)),
        ],
      ),
    );
  }

  static IconData _defaultIcon(BtaTone t) {
    switch (t) {
      case BtaTone.success:
        return Icons.check_circle_outline;
      case BtaTone.warning:
        return Icons.warning_amber_outlined;
      case BtaTone.danger:
        return Icons.error_outline;
      case BtaTone.primary:
        return Icons.lock_outline;
      default:
        return Icons.info_outline;
    }
  }
}

/// Banner mất mạng (đặt trên đầu màn, full width).
class OfflineBanner extends StatelessWidget {
  const OfflineBanner({super.key, this.pendingCount = 0, this.onTap});
  final int pendingCount;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => BtaBanner(
        tone: BtaTone.warning,
        icon: Icons.cloud_off_outlined,
        dense: true,
        message: pendingCount > 0 ? 'Mất kết nối — $pendingCount mục sẽ gửi khi có mạng' : 'Mất kết nối — dữ liệu sẽ lưu tạm trên máy',
        actionLabel: onTap != null ? 'Xem' : null,
        onAction: onTap,
      );
}
