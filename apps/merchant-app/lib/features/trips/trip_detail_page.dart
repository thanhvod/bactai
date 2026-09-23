import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_scope.dart';
import '../../core/permissions.dart';
import '../../core/router/routes.dart';
import '../../models/models.dart';
import '../../shared/async_view.dart';
import '../../shared/ui_helpers.dart';

/// Lựa chọn đổi trạng thái chuyến cho người dùng hiện tại (MA-TRIP-02).
List<String> tripStatusOptions(TripItem t, Set<String> perms) {
  if (!perms.contains(Perm.tripStatusUpdate)) return const [];
  if (t.status == 'COMPLETED' || t.status == 'CANCELLED') {
    return perms.contains(Perm.statusReverse) && t.status == 'COMPLETED' ? const ['DELIVERING'] : const [];
  }
  final out = <String>[...t.allowedNextStatuses.where((s) => s != 'CANCELLED')];
  if (perms.contains(Perm.statusReverse)) {
    final i = tripFlow.indexOf(t.status);
    if (i > 0) out.add(tripFlow[i - 1]);
  }
  if (perms.contains(Perm.tripCancel)) out.add('CANCELLED');
  return out.toSet().toList();
}

class TripDetailPage extends StatefulWidget {
  const TripDetailPage({super.key, required this.tripId});
  final String tripId;
  @override
  State<TripDetailPage> createState() => _TripDetailPageState();
}

class _TripDetailPageState extends State<TripDetailPage> {
  final _key = GlobalKey<AsyncViewState<TripItem>>();

  @override
  Widget build(BuildContext context) {
    final repo = AppScope.repo(context);
    return Scaffold(
      appBar: MobileHeader(title: 'Chi tiết chuyến', onBack: context.canPop() ? () => context.pop() : null),
      body: AsyncView<TripItem>(
        key: _key,
        load: () => repo.trip(widget.tripId),
        builder: (context, t, reload) => _TripBody(trip: t, reload: reload),
      ),
    );
  }
}

class _TripBody extends StatelessWidget {
  const _TripBody({required this.trip, required this.reload});
  final TripItem trip;
  final Future<void> Function() reload;

