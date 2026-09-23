import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Nhập tiền VND số nguyên, hiển thị dấu chấm nghìn.
class MoneyField extends StatefulWidget {
  const MoneyField({super.key, required this.label, required this.onChanged, this.initial, this.validator, this.fieldKey});
  final String label;
  final int? initial;
  final ValueChanged<int?> onChanged;
  final String? Function(int?)? validator;
  final Key? fieldKey;
  @override
  State<MoneyField> createState() => _MoneyFieldState();
}

int? parseMoneyText(String s) {
  final digits = s.replaceAll(RegExp(r'[^0-9]'), '');
  return digits.isEmpty ? null : int.parse(digits);
}

class _ThousandsFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final v = parseMoneyText(newValue.text);
    if (v == null) return const TextEditingValue();
    final text = BtaFormat.vnd(v, withUnit: false);
    return TextEditingValue(text: text, selection: TextSelection.collapsed(offset: text.length));
  }
}

class _MoneyFieldState extends State<MoneyField> {
  late final TextEditingController _c = TextEditingController(text: widget.initial == null ? '' : BtaFormat.vnd(widget.initial, withUnit: false));

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => TextFormField(
        key: widget.fieldKey,
        controller: _c,
        keyboardType: TextInputType.number,
        textAlign: TextAlign.right,
        inputFormatters: [_ThousandsFormatter()],
        decoration: InputDecoration(labelText: widget.label, suffixText: 'đ', border: const OutlineInputBorder()),
        onChanged: (s) => widget.onChanged(parseMoneyText(s)),
        validator: widget.validator == null ? null : (s) => widget.validator!(parseMoneyText(s ?? '')),
      );
}
