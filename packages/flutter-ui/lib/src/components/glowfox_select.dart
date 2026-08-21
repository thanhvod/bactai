import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_typography.dart';

class GFSelectOption<T> {
  const GFSelectOption({required this.value, required this.label, this.icon});

  final T value;
  final String label;
  final Widget? icon;
}

class GFSelect<T> extends StatelessWidget {
  const GFSelect({
    super.key,
    required this.options,
    required this.onChanged,
    this.value,
    this.label,
    this.hint,
    this.enabled = true,
    this.menuMaxHeight = 320,
    this.required = false,
  });

  final List<GFSelectOption<T>> options;
  final ValueChanged<T?> onChanged;
  final T? value;
  final String? label;
  final String? hint;
  final bool enabled;
  final bool required;

  /// Caps the dropdown menu height so long option lists scroll instead of
  /// covering the whole screen. Null = platform default (unbounded).
  final double? menuMaxHeight;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (label != null) ...[
          required
              ? RichText(
                  text: TextSpan(
                    style: GFTypography.label,
                    children: [
                      TextSpan(text: label!),
                      const TextSpan(
                        text: ' *',
                        style: TextStyle(color: GFColors.error),
                      ),
                    ],
                  ),
                )
              : Text(label!, style: GFTypography.label),
          const SizedBox(height: 6),
        ],
        DropdownButtonFormField<T>(
          value: value,
          onChanged: enabled ? onChanged : null,
          // Fill the field width instead of sizing to the widest option —
          // long option labels would otherwise overflow the button.
          isExpanded: true,
          menuMaxHeight: menuMaxHeight,
          hint: hint != null
              ? Text(
                  hint!,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style:
                      GFTypography.body.copyWith(color: GFColors.textTertiary),
                )
              : null,
          style: GFTypography.body,
          decoration: InputDecoration(
            enabled: enabled,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            border: OutlineInputBorder(
              borderRadius: const BorderRadius.all(Radius.circular(10)),
              borderSide: const BorderSide(color: GFColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: const BorderRadius.all(Radius.circular(10)),
              borderSide: const BorderSide(color: GFColors.border),
            ),
          ),
          items: options
              .map(
                (opt) => DropdownMenuItem<T>(
                  value: opt.value,
                  child: Row(
                    children: [
                      if (opt.icon != null) ...[opt.icon!, const SizedBox(width: 8)],
                      Flexible(
                        child: Text(
                          opt.label,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              )
              .toList(),
        ),
      ],
    );
  }
}
