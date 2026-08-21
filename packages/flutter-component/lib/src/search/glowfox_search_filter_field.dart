import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// One selectable value inside a [GFSearchFilter].
class GFFilterOption {
  const GFFilterOption({required this.value, required this.label});

  final String value;
  final String label;
}

/// A filter category shown in the dropdown root menu
/// (e.g. "Tìm kiếm theo trạng thái").
class GFSearchFilter {
  const GFSearchFilter({
    required this.id,
    required this.label,
    this.icon,
    required this.options,
    this.allLabel,
  });

  final String id;
  final String label;
  final IconData? icon;
  final List<GFFilterOption> options;

  /// When set, an "all" row is rendered first in the option list
  /// (e.g. "Tất cả trạng thái"). It shows the tick while the filter has no
  /// selection and tapping it reports through [GFSearchFilterField.onClearFilter].
  final String? allLabel;
}

/// Search field with an attached filter dropdown — the shared search+filter
/// flow used across list screens.
///
/// Flow: focusing the field opens a dropdown listing [filters]; tapping a
/// filter drills into its option list; tapping an option toggles it (tick on
/// the right); the header row offers back (to the filter list) and ✓ (close).
///
/// The widget is presentation-only: selection state lives in the parent via
/// [selected] and every tap reports through [onToggleOption].
///
/// ```dart
/// GFSearchFilterField(
///   controller: _searchCtrl,
///   hintText: l10n.assets_search_placeholder,
///   onChanged: onSearch,
///   backLabel: l10n.common_filter_back,
///   filters: [
///     GFSearchFilter(
///       id: 'status',
///       label: l10n.assets_filter_by_status,
///       icon: Icons.sell_outlined,
///       options: [...],
///     ),
///   ],
///   selected: {'status': {'USING'}},
///   onToggleOption: (filterId, value) => ...,
/// )
/// ```
class GFSearchFilterField extends StatefulWidget {
  const GFSearchFilterField({
    super.key,
    required this.hintText,
    this.controller,
    this.onChanged,
    required this.filters,
    required this.selected,
    required this.onToggleOption,
    this.onClearFilter,
    this.backLabel = 'Quay lại',
    this.isLoading = false,
  });

  final String hintText;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;

  /// Shows a small spinner in the field while a request it triggered is in
  /// flight (search debounce, filter change, …).
  final bool isLoading;

  /// Filter categories shown in the dropdown root menu.
  final List<GFSearchFilter> filters;

  /// Currently selected option values, keyed by filter id.
  final Map<String, Set<String>> selected;

  /// Called when the user taps an option — parent decides toggle semantics
  /// (single-select screens replace, multi-select screens toggle).
  final void Function(String filterId, String value) onToggleOption;

  /// Called when the user taps a filter's "all" row (see
  /// [GFSearchFilter.allLabel]) — parent clears that filter's selection.
  final void Function(String filterId)? onClearFilter;

  /// Label for the back row inside an option list.
  final String backLabel;

  @override
  State<GFSearchFilterField> createState() => _GFSearchFilterFieldState();
}

