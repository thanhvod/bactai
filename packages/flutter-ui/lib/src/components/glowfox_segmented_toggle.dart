import 'package:flutter/material.dart';

import '../theme/glowfox_colors.dart';
import '../theme/glowfox_typography.dart';

/// A pill-shaped segmented toggle (web-style: grey container + white active pill).
///
/// Usage:
/// ```dart
/// GFSegmentedToggle<MyEnum>(
///   options: const [
///     GFToggleOption(value: MyEnum.a, label: 'A'),
///     GFToggleOption(value: MyEnum.b, label: 'B'),
///   ],
///   selected: current,
///   onChanged: onChanged,
/// )
/// ```
class GFToggleOption<T> {
  const GFToggleOption({required this.value, required this.label, this.icon});
  final T value;
  final String label;

  /// Optional leading icon rendered before the label.
  final IconData? icon;
}

class GFSegmentedToggle<T> extends StatelessWidget {
  const GFSegmentedToggle({
    super.key,
    required this.options,
    required this.selected,
    required this.onChanged,
    this.height = 30,
    this.fullWidth = false,
  });

  final List<GFToggleOption<T>> options;
  final T selected;
  final ValueChanged<T> onChanged;
  final double height;

  /// Stretch the segments to fill the available width, splitting it equally.
  /// Default is content-width (compact) for inline placement in headings.
  final bool fullWidth;

  @override
  Widget build(BuildContext context) {
    Widget segment(GFToggleOption<T> opt) {
      final isSelected = opt.value == selected;
      return GestureDetector(
        onTap: () => onChanged(opt.value),
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeInOut,
          alignment: Alignment.center,
          padding: EdgeInsets.symmetric(
            horizontal: fullWidth ? 8 : 14,
            vertical: 4,
          ),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(9),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.08),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (opt.icon != null) ...[
                Icon(
                  opt.icon,
                  size: 16,
                  color: isSelected
                      ? GFColors.textPrimary
                      : GFColors.textSecondary,
                ),
                const SizedBox(width: 6),
              ],
              Flexible(
                child: Text(
                  opt.label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: (fullWidth ? GFTypography.label : GFTypography.labelSm)
                      .copyWith(
                    color: isSelected
                        ? GFColors.textPrimary
                        : GFColors.textSecondary,
                    fontWeight:
                        isSelected ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      height: height,
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F4F4),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
        children: [
          for (final opt in options)
            if (fullWidth)
              Expanded(child: segment(opt))
            else
              segment(opt),
        ],
      ),
    );
  }
}
