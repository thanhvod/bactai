import 'package:flutter/material.dart';
import '../domain/status.dart';
import '../format.dart';
import '../tokens/bta_tokens.dart';
import 'money_text.dart';
import 'status_badge.dart';

/// Dữ liệu tối thiểu để vẽ thẻ chuyến (map từ GraphQL Trip ở app).
class TripCardData {
  const TripCardData({
    required this.id,
    required this.code,
    required this.routeSummary,
    required this.status,
    this.plannedStartAt,
    this.plannedEndAt,
    this.vehiclePlate,
    this.codExpected,
    this.pendingSyncCount = 0,
    this.orderCode,
  });

  final String id;
  final String code;
  final String routeSummary;
  final TripStatus status;
  final DateTime? plannedStartAt;
  final DateTime? plannedEndAt;
  final String? vehiclePlate;
  final int? codExpected;
  final int pendingSyncCount;
  final String? orderCode;
}

class TripCard extends StatelessWidget {
  const TripCard({super.key, required this.trip, this.onTap, this.highlight = false});

  final TripCardData trip;
  final VoidCallback? onTap;
  /// Chuyến đang chạy → viền primary.
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    final meta = tripStatusMeta[trip.status]!;
    return Material(
      color: BtaColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(BtaRadius.lg),
        side: BorderSide(color: highlight ? BtaColors.primary : BtaColors.border, width: highlight ? 1.5 : 1),
      ),
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
                  Expanded(child: Text(trip.code, style: BtaText.bodyStrong.copyWith(fontFeatures: BtaText.tabular))),
                  if (trip.pendingSyncCount > 0) ...[
                    StatusBadge(label: 'Chờ đồng bộ ${trip.pendingSyncCount}', tone: BtaTone.warning, icon: Icons.sync, compact: true),
                    const SizedBox(width: BtaSpace.s2),
                  ],
                  StatusBadge(label: meta.label, tone: meta.tone),
                ],
              ),
              const SizedBox(height: BtaSpace.s2),
              Text(trip.routeSummary, style: BtaText.mobileKey, maxLines: 2, overflow: TextOverflow.ellipsis),
              const SizedBox(height: BtaSpace.s2),
              Wrap(
                spacing: BtaSpace.s4,
                runSpacing: BtaSpace.s1,
                children: [
                  if (trip.plannedStartAt != null)
                    _Meta(Icons.schedule, '${BtaFormat.date(trip.plannedStartAt)} ${BtaFormat.timeWindow(trip.plannedStartAt, trip.plannedEndAt)}'),
                  if (trip.vehiclePlate != null) _Meta(Icons.local_shipping_outlined, trip.vehiclePlate!),
                  if (trip.orderCode != null) _Meta(Icons.receipt_long_outlined, trip.orderCode!),
                ],
              ),
              if ((trip.codExpected ?? 0) > 0) ...[
                const SizedBox(height: BtaSpace.s2),
                Row(
                  children: [
                    const Icon(Icons.payments_outlined, size: 16, color: BtaColors.warning),
                    const SizedBox(width: 4),
                    Text('COD cần thu: ', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
                    MoneyText(trip.codExpected, color: BtaColors.warning),
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

class _Meta extends StatelessWidget {
  const _Meta(this.icon, this.text);
  final IconData icon;
  final String text;
  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: BtaColors.textMuted),
          const SizedBox(width: 4),
          Text(text, style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
        ],
      );
}
