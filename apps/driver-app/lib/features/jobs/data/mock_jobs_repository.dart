import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:bta_flutter_ui/bta_flutter_ui.dart';

import '../domain/jobs_repository.dart';
import '../domain/models.dart';

/// Dữ liệu mẫu theo doc/3-TECHNICAL/SEED-SCENARIOS.md (tài xế Nguyễn Văn Tài) — chạy UI không cần API (`USE_MOCK=true`).
class MockJobsRepository implements JobsRepository {
  final Map<String, DriverTrip> _overlay = {};

  List<DriverTrip> _all() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    DriverStop stop(String id, int seq, StopType type, String name, String address, StopStatus st, {int? cod, int? codActual}) => DriverStop(
        id: id, orderId: 'o', type: type, sequence: seq, address: address, locationName: name, status: st, codExpected: cod, codActual: codActual,
        contactName: seq == 1 ? 'Anh Nam' : 'Chị Hạnh', contactPhone: '0912000001', lat: 10.8, lng: 106.7, plannedAt: today.add(Duration(hours: 6 + seq * 4)));
    return [
      DriverTrip(
        id: 'trip-1', code: 'CX-202609-0001', status: TripStatus.IN_TRANSIT, orderId: 'o1', orderCode: 'DH-202609-0001', customerName: 'Công ty Gạo Miền Tây',
        routeSummary: 'Kho Cần Thơ → Kho Bình Dương', vehiclePlate: '51C-123.45', vehicleType: 'Tải thùng',
        plannedStartAt: today.add(const Duration(hours: 6)), plannedEndAt: today.add(const Duration(hours: 15)), codExpectedTotal: 12500000, driverBonusAmount: 500000,
        allowedNextStatuses: const [TripStatus.DELIVERING, TripStatus.PAUSED],
        stops: [
          stop('s-1', 1, StopType.PICKUP, 'Kho Cần Thơ', 'KCN Trà Nóc, Bình Thủy, Cần Thơ', StopStatus.COMPLETED),
          stop('s-2', 2, StopType.DROPOFF, 'Kho Bình Dương', 'KCN Sóng Thần, Dĩ An, Bình Dương', StopStatus.NOT_ARRIVED, cod: 12500000),
        ],
        cargoLines: const [DriverCargo(name: 'Gạo ST25 đóng bao 50kg', weightKg: 8000, quantity: 160, packagingUnit: 'Bao')],
      ),
      DriverTrip(
        id: 'trip-2', code: 'CX-202609-0002', status: TripStatus.SCHEDULED, orderId: 'o2', orderCode: 'DH-202609-0002', customerName: 'Kho Thép An Phát',
        routeSummary: 'Nhà máy Long An → Công trình Quận 7', vehiclePlate: '51C-123.45',
        plannedStartAt: today.add(const Duration(days: 1, hours: 7)), plannedEndAt: today.add(const Duration(days: 1, hours: 12)),
        allowedNextStatuses: const [TripStatus.TO_PICKUP],
        stops: [
          stop('s-3', 1, StopType.PICKUP, 'Nhà máy Long An', 'KCN Đức Hòa, Long An', StopStatus.NOT_ARRIVED),
          stop('s-4', 2, StopType.DROPOFF, 'Công trình Quận 7', 'Nguyễn Văn Linh, Quận 7', StopStatus.NOT_ARRIVED),
        ],
      ),
      DriverTrip(
        id: 'trip-3', code: 'CX-202608-0009', status: TripStatus.COMPLETED, orderId: 'o3', orderCode: 'DH-202608-0009', customerName: 'Công ty Gạo Miền Tây',
        routeSummary: 'Kho Cần Thơ → Kho Bình Dương', vehiclePlate: '51D-678.90', driverBonusAmount: 1000000,
        plannedStartAt: today.subtract(const Duration(days: 29)).add(const Duration(hours: 6)),
        stops: [stop('s-5', 1, StopType.DROPOFF, 'Kho Bình Dương', 'KCN Sóng Thần', StopStatus.COMPLETED)],
      ),
    ].map((t) => _overlay[t.id] ?? t).toList();
  }

  @override
  Future<({List<DriverTrip> items, bool stale})> jobs({JobBucket bucket = JobBucket.today, String? date}) async {
    await Future<void>.delayed(const Duration(milliseconds: 200));
    final all = _all();
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    bool sameDay(DateTime? d, DateTime day) => d != null && d.year == day.year && d.month == day.month && d.day == day.day;
    if (date != null) return (items: all.where((t) => sameDay(t.plannedStartAt, DateTime.parse(date))).toList(), stale: false);
    final List<DriverTrip> items = switch (bucket) {
      JobBucket.today => all.where((t) => sameDay(t.plannedStartAt, today) || t.isRunning).toList(),
      JobBucket.upcoming => all.where((t) => t.status == TripStatus.SCHEDULED && t.plannedStartAt!.isAfter(today.add(const Duration(days: 1)))).toList(),
      JobBucket.running => all.where((t) => t.isRunning).toList(),
      JobBucket.done => all.where((t) => t.isClosed).toList(),
    };
    return (items: items, stale: false);
  }

  @override
  Future<({DriverTrip trip, bool stale})> trip(String id) async {
    final t = _all().where((x) => x.id == id).firstOrNull;
    if (t == null) throw ApiException(code: 'NOT_FOUND', message: 'Không tìm thấy chuyến');
    return (trip: t, stale: false);
  }

  @override
  Future<List<CalendarDay>> calendar(DateTime from, DateTime to) async {
    final m = <String, List<TripStatus>>{};
    for (final t in _all()) {
      final d = t.plannedStartAt!;
      final k = DateTime(d.year, d.month, d.day).toIso8601String().substring(0, 10);
      (m[k] ??= []).add(t.status);
    }
    return m.entries.map((e) => CalendarDay(date: DateTime.parse(e.key), tripCount: e.value.length, statuses: e.value)).toList();
  }

  @override
  Future<({DriverTrip trip, DriverStop stop, bool stale})> stop(String stopId) async {
    for (final t in _all()) {
      final s = t.stops.where((x) => x.id == stopId).firstOrNull;
      if (s != null) return (trip: t, stop: s, stale: false);
    }
    throw ApiException(code: 'NOT_FOUND', message: 'Không tìm thấy điểm dừng');
  }

  @override
  Future<void> cacheTrip(DriverTrip trip, Map<String, dynamic>? raw) async => _overlay[trip.id] = raw == null ? trip : DriverTrip.fromJson(raw);

  @override
  void clearOverlays() {}
}
