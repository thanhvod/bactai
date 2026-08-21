import 'package:flutter/material.dart';
import 'package:flutter_ui/flutter_ui.dart';

/// Pins the page's search field to the top of a [CustomScrollView] while the
/// title row above it scrolls away.
///
/// Place right after the title sliver:
/// ```dart
/// CustomScrollView(slivers: [
///   SliverToBoxAdapter(child: GFPageHeading(title: ..., onAdd: ...)),
///   GFStickySearchHeader(child: GFSearchField(...)),
///   // content slivers…
/// ])
/// ```
class GFStickySearchHeader extends StatelessWidget {
  const GFStickySearchHeader({
    super.key,
    required this.child,
    this.backgroundColor = GFShellStyle.sheetColor,
    this.height = 74,
    this.padding = const EdgeInsets.fromLTRB(
        GFSpacing.base, GFSpacing.base, GFSpacing.base, GFSpacing.md),
  });

  final Widget child;

  /// Painted behind the pinned field so list content scrolls under it.
  final Color backgroundColor;

  /// Total pinned extent — must cover [padding] plus the field's height.
  final double height;

  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return SliverPersistentHeader(
      pinned: true,
      delegate: _StickySearchHeaderDelegate(
        child: child,
        backgroundColor: backgroundColor,
        height: height,
        padding: padding,
      ),
    );
  }
}

class _StickySearchHeaderDelegate extends SliverPersistentHeaderDelegate {
  const _StickySearchHeaderDelegate({
    required this.child,
    required this.backgroundColor,
    required this.height,
    required this.padding,
  });

  final Widget child;
  final Color backgroundColor;
  final double height;
  final EdgeInsetsGeometry padding;

  @override
  double get minExtent => height;

  @override
  double get maxExtent => height;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: backgroundColor,
      padding: padding,
      alignment: Alignment.topCenter,
      child: child,
    );
  }

  @override
  bool shouldRebuild(_StickySearchHeaderDelegate oldDelegate) =>
      child != oldDelegate.child ||
      backgroundColor != oldDelegate.backgroundColor ||
      height != oldDelegate.height ||
      padding != oldDelegate.padding;
}
