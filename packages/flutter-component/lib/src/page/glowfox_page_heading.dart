import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// Standard page heading used at the top of content screens.
///
/// Template: title on the left, optional CTA on the right, optional
/// full-width search field below. Keeps every screen's heading identical
/// in size, weight and spacing.
///
/// ```dart
/// GFPageHeading(
///   title: l10n.customers_title,
///   onAdd: _openCreate,                       // standard + CTA
///   searchField: GFSearchField(               // omit when no search
///     hintText: l10n.customers_search_placeholder,
///     onChanged: onSearch,
///   ),
/// )
/// ```
///
/// For a non-standard CTA pass [action] instead of [onAdd]
/// (e.g. `GFHeadingActionButton(icon: Icons.tune_rounded, onTap: ...)`).
class GFPageHeading extends StatelessWidget {
  const GFPageHeading({
    super.key,
    required this.title,
    this.onAdd,
    this.action,
    this.searchField,
    this.padding = EdgeInsets.zero,
  }) : assert(onAdd == null || action == null,
            'Pass either onAdd (standard + CTA) or a custom action, not both');

  final String title;

  /// Shorthand for the standard `+` CTA on the right.
  final VoidCallback? onAdd;

  /// Custom trailing widget when the screen needs a different CTA.
  final Widget? action;

  /// Optional full-width search input rendered below the title row —
  /// typically a [GFSearchField].
  final Widget? searchField;

  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final trailing =
        action ?? (onAdd != null ? GFHeadingActionButton.add(onTap: onAdd!) : null);

    return Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(title, style: GFTypography.pageTitle),
              ),
              if (trailing != null) trailing,
            ],
          ),
          if (searchField != null) ...[
            const SizedBox(height: GFSpacing.base),
            searchField!,
          ],
        ],
      ),
    );
  }
}

/// Standard heading CTA — 40×40 bordered square button with an icon.
///
/// Use [GFHeadingActionButton.add] for the common `+` (add) action so the
/// icon stays identical across screens.
class GFHeadingActionButton extends StatelessWidget {
  const GFHeadingActionButton({
    super.key,
    required this.icon,
    required this.onTap,
  });

  const GFHeadingActionButton.add({super.key, required this.onTap})
      : icon = Icons.add_rounded;

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: GFColors.surface,
          border: Border.all(color: GFColors.border),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, size: 20, color: GFColors.textPrimary),
      ),
    );
  }
}
