import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_scope.dart';
import '../../core/permissions.dart';
import '../../core/router/routes.dart';
import '../../models/models.dart';
import '../../shared/async_view.dart';
import '../../shared/ui_helpers.dart';

StatusBadge payrollBadge(String status) {
  const tones = {'DRAFT': BtaTone.neutral, 'SUBMITTED': BtaTone.warning, 'RETURNED': BtaTone.danger, 'APPROVED': BtaTone.primary, 'PAID': BtaTone.success, 'CANCELLED': BtaTone.danger};
  return StatusBadge(label: payrollStatusLabels[status] ?? status, tone: tones[status] ?? BtaTone.neutral, compact: true);
}

const _filters = {'SUBMITTED': 'Chờ duyệt', 'APPROVED': 'Đã duyệt', 'RETURNED': 'Bị trả về', 'PAID': 'Đã chi trả'};

/// MA-PAYROLL-01 — danh sách bảng lương chờ duyệt (giám đốc duyệt/trả về ở chi tiết).
class PayrollListPage extends StatefulWidget {
  const PayrollListPage({super.key});
  @override
  State<PayrollListPage> createState() => _PayrollListPageState();
}

class _PayrollListPageState extends State<PayrollListPage> {
  String _status = 'SUBMITTED';
  final _key = GlobalKey<AsyncViewState<List<PayrollItem>>>();

  @override
  Widget build(BuildContext context) {
    final scope = AppScope.of(context);
    if (!scope.auth.can(Perm.payrollView)) {
      return Scaffold(appBar: MobileHeader(title: 'Duyệt bảng lương', onBack: context.canPop() ? () => context.pop() : null), body: const EmptyState(icon: Icons.lock_outline, message: 'Bạn chưa được cấp quyền xem bảng lương'));
    }
    return Scaffold(
      appBar: MobileHeader(title: 'Bảng lương', subtitle: scope.auth.can(Perm.payrollApprove) ? 'Giám đốc duyệt / trả về' : 'Chỉ giám đốc được duyệt', onBack: context.canPop() ? () => context.pop() : null),
      body: Column(children: [
        FilterChipsBar(options: _filters, value: _status, onChanged: (v) {
          setState(() => _status = v);
          _key.currentState?.reload();
        }),
        Expanded(
          child: AsyncView<List<PayrollItem>>(
            key: _key,
            load: () => scope.repository.payrolls(status: [_status]),
            isEmpty: (l) => l.isEmpty,
            emptyMessage: 'Không có bảng lương ở trạng thái này',
            builder: (context, items, _) => ListView.separated(
              padding: const EdgeInsets.all(BtaSpace.s4),
              itemCount: items.length,
              separatorBuilder: (_, _) => const SizedBox(height: BtaSpace.s2),
              itemBuilder: (context, i) {
                final p = items[i];
                return Card(
                  margin: EdgeInsets.zero,
                  child: ListTile(
                    onTap: () => context.push(MerchantRoutes.payrollDetailPath(p.id)),
                    title: Row(children: [Expanded(child: Text('${p.code} · ${p.periodLabel}', style: BtaText.bodyStrong)), payrollBadge(p.status)]),
                    subtitle: Text('${p.totals.driverCount} tài xế${p.submittedByName != null ? ' · gửi bởi ${p.submittedByName}' : ''}${p.anomalyCount > 0 ? ' · ${p.anomalyCount} cảnh báo' : ''}'),
                    trailing: MoneyText(p.totals.net),
                  ),
                );
              },
            ),
          ),
        ),
      ]),
    );
  }
}
