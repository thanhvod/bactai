import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/routes.dart';
import '../../../../core/ui/ui_helpers.dart';
import '../../../jobs/domain/models.dart';
import '../cubit/trip_cubit.dart';
import 'trip_detail_page.dart';

/// DA-STOP-02 — tại điểm: địa chỉ lớn, liên hệ, COD, POD; Đã đến / Hoàn thành / Bỏ qua (lý do).
class StopDetailPage extends StatelessWidget {
  const StopDetailPage({super.key, required this.stopId});
  final String stopId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => newTripCubit()..loadByStop(stopId),
      child: TripMessageListener(child: _StopView(stopId: stopId)),
    );
  }
}

class _StopView extends StatefulWidget {
  const _StopView({required this.stopId});
  final String stopId;
  @override
  State<_StopView> createState() => _StopViewState();
}

class _StopViewState extends State<_StopView> {
  String? _validation;

  Future<void> _go(String path) async {
    final cubit = context.read<TripCubit>();
    await context.push(path);
    if (cubit.state.trip != null) await cubit.load(cubit.state.trip!.id);
  }

  Future<void> _complete(DriverStop st) async {
    // Điểm trả cần ≥1 POD và COD đã nhập nếu có COD dự kiến (DA-STOP-02 validation).
    if (st.type == StopType.DROPOFF && st.podCount == 0) {
      setState(() => _validation = 'Cần chụp POD trước khi hoàn thành điểm trả');
      return;
    }
    if (st.hasCod && st.codActual == null) {
      setState(() => _validation = 'Cần nhập COD thực thu trước khi hoàn thành');
      return;
    }
    setState(() => _validation = null);
    final ok = await showConfirmBottomSheet(context, title: 'Hoàn thành điểm ${st.sequence}?', message: st.title, confirmLabel: 'Hoàn thành điểm');
    if (ok && mounted) await context.read<TripCubit>().changeStopStatus(st.id, StopStatus.COMPLETED);
  }

  Future<void> _skip(DriverStop st) async {
    final r = await showReasonBottomSheet(context, title: 'Bỏ qua điểm ${st.sequence}', requireNote: true, noteHint: 'Lý do bỏ qua (bắt buộc)', confirmLabel: 'Bỏ qua điểm');
    if (r != null && mounted) await context.read<TripCubit>().changeStopStatus(st.id, StopStatus.SKIPPED, reason: r.note);
  }

