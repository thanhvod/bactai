import 'package:flutter/material.dart';
import '../theme/glowfox_colors.dart';

/// Standard full-width search input used under page headings.
///
/// Consistent everywhere: 12px radius, light border, search icon prefix,
/// clear (×) suffix while the field has text. Pass an external [controller]
/// when the screen needs to read/reset the query; otherwise the field manages
/// its own controller internally.
class GFSearchField extends StatefulWidget {
  const GFSearchField({
    super.key,
    required this.hintText,
    this.controller,
    this.focusNode,
    this.onChanged,
    this.autofocus = false,
    this.enabled = true,
    this.isLoading = false,
  });

  final String hintText;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final ValueChanged<String>? onChanged;
  final bool autofocus;
  final bool enabled;

  /// Shows a small spinner in place of the clear button while a search
  /// request triggered by this field is in flight.
  final bool isLoading;

  @override
  State<GFSearchField> createState() => _GFSearchFieldState();
}

class _GFSearchFieldState extends State<GFSearchField> {
  TextEditingController? _internalController;

  TextEditingController get _controller =>
      widget.controller ?? (_internalController ??= TextEditingController());

  @override
  void dispose() {
    _internalController?.dispose();
    super.dispose();
  }

  void _clear() {
    _controller.clear();
    widget.onChanged?.call('');
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _controller,
      builder: (context, _) {
        return TextField(
          controller: _controller,
          focusNode: widget.focusNode,
          onChanged: widget.onChanged,
          autofocus: widget.autofocus,
          enabled: widget.enabled,
          style: const TextStyle(fontSize: 14),
          decoration: InputDecoration(
            hintText: widget.hintText,
            hintStyle:
                const TextStyle(color: GFColors.textTertiary, fontSize: 14),
            prefixIcon: const Icon(Icons.search_rounded,
                color: GFColors.textTertiary, size: 20),
            suffixIcon: widget.isLoading
                ? const Padding(
                    padding: EdgeInsets.all(14),
                    child: SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: GFColors.textTertiary,
                      ),
                    ),
                  )
                : _controller.text.isNotEmpty
                    ? GestureDetector(
                        onTap: _clear,
                        child: const Icon(Icons.cancel_rounded,
                            color: GFColors.textTertiary, size: 18),
                      )
                    : null,
            filled: true,
            fillColor: GFColors.surface,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: GFColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: GFColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: GFColors.borderStrong),
            ),
          ),
        );
      },
    );
  }
}
