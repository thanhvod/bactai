import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_scope.dart';
import '../../core/permissions.dart';
import '../../core/router/routes.dart';
import '../../models/models.dart';
import '../../shared/async_view.dart';
import '../../shared/section_switcher.dart';
import '../../shared/ui_helpers.dart';
import '../../shared/warning_line.dart';

const _statusFilters = {
  'all': 'Tất cả',
  'action': 'Cần xử lý',
  'PENDING_CONFIRMATION': 'Chờ xác nhận',
  'IN_PROGRESS': 'Đang thực hiện',
  'COMPLETED': 'Hoàn thành',
  'debt': 'Còn nợ',
};

/// MA-ORD-01 — danh sách đơn (tìm/lọc, mở chi tiết, FAB tạo nhanh).
class OrderListPage extends StatefulWidget {
  const OrderListPage({super.key, this.initialNeedsAction = false});
  final bool initialNeedsAction;
  @override
  State<OrderListPage> createState() => _OrderListPageState();
}

class _OrderListPageState extends State<OrderListPage> {
  late String _filter = widget.initialNeedsAction ? 'action' : 'all';
  String _search = '';
  final _key = GlobalKey<AsyncViewState<PageResult<OrderItem>>>();

  Future<PageResult<OrderItem>> _load() async {
    final repo = AppScope.repo(context);
    final page = await repo.orders(
      search: _search,
      needsAction: _filter == 'action',
      status: _statusFilters.containsKey(_filter) && _filter.toUpperCase() == _filter ? [_filter] : null,
    );
    if (_filter == 'debt') return PageResult(items: page.items.where((o) => o.remainingAmount > 0).toList(), totalCount: page.totalCount);
    return page;
  }

  @override
  Widget build(BuildContext context) {
    final auth = AppScope.of(context).auth;
    return Scaffold(
      appBar: const MobileHeader(title: 'Đơn hàng'),
      floatingActionButton: auth.can(Perm.orderCreate)
          ? FloatingActionButton(tooltip: 'Tạo nhanh đơn', onPressed: () => context.go(MerchantRoutes.pOrderNew), child: const Icon(Icons.add))
          : null,
      body: Column(children: [
        const OpsSectionSwitcher(current: 'orders'),
        Padding(
          padding: const EdgeInsets.fromLTRB(BtaSpace.s4, BtaSpace.s2, BtaSpace.s4, 0),
          child: TextField(
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Mã đơn, khách hàng, tuyến', border: OutlineInputBorder(), isDense: true),
            textInputAction: TextInputAction.search,
            onSubmitted: (v) {
              _search = v.trim();
              _key.currentState?.reload();
            },
          ),
        ),
        FilterChipsBar(options: _statusFilters, value: _filter, onChanged: (v) {
          setState(() => _filter = v);
          _key.currentState?.reload();
        }),
        Expanded(
          child: AsyncView<PageResult<OrderItem>>(
            key: _key,
            load: _load,
            isEmpty: (p) => p.items.isEmpty,
            emptyMessage: 'Không có đơn phù hợp',
            builder: (context, page, _) => ListView.separated(
              padding: const EdgeInsets.fromLTRB(BtaSpace.s4, 0, BtaSpace.s4, 96),
              itemCount: page.items.length,
              separatorBuilder: (_, _) => const SizedBox(height: BtaSpace.s2),
              itemBuilder: (context, i) => OrderCard(order: page.items[i]),
            ),
          ),
        ),
      ]),
    );
  }
}

class OrderCard extends StatelessWidget {
  const OrderCard({super.key, required this.order});
  final OrderItem order;
  @override
  Widget build(BuildContext context) {
    final o = order;
    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: () => context.push(MerchantRoutes.orderDetailPath(o.id)),
        child: Padding(
          padding: const EdgeInsets.all(BtaSpace.s3),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text(o.code, style: BtaText.bodyStrong)),
              orderBadge(o.status),
            ]),
            const SizedBox(height: 4),
            Text(o.customerName, style: BtaText.body),
            if (o.routeSummary != null) Text(o.routeSummary!, style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
            const SizedBox(height: 6),
            Row(children: [
              Expanded(
                child: Text(
                  o.dueDate == null ? 'Chưa có hạn thanh toán' : 'Hạn ${BtaFormat.date(o.dueDate)}${o.overdueDays > 0 ? ' · quá hạn ${o.overdueDays} ngày' : ''}',
                  style: BtaText.caption.copyWith(color: o.overdueDays > 0 ? BtaColors.danger : BtaColors.textSubtle),
                ),
              ),
              if (o.remainingAmount > 0) ...[
                Text('Còn nợ ', style: BtaText.caption.copyWith(color: BtaColors.textMuted)),
                MoneyText(o.remainingAmount, color: BtaColors.warning),
              ] else
                MoneyText(o.totalAmount),
            ]),
            for (final w in o.warnings.take(2)) WarningLine(w),
          ]),
        ),
      ),
    );
  }
}
