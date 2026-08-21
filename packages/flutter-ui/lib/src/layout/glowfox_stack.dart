import 'package:flutter/material.dart';

/// Thin wrapper around [Stack] for consistent usage.
class GFStack extends StatelessWidget {
  const GFStack({super.key, required this.children, this.alignment = AlignmentDirectional.topStart});

  final List<Widget> children;
  final AlignmentGeometry alignment;

  @override
  Widget build(BuildContext context) => Stack(alignment: alignment, children: children);
}
