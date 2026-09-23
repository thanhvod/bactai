import 'package:bta_flutter_core/bta_flutter_core.dart';

/// Hợp đồng GraphQL phía App Tài xế (apps/api/src/modules/driver-app, finance driverLedger, notifications, catalogs).
/// Trả JSON thô; repository map sang model domain. Interface để test thay bằng fake.
abstract class DriverApi {
  Future<Map<String, dynamic>> driverMe();
  Future<List<Map<String, dynamic>>> driverJobs({String? bucket, String? date, String? from, String? to, List<String>? status});
  Future<List<Map<String, dynamic>>> driverJobCalendar(String from, String to);
  Future<Map<String, dynamic>> driverTrip(String id);

  Future<Map<String, dynamic>> updateTripStatus(Map<String, dynamic> input);
  Future<Map<String, dynamic>> resumeTrip(String tripId, {String? note, String? idempotencyKey});
  Future<Map<String, dynamic>> updateStopStatus(Map<String, dynamic> input);
  Future<Map<String, dynamic>> submitCod(Map<String, dynamic> input);
  Future<Map<String, dynamic>> reportIncident(Map<String, dynamic> input);

  Future<List<Map<String, dynamic>>> catalogItems(String type);
  Future<Map<String, dynamic>> driverLedger();
  Future<Map<String, dynamic>> notifications({bool unreadOnly = false, int first = 50});
  Future<int> markNotificationRead(String id);
  Future<int> markAllNotificationsRead();
  Future<int> unreadNotificationCount();
}

const _stopFields = '''
  id orderId type sequence locationName address lat lng contactName contactPhone plannedAt arrivedAt completedAt
  codExpected codActual codCollectedAt codNote status skipReason note podCount cargoSummary
''';

const tripFields = '''
  id code status previousStatusBeforePause pauseReason orderId orderCode customerName routeSummary vehiclePlate vehicleType
  plannedStartAt plannedEndAt actualStartAt actualEndAt codExpectedTotal codActualTotal driverBonusAmount note orderNote
  stopCount completedStopCount attachmentCount allowedNextStatuses lastLocationAt isRunning
  stops { $_stopFields }
  cargoLines { name type weightKg volumeM3 quantity packagingUnit properties note }
  incidents { id code title severity status createdAt }
''';

class GraphqlDriverApi implements DriverApi {
  GraphqlDriverApi(this._gql);
  final GraphqlClientFactory _gql;

  List<Map<String, dynamic>> _list(Object? v) => ((v as List?) ?? const []).cast<Map<String, dynamic>>();

  @override
  Future<Map<String, dynamic>> driverMe() async {
    final d = await _gql.query('query { driverMe { id code name phone merchantId merchantName merchantHotline mustChangePassword licenseClass licenseExpiresAt unreadNotifications codHeld } }');
    return d['driverMe'] as Map<String, dynamic>;
  }

  @override
  Future<List<Map<String, dynamic>>> driverJobs({String? bucket, String? date, String? from, String? to, List<String>? status}) async {
    final d = await _gql.query('query(\$f: DriverJobsFilter) { driverJobs(filter: \$f) { $tripFields } }', variables: {
      'f': {'bucket': ?bucket, 'date': ?date, 'from': ?from, 'to': ?to, 'status': ?status},
    });
    return _list(d['driverJobs']);
  }

  @override
  Future<List<Map<String, dynamic>>> driverJobCalendar(String from, String to) async {
    final d = await _gql.query(r'query($from: String!, $to: String!) { driverJobCalendar(from: $from, to: $to) { date tripCount statuses } }', variables: {'from': from, 'to': to});
    return _list(d['driverJobCalendar']);
  }

  @override
  Future<Map<String, dynamic>> driverTrip(String id) async {
    final d = await _gql.query('query(\$id: ID!) { driverTrip(id: \$id) { $tripFields } }', variables: {'id': id});
    return d['driverTrip'] as Map<String, dynamic>;
  }

