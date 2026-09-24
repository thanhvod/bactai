import 'dart:async';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:driver_app/core/api/driver_api.dart';
import 'package:driver_app/core/gps/background_gps_controller.dart';
import 'package:driver_app/core/gps/location_source.dart';
import 'package:driver_app/core/gps/tracking_store.dart';
import 'package:driver_app/features/field/domain/field_models.dart';

Map<String, dynamic> tripJson({String id = 'trip-1', String status = 'IN_TRANSIT', List<String> allowed = const ['DELIVERING', 'PAUSED'], int? codActual}) => {
      'id': id,
      'code': 'CX-202609-0001',
      'status': status,
      'orderId': 'o1',
      'orderCode': 'DH-202609-0001',
      'customerName': 'Công ty Gạo Miền Tây',
      'routeSummary': 'Kho Cần Thơ → Kho Bình Dương',
      'vehiclePlate': '51C-123.45',
      'plannedStartAt': DateTime.now().toUtc().toIso8601String(),
      'codExpectedTotal': 12500000,
      'codActualTotal': codActual ?? 0,
      'driverBonusAmount': 500000,
      'attachmentCount': 0,
      'allowedNextStatuses': allowed,
      'isRunning': true,
      'stops': [
        {'id': 's-1', 'orderId': 'o1', 'type': 'PICKUP', 'sequence': 1, 'address': 'KCN Trà Nóc', 'locationName': 'Kho Cần Thơ', 'status': 'COMPLETED', 'podCount': 0, 'cargoSummary': []},
        {
          'id': 's-2', 'orderId': 'o1', 'type': 'DROPOFF', 'sequence': 2, 'address': 'KCN Sóng Thần', 'locationName': 'Kho Bình Dương', 'status': 'ARRIVED',
          'codExpected': 12500000, 'codActual': codActual, 'podCount': 1, 'contactPhone': '0912000002', 'cargoSummary': ['Gạo'],
        },
      ],
      'cargoLines': [
        {'name': 'Gạo ST25', 'weightKg': 8000, 'quantity': 160, 'packagingUnit': 'Bao', 'properties': []},
      ],
      'incidents': [],
    };

/// DriverApi giả: ghi lại lệnh gọi; `offline = true` → mọi lệnh ném lỗi mạng.
class FakeDriverApi implements DriverApi {
  bool offline = false;
  ApiException? failWith;
  final calls = <(String, Map<String, dynamic>)>[];
  Map<String, dynamic> trip = tripJson();

  Future<T> _do<T>(String name, Map<String, dynamic> args, T Function() r) async {
    calls.add((name, args));
    if (offline) throw ApiException.network('offline');
    if (failWith != null) throw failWith!;
    return r();
  }

