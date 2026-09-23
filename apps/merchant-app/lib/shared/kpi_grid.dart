import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';

/// Lưới KPI 2 cột, chiều cao theo nội dung (không tràn chữ khi font to).
class KpiGrid extends StatelessWidget {
  const KpiGrid({super.key, required this.children});
  final List<Widget> children;
  @override
  Widget build(BuildContext context) => LayoutBuilder(builder: (context, c) {
        final w = (c.maxWidth - BtaSpace.s3) / 2;
        return Wrap(spacing: BtaSpace.s3, runSpacing: BtaSpace.s3, children: [for (final k in children) SizedBox(width: w, child: k)]);
      });
}
