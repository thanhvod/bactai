import 'package:flutter/material.dart';
import '../format.dart';
import '../tokens/bta_tokens.dart';

/// Tiền VND số nguyên: `1.250.000 đ`, tabular figures.
class MoneyText extends StatelessWidget {
  const MoneyText(this.value, {super.key, this.style, this.color, this.withUnit = true, this.textAlign});

  final num? value;
  final TextStyle? style;
  final Color? color;
  final bool withUnit;
  final TextAlign? textAlign;

  @override
  Widget build(BuildContext context) {
    final base = style ?? BtaText.bodyStrong;
    return Text(
      BtaFormat.vnd(value, withUnit: withUnit),
      textAlign: textAlign,
      style: base.copyWith(color: color ?? base.color ?? BtaColors.text, fontFeatures: BtaText.tabular),
    );
  }
}
