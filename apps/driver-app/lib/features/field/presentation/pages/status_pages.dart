import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/di.dart';
import '../../../../core/router/routes.dart';
import '../../../gps/presentation/cubit/gps_cubit.dart';
import '../../data/field_repository.dart';
import '../../domain/field_models.dart';
import '../cubit/trip_cubit.dart';
import 'trip_detail_page.dart';

/// DA-STATUS-01 — chọn trạng thái hợp lệ kế tiếp + ghi chú. Tạm dừng → DA-STATUS-02.
class StatusUpdatePage extends StatelessWidget {
  const StatusUpdatePage({super.key, required this.tripId});
  final String tripId;

  @override
  Widget build(BuildContext context) => BlocProvider(create: (_) => newTripCubit()..load(tripId), child: TripMessageListener(child: _StatusView(tripId: tripId)));
}

class _StatusView extends StatefulWidget {
  const _StatusView({required this.tripId});
  final String tripId;
  @override
  State<_StatusView> createState() => _StatusViewState();
}

class _StatusViewState extends State<_StatusView> {
  TripStatus? _selected;
  final _note = TextEditingController();

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final to = _selected;
    if (to == null) return;
    if (to == TripStatus.PAUSED) {
      context.pushReplacement(DriverRoutes.pauseTripPath(widget.tripId));
      return;
    }
    final cubit = context.read<TripCubit>();
    final gps = context.read<GpsCubit>();
    final ok = to == cubit.state.trip?.previousStatusBeforePause && cubit.state.trip?.status == TripStatus.PAUSED
        ? await cubit.resume(note: _note.text.trim().isEmpty ? null : _note.text.trim())
        : await cubit.changeStatus(to, note: _note.text.trim().isEmpty ? null : _note.text.trim());
    if (!ok) return;
    await gps.ensureTracking(tripRunningStatuses.contains(to) ? widget.tripId : null, tripCode: cubit.state.trip?.code);
    if (mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final s = context.watch<TripCubit>().state;
    final t = s.trip;
    final options = t?.allowedNextStatuses.where((x) => x != TripStatus.CANCELLED).toList() ?? const <TripStatus>[];
    return Scaffold(
      appBar: MobileHeader(title: 'Cập nhật trạng thái', subtitle: t?.code, onBack: () => context.pop()),
      body: s.loading
          ? const Padding(padding: EdgeInsets.all(BtaSpace.s4), child: SkeletonCard())
          : s.error != null
              ? ErrorState(message: s.error!, onRetry: () => context.read<TripCubit>().load(widget.tripId))
              : ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
                  Row(children: [
                    Text('Hiện tại: ', style: BtaText.body.copyWith(color: BtaColors.textMuted)),
                    StatusBadge(label: tripStatusMeta[t!.status]!.label, tone: tripStatusMeta[t.status]!.tone),
                  ]),
                  const SizedBox(height: BtaSpace.s3),
                  if (options.isEmpty)
                    const EmptyState(icon: Icons.lock_outline, message: 'Chuyến đã kết thúc, không đổi trạng thái được. Cần sửa thì báo điều phối.')
                  else
                    RadioGroup<TripStatus>(
                      groupValue: _selected,
                      onChanged: (v) => setState(() => _selected = v),
                      child: Column(children: [
                        for (final o in options)
                          RadioListTile<TripStatus>(
                            value: o,
                            title: Text(tripStatusMeta[o]!.label, style: BtaText.bodyStrong),
                            subtitle: o == TripStatus.PAUSED ? const Text('Cần chọn lý do ở bước tiếp theo') : null,
                          ),
                      ]),
                    ),
                  const SizedBox(height: BtaSpace.s3),
                  TextField(controller: _note, maxLines: 3, decoration: const InputDecoration(labelText: 'Ghi chú (không bắt buộc)')),
                  const SizedBox(height: BtaSpace.s2),
                  Text('Thời điểm ghi nhận: lúc bấm xác nhận (${BtaFormat.time(DateTime.now())}).', style: BtaText.caption.copyWith(color: BtaColors.textSubtle)),
                ]),
      bottomNavigationBar: PrimaryBottomAction(label: _selected == TripStatus.PAUSED ? 'Tiếp tục: chọn lý do' : 'Xác nhận', loading: s.busy, onPressed: _selected == null ? null : _submit),
    );
  }
}

/// DA-STATUS-02 — tạm dừng: lý do bắt buộc từ danh mục PAUSE_REASON + ghi chú. Tạm dừng ≠ sự cố.
class PauseTripPage extends StatelessWidget {
  const PauseTripPage({super.key, required this.tripId});
  final String tripId;

  @override
  Widget build(BuildContext context) => BlocProvider(create: (_) => newTripCubit()..load(tripId), child: TripMessageListener(child: _PauseView(tripId: tripId)));
}

class _PauseView extends StatefulWidget {
  const _PauseView({required this.tripId});
  final String tripId;
  @override
  State<_PauseView> createState() => _PauseViewState();
}

class _PauseViewState extends State<_PauseView> {
  List<CatalogOption>? _reasons;
  String? _error;
  CatalogOption? _selected;
  final _note = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await getIt<FieldRepository>().catalog('PAUSE_REASON');
      if (mounted) setState(() => _reasons = r);
    } catch (e) {
      if (mounted) setState(() => _error = 'Không tải được danh mục lý do. Kiểm tra mạng rồi thử lại.');
    }
  }

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final r = _selected;
    if (r == null) return;
    final ok = await context.read<TripCubit>().changeStatus(TripStatus.PAUSED, pauseReasonId: r.id, pauseReasonLabel: r.name, note: _note.text.trim().isEmpty ? null : _note.text.trim());
    if (ok && mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final s = context.watch<TripCubit>().state;
    return Scaffold(
      appBar: MobileHeader(title: 'Tạm dừng chuyến', subtitle: s.trip?.code, onBack: () => context.pop()),
      body: ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
        const BtaBanner(message: 'Tạm dừng là trạng thái tạm thời (cấm tải, nghỉ đêm, chờ phà...). Hàng hư, tai nạn, khách đổi điểm → dùng "Báo sự cố".', tone: BtaTone.info),
        const SizedBox(height: BtaSpace.s3),
        if (_error != null)
          ErrorState(message: _error!, onRetry: () {
            setState(() => _error = null);
            _load();
          })
        else if (_reasons == null)
          const SkeletonCard(lines: 5)
        else
          RadioGroup<String>(
            groupValue: _selected?.id,
            onChanged: (v) => setState(() => _selected = _reasons!.firstWhere((r) => r.id == v)),
            child: Column(children: [for (final r in _reasons!) RadioListTile<String>(value: r.id, title: Text(r.name, style: BtaText.body))]),
          ),
        const SizedBox(height: BtaSpace.s3),
        TextField(controller: _note, maxLines: 3, decoration: const InputDecoration(labelText: 'Ghi chú (không bắt buộc)')),
        const SizedBox(height: BtaSpace.s3),
        TextButton.icon(
          onPressed: () => context.pushReplacement(DriverRoutes.incidentReportPath(widget.tripId)),
          icon: const Icon(Icons.report_problem_outlined),
          label: const Text('Đây là sự cố? Báo sự cố'),
        ),
      ]),
      bottomNavigationBar: PrimaryBottomAction(label: 'Xác nhận tạm dừng', icon: Icons.pause, loading: s.busy, onPressed: _selected == null ? null : _submit),
    );
  }
}
