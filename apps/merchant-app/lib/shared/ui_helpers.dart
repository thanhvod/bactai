import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/api/merchant_graphql_client.dart';

StatusBadge orderBadge(String status, {bool compact = true}) {
  final m = orderStatusMeta[orderStatusFromApi(status)];
  return StatusBadge(label: m?.label ?? status, tone: m?.tone ?? BtaTone.neutral, compact: compact);
}

StatusBadge tripBadge(String status, {bool compact = true}) {
  final m = tripStatusMeta[tripStatusFromApi(status)];
  return StatusBadge(label: m?.label ?? status, tone: m?.tone ?? BtaTone.neutral, compact: compact);
}

StatusBadge stopBadge(String status) {
  final m = stopStatusMeta[stopStatusFromApi(status)];
  return StatusBadge(label: m?.label ?? status, tone: m?.tone ?? BtaTone.neutral, compact: true);
}

String tripStatusLabel(String s) => tripStatusMeta[tripStatusFromApi(s)]?.label ?? s;
String orderStatusLabel(String s) => orderStatusMeta[orderStatusFromApi(s)]?.label ?? s;

Future<void> callPhone(BuildContext context, String? phone) async {
  if (phone == null || phone.isEmpty) return;
  final uri = Uri(scheme: 'tel', path: phone.replaceAll(' ', ''));
  if (!await launchUrl(uri) && context.mounted) {
    showSnack(context, 'Không mở được cuộc gọi tới $phone');
  }
}

void showSnack(BuildContext context, String message, {bool error = false}) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message), backgroundColor: error ? BtaColors.danger : null));
}

/// Chạy action async: bắt lỗi → snackbar; trả true nếu thành công.
Future<bool> runAction(BuildContext context, Future<void> Function() action, {String? success}) async {
  try {
    await action();
    if (context.mounted && success != null) showSnack(context, success);
    return true;
  } catch (e) {
    if (context.mounted) showSnack(context, errorMessage(e), error: true);
    return false;
  }
}

/// Dòng label – value gọn cho mobile.
class InfoRow extends StatelessWidget {
  const InfoRow(this.label, this.value, {super.key, this.valueWidget});
  final String label;
  final String? value;
  final Widget? valueWidget;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(width: 120, child: Text(label, style: BtaText.bodySm.copyWith(color: BtaColors.textMuted))),
          Expanded(child: valueWidget ?? Text(value ?? '—', style: BtaText.body)),
        ]),
      );
}

/// Dòng tiền label – số, căn phải.
class MoneyRow extends StatelessWidget {
  const MoneyRow(this.label, this.amount, {super.key, this.tone, this.strong = false});
  final String label;
  final int amount;
  final Color? tone;
  final bool strong;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 3),
        child: Row(children: [
          Expanded(child: Text(label, style: (strong ? BtaText.bodyStrong : BtaText.body).copyWith(color: strong ? null : BtaColors.textMuted))),
          MoneyText(amount, color: tone, style: strong ? BtaText.bodyStrong : BtaText.body),
        ]),
      );
}

/// Chip lọc đơn giản (FilterChip Material).
class FilterChipsBar extends StatelessWidget {
  const FilterChipsBar({super.key, required this.options, required this.value, required this.onChanged});
  final Map<String, String> options;
  final String value;
  final ValueChanged<String> onChanged;
  @override
  Widget build(BuildContext context) => SizedBox(
        height: 48,
        child: ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: BtaSpace.s4, vertical: BtaSpace.s2),
          children: [
            for (final e in options.entries)
              Padding(
                padding: const EdgeInsets.only(right: BtaSpace.s2),
                child: ChoiceChip(label: Text(e.value), selected: value == e.key, onSelected: (_) => onChanged(e.key)),
              ),
          ],
        ),
      );
}
