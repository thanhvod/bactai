import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/app_scope.dart';
import '../../core/permissions.dart';
import '../../core/router/routes.dart';
import '../../models/models.dart';
import '../../shared/async_view.dart';
import '../../shared/kpi_grid.dart';
import '../orders/order_detail_page.dart' show webUrl;

/// MA-FIN-01 — tài chính nhanh: nợ quá hạn, COD tài xế, phiếu gần đây, bảng lương chờ duyệt.
class FinancePage extends StatelessWidget {
  const FinancePage({super.key});

  @override
  Widget build(BuildContext context) {
    final scope = AppScope.of(context);
    final auth = scope.auth;
    if (!auth.can(Perm.debtView) && !auth.can(Perm.financeView) && !auth.can(Perm.driverLedgerView)) {
      return const Scaffold(appBar: MobileHeader(title: 'Tài chính'), body: EmptyState(icon: Icons.lock_outline, message: 'Bạn chưa được cấp quyền xem tài chính'));
    }
    return Scaffold(
      appBar: MobileHeader(title: 'Tài chính', actions: [
        if (auth.can(Perm.financeView))
          IconButton(tooltip: 'Sổ thu chi trên web', icon: const Icon(Icons.open_in_browser), onPressed: () => launchUrl(Uri.parse('$webUrl/finance'), mode: LaunchMode.externalApplication)),
      ]),
      body: AsyncView<FinanceOverview>(
        load: scope.repository.financeOverview,
        builder: (context, f, _) => ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
          KpiGrid(
            children: [
              KpiTile(label: 'Nợ quá hạn', value: BtaFormat.vnd(f.overdue), sub: '${f.debtRows.length} khách', tone: f.overdue > 0 ? BtaTone.danger : BtaTone.neutral, onTap: () => context.go('${MerchantRoutes.pCustomers}?debt=OVERDUE')),
              KpiTile(label: 'COD tài xế giữ', value: BtaFormat.vnd(f.cod.totalHeld), sub: '${f.cod.rows.where((r) => r.overThreshold).length} vượt ngưỡng', tone: f.cod.rows.any((r) => r.overThreshold) ? BtaTone.warning : BtaTone.neutral, onTap: () => context.goNamed(MerchantRoutes.cod)),
              KpiTile(label: 'Bảng lương chờ duyệt', value: '${f.pendingPayrolls.length}', tone: f.pendingPayrolls.isNotEmpty ? BtaTone.warning : BtaTone.neutral, onTap: () => context.go(MerchantRoutes.pPayroll)),
              KpiTile(label: 'Phải thu (quá hạn)', value: BtaFormat.vnd(f.receivable), tone: BtaTone.info),
            ],
          ),
          const SizedBox(height: BtaSpace.s4),
          SectionCard(
            title: 'Khách quá hạn',
            child: f.debtRows.isEmpty
                ? Text('Không có khách quá hạn', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted))
                : Column(children: [
                    for (final r in f.debtRows.take(5))
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        onTap: () => context.push(MerchantRoutes.customerDetailPath(r.customerId)),
                        title: Text(r.customerName),
                        subtitle: Text('Quá hạn ${r.maxOverdueDays} ngày'),
                        trailing: MoneyText(r.overdueAmount, color: BtaColors.danger),
                      ),
                  ]),
          ),
          const SizedBox(height: BtaSpace.s3),
          SectionCard(
            title: 'Phiếu thu gần đây',
            child: f.recentPayments.isEmpty
                ? Text('Chưa có phiếu thu', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted))
                : Column(children: [
                    for (final p in f.recentPayments)
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text('${p.code} · ${p.typeLabel}'),
                        subtitle: Text('${p.payerLabel} · ${BtaFormat.date(p.receivedAt)}${p.notRevenue ? '\nKhông phải doanh thu' : ''}'),
                        trailing: MoneyText(p.amount, color: BtaColors.success),
                      ),
                  ]),
          ),
          const SizedBox(height: BtaSpace.s3),
          SectionCard(
            title: 'Phiếu chi gần đây',
            child: f.recentExpenses.isEmpty
                ? Text('Chưa có phiếu chi', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted))
                : Column(children: [
                    for (final e in f.recentExpenses)
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text('${e.code} · ${e.categoryName ?? e.kindLabel}'),
                        subtitle: Text('${BtaFormat.date(e.expenseDate)}${e.paidStatus == 'UNPAID' ? ' · chưa trả' : ''}'),
                        trailing: MoneyText(e.amount),
                      ),
                  ]),
          ),
        ]),
      ),
    );
  }
}