class _GFSearchFilterFieldState extends State<GFSearchFilterField> {
  final _link = LayerLink();
  final _overlayController = OverlayPortalController();
  final _focusNode = FocusNode();
  String? _activeFilterId;
  double _fieldWidth = 0;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_handleFocusChange);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_handleFocusChange);
    _focusNode.dispose();
    super.dispose();
  }

  void _handleFocusChange() {
    if (_focusNode.hasFocus && widget.filters.isNotEmpty) {
      setState(() => _activeFilterId = null);
      _overlayController.show();
    }
  }

  void _close() {
    if (_overlayController.isShowing) _overlayController.hide();
    _activeFilterId = null;
    _focusNode.unfocus();
  }

  GFSearchFilter? get _activeFilter {
    if (_activeFilterId == null) return null;
    for (final f in widget.filters) {
      if (f.id == _activeFilterId) return f;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      _fieldWidth = constraints.maxWidth;
      return OverlayPortal(
        controller: _overlayController,
        overlayChildBuilder: _buildDropdown,
        child: TapRegion(
          groupId: this,
          child: CompositedTransformTarget(
            link: _link,
            child: GFSearchField(
              controller: widget.controller,
              focusNode: _focusNode,
              hintText: widget.hintText,
              onChanged: widget.onChanged,
              isLoading: widget.isLoading,
            ),
          ),
        ),
      );
    });
  }

  Widget _buildDropdown(BuildContext context) {
    final active = _activeFilter;
    return Positioned(
      width: _fieldWidth,
      child: CompositedTransformFollower(
        link: _link,
        showWhenUnlinked: false,
        targetAnchor: Alignment.bottomLeft,
        followerAnchor: Alignment.topLeft,
        offset: const Offset(0, 4),
        child: TapRegion(
          groupId: this,
          onTapOutside: (_) => _close(),
          child: Material(
            color: GFColors.surface,
            elevation: 6,
            shadowColor: Colors.black26,
            borderRadius: BorderRadius.circular(14),
            clipBehavior: Clip.antiAlias,
            child: Container(
              decoration: BoxDecoration(
                border: Border.all(color: GFColors.border),
                borderRadius: BorderRadius.circular(14),
              ),
              constraints: const BoxConstraints(maxHeight: 320),
              child: active == null
                  ? _FilterRootMenu(
                      filters: widget.filters,
                      onSelect: (id) =>
                          setState(() => _activeFilterId = id),
                    )
                  : _FilterValuesMenu(
                      filter: active,
                      selected: widget.selected[active.id] ?? const {},
                      backLabel: widget.backLabel,
                      onBack: () => setState(() => _activeFilterId = null),
                      onDone: _close,
                      onToggle: (value) =>
                          widget.onToggleOption(active.id, value),
                      onClear: widget.onClearFilter != null
                          ? () => widget.onClearFilter!(active.id)
                          : null,
                    ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Root menu: filter categories ─────────────────────────────────────────────

class _FilterRootMenu extends StatelessWidget {
  const _FilterRootMenu({required this.filters, required this.onSelect});

  final List<GFSearchFilter> filters;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final f in filters)
            InkWell(
              onTap: () => onSelect(f.id),
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                child: Row(
                  children: [
                    Icon(f.icon ?? Icons.filter_list_rounded,
                        size: 18, color: GFColors.textSecondary),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(f.label,
                          style: GFTypography.body,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ─── Values menu: back header + option list with ticks ────────────────────────

class _FilterValuesMenu extends StatelessWidget {
  const _FilterValuesMenu({
    required this.filter,
    required this.selected,
    required this.backLabel,
    required this.onBack,
    required this.onDone,
    required this.onToggle,
    this.onClear,
  });

  final GFSearchFilter filter;
  final Set<String> selected;
  final String backLabel;
  final VoidCallback onBack;
  final VoidCallback onDone;
  final ValueChanged<String> onToggle;
  final VoidCallback? onClear;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Header: back + done
        Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: onBack,
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 10),
                  child: Row(
                    children: [
                      const Icon(Icons.chevron_left_rounded,
                          size: 20, color: GFColors.textSecondary),
                      const SizedBox(width: 2),
                      Text(backLabel,
                          style: GFTypography.body
                              .copyWith(color: GFColors.textSecondary)),
                    ],
                  ),
                ),
              ),
            ),
            InkWell(
              onTap: onDone,
              child: const Padding(
                padding: EdgeInsets.all(10),
                child: Icon(Icons.check_rounded,
                    size: 18, color: GFColors.textPrimary),
              ),
            ),
          ],
        ),
        const Divider(height: 1, color: GFColors.border),
        // Options
        Flexible(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (filter.allLabel != null)
                  InkWell(
                    onTap: onClear,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 11),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(filter.allLabel!,
                                style: GFTypography.body,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis),
                          ),
                          _CheckboxIcon(checked: selected.isEmpty),
                        ],
                      ),
                    ),
                  ),
                for (final option in filter.options)
                  InkWell(
                    onTap: () => onToggle(option.value),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 11),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(option.label,
                                style: GFTypography.body,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis),
                          ),
                          _CheckboxIcon(
                              checked: selected.contains(option.value)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _CheckboxIcon extends StatelessWidget {
  const _CheckboxIcon({required this.checked});

  final bool checked;

  @override
  Widget build(BuildContext context) {
    return Icon(
      checked ? Icons.check_box_rounded : Icons.check_box_outline_blank_rounded,
      size: 20,
      color: checked ? GFColors.textPrimary : GFColors.textTertiary,
    );
  }
}
