import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

/// KPI nhỏ (App Merchant home/finance). Không đổ bóng.
class KpiTile extends StatelessWidget {
  const KpiTile({super.key, required this.label, required this.value, this.sub, this.tone = BtaTone.neutral, this.onTap});
  final String label;
  final String value;
  final String? sub;
  final BtaTone tone;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final c = BtaToneColors.of(tone);
    return Material(
      color: BtaColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(BtaRadius.lg), side: const BorderSide(color: BtaColors.border)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(BtaSpace.s3),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(label, maxLines: 2, overflow: TextOverflow.ellipsis, style: BtaText.caption.copyWith(color: BtaColors.textMuted)),
              const SizedBox(height: BtaSpace.s1),
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(value, maxLines: 1, style: BtaText.headingLg.copyWith(color: tone == BtaTone.neutral ? BtaColors.text : c.fg, fontFeatures: BtaText.tabular)),
              ),
              if (sub != null) Text(sub!, maxLines: 2, overflow: TextOverflow.ellipsis, style: BtaText.bodySm.copyWith(color: BtaColors.textSubtle)),
            ],
          ),
        ),
      ),
    );
  }
}
