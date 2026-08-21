import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';
import '../theme/glowfox_typography.dart';

/// Password field with built-in visibility toggle and optional label-row trailing widget.
///
/// Use [labelTrailing] to add a "Forgot?" link aligned right of the label.
class GFPasswordField extends StatefulWidget {
  const GFPasswordField({
    super.key,
    this.controller,
    this.label,
    this.labelTrailing,
    this.hint,
    this.errorText,
    this.enabled = true,
    this.onChanged,
    this.onSubmitted,
    this.textInputAction = TextInputAction.done,
    this.focusNode,
    this.contentPadding,
  });

  final TextEditingController? controller;
  final String? label;

  /// Widget shown on the right side of the label row (e.g. a "Forgot?" link).
  final Widget? labelTrailing;
  final String? hint;
  final String? errorText;
  final bool enabled;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final TextInputAction? textInputAction;
  final FocusNode? focusNode;
  final EdgeInsetsGeometry? contentPadding;

  @override
  State<GFPasswordField> createState() => _GFPasswordFieldState();
}

class _GFPasswordFieldState extends State<GFPasswordField> {
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    final hasLabel = widget.label != null;
    final hasTrailing = widget.labelTrailing != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (hasLabel || hasTrailing) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              if (hasLabel)
                Text(widget.label!, style: GFTypography.label),
              if (hasTrailing) widget.labelTrailing!,
            ],
          ),
          const SizedBox(height: 6),
        ],
        TextField(
          controller: widget.controller,
          onChanged: widget.onChanged,
          onSubmitted: widget.onSubmitted,
          obscureText: _obscure,
          enabled: widget.enabled,
          textInputAction: widget.textInputAction,
          focusNode: widget.focusNode,
          style: GFTypography.body,
          decoration: InputDecoration(
            hintText: widget.hint,
            errorText: widget.errorText,
            contentPadding: widget.contentPadding,
            suffixIcon: GestureDetector(
              onTap: () => setState(() => _obscure = !_obscure),
              child: Icon(
                _obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                size: 20,
                color: GFColors.textSecondary,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: GFColors.border, width: 1),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: GFColors.charcoal, width: 1.5),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: GFColors.error, width: 1),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: GFColors.error, width: 1.5),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: GFColors.border.withOpacity(0.5), width: 1),
            ),
          ),
        ),
      ],
    );
  }
}
