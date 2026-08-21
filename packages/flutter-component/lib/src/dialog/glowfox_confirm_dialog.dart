import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

class GFConfirmDialog extends StatelessWidget {
  const GFConfirmDialog({
    super.key,
    required this.title,
    required this.message,
    this.confirmLabel,
    this.cancelLabel,
    this.isDestructive = false,
  });

  final String title;
  final String message;
  final String? confirmLabel;
  final String? cancelLabel;
  final bool isDestructive;

  @override
  Widget build(BuildContext context) {
    return GFDialog(
      title: title,
      icon: Icon(
        isDestructive ? Icons.warning_amber_rounded : Icons.info_outline,
        color: isDestructive ? GFColors.error : GFColors.primary,
        size: 32,
      ),
      content: Text(message, style: GFTypography.body.copyWith(color: GFColors.textSecondary)),
      actions: [
        GFButton(
          variant: GFButtonVariant.ghost,
          onPressed: () => Navigator.of(context).pop(false),
          child: Text(cancelLabel ?? 'Hủy'),
        ),
        GFButton(
          variant: isDestructive ? GFButtonVariant.destructive : GFButtonVariant.primary,
          onPressed: () => Navigator.of(context).pop(true),
          child: Text(confirmLabel ?? 'Xác nhận'),
        ),
      ],
    );
  }

  /// Shows the dialog and returns `true` if confirmed, `false`/`null` if cancelled.
  static Future<bool?> show({
    required BuildContext context,
    required String title,
    required String message,
    String? confirmLabel,
    String? cancelLabel,
    bool isDestructive = false,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (_) => GFConfirmDialog(
        title: title,
        message: message,
        confirmLabel: confirmLabel,
        cancelLabel: cancelLabel,
        isDestructive: isDestructive,
      ),
    );
  }
}
