import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

/// Dòng danh sách (tài khoản/cài đặt) cao ≥56dp.
class ListRow extends StatelessWidget {
  const ListRow({super.key, this.icon, required this.label, this.value, this.onTap, this.trailing, this.danger = false});
  final IconData? icon;
  final String label;
  final String? value;
  final VoidCallback? onTap;
  final Widget? trailing;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final color = danger ? BtaColors.danger : BtaColors.text;
    return InkWell(
      onTap: onTap,
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: 56),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: BtaSpace.s4, vertical: BtaSpace.s2),
          child: Row(
            children: [
              if (icon != null) ...[Icon(icon, size: 22, color: danger ? BtaColors.danger : BtaColors.textMuted), const SizedBox(width: BtaSpace.s3)],
              Expanded(child: Text(label, style: BtaText.body.copyWith(color: color))),
              if (value != null) Flexible(child: Text(value!, style: BtaText.body.copyWith(color: BtaColors.textMuted), textAlign: TextAlign.end, overflow: TextOverflow.ellipsis)),
              if (trailing != null) trailing! else if (onTap != null) const Icon(Icons.chevron_right, color: BtaColors.textSubtle),
            ],
          ),
        ),
      ),
    );
  }
}
