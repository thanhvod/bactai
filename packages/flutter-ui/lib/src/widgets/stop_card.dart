import 'package:flutter/material.dart';
import '../domain/status.dart';
import '../tokens/bta_tokens.dart';
import 'money_text.dart';
import 'status_badge.dart';

class StopCardData {
  const StopCardData({
    required this.id,
    required this.sequence,
    required this.type,
    required this.address,
    required this.status,
    this.locationName,
    this.contactName,
    this.contactPhone,
    this.codExpected,
    this.codActual,
    this.podCount = 0,
  });

  final String id;
  final int sequence;
  final StopType type;
  final String address;
  final StopStatus status;
  final String? locationName;
  final String? contactName;
  final String? contactPhone;
  final int? codExpected;
  final int? codActual;
  final int podCount;
}

/// Thẻ điểm dừng: loại lấy/trả, địa chỉ 16sp, liên hệ, COD, trạng thái. Nút gọi/chỉ đường ≥48dp.
class StopCard extends StatelessWidget {
  const StopCard({super.key, required this.stop, this.onTap, this.onCall, this.onNavigate});

  final StopCardData stop;
  final VoidCallback? onTap;
  final VoidCallback? onCall;
  final VoidCallback? onNavigate;

  @override
  Widget build(BuildContext context) {
    final t = stopTypeMeta[stop.type]!;
    final s = stopStatusMeta[stop.status]!;
    return Material(
      color: BtaColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(BtaRadius.lg), side: const BorderSide(color: BtaColors.border)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(BtaSpace.s4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(color: BtaToneColors.of(t.tone).bg, shape: BoxShape.circle),
                    child: Text('${stop.sequence}', style: BtaText.caption.copyWith(color: BtaToneColors.of(t.tone).fg)),
                  ),
                  const SizedBox(width: BtaSpace.s2),
                  StatusBadge(label: t.label, tone: t.tone),
                  const Spacer(),
                  StatusBadge(label: s.label, tone: s.tone),
                ],
              ),
              const SizedBox(height: BtaSpace.s2),
              if (stop.locationName != null) Text(stop.locationName!, style: BtaText.bodyStrong),
              Text(stop.address, style: BtaText.mobileKey.copyWith(fontWeight: FontWeight.w500)),
              if (stop.contactName != null || stop.contactPhone != null) ...[
                const SizedBox(height: BtaSpace.s1),
                Text([stop.contactName, stop.contactPhone].where((e) => e != null && e.isNotEmpty).join(' · '),
                    style: BtaText.body.copyWith(color: BtaColors.textMuted)),
              ],
              if ((stop.codExpected ?? 0) > 0 || (stop.codActual ?? 0) > 0) ...[
                const SizedBox(height: BtaSpace.s2),
                Row(
                  children: [
                    Text('COD: ', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
                    MoneyText(stop.codActual ?? stop.codExpected, color: stop.codActual != null ? BtaColors.success : BtaColors.warning),
                    if (stop.codActual != null) Text('  (dự kiến ', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
                    if (stop.codActual != null) MoneyText(stop.codExpected, style: BtaText.bodySm, color: BtaColors.textMuted),
                    if (stop.codActual != null) Text(')', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
                  ],
                ),
              ],
              if (stop.podCount > 0) ...[
                const SizedBox(height: BtaSpace.s1),
                Text('POD: ${stop.podCount} ảnh', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
              ],
              if (onCall != null || onNavigate != null) ...[
                const SizedBox(height: BtaSpace.s2),
                Row(
                  children: [
                    if (onCall != null)
                      Expanded(
                        child: OutlinedButton.icon(onPressed: onCall, icon: const Icon(Icons.call, size: 18), label: const Text('Gọi')),
                      ),
                    if (onCall != null && onNavigate != null) const SizedBox(width: BtaSpace.s2),
                    if (onNavigate != null)
                      Expanded(
                        child: OutlinedButton.icon(onPressed: onNavigate, icon: const Icon(Icons.map_outlined, size: 18), label: const Text('Chỉ đường')),
                      ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
