import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/routes.dart';
import '../../../../core/ui/ui_helpers.dart';
import '../cubit/trip_cubit.dart';
import 'trip_detail_page.dart';

/// DA-STOP-01 — điểm dừng theo thứ tự; gọi liên hệ, chỉ đường, mở điểm.
class StopListPage extends StatelessWidget {
  const StopListPage({super.key, required this.tripId});
  final String tripId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => newTripCubit()..load(tripId),
      child: BlocBuilder<TripCubit, TripViewState>(builder: (context, s) {
        final t = s.trip;
        return Scaffold(
          appBar: MobileHeader(title: 'Điểm dừng', subtitle: t?.code, onBack: () => context.pop()),
          body: s.loading
              ? ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: const [SkeletonCard(), SizedBox(height: BtaSpace.s2), SkeletonCard()])
              : s.error != null
                  ? ErrorState(message: s.error!, onRetry: () => context.read<TripCubit>().load(tripId))
                  : t!.stops.isEmpty
                      ? const EmptyState(icon: Icons.place_outlined, message: 'Chuyến chưa được giao điểm dừng nào. Liên hệ điều phối.')
                      : RefreshIndicator(
                          onRefresh: () => context.read<TripCubit>().load(tripId),
                          child: ListView.separated(
                            padding: const EdgeInsets.all(BtaSpace.s4),
                            itemCount: t.stops.length,
                            separatorBuilder: (_, _) => const SizedBox(height: BtaSpace.s2),
                            itemBuilder: (_, i) {
                              final st = t.stops[i];
                              return StopCard(
                                stop: st.toCard(),
                                onTap: () async {
                                  final cubit = context.read<TripCubit>();
                                  await context.push(DriverRoutes.stopDetailPath(st.id));
                                  await cubit.load(tripId);
                                },
                                onCall: st.contactPhone == null ? null : () => callPhone(context, st.contactPhone),
                                onNavigate: () => openDirections(context, lat: st.lat, lng: st.lng, address: st.address),
                              );
                            },
                          ),
                        ),
        );
      }),
    );
  }
}
