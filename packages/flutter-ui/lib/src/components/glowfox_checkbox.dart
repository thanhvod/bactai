import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_typography.dart';

class GFCheckbox extends StatelessWidget {
  const GFCheckbox({
    super.key,
    required this.value,
    required this.onChanged,
    this.label,
    this.enabled = true,
  });

  final bool value;
  final ValueChanged<bool?> onChanged;
  final String? label;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Checkbox(
          value: value,
          onChanged: enabled ? onChanged : null,
          activeColor: GFColors.primary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        ),
        if (label != null)
          GestureDetector(
            onTap: enabled ? () => onChanged(!value) : null,
            child: Text(
              label!,
              style: GFTypography.body.copyWith(
                color: enabled ? GFColors.textPrimary : GFColors.textDisabled,
              ),
            ),
          ),
      ],
    );
  }
}