  @override
  Widget build(BuildContext context) {
    final s = context.watch<TripCubit>().state;
    final t = s.trip;
    final st = s.stop(widget.stopId);
    return Scaffold(
      appBar: MobileHeader(
        title: st == null ? 'Điểm dừng' : 'Điểm ${st.sequence} · ${stopTypeMeta[st.type]!.label}',
        subtitle: t?.code,
        onBack: () => context.pop(),
      ),
      body: s.loading
          ? ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: const [SkeletonCard(lines: 4), SizedBox(height: BtaSpace.s3), SkeletonCard()])
          : s.error != null || st == null
              ? ErrorState(message: s.error ?? 'Không tìm thấy điểm dừng', onRetry: () => context.read<TripCubit>().loadByStop(widget.stopId))
              : ListView(
                  padding: const EdgeInsets.all(BtaSpace.s4),
                  children: [
                    if (s.stale) ...[const BtaBanner(message: 'Đang offline — hiện dữ liệu đã lưu, thao tác vào hàng đợi.', tone: BtaTone.warning), const SizedBox(height: BtaSpace.s3)],
                    SectionCard(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(children: [
                          StatusBadge(label: stopStatusMeta[st.status]!.label, tone: stopStatusMeta[st.status]!.tone),
                          if (st.pendingSync) ...[const SizedBox(width: BtaSpace.s2), const StatusBadge(label: 'Chờ đồng bộ', tone: BtaTone.warning, icon: Icons.sync, compact: true)],
                        ]),
                        const SizedBox(height: BtaSpace.s2),
                        if (st.locationName != null) Text(st.locationName!, style: BtaText.headingSm),
                        Text(st.address, style: BtaText.mobileKey.copyWith(fontSize: 17, fontWeight: FontWeight.w500)),
                        const SizedBox(height: BtaSpace.s2),
                        InfoRow('Liên hệ', [st.contactName, st.contactPhone].whereType<String>().join(' · ')),
                        InfoRow('Giờ dự kiến', BtaFormat.dateTime(st.plannedAt)),
                        InfoRow('Đã đến lúc', BtaFormat.dateTime(st.arrivedAt)),
                        InfoRow('Hoàn thành lúc', BtaFormat.dateTime(st.completedAt)),
                        if (st.skipReason != null) InfoRow('Lý do bỏ qua', st.skipReason),
                        if (st.note != null) InfoRow('Ghi chú', st.note),
                        if (st.cargoSummary.isNotEmpty) InfoRow('Hàng', st.cargoSummary.join(', ')),
                        const SizedBox(height: BtaSpace.s2),
                        Row(children: [
                          if (st.contactPhone != null)
                            Expanded(child: OutlinedButton.icon(style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)), onPressed: () => callPhone(context, st.contactPhone), icon: const Icon(Icons.call), label: const Text('Gọi'))),
                          if (st.contactPhone != null) const SizedBox(width: BtaSpace.s2),
                          Expanded(
                            child: OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                              onPressed: () => openDirections(context, lat: st.lat, lng: st.lng, address: st.address),
                              icon: const Icon(Icons.map_outlined),
                              label: const Text('Chỉ đường'),
                            ),
                          ),
                        ]),
                      ]),
                    ),
                    const SizedBox(height: BtaSpace.s3),
                    if (st.hasCod || st.codActual != null)
                      SectionCard(
                        title: 'Thu hộ (COD)',
                        onTap: st.status == StopStatus.SKIPPED ? null : () => _go(DriverRoutes.codInputPath(st.id)),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(children: [
                            Text('Dự kiến: ', style: BtaText.body.copyWith(color: BtaColors.textMuted)),
                            MoneyText(st.codExpected, style: BtaText.headingMd.copyWith(fontSize: 24)),
                          ]),
                          const SizedBox(height: BtaSpace.s1),
                          Row(children: [
                            Text('Thực thu: ', style: BtaText.body.copyWith(color: BtaColors.textMuted)),
                            st.codActual == null ? Text('Chưa nhập', style: BtaText.bodyStrong.copyWith(color: BtaColors.warning)) : MoneyText(st.codActual, color: BtaColors.success),
                          ]),
                          const SizedBox(height: BtaSpace.s2),
                          Text(st.codActual == null ? 'Chạm để nhập COD thực thu' : 'Chạm để sửa (cần lý do)', style: BtaText.bodySm.copyWith(color: BtaColors.accent)),
                        ]),
                      ),
                    const SizedBox(height: BtaSpace.s3),
                    SectionCard(
                      title: 'POD & chứng từ',
                      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                        Text(st.podCount == 0 ? 'Chưa có ảnh POD' : 'Đã có ${st.podCount} ảnh POD', style: BtaText.body),
                        const SizedBox(height: BtaSpace.s2),
                        Row(children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                              onPressed: () => _go(DriverRoutes.podCapturePath(st.id)),
                              icon: const Icon(Icons.photo_camera_outlined),
                              label: const Text('Chụp POD'),
                            ),
                          ),
                          const SizedBox(width: BtaSpace.s2),
                          Expanded(
                            child: OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                              onPressed: () => _go(DriverRoutes.attachmentUploadPath('ORDER_STOP', st.id, 'Điểm ${st.sequence} · ${st.title}')),
                              icon: const Icon(Icons.upload_file_outlined),
                              label: const Text('Chứng từ khác'),
                            ),
                          ),
                        ]),
                      ]),
                    ),
                    if (_validation != null) ...[
                      const SizedBox(height: BtaSpace.s3),
                      BtaBanner(message: _validation!, tone: BtaTone.danger),
                    ],
                    if (!st.isDone && t != null && !t.isClosed) ...[
                      const SizedBox(height: BtaSpace.s3),
                      TextButton.icon(
                        style: TextButton.styleFrom(foregroundColor: BtaColors.danger, minimumSize: const Size.fromHeight(48)),
                        onPressed: s.busy ? null : () => _skip(st),
                        icon: const Icon(Icons.block),
                        label: const Text('Bỏ qua điểm này'),
                      ),
                    ],
                    const SizedBox(height: BtaSpace.s6),
                  ],
                ),
      bottomNavigationBar: st == null || t == null || t.isClosed || st.isDone
          ? null
          : st.status == StopStatus.NOT_ARRIVED
              ? PrimaryBottomAction(label: 'Đã đến', icon: Icons.where_to_vote_outlined, loading: s.busy, onPressed: () => context.read<TripCubit>().changeStopStatus(st.id, StopStatus.ARRIVED))
              : PrimaryBottomAction(label: 'Hoàn thành điểm', icon: Icons.check_circle_outline, loading: s.busy, onPressed: () => _complete(st)),
    );
  }
}
