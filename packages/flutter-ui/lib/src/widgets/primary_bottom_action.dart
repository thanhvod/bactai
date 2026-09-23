import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

/// Nút hành động chính full width 48dp ở đáy màn (SafeArea), có nút phụ tùy chọn.
class PrimaryBottomAction extends StatelessWidget {
  const PrimaryBottomAction({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.secondaryLabel,
    this.onSecondary,
    this.loading = false,
    this.destructive = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final String? secondaryLabel;
  final VoidCallback? onSecondary;
  final bool loading;
  final bool destructive;

  @override
  Widget build(BuildContext context) {
    final child = loading
        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
        : Row(mainAxisSize: MainAxisSize.min, children: [
            if (icon != null) ...[Icon(icon, size: 20), const SizedBox(width: BtaSpace.s2)],
            Flexible(
              child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: BtaText.bodyStrong.copyWith(color: BtaColors.primaryForeground)),
            ),
          ]);
    return Material(
      color: BtaColors.surface,
      child: SafeArea(
        top: false,
        child: Container(
          padding: const EdgeInsets.fromLTRB(BtaSpace.s4, BtaSpace.s3, BtaSpace.s4, BtaSpace.s3),
          decoration: const BoxDecoration(border: Border(top: BorderSide(color: BtaColors.border))),
          child: Row(
            children: [
              if (secondaryLabel != null) ...[
                Expanded(
                  child: OutlinedButton(onPressed: onSecondary, child: Text(secondaryLabel!, maxLines: 1, overflow: TextOverflow.ellipsis)),
                ),
                const SizedBox(width: BtaSpace.s3),
              ],
              Expanded(
                flex: 2,
                child: FilledButton(
                  onPressed: loading ? null : onPressed,
                  style: FilledButton.styleFrom(backgroundColor: destructive ? BtaColors.danger : BtaColors.primary),
                  child: child,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
