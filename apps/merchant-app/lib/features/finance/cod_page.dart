import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_scope.dart';
import '../../core/permissions.dart';
import '../../models/models.dart';
import '../../shared/async_view.dart';
import '../../shared/money_field.dart';
import '../../shared/ui_helpers.dart';

/// MA-COD-01 — COD tài xế đang giữ; ghi nhận nộp COD (phiếu thu DRIVER_COD_REMITTANCE — thu hồi phải thu, KHÔNG phải doanh thu).
class CodPage extends StatefulWidget {
  const CodPage({super.key});
  @override
  State<CodPage> createState() => _CodPageState();
}

class _CodPageState extends State<CodPage> {
  final _key = GlobalKey<AsyncViewState<CodReport>>();

  @override
  Widget build(BuildContext context) {
    final scope = AppScope.of(context);
    final canRecord = scope.auth.can(Perm.codRemittanceRecord);
    return Scaffold(
      appBar: MobileHeader(title: 'COD tài xế', subtitle: 'Tiền thu hộ tài xế đang giữ', onBack: context.canPop() ? () => context.pop() : null),
      body: AsyncView<CodReport>(
        key: _key,
        load: () => scope.repository.codHeld(),
        isEmpty: (r) => r.rows.where((x) => x.codHeld > 0).isEmpty,
        emptyMessage: 'Không có tài xế nào đang giữ COD',
        builder: (context, r, reload) {
          final rows = r.rows.where((x) => x.codHeld > 0).toList()..sort((a, b) => b.codHeld.compareTo(a.codHeld));
          return ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
            BtaBanner(tone: BtaTone.info, message: 'Ngưỡng cảnh báo: ${BtaFormat.vnd(r.warningAmount)} hoặc ${r.warningDays} ngày. Tổng đang giữ ${BtaFormat.vnd(r.totalHeld)}.', dense: true),
            const SizedBox(height: BtaSpace.s3),
            for (final h in rows)
              Card(
                margin: const EdgeInsets.only(bottom: BtaSpace.s3),
                child: Padding(
                  padding: const EdgeInsets.all(BtaSpace.s3),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Expanded(child: Text(h.driverName, style: BtaText.bodyStrong)),
                      if (h.overThreshold) const StatusBadge(label: 'Vượt ngưỡng', tone: BtaTone.warning, compact: true),
                    ]),
                    const SizedBox(height: 6),
                    MoneyRow('Đang giữ', h.codHeld, strong: true, tone: h.overThreshold ? BtaColors.warning : null),
                    MoneyRow('Đã thu', h.codCollected),
                    MoneyRow('Đã nộp', h.codRemitted),
                    if (h.oldestHeldAt != null) InfoRow('Giữ lâu nhất', '${h.daysHeld} ngày (từ ${BtaFormat.date(h.oldestHeldAt)})'),
                    const SizedBox(height: BtaSpace.s2),
                    Row(children: [
                      if (h.phone != null) OutlinedButton.icon(onPressed: () => callPhone(context, h.phone), icon: const Icon(Icons.call_outlined), label: const Text('Gọi tài xế')),
                      const Spacer(),
                      if (canRecord)
                        FilledButton(
                          onPressed: () async {
                            if (await _record(context, h) == true) await reload();
                          },
                          child: const Text('Ghi nhận nộp COD'),
                        ),
                    ]),
                  ]),
                ),
              ),
          ]);
        },
      ),
    );
  }

  Future<bool?> _record(BuildContext context, CodHolder h) {
    return showModalBottomSheet<bool>(context: context, isScrollControlled: true, builder: (_) => _RemitSheet(holder: h));
  }
}

class _RemitSheet extends StatefulWidget {
  const _RemitSheet({required this.holder});
  final CodHolder holder;
  @override
  State<_RemitSheet> createState() => _RemitSheetState();
}

class _RemitSheetState extends State<_RemitSheet> {
  late final Set<String> _stops = widget.holder.items.map((i) => i.stopId).toSet();
  late int? _amount = widget.holder.codHeld;
  final _note = TextEditingController();
  bool _saving = false;
  String? _error;
  // Khóa idempotency cho lần bấm này (gửi lại không tạo trùng phiếu).
  final _requestId = 'ma-cod-${DateTime.now().microsecondsSinceEpoch}';

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final amt = _amount;
    if (amt == null || amt <= 0) return setState(() => _error = 'Nhập số tiền nộp (> 0)');
    if (amt > widget.holder.codHeld) return setState(() => _error = 'Không được vượt số COD đang giữ (${BtaFormat.vnd(widget.holder.codHeld)})');
    setState(() {
      _saving = true;
      _error = null;
    });
    final ok = await runAction(
      context,
      () => AppScope.repo(context).recordCodRemittance(driverId: widget.holder.driverId, amount: amt, stopIds: _stops.toList(), clientRequestId: _requestId, note: _note.text.trim().isEmpty ? null : _note.text.trim()),
      success: 'Đã ghi nhận ${BtaFormat.vnd(amt)} tài xế nộp COD',
    );
    if (!mounted) return;
    setState(() => _saving = false);
    if (ok) Navigator.of(context).pop(true);
  }

  @override
  Widget build(BuildContext context) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
        child: SafeArea(
          child: ListView(shrinkWrap: true, padding: const EdgeInsets.all(BtaSpace.s4), children: [
            Text('Tài xế ${widget.holder.driverName} nộp COD', style: BtaText.headingMd),
            const SizedBox(height: 4),
            Text('Phiếu thu loại "Tài xế nộp COD" — thu hồi phải thu, không tính doanh thu.', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
            if (_error != null) ...[const SizedBox(height: BtaSpace.s2), BtaBanner(tone: BtaTone.danger, message: _error!, dense: true)],
            const SizedBox(height: BtaSpace.s3),
            for (final i in widget.holder.items)
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                value: _stops.contains(i.stopId),
                onChanged: (v) => setState(() => v == true ? _stops.add(i.stopId) : _stops.remove(i.stopId)),
                title: Text('${i.orderCode} · ${i.customerName}'),
                subtitle: Text('Giữ ${BtaFormat.vnd(i.held)} · ${i.daysHeld} ngày'),
              ),
            const SizedBox(height: BtaSpace.s2),
            MoneyField(label: 'Số tiền nộp', initial: _amount, onChanged: (v) => _amount = v),
            const SizedBox(height: BtaSpace.s2),
            TextField(controller: _note, decoration: const InputDecoration(labelText: 'Ghi chú', border: OutlineInputBorder())),
            const SizedBox(height: BtaSpace.s4),
            SizedBox(height: BtaSize.tapTarget, child: FilledButton(onPressed: _saving ? null : _save, child: Text(_saving ? 'Đang lưu...' : 'Lưu phiếu thu'))),
          ]),
        ),
      );
}
