import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// One action button revealed behind a [GFSwipeActionRow].
class GFSwipeAction {
  const GFSwipeAction({
    required this.icon,
    required this.color,
    required this.onTap,
    this.foregroundColor = Colors.white,
    this.label,
  });

  /// Standard "restore" action for deleted-item lists — black block with a
  /// white refresh icon. Use this on every deleted-mode row so the gesture
  /// looks identical across screens (staff, assets, rooms, beds, suppliers…).
  factory GFSwipeAction.restore({required VoidCallback onTap}) =>
      GFSwipeAction(
        icon: Icons.refresh_rounded,
        color: GFColors.charcoal,
        onTap: onTap,
      );

  final IconData icon;
  final Color color;
  final Color foregroundColor;
  final VoidCallback onTap;

  /// Optional multi-line text rendered instead of [icon]
  /// (e.g. "Tiếp tục\ntại POS").
  final String? label;
}

/// List row with swipe-to-reveal actions (edit / delete …).
///
/// The row content slides left to reveal full-height action blocks behind
/// it — triggered by swiping the row or by an external toggle (e.g. a "…"
/// button inside [child] calling [onToggle]).
///
/// State is controlled by the parent ([isOpen] + [onToggle]) so screens can
/// keep a single row open at a time. Tapping the row while open closes it;
/// while closed it fires [onTap].
///
/// ```dart
/// GFSwipeActionRow(
///   height: 88,
///   isOpen: openActionId == item.id,
///   onToggle: () => toggleAction(item.id),
///   onTap: () => openDetail(item),
///   actions: [
///     GFSwipeAction(icon: Icons.edit_outlined, color: GFColors.charcoal, onTap: onEdit),
///     GFSwipeAction(icon: Icons.delete_outline_rounded, color: GFColors.error, onTap: onDelete),
///   ],
///   child: ...,
/// )
/// ```
class GFSwipeActionRow extends StatelessWidget {
  const GFSwipeActionRow({
    super.key,
    required this.child,
    required this.actions,
    required this.isOpen,
    required this.onToggle,
    this.onTap,
    this.height,
    this.backgroundColor = Colors.white,
  });

  final Widget child;
  final List<GFSwipeAction> actions;
  final bool isOpen;
  final VoidCallback onToggle;
  final VoidCallback? onTap;

  /// Fixed row height. When null the row sizes to [child].
  final double? height;

  /// Background of the sliding foreground (matches the list surface).
  final Color backgroundColor;

  static const double _actionWidth = 76;

  double get _revealWidth => actions.length * _actionWidth;

  void _handleDragEnd(DragEndDetails details) {
    final velocity = details.primaryVelocity ?? 0;
    if (velocity < -200 && !isOpen) onToggle();
    if (velocity > 200 && isOpen) onToggle();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: Stack(
        children: [
          // Full-height action blocks revealed behind the row
          Positioned.fill(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (final action in actions)
                  _ActionBlock(
                    action: action,
                    onTap: () {
                      // Slide the row back before running the action.
                      if (isOpen) onToggle();
                      action.onTap();
                    },
                  ),
              ],
            ),
          ),
          // Foreground row (slides left to reveal actions)
          GestureDetector(
            onHorizontalDragEnd: _handleDragEnd,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOut,
              transform: Matrix4.translationValues(
                  isOpen ? -_revealWidth : 0.0, 0, 0),
              color: backgroundColor,
              // Fill the fixed [height] so the white foreground fully covers
              // the action blocks behind it (otherwise a strip of the action
              // background shows below a shorter child).
              child: SizedBox(
                height: height,
                width: double.infinity,
                child: InkWell(
                  onTap: isOpen ? onToggle : onTap,
                  child: child,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionBlock extends StatelessWidget {
  const _ActionBlock({required this.action, required this.onTap});

  final GFSwipeAction action;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: GFSwipeActionRow._actionWidth,
        color: action.color,
        alignment: Alignment.center,
        child: action.label != null
            ? Text(
                action.label!,
                textAlign: TextAlign.center,
                style: GFTypography.labelSm.copyWith(
                  color: action.foregroundColor,
                  fontWeight: FontWeight.w600,
                  height: 1.35,
                ),
              )
            : Icon(action.icon, color: action.foregroundColor, size: 22),
      ),
    );
  }
}
