import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_scope.dart';
import '../../core/router/routes.dart';
import '../../models/models.dart';
import '../../shared/async_view.dart';
import '../../shared/section_switcher.dart';
import '../../shared/ui_helpers.dart';

const _filters = {'all': 'Tất cả', 'HAS_DEBT': 'Còn nợ', 'OVERDUE': 'Quá hạn', 'OVER_LIMIT': 'Vượt hạn mức', 'HAS_CREDIT': 'Có số dư'};

/// MA-CUS-01 — tìm khách, công nợ, gọi nhanh.
class CustomerListPage extends StatefulWidget {
  const CustomerListPage({super.key, this.initialDebt});
  final String? initialDebt;
  @override
  State<CustomerListPage> createState() => _CustomerListPageState();
}

class _CustomerListPageState extends State<CustomerListPage> {
  late String _filter = _filters.containsKey(widget.initialDebt) ? widget.initialDebt! : 'all';
  String _search = '';
  final _key = GlobalKey<AsyncViewState<PageResult<CustomerItem>>>();

  @override
  Widget build(BuildContext context) {
    final repo = AppScope.repo(context);
    return Scaffold(
      appBar: const MobileHeader(title: 'Khách hàng'),
      body: Column(children: [
        const OpsSectionSwitcher(current: 'customers'),
        Padding(
          padding: const EdgeInsets.fromLTRB(BtaSpace.s4, BtaSpace.s2, BtaSpace.s4, 0),
          child: TextField(
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Tên, SĐT, MST', border: OutlineInputBorder(), isDense: true),
            onSubmitted: (v) {
              _search = v.trim();
              _key.currentState?.reload();
            },
          ),
        ),
        FilterChipsBar(options: _filters, value: _filter, onChanged: (v) {
          setState(() => _filter = v);
          _key.currentState?.reload();
        }),
        Expanded(
          child: AsyncView<PageResult<CustomerItem>>(
            key: _key,
            load: () => repo.customers(search: _search, debtStatus: _filter == 'all' ? null : _filter),
            isEmpty: (p) => p.items.isEmpty,
            emptyMessage: 'Không có khách hàng phù hợp',
            builder: (context, page, _) => ListView.separated(
              itemCount: page.items.length,
              separatorBuilder: (_, _) => const Divider(height: 1),
              itemBuilder: (context, i) {
                final c = page.items[i];
                return ListTile(
                  onTap: () => context.push(MerchantRoutes.customerDetailPath(c.id)),
                  onLongPress: () => callPhone(context, c.phone),
                  title: Text(c.name, style: BtaText.bodyStrong),
                  subtitle: Text([
                    [c.code, c.phone].whereType<String>().join(' · '),
                    if (c.overdueAmount > 0) 'Quá hạn ${BtaFormat.vnd(c.overdueAmount)} (${c.maxOverdueDays} ngày)',
                    if (c.creditBalance > 0) 'Số dư ${BtaFormat.vnd(c.creditBalance)}',
                  ].join('\n')),
                  trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                    MoneyText(c.remaining, color: c.remaining > 0 ? BtaColors.warning : BtaColors.textMuted),
                    if (c.overLimit) const StatusBadge(label: 'Vượt hạn mức', tone: BtaTone.danger, compact: true),
                  ]),
                );
              },
            ),
          ),
        ),
      ]),
    );
  }
}
