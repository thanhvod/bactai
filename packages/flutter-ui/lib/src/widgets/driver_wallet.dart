import 'package:flutter/material.dart';
import '../format.dart';
import '../tokens/bta_tokens.dart';
import 'money_text.dart';
import 'section_card.dart';

class WalletEntry {
  const WalletEntry({required this.label, required this.amount, this.date, this.sub, this.onTap});
  final String label;
  final int amount;
  final DateTime? date;
  final String? sub;
  final VoidCallback? onTap;
}

/// "Thưởng & khoản ứng của tôi": chỉ dữ liệu liên quan tài xế, không hiển thị tài chính công ty.
class DriverWallet extends StatelessWidget {
  const DriverWallet({
    super.key,
    required this.codHeld,
    required this.bonuses,
    required this.salaryAdvances,
    required this.tripAdvances,
    this.codRemittances = const [],
    this.reimbursable = 0,
  });

  final int codHeld;
  final int reimbursable;
  final List<WalletEntry> bonuses;
  final List<WalletEntry> salaryAdvances;
  final List<WalletEntry> tripAdvances;
  final List<WalletEntry> codRemittances;

  int _sum(List<WalletEntry> l) => l.fold(0, (a, b) => a + b.amount);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(children: [
          Expanded(child: _Summary('COD đang giữ', codHeld, codHeld > 0 ? BtaTone.warning : BtaTone.success)),
          const SizedBox(width: BtaSpace.s2),
          Expanded(child: _Summary('Công ty còn hoàn', reimbursable, reimbursable > 0 ? BtaTone.info : BtaTone.neutral)),
        ]),
        const SizedBox(height: BtaSpace.s3),
        _Section('Thưởng chuyến', bonuses, _sum(bonuses)),
        const SizedBox(height: BtaSpace.s3),
        _Section('Ứng lương', salaryAdvances, _sum(salaryAdvances)),
        const SizedBox(height: BtaSpace.s3),
        _Section('Tạm ứng chuyến', tripAdvances, _sum(tripAdvances)),
        if (codRemittances.isNotEmpty) ...[
          const SizedBox(height: BtaSpace.s3),
          _Section('Đã nộp COD', codRemittances, _sum(codRemittances)),
        ],
      ],
    );
  }
}

class _Summary extends StatelessWidget {
  const _Summary(this.label, this.amount, this.tone);
  final String label;
  final int amount;
  final BtaTone tone;
  @override
  Widget build(BuildContext context) {
    final c = BtaToneColors.of(tone);
    return Container(
      padding: const EdgeInsets.all(BtaSpace.s3),
      decoration: BoxDecoration(color: c.bg, borderRadius: BorderRadius.circular(BtaRadius.lg)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: BtaText.caption.copyWith(color: c.fg)),
        const SizedBox(height: BtaSpace.s1),
        MoneyText(amount, style: BtaText.headingMd, color: c.fg),
      ]),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section(this.title, this.entries, this.total);
  final String title;
  final List<WalletEntry> entries;
  final int total;
  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: title,
      trailing: MoneyText(total),
      padding: const EdgeInsets.fromLTRB(BtaSpace.s4, BtaSpace.s4, BtaSpace.s4, BtaSpace.s2),
      child: entries.isEmpty
          ? Padding(padding: const EdgeInsets.only(bottom: BtaSpace.s2), child: Text('Chưa có khoản nào', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)))
          : Column(children: [
              for (final e in entries)
                InkWell(
                  onTap: e.onTap,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: BtaSpace.s2),
                    child: Row(children: [
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(e.label, style: BtaText.body),
                          if (e.sub != null || e.date != null)
                            Text([if (e.date != null) BtaFormat.date(e.date), if (e.sub != null) e.sub].join(' · '), style: BtaText.caption.copyWith(color: BtaColors.textSubtle)),
                        ]),
                      ),
                      MoneyText(e.amount),
                    ]),
                  ),
                ),
            ]),
    );
  }
}
