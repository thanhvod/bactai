import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_scope.dart';
import '../../core/permissions.dart';
import '../../models/models.dart';
import '../../shared/async_view.dart';
import '../../shared/ui_helpers.dart';
import 'payroll_list_page.dart';

/// Chi tiết + duyệt bảng lương (MA-PAYROLL-01). Duyệt/trả về chỉ admin; trả về bắt buộc lý do.
class PayrollDetailPage extends StatelessWidget {
  const PayrollDetailPage({super.key, required this.payrollId});
  final String payrollId;

  @override
  Widget build(BuildContext context) {
    final scope = AppScope.of(context);
    return Scaffold(
      appBar: MobileHeader(title: 'Duyệt bảng lương', onBack: context.canPop() ? () => context.pop() : null),
      body: AsyncView<PayrollItem>(
        load: () => scope.repository.payroll(payrollId),
        builder: (context, p, reload) {
          final canApprove = scope.auth.can(Perm.payrollApprove) && p.status == 'SUBMITTED';
          final canReturn = scope.auth.can(Perm.payrollReturn) && (p.status == 'SUBMITTED' || p.status == 'APPROVED');
          final t = p.totals;
          final prev = p.previousTotals;
          return Stack(children: [
            ListView(padding: const EdgeInsets.fromLTRB(BtaSpace.s4, BtaSpace.s4, BtaSpace.s4, 120), children: [
              Row(children: [Expanded(child: Text(p.code, style: BtaText.headingLg)), payrollBadge(p.status)]),
              Text(p.periodLabel, style: BtaText.body.copyWith(color: BtaColors.textMuted)),
              if (p.returnReason != null) Padding(padding: const EdgeInsets.only(top: 6), child: BtaBanner(tone: BtaTone.danger, message: 'Lý do trả về: ${p.returnReason}', dense: true)),
              const SizedBox(height: BtaSpace.s3),
              SectionCard(
                title: 'Tổng (${t.driverCount} tài xế)',
                child: Column(children: [
                  MoneyRow('Lương cố định', t.salary),
                  MoneyRow('Thưởng chuyến', t.bonus),
                  MoneyRow('Trừ ứng lương', -t.advance),
                  MoneyRow('Giảm trừ', -t.deduction),
                  if (t.adjustment != 0) MoneyRow('Điều chỉnh kỳ trước', t.adjustment),
                  const Divider(),
                  MoneyRow('Thực lãnh', t.net, strong: true),
                  if (prev != null) InfoRow('Kỳ trước', '${BtaFormat.vnd(prev.net)} (${t.net >= prev.net ? '+' : ''}${BtaFormat.vnd(t.net - prev.net)})'),
                ]),
              ),
              const SizedBox(height: BtaSpace.s3),
              const Text('Theo tài xế', style: BtaText.headingSm),
              for (final l in p.lines)
                Card(
                  margin: const EdgeInsets.only(top: BtaSpace.s2),
                  child: Padding(
                    padding: const EdgeInsets.all(BtaSpace.s3),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [Expanded(child: Text(l.driverName, style: BtaText.bodyStrong)), MoneyText(l.netAmount)]),
                      Text('Lương ${BtaFormat.vnd(l.baseSalary)} · thưởng ${BtaFormat.vnd(l.bonusTotal)} · ứng ${BtaFormat.vnd(l.advanceTotal)} · giảm trừ ${BtaFormat.vnd(l.deductionTotal)}',
                          style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
                      for (final a in l.anomalies) Text(a, style: BtaText.caption.copyWith(color: BtaColors.warning)),
                    ]),
                  ),
                ),
            ]),
            if (canApprove || canReturn)
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: PrimaryBottomAction(
                  label: canApprove ? 'Duyệt' : 'Hủy duyệt',
                  destructive: !canApprove,
                  onPressed: () async {
                    if (canApprove) {
                      final repo = scope.repository;
                      final r = await showReasonBottomSheet(context, title: 'Duyệt ${p.code}', requireReason: false, noteHint: 'Ghi chú (không bắt buộc)', confirmLabel: 'Duyệt');
                      if (r == null || !context.mounted) return;
                      if (await runAction(context, () => repo.approvePayroll(p.id, note: r.note), success: 'Đã duyệt bảng lương')) await reload();
                    } else {
                      await _return(context, p, reload);
                    }
                  },
                  secondaryLabel: canApprove && canReturn ? 'Trả về' : null,
                  onSecondary: canApprove && canReturn ? () => _return(context, p, reload) : null,
                ),
              ),
          ]);
        },
      ),
    );
  }

  Future<void> _return(BuildContext context, PayrollItem p, Future<void> Function() reload) async {
    final repo = AppScope.repo(context);
    final r = await showReasonBottomSheet(context, title: 'Trả về ${p.code}', requireNote: true, noteHint: 'Lý do trả về (bắt buộc, ≥ 5 ký tự)', confirmLabel: 'Trả về');
    if (r == null || !context.mounted) return;
    if (await runAction(context, () => repo.returnPayroll(p.id, r.note ?? ''), success: 'Đã trả về bảng lương')) await reload();
  }
}
