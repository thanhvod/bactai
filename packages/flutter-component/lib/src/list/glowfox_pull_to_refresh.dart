import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// GlowFox pull-to-refresh wrapper around a sliver scroll view.
///
/// Standardizes the refresh UX across screens:
/// - GlowFox indicator colors (charcoal spinner on white).
/// - `AlwaysScrollableScrollPhysics` so short content can still be pulled
///   down to refresh (a plain `CustomScrollView` cannot).
///
/// ```dart
/// GFPullToRefresh(
///   onRefresh: () => ref.read(provider.notifier).refresh(),
///   slivers: [
///     SliverToBoxAdapter(child: ...),
///     ...
///   ],
/// )
/// ```
class GFPullToRefresh extends StatelessWidget {
  const GFPullToRefresh({
    super.key,
    required this.onRefresh,
    required List<Widget> this.slivers,
    this.controller,
    this.color,
    this.backgroundColor,
  }) : child = null;

  /// Wraps an existing scrollable (ListView, GridView, …) instead of
  /// building a CustomScrollView. The child must be scrollable and should
  /// use `AlwaysScrollableScrollPhysics` so short content can still be
  /// pulled down.
  const GFPullToRefresh.child({
    super.key,
    required this.onRefresh,
    required Widget this.child,
    this.color,
    this.backgroundColor,
  })  : slivers = null,
        controller = null;

  /// Awaited by the indicator — keep it running until data is reloaded.
  final Future<void> Function() onRefresh;

  /// Content of the underlying [CustomScrollView] (sliver mode).
  final List<Widget>? slivers;

  /// Pre-built scrollable (box mode).
  final Widget? child;

  final ScrollController? controller;

  /// Spinner color — defaults to [GFColors.charcoal].
  final Color? color;

  /// Indicator disc color — defaults to [GFColors.surface].
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      color: color ?? GFColors.charcoal,
      backgroundColor: backgroundColor ?? GFColors.surface,
      child: child ??
          CustomScrollView(
            controller: controller,
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: slivers!,
          ),
    );
  }
}
