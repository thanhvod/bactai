import 'dart:async';

import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_typography.dart';

enum GFToastVariant { success, error, warning, info }

/// Top-sliding toast overlay — white pill, slides in from above the safe area.
///
/// Usage:
/// ```dart
/// GFToast.success(context, 'Lưu thành công');
/// GFToast.error(context, 'Đã xảy ra lỗi');
/// ```
class GFToast {
  GFToast._();

  static OverlayEntry? _current;

  static void show(
    BuildContext context, {
    required String message,
    GFToastVariant variant = GFToastVariant.success,
    Duration duration = const Duration(seconds: 3),
  }) {
    _dismiss();

    final overlay = Overlay.of(context, rootOverlay: true);
    late OverlayEntry entry;

    entry = OverlayEntry(
      builder: (_) => _GFToastOverlay(
        message: message,
        variant: variant,
        duration: duration,
        onDismiss: () {
          entry.remove();
          if (_current == entry) _current = null;
        },
      ),
    );

    _current = entry;
    overlay.insert(entry);
  }

  static void success(BuildContext context, String message) =>
      show(context, message: message, variant: GFToastVariant.success);

  static void error(BuildContext context, String message) =>
      show(context, message: message, variant: GFToastVariant.error);

  static void warning(BuildContext context, String message) =>
      show(context, message: message, variant: GFToastVariant.warning);

  static void info(BuildContext context, String message) =>
      show(context, message: message, variant: GFToastVariant.info);

  static void _dismiss() {
    _current?.remove();
    _current = null;
  }
}

class _GFToastOverlay extends StatefulWidget {
  const _GFToastOverlay({
    required this.message,
    required this.variant,
    required this.duration,
    required this.onDismiss,
  });

  final String message;
  final GFToastVariant variant;
  final Duration duration;
  final VoidCallback onDismiss;

  @override
  State<_GFToastOverlay> createState() => _GFToastOverlayState();
}

class _GFToastOverlayState extends State<_GFToastOverlay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<Offset> _slide;
  late final Animation<double> _fade;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 320),
      reverseDuration: const Duration(milliseconds: 220),
    );
    _slide = Tween<Offset>(
      begin: const Offset(0, -1.6),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));
    _fade = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);

    _ctrl.forward();
    _timer = Timer(widget.duration, _close);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _ctrl.dispose();
    super.dispose();
  }

  void _close() {
    _timer?.cancel();
    if (!mounted) return;
    _ctrl.reverse().then((_) {
      if (mounted) widget.onDismiss();
    });
  }

  @override
  Widget build(BuildContext context) {
    final topInset = MediaQuery.of(context).padding.top;

    return Positioned(
      top: topInset + 10,
      left: 24,
      right: 24,
      child: SlideTransition(
        position: _slide,
        child: FadeTransition(
          opacity: _fade,
          child: GestureDetector(
            onTap: _close,
            child: _ToastPill(
              message: widget.message,
              variant: widget.variant,
            ),
          ),
        ),
      ),
    );
  }
}

class _ToastPill extends StatelessWidget {
  const _ToastPill({required this.message, required this.variant});

  final String message;
  final GFToastVariant variant;

  @override
  Widget build(BuildContext context) {
    final (icon, iconColor) = _iconStyle();

    return Material(
      color: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(100),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.10),
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 6,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: iconColor, size: 18),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                message,
                style: GFTypography.label.copyWith(
                  color: GFColors.textPrimary,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  (IconData icon, Color color) _iconStyle() => switch (variant) {
        GFToastVariant.success => (Icons.check_circle_rounded, const Color(0xFF16A34A)),
        GFToastVariant.error => (Icons.cancel_rounded, GFColors.error),
        GFToastVariant.warning => (Icons.warning_rounded, GFColors.warning),
        GFToastVariant.info => (Icons.info_rounded, GFColors.info),
      };
}
