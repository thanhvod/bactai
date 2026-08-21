import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';

/// Intent of a [GFConfirmModal] — drives the accent colour + default icon.
enum GFConfirmType {
  /// Confirming a benign/positive action → black CTA.
  positive,

  /// Destructive action (delete/cancel) → red CTA.
  negative,
}

/// Bottom-sheet confirmation dialog (slides up from the bottom edge).
///
/// Layout: soft icon badge → title → description → full-width confirm CTA
/// (red for [GFConfirmType.negative], black for [GFConfirmType.positive]) →
/// a cancel text button below.
///
/// ```dart
/// final ok = await GFConfirmModal.show(
///   context: context,
///   type: GFConfirmType.negative,
///   icon: Icons.delete_outline_rounded,
///   title: 'Xóa tài sản này?',
///   description: 'Bạn có thể khôi phục trong mục đã xóa.',
///   confirmLabel: 'Xóa',
///   cancelLabel: 'Hủy',
/// );
/// if (ok) { /* proceed */ }
/// ```
class GFConfirmModal extends StatelessWidget {
  const GFConfirmModal({
    super.key,
    required this.title,
    required this.confirmLabel,
    required this.cancelLabel,
    this.description,
    this.icon,
    this.type = GFConfirmType.positive,
  });

  final String title;
  final String? description;
  final String confirmLabel;
  final String cancelLabel;

  /// Defaults to a trash icon (negative) or a help icon (positive).
  final IconData? icon;
  final GFConfirmType type;

  bool get _negative => type == GFConfirmType.negative;
  Color get _accent => _negative ? GFColors.error : GFColors.charcoal;
  IconData get _effectiveIcon =>
      icon ??
      (_negative ? Icons.delete_outline_rounded : Icons.help_outline_rounded);

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).padding.bottom;

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Padding(
        padding: EdgeInsets.fromLTRB(24, 28, 24, 12 + bottom),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // ── Icon badge (soft ring + soft fill) ─────────────────────
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                    color: _accent.withValues(alpha: 0.12), width: 1),
              ),
              child: Center(
                child: Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _accent.withValues(alpha: 0.12),
                  ),
                  child: Icon(_effectiveIcon, size: 28, color: _accent),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // ── Title ──────────────────────────────────────────────────
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w800,
                color: Color(0xFF111111),
                letterSpacing: -0.2,
              ),
            ),

            // ── Description ────────────────────────────────────────────
            if (description != null) ...[
              const SizedBox(height: 8),
              Text(
                description!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontSize: 14, color: Color(0xFF6B7280), height: 1.5),
              ),
            ],
            const SizedBox(height: 24),

            // ── Confirm CTA ────────────────────────────────────────────
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () => Navigator.of(context).pop(true),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _accent,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                child: Text(
                  confirmLabel,
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w700),
                ),
              ),
            ),
            const SizedBox(height: 4),

            // ── Cancel ─────────────────────────────────────────────────
            SizedBox(
              width: double.infinity,
              height: 48,
              child: TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: Text(
                  cancelLabel,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF111111),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Shows the modal and resolves to `true` when confirmed, `false` when
  /// cancelled or dismissed.
  static Future<bool> show({
    required BuildContext context,
    required String title,
    required String confirmLabel,
    required String cancelLabel,
    String? description,
    IconData? icon,
    GFConfirmType type = GFConfirmType.positive,
    bool isDismissible = true,
  }) async {
    final result = await showModalBottomSheet<bool>(
      context: context,
      // Root navigator so the sheet overlays app-level chrome (e.g. the
      // floating bottom navigation of a shell), not just the tab body.
      useRootNavigator: true,
      isScrollControlled: true,
      isDismissible: isDismissible,
      backgroundColor: Colors.transparent,
      builder: (_) => GFConfirmModal(
        title: title,
        description: description,
        confirmLabel: confirmLabel,
        cancelLabel: cancelLabel,
        icon: icon,
        type: type,
      ),
    );
    return result ?? false;
  }
}
