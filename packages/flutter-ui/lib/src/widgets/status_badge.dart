import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

/// Badge trạng thái — luôn có chữ, màu theo tone (không dùng màu là tín hiệu duy nhất).
class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.label, this.tone = BtaTone.neutral, this.icon, this.outline = false, this.compact = false});

  final String label;
  final BtaTone tone;
  final IconData? icon;
  final bool outline;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final c = BtaToneColors.of(tone);
    return Container(
      padding: EdgeInsets.symmetric(horizontal: compact ? 6 : 8, vertical: compact ? 2 : 3),
      decoration: BoxDecoration(
        color: outline ? Colors.transparent : c.bg,
        border: Border.all(color: outline ? c.fg : c.bg),
        borderRadius: BorderRadius.circular(BtaRadius.sm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[Icon(icon, size: 14, color: c.fg), const SizedBox(width: 4)],
          Text(label, style: BtaText.caption.copyWith(color: c.fg, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
