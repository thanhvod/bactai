import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/di.dart';
import '../../../../core/router/routes.dart';
import '../../domain/jobs_repository.dart';
import '../../../sync/presentation/cubit/sync_cubit.dart';
import '../cubit/jobs_cubit.dart';

/// DA-JOB-01 — danh sách chuyến theo bucket Hôm nay · Sắp tới · Đang chạy · Hoàn thành (không có nút nhận việc).
class JobListPage extends StatelessWidget {
  const JobListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => JobsCubit(getIt<JobsRepository>())..load(),
      child: const _JobListView(),
    );
  }
}

class _JobListView extends StatelessWidget {
  const _JobListView();

  static const _buckets = [
    (JobBucket.today, 'Hôm nay'),
    (JobBucket.upcoming, 'Sắp tới'),
    (JobBucket.running, 'Đang chạy'),
    (JobBucket.done, 'Hoàn thành'),
  ];

  @override
  Widget build(BuildContext context) {
    final s = context.watch<JobsCubit>().state;
    return Scaffold(
      appBar: MobileHeader(
        title: 'Chuyến của tôi',
        actions: [IconButton(tooltip: 'Lịch', onPressed: () => context.push(DriverRoutes.pJobCalendar), icon: const Icon(Icons.calendar_month_outlined))],
      ),
      body: Column(
        children: [
          SizedBox(
            height: 56,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: BtaSpace.s4, vertical: BtaSpace.s2),
              children: [
                for (final (b, label) in _buckets)
                  Padding(
                    padding: const EdgeInsets.only(right: BtaSpace.s2),
                    child: ChoiceChip(label: Text(label), selected: s.bucket == b, onSelected: (_) => context.read<JobsCubit>().load(b)),
                  ),
              ],
            ),
          ),
          if (s.stale) const BtaBanner(message: 'Đang offline — hiện dữ liệu đã lưu.', tone: BtaTone.warning, dense: true),
          Expanded(
            child: s.loading
                ? ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: const [SkeletonCard(), SizedBox(height: BtaSpace.s2), SkeletonCard()])
                : s.error != null
                    ? ErrorState(message: s.error!, onRetry: () => context.read<JobsCubit>().load())
                    : s.items.isEmpty
                        ? const EmptyState(icon: Icons.local_shipping_outlined, message: 'Không có chuyến trong mục này.')
                        : RefreshIndicator(
                            onRefresh: () => context.read<JobsCubit>().load(),
                            child: ListView.separated(
                              padding: const EdgeInsets.all(BtaSpace.s4),
                              itemCount: s.items.length,
                              separatorBuilder: (_, _) => const SizedBox(height: BtaSpace.s2),
                              itemBuilder: (ctx, i) => TripCard(
                                trip: s.items[i].toCard(pendingSyncCount: ctx.watch<SyncCubit>().state.pendingForTrip(s.items[i].id)),
                                highlight: s.items[i].isRunning,
                                onTap: () => context.push(DriverRoutes.tripDetailPath(s.items[i].id)),
                              ),
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
