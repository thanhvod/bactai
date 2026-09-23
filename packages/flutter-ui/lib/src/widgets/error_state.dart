import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

/// Lỗi tải dữ liệu — nói rõ lỗi, có nút thử lại.
class ErrorState extends StatelessWidget {
  const ErrorState({super.key, required this.message, this.onRetry, this.title = 'Không tải được dữ liệu'});
  final String title;
  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(BtaSpace.s6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 40, color: BtaColors.danger),
            const SizedBox(height: BtaSpace.s3),
            Text(title, style: BtaText.headingSm, textAlign: TextAlign.center),
            const SizedBox(height: BtaSpace.s1),
            Text(message, style: BtaText.body.copyWith(color: BtaColors.textMuted), textAlign: TextAlign.center),
            if (onRetry != null) ...[
              const SizedBox(height: BtaSpace.s4),
              OutlinedButton.icon(onPressed: onRetry, icon: const Icon(Icons.refresh), label: const Text('Thử lại')),
            ],
          ],
        ),
      ),
    );
  }
}
