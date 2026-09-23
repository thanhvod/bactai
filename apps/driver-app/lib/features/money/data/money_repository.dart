import 'package:bta_flutter_ui/bta_flutter_ui.dart';

import '../../../core/api/driver_api.dart';

class DriverMoney {
  const DriverMoney({
    required this.codHeld,
    required this.companyOwesDriver,
    required this.netBalance,
    required this.bonuses,
    required this.salaryAdvances,
    required this.tripAdvances,
    required this.codRemittances,
    required this.codItems,
    this.overAmount = false,
    this.overDays = false,
    this.daysHeld = 0,
  });
  final int codHeld;
  final int companyOwesDriver;
  final int netBalance;
  final List<WalletEntry> bonuses;
  final List<WalletEntry> salaryAdvances;
  final List<WalletEntry> tripAdvances;
  final List<WalletEntry> codRemittances;
  final List<WalletEntry> codItems;
  final bool overAmount;
  final bool overDays;
  final int daysHeld;
}

int _m(Object? v) => (v as num?)?.toInt() ?? 0;
DateTime? _d(Object? v) => v == null ? null : DateTime.tryParse(v.toString())?.toLocal();

class MoneyRepository {
  MoneyRepository(this._api);
  final DriverApi _api;

  /// DA-MONEY-01: chỉ dữ liệu của chính tài xế (backend ép driverId = mình).
  Future<DriverMoney> load() async {
    final j = await _api.driverLedger();
    List<Map<String, dynamic>> l(String k) => ((j[k] as List?) ?? const []).cast<Map<String, dynamic>>();
    return DriverMoney(
      codHeld: _m(j['codHeld']),
      companyOwesDriver: _m(j['companyOwesDriver']),
      netBalance: _m(j['netBalance']),
      overAmount: j['overAmount'] == true,
      overDays: j['overDays'] == true,
      daysHeld: _m(j['daysHeld']),
      bonuses: [for (final b in l('tripBonuses')) WalletEntry(label: 'Chuyến ${b['tripCode']}', sub: b['orderCode'] as String?, amount: _m(b['amount']), date: _d(b['date']))],
      salaryAdvances: [for (final e in l('salaryAdvances')) WalletEntry(label: e['code'] as String? ?? 'Ứng lương', sub: e['description'] as String?, amount: _m(e['amount']), date: _d(e['expenseDate']))],
      tripAdvances: [
        for (final a in l('tripAdvances'))
          WalletEntry(label: 'Tạm ứng ${a['tripCode']}', sub: 'Đã chi ${BtaFormat.vnd(_m(a['spentFromAdvance']))} · còn ${BtaFormat.vnd(_m(a['difference']))}', amount: _m(a['advanceAmount'])),
      ],
      codRemittances: [for (final p in l('codRemittances')) WalletEntry(label: 'Đã nộp ${p['code']}', amount: _m(p['amount']), date: _d(p['receivedAt']))],
      codItems: [for (final c in l('codItems')) WalletEntry(label: '${c['orderCode']} · ${c['stopName'] ?? c['address']}', sub: 'Giữ ${c['daysHeld']} ngày', amount: _m(c['held']), date: _d(c['collectedAt']))],
    );
  }
}
