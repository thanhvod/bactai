import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';

class WarningLine extends StatelessWidget {
  const WarningLine(this.text, {super.key, this.tone = BtaTone.warning});
  final String text;
  final BtaTone tone;
  @override
  Widget build(BuildContext context) {
    final c = BtaToneColors.of(tone).fg;
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(Icons.warning_amber_rounded, size: 14, color: c),
        const SizedBox(width: 4),
        Expanded(child: Text(text, style: BtaText.caption.copyWith(color: c))),
      ]),
    );
  }
}
