import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/app_scope.dart';
import '../../core/permissions.dart';
import '../../models/models.dart';
import '../../shared/async_view.dart';
import '../../shared/ui_helpers.dart';
import '../orders/order_detail_page.dart' show webUrl;

/// MA-RPT-01 — doanh thu (cước + add-on), chi phí, lãi/lỗ; công nợ; COD. Xem sâu trên web.
class ReportsPage extends StatefulWidget {
  const ReportsPage({super.key});
  @override
  State<ReportsPage> createState() => _ReportsPageState();
}

class _ReportsPageState extends State<ReportsPage> {
  String _period = 'MONTH';
  final _key = GlobalKey<AsyncViewState<ReportsOverview>>();

  @override
  Widget build(BuildContext context) {
    final scope = AppScope.of(context);
    if (!scope.auth.can(Perm.reportView)) {
      return const Scaffold(appBar: MobileHeader(title: 'Báo cáo'), body: EmptyState(icon: Icons.lock_outline, message: 'Bạn chưa được cấp quyền xem báo cáo'));
    }
    return Scaffold(
      appBar: MobileHeader(title: 'Báo cáo', actions: [
        IconButton(tooltip: 'Xem sâu trên web', icon: const Icon(Icons.open_in_browser), onPressed: () => launchUrl(Uri.parse('$webUrl/reports'), mode: LaunchMode.externalApplication)),
      ]),
      body: Column(children: [
        FilterChipsBar(options: const {'MONTH': '6 tháng', 'WEEK': '8 tuần'}, value: _period, onChanged: (v) {
          setState(() => _period = v);
          _key.currentState?.reload();
        }),
        Expanded(
          child: AsyncView<ReportsOverview>(
            key: _key,
            load: () => scope.repository.reports(period: _period),
            builder: (context, r, _) {
              final maxRevenue = r.series.fold<int>(1, (m, x) => x.revenue > m ? x.revenue : m);
              return ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
                SectionCard(
                  title: 'Kết quả kinh doanh',
                  child: Column(children: [
                    MoneyRow('Doanh thu (cước + dịch vụ)', r.totals.revenue, strong: true),
                    MoneyRow('Chi phí', r.totals.cost),
                    MoneyRow('Lãi/lỗ', r.totals.profit, strong: true, tone: r.totals.profit < 0 ? BtaColors.danger : BtaColors.success),
                    if (r.totals.margin != null) InfoRow('Biên lợi nhuận', '${r.totals.margin!.toStringAsFixed(1)}%'),
                    const SizedBox(height: 4),
                    Text('Doanh thu tính theo đơn, không gồm phiếu thu hay tiền tài xế nộp COD.', style: BtaText.caption.copyWith(color: BtaColors.textSubtle)),
                  ]),
                ),
                const SizedBox(height: BtaSpace.s3),
                SectionCard(
                  title: 'Theo ${_period == 'WEEK' ? 'tuần' : 'tháng'}',
                  child: Column(children: [
                    for (final row in r.series)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(children: [Expanded(child: Text(row.label, style: BtaText.bodySm)), MoneyText(row.profit, color: row.profit < 0 ? BtaColors.danger : null, style: BtaText.bodySm)]),
                          const SizedBox(height: 4),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(BtaRadius.sm),
                            child: LinearProgressIndicator(value: row.revenue / maxRevenue, minHeight: 8, color: BtaColors.chart1, backgroundColor: BtaColors.surfaceMuted),
                          ),
                          Text('Doanh thu ${BtaFormat.vnd(row.revenue)} · chi phí ${BtaFormat.vnd(row.cost)}', style: BtaText.caption.copyWith(color: BtaColors.textMuted)),
                        ]),
                      ),
                  ]),
                ),
                const SizedBox(height: BtaSpace.s3),
                SectionCard(
                  title: 'Công nợ & COD',
                  child: Column(children: [
                    MoneyRow('Công nợ khách', r.totalDebt, strong: true),
                    MoneyRow('Trong đó quá hạn', r.totalOverdue, tone: r.totalOverdue > 0 ? BtaColors.danger : null),
                    MoneyRow('Số dư khách chưa phân bổ', r.totalCredit),
                    MoneyRow('COD tài xế đang giữ', r.codHeld, tone: r.codOverThreshold > 0 ? BtaColors.warning : null),
                    if (r.codOverThreshold > 0) InfoRow('Vượt ngưỡng', '${r.codOverThreshold} tài xế'),
                  ]),
                ),
              ]);
            },
          ),
        ),
      ]),
    );
  }
}
