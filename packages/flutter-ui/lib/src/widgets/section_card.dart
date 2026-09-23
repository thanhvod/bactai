import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

/// Khối nội dung có viền nhẹ (không đổ bóng, không card lồng card).
class SectionCard extends StatelessWidget {
  const SectionCard({super.key, this.title, this.trailing, required this.child, this.padding = const EdgeInsets.all(BtaSpace.s4), this.onTap});

  final String? title;
  final Widget? trailing;
  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final body = Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (title != null)
            Padding(
              padding: const EdgeInsets.only(bottom: BtaSpace.s3),
              child: Row(children: [Expanded(child: Text(title!, style: BtaText.headingSm)), ?trailing]),
            ),
          child,
        ],
      ),
    );
    return Material(
      color: BtaColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(BtaRadius.lg), side: const BorderSide(color: BtaColors.border)),
      clipBehavior: Clip.antiAlias,
      child: onTap == null ? body : InkWell(onTap: onTap, child: body),
    );
  }
}
