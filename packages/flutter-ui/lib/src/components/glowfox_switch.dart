import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_typography.dart';

/// GlowFox toggle switch — the single source of truth for on/off toggles.
///
/// Consistent across the whole app:
/// - white thumb (on & off)
/// - black track when on ([GFColors.primary])
/// - light-grey track when off ([GFColors.border])
/// - no track outline
/// - one fixed compact size (see [_scale])
///
/// Do NOT use the raw Material [Switch] in feature code — always use [GFSwitch]
/// so size and colour stay identical everywhere.
class GFSwitch extends StatelessWidget {
  const GFSwitch({
    super.key,
    required this.value,
    required this.onChanged,
    this.label,
    this.enabled = true,
  });

  final bool value;

  /// Null (or [enabled] == false) renders the switch in a disabled state.
  final ValueChanged<bool>? onChanged;

  /// Optional leading label. When set, the switch is laid out as a row with the
  /// label taking the remaining width and the control pinned to the right.
  final String? label;

  final bool enabled;

  /// Uniform visual scale so every switch in the app is the same size.
  static const double _scale = 0.8;

  @override
  Widget build(BuildContext context) {
    final effectiveOnChanged =
        enabled && onChanged != null ? onChanged : null;

    final control = Transform.scale(
      scale: _scale,
      child: Switch(
        value: value,
        onChanged: effectiveOnChanged,
        activeThumbColor: GFColors.white,
        activeTrackColor: GFColors.primary,
        inactiveThumbColor: GFColors.white,
        inactiveTrackColor: GFColors.border,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
        trackOutlineColor: WidgetStateProperty.all(Colors.transparent),
      ),
    );

    if (label == null) return control;

    return Row(
      children: [
        Expanded(
          child: Text(
            label!,
            style: GFTypography.body.copyWith(
              color: enabled ? GFColors.textPrimary : GFColors.textTertiary,
            ),
          ),
        ),
        const SizedBox(width: 8),
        control,
      ],
    );
  }
}
