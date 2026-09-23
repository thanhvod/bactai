import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

/// Trạng thái rỗng — nói thẳng việc tiếp theo.
class EmptyState extends StatelessWidget {
  const EmptyState({super.key, this.icon = Icons.inbox_outlined, required this.message, this.actionLabel, this.onAction, this.title});
  final IconData icon;
  final String? title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(BtaSpace.s6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 40, color: BtaColors.textSubtle),
            const SizedBox(height: BtaSpace.s3),
            if (title != null) ...[Text(title!, style: BtaText.headingSm, textAlign: TextAlign.center), const SizedBox(height: BtaSpace.s1)],
            Text(message, style: BtaText.body.copyWith(color: BtaColors.textMuted), textAlign: TextAlign.center),
            if (actionLabel != null) ...[
              const SizedBox(height: BtaSpace.s4),
              FilledButton(onPressed: onAction, child: Text(actionLabel!)),
            ],
          ],
        ),
      ),
    );
  }
}
