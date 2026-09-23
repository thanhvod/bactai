import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/di.dart';
import '../../../../core/router/routes.dart';
import '../../../../core/ui/ui_helpers.dart';
import '../../../gps/presentation/cubit/gps_cubit.dart';
import '../../../jobs/domain/jobs_repository.dart';
import '../../../jobs/domain/models.dart';
import '../../../sync/presentation/cubit/sync_cubit.dart';
import '../../data/field_repository.dart';
import '../cubit/trip_cubit.dart';

/// Tạo TripCubit cho màn con (dùng chung DI).
TripCubit newTripCubit() => TripCubit(getIt<JobsRepository>(), getIt<FieldRepository>());

/// Hiện snackbar mỗi khi cubit có thông báo mới.
class TripMessageListener extends StatelessWidget {
  const TripMessageListener({super.key, required this.child});
  final Widget child;
  @override
  Widget build(BuildContext context) => BlocListener<TripCubit, TripViewState>(
        listenWhen: (a, b) => a.messageSeq != b.messageSeq && b.message != null,
        listener: (context, s) => showToast(context, s.message!, tone: s.messageTone),
        child: child,
      );
}

/// DA-TRIP-01 — chi tiết chuyến: nút chính theo trạng thái (không có nhận việc), tạm dừng ≠ sự cố.
class TripDetailPage extends StatelessWidget {
  const TripDetailPage({super.key, required this.tripId});
  final String tripId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => newTripCubit()..load(tripId),
      child: TripMessageListener(child: _TripDetailView(tripId: tripId)),
    );
  }
}

class _TripDetailView extends StatelessWidget {
  const _TripDetailView({required this.tripId});
  final String tripId;

  Future<void> _go(BuildContext context, String path) async {
    final cubit = context.read<TripCubit>();
    await context.push(path);
    await cubit.load(tripId);
  }

  Future<void> _primary(BuildContext context, DriverTrip t) async {
    final cubit = context.read<TripCubit>();
    if (t.status == TripStatus.PAUSED) {
      await cubit.resume();
      return;
    }
    final next = t.primaryNext;
    if (next == null) return;
    if (next == TripStatus.COMPLETED) {
      final open = t.stops.where((s) => !s.isDone).toList();
      final ok = await showConfirmBottomSheet(
        context,
        title: 'Hoàn thành chuyến?',
        message: open.isEmpty ? 'Tất cả điểm đã xong.' : 'Còn ${open.length} điểm chưa hoàn thành/bỏ qua. Bạn vẫn muốn hoàn thành chuyến?',
        confirmLabel: 'Hoàn thành chuyến',
      );
      if (!ok) return;
    }
    await cubit.changeStatus(next);
    if (next == TripStatus.COMPLETED && context.mounted) context.read<GpsCubit>().ensureTracking(null);
    if (tripRunningStatuses.contains(next) && context.mounted) context.read<GpsCubit>().ensureTracking(t.id, tripCode: t.code);
  }