  @override
  Future<Map<String, dynamic>> updateTripStatus(Map<String, dynamic> input) async {
    final d = await _gql.mutate('mutation(\$i: DriverTripStatusInput!) { driverUpdateTripStatus(input: \$i) { warnings trip { $tripFields } } }', variables: {'i': input});
    return d['driverUpdateTripStatus'] as Map<String, dynamic>;
  }

  @override
  Future<Map<String, dynamic>> resumeTrip(String tripId, {String? note, String? idempotencyKey}) async {
    final d = await _gql.mutate('mutation(\$t: ID!, \$n: String, \$k: String) { driverResumeTrip(tripId: \$t, note: \$n, idempotencyKey: \$k) { warnings trip { $tripFields } } }',
        variables: {'t': tripId, 'n': note, 'k': idempotencyKey});
    return d['driverResumeTrip'] as Map<String, dynamic>;
  }

  @override
  Future<Map<String, dynamic>> updateStopStatus(Map<String, dynamic> input) async {
    final d = await _gql.mutate('mutation(\$i: DriverStopStatusInput!) { driverUpdateStopStatus(input: \$i) { warnings orderStatus stop { $_stopFields } } }', variables: {'i': input});
    return d['driverUpdateStopStatus'] as Map<String, dynamic>;
  }

  @override
  Future<Map<String, dynamic>> submitCod(Map<String, dynamic> input) async {
    final d = await _gql.mutate('mutation(\$i: DriverCodInput!) { driverSubmitCod(input: \$i) { warnings orderStatus stop { $_stopFields } } }', variables: {'i': input});
    return d['driverSubmitCod'] as Map<String, dynamic>;
  }

  @override
  Future<Map<String, dynamic>> reportIncident(Map<String, dynamic> input) async {
    final d = await _gql.mutate(r'mutation($i: DriverIncidentInput!) { driverReportIncident(input: $i) { id code title severity status createdAt } }', variables: {'i': input});
    return d['driverReportIncident'] as Map<String, dynamic>;
  }

  @override
  Future<List<Map<String, dynamic>>> catalogItems(String type) async {
    final d = await _gql.query('query { catalogItems(type: $type, activeOnly: true) { id code name } }');
    return _list(d['catalogItems']);
  }

  @override
  Future<Map<String, dynamic>> driverLedger() async {
    final d = await _gql.query('''query { driverLedger {
      codHeld codCollected codRemitted companyOwesDriver driverOwesCompany netBalance tripAdvanceOutstanding salaryAdvanceUndeducted overAmount overDays daysHeld
      tripBonuses { tripId tripCode orderCode amount date status }
      salaryAdvances { id code amount expenseDate description }
      tripAdvances { tripId tripCode orderCode advanceAmount spentFromAdvance difference status }
      codRemittances { id code amount receivedAt }
      reimbursableExpenses { id code amount expenseDate description categoryName }
      codItems { stopId orderCode tripCode stopName address held collectedAt daysHeld }
    } }''');
    return d['driverLedger'] as Map<String, dynamic>;
  }

  @override
  Future<Map<String, dynamic>> notifications({bool unreadOnly = false, int first = 50}) async {
    final d = await _gql.query(r'query($f: NotificationFilter, $first: Int) { notifications(filter: $f, first: $first) { unreadCount totalCount nodes { id type title body entityType entityId severity readAt createdAt } } }',
        variables: {'f': {'unread': unreadOnly}, 'first': first});
    return d['notifications'] as Map<String, dynamic>;
  }

  @override
  Future<int> markNotificationRead(String id) async =>
      ((await _gql.mutate(r'mutation($id: ID!) { markNotificationRead(id: $id) }', variables: {'id': id}))['markNotificationRead'] as num).toInt();

  @override
  Future<int> markAllNotificationsRead() async => ((await _gql.mutate('mutation { markAllNotificationsRead }'))['markAllNotificationsRead'] as num).toInt();

  @override
  Future<int> unreadNotificationCount() async => ((await _gql.query('query { unreadNotificationCount }'))['unreadNotificationCount'] as num).toInt();
}
