import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

/// Gọi điện (tel:) — tài xế gọi liên hệ điểm dừng / điều phối.
Future<void> callPhone(BuildContext context, String? phone) async {
  if (phone == null || phone.isEmpty) return;
  final ok = await launchUrl(Uri(scheme: 'tel', path: phone.replaceAll(' ', '')));
  if (!ok && context.mounted) showToast(context, 'Không mở được ứng dụng gọi điện', tone: BtaTone.danger);
}

/// Chỉ đường: có tọa độ → Google Maps theo lat/lng; không có → tìm theo địa chỉ.
Future<void> openDirections(BuildContext context, {double? lat, double? lng, required String address}) async {
  final dest = lat != null && lng != null ? '$lat,$lng' : address;
  final uri = Uri.https('www.google.com', '/maps/dir/', {'api': '1', 'destination': dest, 'travelmode': 'driving'});
  final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!ok && context.mounted) showToast(context, 'Không mở được bản đồ', tone: BtaTone.danger);
}

void showToast(BuildContext context, String message, {BtaTone tone = BtaTone.success}) {
  final c = BtaToneColors.of(tone);
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Text(message, style: BtaText.body.copyWith(color: c.fg)),
      backgroundColor: c.bg,
      behavior: SnackBarBehavior.floating,
      duration: Duration(seconds: tone == BtaTone.danger ? 5 : 3),
    ));
}

/// Hàng label–value trong section chi tiết.
class InfoRow extends StatelessWidget {
  const InfoRow(this.label, this.value, {super.key, this.valueWidget});
  final String label;
  final String? value;
  final Widget? valueWidget;

  @override
  Widget build(BuildContext context) {
    if (valueWidget == null && (value == null || value!.isEmpty)) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        SizedBox(width: 112, child: Text(label, style: BtaText.bodySm.copyWith(color: BtaColors.textMuted))),
        Expanded(child: valueWidget ?? Text(value!, style: BtaText.body)),
      ]),
    );
  }
}