  Future<void> _changeStatus(BuildContext context) async {
    final scope = AppScope.of(context);
    final options = tripStatusOptions(trip, scope.auth.permissions);
    final to = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: BtaColors.surface,
      builder: (ctx) => SafeArea(
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Padding(
            padding: const EdgeInsets.all(BtaSpace.s4),
            child: Text('Cập nhật trạng thái thay tài xế\nHiện tại: ${tripStatusLabel(trip.status)}', style: BtaText.headingSm),
          ),
          for (final s in options)
            ListRow(
              label: s == 'CANCELLED' ? 'Hủy chuyến' : tripStatusLabel(s),
              value: tripChangeNeedsReason(trip.status, s) ? 'Cần nhập lý do' : null,
              danger: s == 'CANCELLED',
              onTap: () => Navigator.of(ctx).pop(s),
            ),
        ]),
      ),
    );
    if (to == null || !context.mounted) return;
    final repo = scope.repository;
    if (to == 'PAUSED') {
      final reasons = await repo.pauseReasons();
      if (!context.mounted) return;
      final r = await showReasonBottomSheet(context, title: 'Tạm dừng chuyến ${trip.code}', reasons: [for (final x in reasons) ReasonOption(id: x.id, label: x.name)], confirmLabel: 'Tạm dừng');
      if (r == null || !context.mounted) return;
      if (await runAction(context, () => repo.updateTripStatus(trip.id, 'PAUSED', pauseReasonId: r.reasonId, note: r.note, reason: r.reasonLabel), success: 'Đã tạm dừng chuyến')) await reload();
      return;
    }
    String? reason;
    if (tripChangeNeedsReason(trip.status, to)) {
      final r = await showReasonBottomSheet(
        context,
        title: to == 'CANCELLED' ? 'Hủy chuyến ${trip.code}' : 'Đổi ngược về "${tripStatusLabel(to)}"',
        requireNote: true,
        noteHint: 'Lý do (bắt buộc, ≥ 5 ký tự)',
        confirmLabel: 'Xác nhận',
      );
      if (r == null) return;
      reason = r.note;
    }
    if (!context.mounted) return;
    final ok = await runAction(
      context,
      () => to == 'CANCELLED' ? repo.cancelTrip(trip.id, reason!) : repo.updateTripStatus(trip.id, to, reason: reason),
      success: 'Đã cập nhật: ${to == 'CANCELLED' ? 'Đã hủy' : tripStatusLabel(to)}',
    );
    if (ok) await reload();
  }

  Future<void> _showPods(BuildContext context, StopItem s) async {
    final repo = AppScope.repo(context);
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => SafeArea(
        child: SizedBox(
          height: MediaQuery.of(ctx).size.height * 0.8,
          child: FutureBuilder<List<AttachmentItem>>(
            future: repo.stopPods(s.id),
            builder: (ctx, snap) {
              if (snap.connectionState != ConnectionState.done) return const Center(child: CircularProgressIndicator());
              if (snap.hasError) return ErrorState(message: '${snap.error}');
              final items = snap.data!;
              if (items.isEmpty) return const EmptyState(message: 'Chưa có ảnh POD');
              return PageView(children: [
                for (final a in items)
                  Column(children: [
                    Padding(padding: const EdgeInsets.all(BtaSpace.s3), child: Text('${a.fileName} · ${BtaFormat.dateTime(a.createdAt)}', style: BtaText.bodySm)),
                    Expanded(
                      child: a.url == null || !a.isImage
                          ? Center(child: Text(a.fileName))
                          : InteractiveViewer(child: Image.network(a.url!, fit: BoxFit.contain, errorBuilder: (_, _, _) => const Center(child: Text('Không tải được ảnh')))),
                    ),
                  ]),
              ]);
            },
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = trip;
    final scope = AppScope.of(context);
    final canUpdate = tripStatusOptions(t, scope.auth.permissions).isNotEmpty;
    final loc = t.lastLocation;
    final openIncidents = t.incidents.where((i) => i.isOpen).toList();
    return Stack(children: [
      ListView(padding: const EdgeInsets.fromLTRB(BtaSpace.s4, BtaSpace.s4, BtaSpace.s4, 96), children: [
        Row(children: [Expanded(child: Text(t.code, style: BtaText.headingLg)), tripBadge(t.status, compact: false)]),
        if (t.status == 'PAUSED' && t.pauseReasonLabel != null)
          Padding(padding: const EdgeInsets.only(top: 6), child: BtaBanner(tone: BtaTone.warning, message: 'Tạm dừng: ${t.pauseReasonLabel}', dense: true)),
        const SizedBox(height: BtaSpace.s3),
        SectionCard(
          child: Column(children: [
            InfoRow('Đơn hàng', null, valueWidget: InkWell(onTap: () => context.push(MerchantRoutes.orderDetailPath(t.orderId)), child: Text('${t.orderCode} · ${t.customerName}', style: BtaText.body.copyWith(color: BtaColors.accent)))),
            InfoRow('Kế hoạch', '${BtaFormat.date(t.plannedStartAt)} ${BtaFormat.timeWindow(t.plannedStartAt, t.plannedEndAt)}'),
            InfoRow('Xe', t.vehiclePlate),
            InfoRow('Tài xế', t.driverName, valueWidget: t.driverName == null
                ? null
                : Row(children: [
                    Expanded(child: Text('${t.driverName}${t.driverPhone != null ? ' · ${t.driverPhone}' : ''}')),
                    if (t.driverPhone != null) IconButton(tooltip: 'Gọi tài xế', icon: const Icon(Icons.call_outlined), onPressed: () => callPhone(context, t.driverPhone)),
                  ])),
            if (t.codExpectedTotal > 0) InfoRow('COD', '${BtaFormat.vnd(t.codActualTotal)} / dự kiến ${BtaFormat.vnd(t.codExpectedTotal)}'),
            InfoRow('Vị trí gần nhất', loc == null ? 'Chưa có GPS' : '${loc.lat.toStringAsFixed(4)}, ${loc.lng.toStringAsFixed(4)} · ${BtaFormat.dateTime(loc.capturedAt)}${loc.isStale ? ' (cũ)' : ''}'),
          ]),
        ),
        if (openIncidents.isNotEmpty) ...[
          const SizedBox(height: BtaSpace.s3),
          SectionCard(
            title: 'Sự cố đang mở',
            child: Column(children: [
              for (final i in openIncidents)
                ListTile(contentPadding: EdgeInsets.zero, title: Text('${i.code} · ${i.title}'), trailing: StatusBadge(label: incidentSeverityMeta[incidentSeverityFromApi(i.severity)]?.label ?? i.severity, tone: incidentSeverityMeta[incidentSeverityFromApi(i.severity)]?.tone ?? BtaTone.warning, compact: true)),
            ]),
          ),
        ],
        const SizedBox(height: BtaSpace.s3),
        SectionCard(
          title: 'Điểm dừng (${t.stops.length})',
          child: Column(children: [
            for (final s in t.stops)
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(s.type == 'PICKUP' ? Icons.upload_outlined : Icons.download_outlined),
                title: Text('${s.sequence}. ${s.locationName ?? s.address}'),
                subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text([
                    s.address,
                    if (s.codExpected != null || s.codActual != null) 'COD ${BtaFormat.vnd(s.codActual ?? 0)} / dự kiến ${BtaFormat.vnd(s.codExpected ?? 0)}',
                    if (s.completedAt != null) 'Hoàn thành ${BtaFormat.dateTime(s.completedAt)}',
                    if (s.skipReason != null) 'Bỏ qua: ${s.skipReason}',
                  ].join('\n')),
                  if (s.podCount > 0)
                    TextButton.icon(
                      style: TextButton.styleFrom(padding: EdgeInsets.zero, visualDensity: VisualDensity.compact),
                      onPressed: () => _showPods(context, s),
                      icon: const Icon(Icons.photo_library_outlined, size: 18),
                      label: Text('Xem POD (${s.podCount})'),
                    ),
                ]),
                trailing: stopBadge(s.status),
              ),
          ]),
        ),
      ]),
      if (canUpdate || t.status == 'PAUSED')
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          child: t.status == 'PAUSED' && scope.auth.can(Perm.tripStatusUpdate)
              ? PrimaryBottomAction(
                  label: 'Tiếp tục chuyến',
                  icon: Icons.play_arrow,
                  onPressed: () async {
                    if (await runAction(context, () => scope.repository.resumeTrip(t.id), success: 'Đã tiếp tục chuyến')) await reload();
                  },
                  secondaryLabel: 'Trạng thái khác',
                  onSecondary: () => _changeStatus(context),
                )
              : PrimaryBottomAction(label: 'Cập nhật trạng thái', icon: Icons.sync_alt, onPressed: () => _changeStatus(context)),
        ),
    ]);
  }
}
