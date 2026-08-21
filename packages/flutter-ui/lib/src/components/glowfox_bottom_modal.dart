import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_spacing.dart';
import '../theme/glowfox_typography.dart';

/// General-purpose bottom modal that slides up from the bottom edge,
/// spans full width, and pins to the bottom of the screen.
///
/// Unlike [GFSheet] (which uses [DraggableScrollableSheet] and has side margins),
/// this component is a fixed-height sheet designed for menus, pickers, and
/// simple selection flows. It does not drag/resize.
///
/// Usage:
/// ```dart
/// GFBottomModal.show(
///   context: context,
///   title: 'Chọn mã quốc gia',
///   child: MyListWidget(),
/// );
/// ```
class GFBottomModal extends StatelessWidget {
  const GFBottomModal({
    super.key,
    required this.child,
    this.title,
    this.description,
    this.trailing,
    this.footer,
    this.contentPadding,
    this.showHandle = true,
    this.maxHeightFactor = 0.72,
  });

  final Widget child;

  /// Optional title shown below the drag handle.
  final String? title;

  /// Optional subtitle shown below the title.
  final String? description;

  /// Optional widget placed to the right of the title (e.g. an add button).
  final Widget? trailing;

  /// Optional sticky footer pinned above the safe area.
  final Widget? footer;

  /// Padding around the scrollable [child]. Defaults to horizontal 16, vertical 8.
  final EdgeInsetsGeometry? contentPadding;

  /// Whether to show the drag handle pill at the top. Defaults to true.
  final bool showHandle;

  /// Maximum sheet height as a fraction of screen height. Defaults to 0.72.
  final double maxHeightFactor;

  static const BorderRadius _topRadius = BorderRadius.only(
    topLeft: Radius.circular(20),
    topRight: Radius.circular(20),
  );

  @override
  Widget build(BuildContext context) {
    final maxHeight = MediaQuery.of(context).size.height * maxHeightFactor;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return ConstrainedBox(
      constraints: BoxConstraints(maxHeight: maxHeight),
      child: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: _topRadius,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Drag handle ────────────────────────────────────────────
            if (showHandle) _Handle(),

            // ── Header ─────────────────────────────────────────────────
            if (title != null)
              Padding(
                padding: EdgeInsets.fromLTRB(
                  GFSpacing.base,
                  showHandle ? 4 : GFSpacing.base,
                  GFSpacing.base,
                  12,
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(title!, style: GFTypography.h3),
                          if (description != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              description!,
                              style: GFTypography.body.copyWith(
                                color: GFColors.textSecondary,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    if (trailing != null) ...[
                      const SizedBox(width: 12),
                      trailing!,
                    ],
                  ],
                ),
              ),

            // ── Scrollable content ─────────────────────────────────────
            Flexible(
              child: SingleChildScrollView(
                padding: contentPadding ??
                    const EdgeInsets.symmetric(
                      horizontal: GFSpacing.base,
                      vertical: GFSpacing.base,
                    ),
                child: child,
              ),
            ),

            // ── Footer ─────────────────────────────────────────────────
            if (footer != null) ...[
              const Divider(height: 1, color: GFColors.border),
              Padding(
                padding: EdgeInsets.fromLTRB(
                  GFSpacing.base,
                  GFSpacing.sm,
                  GFSpacing.base,
                  GFSpacing.base + bottomPadding,
                ),
                child: footer!,
              ),
            ] else
              SizedBox(height: bottomPadding > 0 ? bottomPadding : GFSpacing.sm),
          ],
        ),
      ),
    );
  }

  /// Show this modal as a bottom sheet.
  ///
  /// Returns the value passed to [Navigator.pop] when the sheet is dismissed,
  /// or `null` if dismissed by tapping the barrier.
  static Future<T?> show<T>({
    required BuildContext context,
    required Widget child,
    String? title,
    String? description,
    Widget? trailing,
    Widget? footer,
    EdgeInsetsGeometry? contentPadding,
    bool showHandle = true,
    double maxHeightFactor = 0.72,
    bool isDismissible = true,
    bool enableDrag = true,
  }) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: true,
      isDismissible: isDismissible,
      enableDrag: enableDrag,
      backgroundColor: Colors.transparent,
      builder: (_) => GFBottomModal(
        title: title,
        description: description,
        trailing: trailing,
        footer: footer,
        contentPadding: contentPadding,
        showHandle: showHandle,
        maxHeightFactor: maxHeightFactor,
        child: child,
      ),
    );
  }
}

class _Handle extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Center(
        child: Container(
          width: 36,
          height: 4,
          decoration: BoxDecoration(
            color: GFColors.borderStrong,
            borderRadius: BorderRadius.circular(9999),
          ),
        ),
      ),
    );
  }
}
