import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';

import '../../core/push/merchant_push.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_scope.dart';
import '../../core/permissions.dart';
import '../../core/router/routes.dart';
import '../../models/models.dart';
import '../../shared/async_view.dart';
import '../../shared/kpi_grid.dart';
import '../../shared/ui_helpers.dart';

class HomeData {
  const HomeData(this.summary, this.unread);
  final DashboardData summary;
  final int unread;
}

/// MA-HOME-01 — KPI ngắn + chuyến đang chạy; mở nhanh việc cần xử lý.
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final scope = AppScope.of(context);
    final auth = scope.auth;
    return Scaffold(
      appBar: MobileHeader(
        title: 'Tổng quan',
        subtitle: auth.merchantName,
        actions: [
          IconButton(tooltip: 'Theo dõi xe', onPressed: () => context.goNamed(MerchantRoutes.map), icon: const Icon(Icons.map_outlined)),
          IconButton(tooltip: 'Thông báo', onPressed: () => context.goNamed(MerchantRoutes.notifications), icon: const Icon(Icons.notifications_outlined)),
        ],
      ),
      floatingActionButton: auth.can(Perm.orderCreate)
          ? FloatingActionButton.extended(onPressed: () => context.go(MerchantRoutes.pOrderNew), icon: const Icon(Icons.add), label: const Text('Tạo nhanh đơn'))
          : null,
      body: AsyncView<HomeData>(
        refreshOn: merchantPushTick,
        load: () async {
          final r = await Future.wait([scope.repository.dashboard(), scope.repository.unreadNotificationCount()]);
          return HomeData(r[0] as DashboardData, r[1] as int);
        },
        builder: (context, d, reload) => _HomeBody(data: d),
      ),
    );
  }
}

class _HomeBody extends StatelessWidget {
  const _HomeBody({required this.data});
  final HomeData data;

  @override
  Widget build(BuildContext context) {
    final s = data.summary;
    final auth = AppScope.of(context).auth;
    final running = s.todayTripList.where((t) => tripRunningStatuses.contains(tripStatusFromApi(t.status))).take(3).toList();
    final kpis = <Widget>[
      KpiTile(label: 'Chuyến đang chạy', value: '${s.runningTrips}', sub: '${s.todayTrips} chuyến hôm nay', tone: BtaTone.accent, onTap: () => context.go('${MerchantRoutes.pTrips}?running=1')),
      KpiTile(label: 'Đơn cần xử lý', value: '${s.ordersNeedAction}', sub: '${s.unassignedOrders} chưa xếp xe', tone: s.ordersNeedAction > 0 ? BtaTone.warning : BtaTone.neutral, onTap: () => context.go('${MerchantRoutes.pOrders}?needsAction=1')),
      if (auth.can(Perm.debtView))
        KpiTile(label: 'Nợ quá hạn', value: BtaFormat.vnd(s.overdueAmount), sub: '${s.overdueCustomers} khách', tone: s.overdueAmount > 0 ? BtaTone.danger : BtaTone.neutral, onTap: () => context.go('${MerchantRoutes.pCustomers}?debt=OVERDUE')),
      if (auth.can(Perm.driverLedgerView))
        KpiTile(label: 'COD tài xế giữ', value: BtaFormat.vnd(s.codHeldAmount), sub: s.codOverThreshold > 0 ? '${s.codOverThreshold} tài xế vượt ngưỡng' : '${s.codHeldDrivers} tài xế', tone: s.codOverThreshold > 0 ? BtaTone.warning : BtaTone.neutral, onTap: () => context.goNamed(MerchantRoutes.cod)),
      KpiTile(label: 'Sự cố đang mở', value: '${s.openIncidents}', tone: s.openIncidents > 0 ? BtaTone.danger : BtaTone.neutral, onTap: () => context.go('${MerchantRoutes.pTrips}?running=1')),
      if (auth.can(Perm.payrollView))
        KpiTile(label: 'Bảng lương chờ duyệt', value: '${s.payrollPending}', tone: s.payrollPending > 0 ? BtaTone.warning : BtaTone.neutral, onTap: () => context.go(MerchantRoutes.pPayroll)),
    ];
    return ListView(
      padding: const EdgeInsets.all(BtaSpace.s4),
      children: [
        if (data.unread > 0)
          Padding(
            padding: const EdgeInsets.only(bottom: BtaSpace.s3),
            child: BtaBanner(tone: BtaTone.info, message: 'Bạn có ${data.unread} thông báo chưa đọc', actionLabel: 'Xem', onAction: () => context.goNamed(MerchantRoutes.notifications)),
          ),
        KpiGrid(
          children: kpis,
        ),
        const SizedBox(height: BtaSpace.s5),
        Row(children: [
          const Expanded(child: Text('Chuyến đang chạy', style: BtaText.headingSm)),
          TextButton(onPressed: () => context.go('${MerchantRoutes.pTrips}?running=1'), child: const Text('Xem tất cả')),
        ]),
        if (running.isEmpty)
          const EmptyState(icon: Icons.local_shipping_outlined, message: 'Không có chuyến nào đang chạy')
        else
          for (final t in running)
            Card(
              margin: const EdgeInsets.only(bottom: BtaSpace.s2),
              child: ListTile(
                onTap: () => context.push(MerchantRoutes.tripDetailPath(t.id)),
                title: Row(children: [
                  Expanded(child: Text(t.code, style: BtaText.bodyStrong)),
                  if (t.openIncident) const Padding(padding: EdgeInsets.only(right: 6), child: StatusBadge(label: 'Sự cố', tone: BtaTone.danger, compact: true)),
                  tripBadge(t.status),
                ]),
                subtitle: Text([t.routeSummary, [t.vehiclePlate, t.driverName].whereType<String>().join(' · ')].whereType<String>().where((e) => e.isNotEmpty).join('\n')),
              ),
            ),
      ],
    );
  }
}
