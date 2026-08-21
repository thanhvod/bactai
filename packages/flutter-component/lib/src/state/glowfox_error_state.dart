import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

class GFErrorState extends StatelessWidget {
  const GFErrorState({
    super.key,
    this.message,
    this.onRetry,
    this.retryLabel,
  });

  final String? message;
  final VoidCallback? onRetry;
  final String? retryLabel;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(GFSpacing.xl2),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: GFColors.error),
            const SizedBox(height: GFSpacing.base),
            Text(
              message ?? 'Đã xảy ra lỗi. Vui lòng thử lại.',
              style: GFTypography.body.copyWith(color: GFColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: GFSpacing.xl),
              GFButton(
                onPressed: onRetry,
                variant: GFButtonVariant.outline,
                icon: const Icon(Icons.refresh, size: 16),
                child: Text(retryLabel ?? 'Thử lại'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
