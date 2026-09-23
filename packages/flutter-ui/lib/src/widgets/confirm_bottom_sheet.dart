import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

/// Xác nhận nhanh (đổi trạng thái, hoàn thành điểm...). Trả về true nếu xác nhận.
Future<bool> showConfirmBottomSheet(
  BuildContext context, {
  required String title,
  String? message,
  String confirmLabel = 'Xác nhận',
  String cancelLabel = 'Hủy',
  bool destructive = false,
  Widget? content,
}) async {
  final r = await showModalBottomSheet<bool>(
    context: context,
    backgroundColor: BtaColors.surface,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(BtaRadius.lg))),
    builder: (ctx) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(BtaSpace.s4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(title, style: BtaText.headingMd),
            if (message != null) ...[const SizedBox(height: BtaSpace.s2), Text(message, style: BtaText.body.copyWith(color: BtaColors.textMuted))],
            if (content != null) ...[const SizedBox(height: BtaSpace.s3), content],
            const SizedBox(height: BtaSpace.s4),
            Row(
              children: [
                Expanded(child: OutlinedButton(onPressed: () => Navigator.of(ctx).pop(false), child: Text(cancelLabel))),
                const SizedBox(width: BtaSpace.s3),
                Expanded(
                  flex: 2,
                  child: FilledButton(
                    onPressed: () => Navigator.of(ctx).pop(true),
                    style: destructive ? FilledButton.styleFrom(backgroundColor: BtaColors.danger) : null,
                    child: Text(confirmLabel),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  );
  return r ?? false;
}
