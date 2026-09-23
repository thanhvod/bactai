import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../format.dart';
import '../tokens/bta_tokens.dart';
import 'bta_banner.dart';
import 'money_text.dart';

/// Nhập COD thực thu: hiện số dự kiến, ô số thực thu (số nguyên VND, tự chèn dấu chấm), ghi chú,
/// cảnh báo khi khác dự kiến. Khi `previousAmount` != null là chế độ sửa → hiện số cũ/số mới.
class CodInput extends StatefulWidget {
  const CodInput({
    super.key,
    required this.expected,
    this.initialActual,
    this.previousAmount,
    this.onChanged,
    this.noteController,
    this.autofocus = true,
  });

  final int? expected;
  final int? initialActual;
  final int? previousAmount;
  final ValueChanged<int?>? onChanged;
  final TextEditingController? noteController;
  final bool autofocus;

  @override
  State<CodInput> createState() => _CodInputState();
}

class _CodInputState extends State<CodInput> {
  late final TextEditingController _amount;
  int? _value;

  @override
  void initState() {
    super.initState();
    _value = widget.initialActual ?? widget.expected;
    _amount = TextEditingController(text: _value == null ? '' : BtaFormat.vnd(_value, withUnit: false));
  }

  void _onText(String s) {
    final digits = s.replaceAll(RegExp(r'[^0-9]'), '');
    final v = digits.isEmpty ? null : int.tryParse(digits);
    final formatted = v == null ? '' : BtaFormat.vnd(v, withUnit: false);
    if (formatted != s) {
      _amount.value = TextEditingValue(text: formatted, selection: TextSelection.collapsed(offset: formatted.length));
    }
    setState(() => _value = v);
    widget.onChanged?.call(v);
  }

  @override
  Widget build(BuildContext context) {
    final expected = widget.expected ?? 0;
    final differs = _value != null && widget.expected != null && _value != widget.expected;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (widget.previousAmount != null) ...[
          Row(children: [
            Text('Số đã lưu: ', style: BtaText.body.copyWith(color: BtaColors.textMuted)),
            MoneyText(widget.previousAmount, color: BtaColors.textMuted),
          ]),
          const SizedBox(height: BtaSpace.s2),
        ],
        Row(children: [
          Text('Dự kiến thu: ', style: BtaText.body.copyWith(color: BtaColors.textMuted)),
          MoneyText(expected, style: BtaText.mobileKey),
        ]),
        const SizedBox(height: BtaSpace.s3),
        Text('Số tiền thực thu', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
        const SizedBox(height: BtaSpace.s1),
        TextField(
          controller: _amount,
          autofocus: widget.autofocus,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))],
          textAlign: TextAlign.right,
          style: BtaText.displaySm.copyWith(fontFeatures: BtaText.tabular),
          decoration: const InputDecoration(suffixText: 'đ', hintText: '0'),
          onChanged: _onText,
        ),
        if (differs) ...[
          const SizedBox(height: BtaSpace.s2),
          BtaBanner(
            tone: BtaTone.warning,
            message: 'Khác dự kiến ${BtaFormat.vnd((_value ?? 0) - expected)}. Hãy ghi rõ lý do trước khi lưu.',
          ),
        ],
        if (widget.noteController != null) ...[
          const SizedBox(height: BtaSpace.s3),
          TextField(
            controller: widget.noteController,
            minLines: 1,
            maxLines: 3,
            decoration: InputDecoration(hintText: differs ? 'Lý do khác dự kiến (bắt buộc)' : 'Ghi chú (không bắt buộc)'),
          ),
        ],
      ],
    );
  }
}
