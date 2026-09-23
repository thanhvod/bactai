import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/di.dart';
import '../../../jobs/presentation/cubit/jobs_cubit.dart' show errorMessage;
import '../../data/money_repository.dart';

/// DA-MONEY-01 — thưởng theo chuyến, ứng lương, tạm ứng chuyến, COD đang giữ. Chỉ dữ liệu của chính tài xế.
class MoneyPage extends StatefulWidget {
  const MoneyPage({super.key});
  @override
  State<MoneyPage> createState() => _MoneyPageState();
}

class _MoneyPageState extends State<MoneyPage> {
  late Future<DriverMoney> _f = getIt<MoneyRepository>().load();

  Future<void> _reload() async {
    setState(() => _f = getIt<MoneyRepository>().load());
    await _f;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: MobileHeader(title: 'Thưởng & khoản ứng của tôi', onBack: () => context.pop()),
      body: FutureBuilder<DriverMoney>(
        future: _f,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: const [SkeletonCard(lines: 3), SizedBox(height: BtaSpace.s3), SkeletonCard()]);
          }
          if (snap.hasError) return ErrorState(message: errorMessage(snap.error!), onRetry: _reload);
          final m = snap.data!;
          return RefreshIndicator(
            onRefresh: _reload,
            child: ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
              if (m.overAmount || m.overDays) ...[
                BtaBanner(message: 'Bạn đang giữ COD ${BtaFormat.vnd(m.codHeld)} (${m.daysHeld} ngày) — vượt ngưỡng công ty, nộp lại sớm cho kế toán.', tone: BtaTone.danger),
                const SizedBox(height: BtaSpace.s3),
              ],
              DriverWallet(
                codHeld: m.codHeld,
                reimbursable: m.companyOwesDriver,
                bonuses: m.bonuses,
                salaryAdvances: m.salaryAdvances,
                tripAdvances: m.tripAdvances,
                codRemittances: m.codRemittances,
              ),
              if (m.codItems.isNotEmpty) ...[
                const SizedBox(height: BtaSpace.s4),
                SectionCard(
                  title: 'COD chưa nộp theo điểm',
                  child: Column(children: [
                    for (final c in m.codItems)
                      ListRow(label: c.label, value: BtaFormat.vnd(c.amount), trailing: c.sub == null ? null : Text(c.sub!, style: BtaText.caption.copyWith(color: BtaColors.warning))),
                  ]),
                ),
              ],
              const SizedBox(height: BtaSpace.s3),
              Text('Số liệu lương chính thức theo bảng lương được duyệt. Có sai lệch hãy báo điều phối/kế toán.', style: BtaText.caption.copyWith(color: BtaColors.textSubtle)),
            ]),
          );
        },
      ),
    );
  }
}
