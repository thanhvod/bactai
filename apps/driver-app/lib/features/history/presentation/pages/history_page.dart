import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/di.dart';
import '../../../../core/router/routes.dart';
import '../../../jobs/domain/jobs_repository.dart';
import '../../../jobs/presentation/cubit/jobs_cubit.dart';

/// DA-HIST-01 — chuyến đã hoàn thành/hủy (chỉ xem): POD, COD, thưởng.
class HistoryPage extends StatelessWidget {
  const HistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => JobsCubit(getIt<JobsRepository>(), bucket: JobBucket.done)..load(),
      child: BlocBuilder<JobsCubit, JobsState>(builder: (context, s) {
        return Scaffold(
          appBar: MobileHeader(title: 'Lịch sử chuyến', onBack: () => context.pop()),
          body: s.loading
              ? ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: const [SkeletonCard(), SizedBox(height: BtaSpace.s2), SkeletonCard()])
              : s.error != null
                  ? ErrorState(message: s.error!, onRetry: () => context.read<JobsCubit>().load())
                  : s.items.isEmpty
                      ? const EmptyState(icon: Icons.history, message: 'Chưa có chuyến hoàn thành.')
                      : RefreshIndicator(
                          onRefresh: () => context.read<JobsCubit>().load(),
                          child: ListView.separated(
                            padding: const EdgeInsets.all(BtaSpace.s4),
                            itemCount: s.items.length,
                            separatorBuilder: (_, _) => const SizedBox(height: BtaSpace.s2),
                            itemBuilder: (_, i) {
                              final t = s.items[i];
                              final pods = t.stops.fold<int>(0, (a, b) => a + b.podCount);
                              return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                                TripCard(trip: t.toCard(), onTap: () => context.push(DriverRoutes.tripDetailPath(t.id))),
                                Padding(
                                  padding: const EdgeInsets.only(top: 4, left: 4),
                                  child: Text(
                                    [
                                      if (t.actualEndAt != null) 'Xong ${BtaFormat.dateTime(t.actualEndAt)}',
                                      '$pods ảnh POD',
                                      if (t.codActualTotal > 0) 'COD ${BtaFormat.vnd(t.codActualTotal)}',
                                      if (t.driverBonusAmount > 0) 'Thưởng ${BtaFormat.vnd(t.driverBonusAmount)}',
                                    ].join(' · '),
                                    style: BtaText.caption.copyWith(color: BtaColors.textMuted),
                                  ),
                                ),
                              ]);
                            },
                          ),
                        ),
        );
      }),
    );
  }
}
