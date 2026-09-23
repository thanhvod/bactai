import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_scope.dart';
import '../../core/router/routes.dart';
import '../../models/models.dart';
import '../../shared/async_view.dart';
import '../../shared/section_switcher.dart';
import '../../shared/ui_helpers.dart';

const _filters = {'today': 'Hôm nay', 'running': 'Đang chạy', 'upcoming': 'Sắp chạy', 'warning': 'Có cảnh báo'};

/// MA-TRIP-01 — chuyến hôm nay/đang chạy/sắp chạy.
class TripListPage extends StatefulWidget {
  const TripListPage({super.key, this.initialRunning = false});
  final bool initialRunning;
  @override
  State<TripListPage> createState() => _TripListPageState();
}

class _TripListPageState extends State<TripListPage> {
  late String _filter = widget.initialRunning ? 'running' : 'today';
  final _key = GlobalKey<AsyncViewState<PageResult<TripItem>>>();

  Future<PageResult<TripItem>> _load() {
    final repo = AppScope.repo(context);
    final now = DateTime.now();
    String day(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    switch (_filter) {
      case 'running':
        return repo.trips(running: true);
      case 'upcoming':
        return repo.trips(status: const ['SCHEDULED'], dateFrom: day(now));
      case 'warning':
        return repo.trips(hasWarning: true);
      default:
        return repo.trips(dateFrom: day(now), dateTo: day(now));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: MobileHeader(title: 'Chuyến', actions: [
          IconButton(tooltip: 'Theo dõi xe', onPressed: () => context.goNamed(MerchantRoutes.map), icon: const Icon(Icons.map_outlined)),
        ]),
        body: Column(children: [
          const OpsSectionSwitcher(current: 'trips'),
          FilterChipsBar(options: _filters, value: _filter, onChanged: (v) {
            setState(() => _filter = v);
            _key.currentState?.reload();
          }),
          Expanded(
            child: AsyncView<PageResult<TripItem>>(
              key: _key,
              load: _load,
              isEmpty: (p) => p.items.isEmpty,
              emptyMessage: 'Không có chuyến',
              emptyIcon: Icons.local_shipping_outlined,
              builder: (context, page, _) => ListView.separated(
                padding: const EdgeInsets.fromLTRB(BtaSpace.s4, 0, BtaSpace.s4, BtaSpace.s6),
                itemCount: page.items.length,
                separatorBuilder: (_, _) => const SizedBox(height: BtaSpace.s2),
                itemBuilder: (context, i) => TripTile(trip: page.items[i]),
              ),
            ),
          ),
        ]),
      );
}

class TripTile extends StatelessWidget {
  const TripTile({super.key, required this.trip});
  final TripItem trip;
  @override
  Widget build(BuildContext context) {
    final t = trip;
    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: () => context.push(MerchantRoutes.tripDetailPath(t.id)),
        child: Padding(
          padding: const EdgeInsets.all(BtaSpace.s3),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text('${t.code} · ${t.orderCode}', style: BtaText.bodyStrong)),
              if (t.hasWarning) const Padding(padding: EdgeInsets.only(right: 6), child: StatusBadge(label: 'Trùng lịch', tone: BtaTone.warning, compact: true)),
              if (t.openIncidentCount > 0) const Padding(padding: EdgeInsets.only(right: 6), child: StatusBadge(label: 'Sự cố', tone: BtaTone.danger, compact: true)),
              tripBadge(t.status),
            ]),
            if (t.routeSummary != null) Padding(padding: const EdgeInsets.only(top: 4), child: Text(t.routeSummary!, style: BtaText.body)),
            const SizedBox(height: 4),
            Text(
              [BtaFormat.timeWindow(t.plannedStartAt, t.plannedEndAt), BtaFormat.date(t.plannedStartAt), t.vehiclePlate, t.driverName].whereType<String>().where((e) => e.isNotEmpty).join(' · '),
              style: BtaText.bodySm.copyWith(color: BtaColors.textMuted),
            ),
          ]),
        ),
      ),
    );
  }
}