  @override
  Widget build(BuildContext context) {
    final s = context.watch<TripCubit>().state;
    final sync = context.watch<SyncCubit>().state;
    final t = s.trip;
    return Scaffold(
      appBar: MobileHeader(
        title: t?.code ?? 'Chi tiết chuyến',
        subtitle: t == null ? null : '${t.orderCode} · ${t.customerName}',
        onBack: () => context.pop(),
        actions: [
          if (t != null && !t.isClosed)
            PopupMenuButton<String>(
              tooltip: 'Thêm',
              onSelected: (v) => _go(context, v),
              itemBuilder: (_) => [
                PopupMenuItem(value: DriverRoutes.statusUpdatePath(t.id), child: const Text('Cập nhật trạng thái')),
                PopupMenuItem(value: DriverRoutes.attachmentUploadPath('TRIP', t.id, t.code), child: const Text('Upload chứng từ chuyến')),
              ],
            ),
        ],
      ),
      body: s.loading
          ? ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: const [SkeletonCard(lines: 4), SizedBox(height: BtaSpace.s3), SkeletonCard(), SizedBox(height: BtaSpace.s3), SkeletonCard()])
          : s.error != null
              ? ErrorState(title: 'Không mở được chuyến', message: s.error!, onRetry: s.errorCode == 'NOT_FOUND' ? null : () => context.read<TripCubit>().load(tripId))
              : RefreshIndicator(
                  onRefresh: () => context.read<TripCubit>().load(tripId),
                  child: ListView(
                    padding: const EdgeInsets.all(BtaSpace.s4),
                    children: [
                      if (!sync.online || s.stale) ...[
                        BtaBanner(message: !sync.online ? 'Đang offline — thao tác sẽ vào hàng đợi.' : 'Đang hiện dữ liệu đã lưu.', tone: BtaTone.warning),
                        const SizedBox(height: BtaSpace.s3),
                      ],
                      if (sync.pendingForTrip(t!.id) > 0) ...[
                        BtaBanner(message: '${sync.pendingForTrip(t.id)} thao tác của chuyến đang chờ đồng bộ', tone: BtaTone.info, actionLabel: 'Xem', onAction: () => context.push(DriverRoutes.pSync)),
                        const SizedBox(height: BtaSpace.s3),
                      ],
                      _Header(trip: t),
                      const SizedBox(height: BtaSpace.s3),
                      Row(children: [
                        const Expanded(child: Text('Điểm lấy / trả', style: BtaText.headingSm)),
                        Text('${t.completedStopCount}/${t.stops.length} xong', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
                      ]),
                      const SizedBox(height: BtaSpace.s2),
                      for (final st in t.stops) ...[
                        StopCard(
                          stop: st.toCard(),
                          onTap: () => _go(context, DriverRoutes.stopDetailPath(st.id)),
                          onCall: st.contactPhone == null ? null : () => callPhone(context, st.contactPhone),
                          onNavigate: st.isDone ? null : () => openDirections(context, lat: st.lat, lng: st.lng, address: st.address),
                        ),
                        const SizedBox(height: BtaSpace.s2),
                      ],
                      if (t.cargoLines.isNotEmpty || t.orderNote != null || t.note != null) ...[
                        const SizedBox(height: BtaSpace.s2),
                        SectionCard(
                          title: 'Hàng hóa & ghi chú',
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            for (final c in t.cargoLines) ...[
                              Text(c.name, style: BtaText.bodyStrong),
                              if (c.summary.isNotEmpty) Text(c.summary, style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
                              if (c.note != null) Text(c.note!, style: BtaText.bodySm),
                              const SizedBox(height: BtaSpace.s2),
                            ],
                            if (t.orderNote != null) InfoRow('Ghi chú đơn', t.orderNote),
                            if (t.note != null) InfoRow('Ghi chú chuyến', t.note),
                          ]),
                        ),
                      ],
                      const SizedBox(height: BtaSpace.s3),
                      SectionCard(
                        title: 'Tiền & chứng từ',
                        child: Column(children: [
                          InfoRow('COD dự kiến', null, valueWidget: MoneyText(t.codExpectedTotal)),
                          InfoRow('COD đã thu', null, valueWidget: MoneyText(t.codActualTotal, color: BtaColors.success)),
                          if (t.driverBonusAmount > 0) InfoRow('Thưởng chuyến', null, valueWidget: MoneyText(t.driverBonusAmount)),
                          InfoRow('Chứng từ', '${t.attachmentCount} file'),
                          if (t.lastLocationAt != null) InfoRow('GPS gửi lần cuối', BtaFormat.dateTime(t.lastLocationAt)),
                        ]),
                      ),
                      if (t.incidents.isNotEmpty) ...[
                        const SizedBox(height: BtaSpace.s3),
                        SectionCard(
                          title: 'Sự cố',
                          child: Column(children: [
                            for (final i in t.incidents)
                              ListTile(
                                contentPadding: EdgeInsets.zero,
                                title: Text(i.title, style: BtaText.bodyStrong),
                                subtitle: Text('${i.code} · ${BtaFormat.dateTime(i.createdAt)}'),
                                trailing: StatusBadge(label: incidentStatusMeta[i.status]!.label, tone: incidentStatusMeta[i.status]!.tone),
                              ),
                          ]),
                        ),
                      ],
                      if (!t.isClosed) ...[
                        const SizedBox(height: BtaSpace.s3),
                        Row(children: [
                          if (t.isRunning && t.status != TripStatus.PAUSED)
                            Expanded(
                              child: OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                                onPressed: () => _go(context, DriverRoutes.pauseTripPath(t.id)),
                                icon: const Icon(Icons.pause_circle_outline),
                                label: const Text('Tạm dừng'),
                              ),
                            ),
                          if (t.isRunning && t.status != TripStatus.PAUSED) const SizedBox(width: BtaSpace.s2),
                          Expanded(
                            child: OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48), foregroundColor: BtaColors.danger),
                              onPressed: () => _go(context, DriverRoutes.incidentReportPath(t.id)),
                              icon: const Icon(Icons.report_problem_outlined),
                              label: const Text('Báo sự cố'),
                            ),
                          ),
                        ]),
                      ],
                      const SizedBox(height: BtaSpace.s6),
                    ],
                  ),
                ),
      bottomNavigationBar: t == null || t.isClosed || s.error != null
          ? null
          : _primaryLabel(t) == null
              ? null
              : PrimaryBottomAction(
                  label: _primaryLabel(t)!,
                  icon: t.status == TripStatus.PAUSED ? Icons.play_arrow : Icons.arrow_forward,
                  loading: s.busy,
                  onPressed: () => _primary(context, t),
                  secondaryLabel: 'Điểm dừng',
                  onSecondary: () => _go(context, DriverRoutes.stopListPath(t.id)),
                ),
    );
  }

  static String? _primaryLabel(DriverTrip t) {
    if (t.status == TripStatus.PAUSED) return 'Tiếp tục chuyến';
    final next = t.primaryNext;
    if (next == null) return null;
    return switch (next) {
      TripStatus.TO_PICKUP => 'Bắt đầu đi lấy',
      TripStatus.PICKING_UP => 'Đã đến điểm lấy',
      TripStatus.IN_TRANSIT => 'Bắt đầu vận chuyển',
      TripStatus.DELIVERING => 'Đến điểm trả',
      TripStatus.COMPLETED => 'Hoàn thành chuyến',
      _ => tripStatusMeta[next]!.label,
    };
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.trip});
  final DriverTrip trip;
  @override
  Widget build(BuildContext context) {
    final m = tripStatusMeta[trip.status]!;
    return SectionCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          StatusBadge(label: m.label, tone: m.tone),
          if (trip.pendingSync) ...[const SizedBox(width: BtaSpace.s2), const StatusBadge(label: 'Chờ đồng bộ', tone: BtaTone.warning, icon: Icons.sync, compact: true)],
        ]),
        if (trip.status == TripStatus.PAUSED && trip.pauseReason != null) ...[
          const SizedBox(height: BtaSpace.s1),
          Text('Lý do tạm dừng: ${trip.pauseReason}', style: BtaText.bodySm.copyWith(color: BtaColors.warning)),
        ],
        const SizedBox(height: BtaSpace.s2),
        Text(trip.route, style: BtaText.mobileKey),
        const SizedBox(height: BtaSpace.s2),
        InfoRow('Xe', [trip.vehiclePlate, trip.vehicleType].whereType<String>().join(' · ')),
        InfoRow('Dự kiến', '${BtaFormat.date(trip.plannedStartAt)} ${BtaFormat.timeWindow(trip.plannedStartAt, trip.plannedEndAt)}'),
        if (trip.actualStartAt != null) InfoRow('Bắt đầu thực tế', BtaFormat.dateTime(trip.actualStartAt)),
        if (trip.actualEndAt != null) InfoRow('Kết thúc', BtaFormat.dateTime(trip.actualEndAt)),
      ]),
    );
  }
}