  @override
  Future<Map<String, dynamic>> driverMe() => _do('driverMe', {}, () => {'id': 'd1', 'name': 'Nguyễn Văn Tài', 'codHeld': 0});
  @override
  Future<List<Map<String, dynamic>>> driverJobs({String? bucket, String? date, String? from, String? to, List<String>? status}) =>
      _do('driverJobs', {'bucket': bucket, 'date': date}, () => [trip]);
  @override
  Future<List<Map<String, dynamic>>> driverJobCalendar(String from, String to) => _do('calendar', {}, () => <Map<String, dynamic>>[]);
  @override
  Future<Map<String, dynamic>> driverTrip(String id) => _do('driverTrip', {'id': id}, () => trip);
  @override
  Future<Map<String, dynamic>> updateTripStatus(Map<String, dynamic> input) =>
      _do('updateTripStatus', input, () => {'warnings': <String>[], 'trip': tripJson(status: input['status'] as String, allowed: const ['COMPLETED', 'PAUSED'])});
  @override
  Future<Map<String, dynamic>> resumeTrip(String tripId, {String? note, String? idempotencyKey}) =>
      _do('resumeTrip', {'tripId': tripId, 'idempotencyKey': idempotencyKey}, () => {'warnings': <String>[], 'trip': tripJson()});
  @override
  Future<Map<String, dynamic>> updateStopStatus(Map<String, dynamic> input) => _do('updateStopStatus', input, () {
        final s = Map<String, dynamic>.of((tripJson()['stops'] as List)[1] as Map<String, dynamic>)..['status'] = input['status'];
        return {'warnings': <String>[], 'stop': s};
      });
  @override
  Future<Map<String, dynamic>> submitCod(Map<String, dynamic> input) => _do('submitCod', input, () {
        final s = Map<String, dynamic>.of((tripJson()['stops'] as List)[1] as Map<String, dynamic>)..['codActual'] = input['amount'];
        return {'warnings': ['COD thực thu khác dự kiến'], 'stop': s};
      });
  @override
  Future<Map<String, dynamic>> reportIncident(Map<String, dynamic> input) =>
      _do('reportIncident', input, () => {'id': 'inc-1', 'code': 'SC-202609-0002', 'title': input['title'], 'severity': input['severity'], 'status': 'OPEN'});
  @override
  Future<List<Map<String, dynamic>>> catalogItems(String type) => _do('catalogItems', {'type': type}, () => [
        {'id': 'r1', 'code': 'TRAFFIC', 'name': 'Kẹt xe'},
      ]);
  @override
  Future<Map<String, dynamic>> driverLedger() => _do('driverLedger', {}, () => {'codHeld': 0});
  @override
  Future<Map<String, dynamic>> notifications({bool unreadOnly = false, int first = 50}) => _do('notifications', {}, () => {'nodes': [], 'unreadCount': 0});
  @override
  Future<int> markNotificationRead(String id) => _do('markRead', {}, () => 0);
  @override
  Future<int> markAllNotificationsRead() => _do('markAll', {}, () => 0);
  @override
  Future<int> unreadNotificationCount() => _do('unread', {}, () => 0);
  @override
  Future<void> registerPushToken(String token, String platform) => _do('registerPushToken', {'token': token, 'platform': platform}, () {});
  @override
  Future<void> unregisterPushToken(String token) => _do('unregisterPushToken', {'token': token}, () {});
}

class FakeQueue implements ActionQueue {
  final items = <(QueueItemType, Map<String, dynamic>, String?)>[];
  @override
  Future<void> enqueue(QueueItemType type, Map<String, dynamic> payload, {String? entityLabel, String? clientRequestId}) async => items.add((type, payload, clientRequestId));
}

class FakeGpsApi extends GpsApi {
  FakeGpsApi() : super(const ApiConfig(baseUrl: 'http://fake'), getToken: () async => null);
  bool offline = false;
  final sent = <(String, String, int)>[];
  @override
  Future<GpsBatchResult> sendBatch({required String clientRequestId, required String tripId, required List<GpsPoint> points}) async {
    if (offline) throw ApiException.network('offline');
    sent.add((clientRequestId, tripId, points.length));
    return GpsBatchResult(accepted: points.length, duplicates: 0);
  }
}

class FakeUploadApi extends UploadApi {
  FakeUploadApi() : super(const ApiConfig(baseUrl: 'http://fake'), getToken: () async => null);
}

class FakeLocationSource implements LocationSource {
  GpsPermission permission = GpsPermission.whileInUse;
  final controller = StreamController<GpsPoint>.broadcast();
  @override
  Future<GpsPermission> check() async => permission;
  @override
  Future<GpsPermission> request() async => permission = GpsPermission.whileInUse;
  @override
  Future<GpsPermission> requestAlways() async => permission = GpsPermission.always;
  @override
  Stream<GpsPoint> positions() => controller.stream;
  @override
  Future<GpsPoint?> current() async => null;
  @override
  Future<void> openSettings() async {}
}

class FakeConnectivity extends ConnectivityWatcher {
  @override
  bool get isOnline => true;
  @override
  Future<void> start() async {}
}

class FakeBackgroundGpsController implements BackgroundGpsController {
  ActiveTrip? trip;
  bool running = false;
  int flushes = 0;
  final calls = <String>[];
  TrackingStatus current = const TrackingStatus();
  @override
  Future<void> start(ActiveTrip t) async {
    calls.add('start:${t.id}:${t.code}');
    trip = t;
    running = true;
  }

  @override
  Future<void> stop() async {
    calls.add('stop');
    trip = null;
    running = false;
  }

  @override
  Future<bool> isRunning() async => running;
  @override
  Future<TrackingStatus> status() async => current;
  @override
  Future<void> flushNow() async => flushes++;
  @override
  Future<void> resumeIfNeeded() async {
    calls.add('resume');
  }
}
