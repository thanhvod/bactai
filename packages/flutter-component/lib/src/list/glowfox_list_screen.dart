import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// Standard list screen with search bar, optional filter bar, and pull-to-refresh.
class GFListScreen<T> extends StatelessWidget {
  const GFListScreen({
    super.key,
    required this.items,
    required this.itemBuilder,
    this.onRefresh,
    this.searchHint,
    this.onSearchChanged,
    this.filterBar,
    this.padding,
    this.physics,
    this.separatorBuilder,
  });

  final List<T> items;
  final Widget Function(BuildContext context, T item, int index) itemBuilder;
  final Future<void> Function()? onRefresh;
  final String? searchHint;
  final ValueChanged<String>? onSearchChanged;
  final Widget? filterBar;
  final EdgeInsetsGeometry? padding;
  final ScrollPhysics? physics;
  final IndexedWidgetBuilder? separatorBuilder;

  @override
  Widget build(BuildContext context) {
    Widget list = ListView.separated(
      padding: padding ?? const EdgeInsets.all(GFSpacing.base),
      physics: physics,
      itemCount: items.length,
      separatorBuilder: separatorBuilder ??
          (_, __) => const SizedBox(height: GFSpacing.sm),
      itemBuilder: (ctx, i) => itemBuilder(ctx, items[i], i),
    );

    if (onRefresh != null) {
      list = RefreshIndicator(
        color: GFColors.primary,
        onRefresh: onRefresh!,
        child: list,
      );
    }

    if (onSearchChanged != null || filterBar != null) {
      return Column(
        children: [
          if (onSearchChanged != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(
                GFSpacing.base, GFSpacing.sm, GFSpacing.base, 0,
              ),
              child: GFTextField(
                hint: searchHint ?? 'Tìm kiếm...',
                onChanged: onSearchChanged,
                prefixIcon: const Icon(Icons.search, color: GFColors.textTertiary),
              ),
            ),
          if (filterBar != null)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: GFSpacing.sm),
              child: filterBar!,
            ),
          Expanded(child: list),
        ],
      );
    }

    return list;
  }
}
