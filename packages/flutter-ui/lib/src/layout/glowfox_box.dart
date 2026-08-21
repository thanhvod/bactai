import 'package:flutter/material.dart';

/// Convenience wrapper providing directional spacing shortcuts.
class GFBox extends StatelessWidget {
  const GFBox({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.color,
    this.width,
    this.height,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? color;
  final double? width;
  final double? height;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      margin: margin,
      color: color,
      width: width,
      height: height,
      child: child,
    );
  }
}
