import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/api/driver_api.dart';
import '../../../../core/di/di.dart';
import '../../../../core/router/routes.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../../gps/presentation/cubit/gps_cubit.dart';
import '../../../sync/presentation/cubit/sync_cubit.dart';
import '../../domain/jobs_repository.dart';
import '../cubit/jobs_cubit.dart';

/// DA-HOME-01 — mở app là biết nên làm gì: chuyến đang chạy/tiếp theo, đồng bộ, cảnh báo COD, chuyến hôm nay.
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => JobsCubit(getIt<JobsRepository>())..load(),
      child: const _HomeView(),
    );
  }
}

class _HomeView extends StatefulWidget {
  const _HomeView();
  @override
  State<_HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<_HomeView> {
  int? _codHeld;

  @override
  void initState() {
    super.initState();
    _loadMe();
  }

  Future<void> _loadMe() async {
    try {
      final me = await getIt<DriverApi>().driverMe();
      if (mounted) setState(() => _codHeld = (me['codHeld'] as num?)?.toInt());
    } catch (_) {}
  }

  Future<void> _refresh() async {
    await Future.wait([context.read<JobsCubit>().load(), _loadMe()]);
  }

  @override
  Widget build(BuildContext context) {
    final driver = context.select((AuthCubit c) => c.state.driver);
    final sync = context.watch<SyncCubit>().state;
    final jobs = context.watch<JobsCubit>().state;
    final headline = jobs.running ?? jobs.next;

    return MultiBlocListener(
      listeners: [
        BlocListener<JobsCubit, JobsState>(
          listenWhen: (a, b) => a.running?.id != b.running?.id || (a.loading && !b.loading),
          listener: (context, s) {
            if (!s.loading && s.error == null) context.read<GpsCubit>().ensureTracking(s.running?.id, tripCode: s.running?.code);
          },
        ),
        BlocListener<SyncCubit, SyncCubitState>(
          listenWhen: (a, b) => a.lastSyncedVersion != b.lastSyncedVersion,
          listener: (context, _) => context.read<JobsCubit>().load(),
        ),
      ],
      child: Scaffold(
        appBar: MobileHeader(
          title: 'Xin chào, ${driver?.name ?? 'tài xế'}',
          subtitle: driver?.merchantName,
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: BtaSpace.s2),
              child: SyncStatusChip(state: sync.syncState, pendingCount: sync.pendingCount, onTap: () => context.push(DriverRoutes.pSync)),
            ),
          ],
        ),
        body: RefreshIndicator(
          onRefresh: _refresh,
          child: ListView(
            padding: const EdgeInsets.all(BtaSpace.s4),
            children: [
              if (!sync.online) ...[
                OfflineBanner(pendingCount: sync.pendingCount, onTap: () => context.push(DriverRoutes.pSync)),
                const SizedBox(height: BtaSpace.s3),
              ] else if (jobs.stale) ...[
                const BtaBanner(message: 'Đang hiện dữ liệu đã lưu, kéo xuống để tải lại.', tone: BtaTone.warning),
                const SizedBox(height: BtaSpace.s3),
              ],
              if ((_codHeld ?? 0) > 0) ...[
                BtaBanner(
                  message: 'Bạn đang giữ COD ${BtaFormat.vnd(_codHeld)} — nộp lại cho kế toán khi về công ty.',
                  tone: BtaTone.warning,
                  icon: Icons.payments_outlined,
                  actionLabel: 'Chi tiết',
                  onAction: () => context.push(DriverRoutes.pMoney),
                ),
                const SizedBox(height: BtaSpace.s3),
              ],
              _GpsHint(),
              if (jobs.loading) ...[
                const SkeletonCard(lines: 4),
                const SizedBox(height: BtaSpace.s3),
                const SkeletonCard(),
              ] else if (jobs.error != null)
                ErrorState(message: jobs.error!, onRetry: () => context.read<JobsCubit>().load())
              else ...[
                if (headline != null) ...[
                  Text(jobs.running != null ? 'Chuyến đang chạy' : 'Chuyến tiếp theo', style: BtaText.headingSm),
                  const SizedBox(height: BtaSpace.s2),
                  TripCard(
                    trip: headline.toCard(pendingSyncCount: sync.pendingForTrip(headline.id)),
                    highlight: jobs.running != null,
                    onTap: () => context.push(DriverRoutes.tripDetailPath(headline.id)),
                  ),
                  if (headline.nextStop != null) ...[
                    const SizedBox(height: BtaSpace.s2),
                    Text('Điểm tiếp theo: ${headline.nextStop!.sequence}. ${headline.nextStop!.title}', style: BtaText.body.copyWith(color: BtaColors.textMuted)),
                  ],
                  if (headline.openIncidents.isNotEmpty) ...[
                    const SizedBox(height: BtaSpace.s2),
                    BtaBanner(message: 'Chuyến có ${headline.openIncidents.length} sự cố đang xử lý', tone: BtaTone.danger, dense: true),
                  ],
                  const SizedBox(height: BtaSpace.s2),
                  FilledButton.icon(
                    style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                    onPressed: () => context.push(DriverRoutes.tripDetailPath(headline.id)),
                    icon: const Icon(Icons.arrow_forward),
                    label: Text(jobs.running != null ? 'Mở chuyến đang chạy' : 'Xem chuyến'),
                  ),
                  const SizedBox(height: BtaSpace.s5),
                ],
                Row(children: [
                  const Expanded(child: Text('Chuyến hôm nay', style: BtaText.headingSm)),
                  TextButton(onPressed: () => context.go(DriverRoutes.pJobs), child: const Text('Tất cả')),
                ]),
                if (jobs.items.isEmpty)
                  EmptyState(
                    icon: Icons.event_available_outlined,
                    title: 'Hôm nay chưa có chuyến',
                    message: 'Điều phối giao chuyến là chuyến tự hiện ở đây.',
                    actionLabel: 'Xem chuyến sắp tới',
                    onAction: () => context.go(DriverRoutes.pJobs),
                  )
                else
                  for (final t in jobs.items) ...[
                    TripCard(trip: t.toCard(pendingSyncCount: sync.pendingForTrip(t.id)), onTap: () => context.push(DriverRoutes.tripDetailPath(t.id))),
                    const SizedBox(height: BtaSpace.s2),
                  ],
                const SizedBox(height: BtaSpace.s3),
                Row(children: [
                  Expanded(child: OutlinedButton.icon(onPressed: () => context.push(DriverRoutes.pMoney), icon: const Icon(Icons.account_balance_wallet_outlined, size: 18), label: const Text('Thưởng & ứng'))),
                  const SizedBox(width: BtaSpace.s2),
                  Expanded(child: OutlinedButton.icon(onPressed: () => context.push(DriverRoutes.pHistory), icon: const Icon(Icons.history, size: 18), label: const Text('Lịch sử'))),
                ]),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// Nhắc bật vị trí khi có chuyến đang chạy mà chưa cấp quyền.
class _GpsHint extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final g = context.watch<GpsCubit>().state;
    if (g.tripId == null || g.granted) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: BtaSpace.s3),
      child: BtaBanner(
        message: 'Chưa bật vị trí — điều phối không thấy xe đang ở đâu.',
        tone: BtaTone.warning,
        icon: Icons.location_off_outlined,
        actionLabel: 'Bật',
        onAction: () => context.push(DriverRoutes.pGps),
      ),
    );
  }
}
