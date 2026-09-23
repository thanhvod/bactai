import 'package:bta_flutter_ui/bta_flutter_ui.dart';

DateTime? _dt(Object? v) => v == null ? null : DateTime.tryParse(v.toString())?.toLocal();
int? _int(Object? v) => v == null ? null : (v as num).toInt();
double? _dbl(Object? v) => v == null ? null : (v as num).toDouble();

class DriverStop {
  const DriverStop({
    required this.id,
    required this.orderId,
    required this.type,
    required this.sequence,
    required this.address,
    required this.status,
    this.locationName,
    this.lat,
    this.lng,
    this.contactName,
    this.contactPhone,
    this.plannedAt,
    this.arrivedAt,
    this.completedAt,
    this.codExpected,
    this.codActual,
    this.codNote,
    this.skipReason,
    this.note,
    this.podCount = 0,
    this.cargoSummary = const [],
    this.pendingSync = false,
  });

  final String id;
  final String orderId;
  final StopType type;
  final int sequence;
  final String address;
  final StopStatus status;
  final String? locationName;
  final double? lat;
  final double? lng;
  final String? contactName;
  final String? contactPhone;
  final DateTime? plannedAt;
  final DateTime? arrivedAt;
  final DateTime? completedAt;
  final int? codExpected;
  final int? codActual;
  final String? codNote;
  final String? skipReason;
  final String? note;
  final int podCount;
  final List<String> cargoSummary;
  /// Có thao tác đang nằm trong hàng đợi offline.
  final bool pendingSync;

  bool get hasCod => (codExpected ?? 0) > 0;
  bool get isDone => status == StopStatus.COMPLETED || status == StopStatus.SKIPPED;
  String get title => locationName ?? address;

  factory DriverStop.fromJson(Map<String, dynamic> j) => DriverStop(
        id: j['id'] as String,
        orderId: (j['orderId'] ?? '') as String,
        type: stopTypeFromApi(j['type'] as String?) ?? StopType.DROPOFF,
        sequence: _int(j['sequence']) ?? 0,
        address: (j['address'] ?? '') as String,
        status: stopStatusFromApi(j['status'] as String?) ?? StopStatus.NOT_ARRIVED,
        locationName: j['locationName'] as String?,
        lat: _dbl(j['lat']),
        lng: _dbl(j['lng']),
        contactName: j['contactName'] as String?,
        contactPhone: j['contactPhone'] as String?,
        plannedAt: _dt(j['plannedAt']),
        arrivedAt: _dt(j['arrivedAt']),
        completedAt: _dt(j['completedAt']),
        codExpected: _int(j['codExpected']),
        codActual: _int(j['codActual']),
        codNote: j['codNote'] as String?,
        skipReason: j['skipReason'] as String?,
        note: j['note'] as String?,
        podCount: _int(j['podCount']) ?? 0,
        cargoSummary: ((j['cargoSummary'] as List?) ?? const []).map((e) => e.toString()).toList(),
      );

  DriverStop copyWith({StopStatus? status, int? codActual, int? podCount, bool? pendingSync, DateTime? arrivedAt, DateTime? completedAt, String? skipReason}) => DriverStop(
        id: id,
        orderId: orderId,
        type: type,
        sequence: sequence,
        address: address,
        status: status ?? this.status,
        locationName: locationName,
        lat: lat,
        lng: lng,
        contactName: contactName,
        contactPhone: contactPhone,
        plannedAt: plannedAt,
        arrivedAt: arrivedAt ?? this.arrivedAt,
        completedAt: completedAt ?? this.completedAt,
        codExpected: codExpected,
        codActual: codActual ?? this.codActual,
        codNote: codNote,
        skipReason: skipReason ?? this.skipReason,
        note: note,
        podCount: podCount ?? this.podCount,
        cargoSummary: cargoSummary,
        pendingSync: pendingSync ?? this.pendingSync,
      );

  StopCardData toCard() => StopCardData(
        id: id,
        sequence: sequence,
        type: type,
        address: address,
        status: status,
        locationName: locationName,
        contactName: contactName,
        contactPhone: contactPhone,
        codExpected: codExpected,
        codActual: codActual,
        podCount: podCount,
      );
}

class DriverCargo {
  const DriverCargo({required this.name, this.type, this.weightKg, this.volumeM3, this.quantity, this.packagingUnit, this.properties = const [], this.note});
  final String name;
  final String? type;
  final double? weightKg;
  final double? volumeM3;
  final double? quantity;
  final String? packagingUnit;
  final List<String> properties;
  final String? note;

  factory DriverCargo.fromJson(Map<String, dynamic> j) => DriverCargo(
        name: (j['name'] ?? '') as String,
        type: j['type'] as String?,
        weightKg: _dbl(j['weightKg']),
        volumeM3: _dbl(j['volumeM3']),
        quantity: _dbl(j['quantity']),
        packagingUnit: j['packagingUnit'] as String?,
        properties: ((j['properties'] as List?) ?? const []).map((e) => e.toString()).toList(),
        note: j['note'] as String?,
      );

  static const _propLabels = {'FRAGILE': 'Dễ vỡ', 'COLD': 'Hàng lạnh', 'OVERSIZE': 'Quá khổ/quá tải', 'HAZARDOUS': 'Hóa chất/nguy hiểm'};

  String get summary {
    String n(double v) => v == v.roundToDouble() ? v.toInt().toString() : v.toString();
    return [
      if (weightKg != null) '${n(weightKg!)} kg',
      if (volumeM3 != null) '${n(volumeM3!)} m³',
      if (quantity != null) '${n(quantity!)} ${packagingUnit ?? ''}'.trim(),
      ...properties.map((p) => _propLabels[p] ?? p),
    ].join(' · ');
  }
}

class DriverIncidentBrief {
  const DriverIncidentBrief({required this.id, required this.code, required this.title, required this.severity, required this.status, this.createdAt});
  final String id;
  final String code;
  final String title;
  final IncidentSeverity severity;
  final IncidentStatus status;
  final DateTime? createdAt;

  factory DriverIncidentBrief.fromJson(Map<String, dynamic> j) => DriverIncidentBrief(
        id: j['id'] as String,
        code: (j['code'] ?? '') as String,
        title: (j['title'] ?? '') as String,
        severity: incidentSeverityFromApi(j['severity'] as String?) ?? IncidentSeverity.MEDIUM,
        status: incidentStatusFromApi(j['status'] as String?) ?? IncidentStatus.OPEN,
        createdAt: _dt(j['createdAt']),
      );
}

class DriverTrip {
  const DriverTrip({
    required this.id,
    required this.code,
    required this.status,
    required this.orderId,
    required this.orderCode,
    required this.customerName,
    required this.stops,
    this.previousStatusBeforePause,
    this.pauseReason,
    this.routeSummary,
    this.vehiclePlate,
    this.vehicleType,
    this.plannedStartAt,
    this.plannedEndAt,
    this.actualStartAt,
    this.actualEndAt,
    this.codExpectedTotal = 0,
    this.codActualTotal = 0,
    this.driverBonusAmount = 0,
    this.note,
    this.orderNote,
    this.attachmentCount = 0,
    this.cargoLines = const [],
    this.incidents = const [],
    this.allowedNextStatuses = const [],
    this.lastLocationAt,
    this.pendingSync = false,
  });

  final String id;
  final String code;
  final TripStatus status;
  final TripStatus? previousStatusBeforePause;
  final String? pauseReason;
  final String orderId;
  final String orderCode;
  final String customerName;
  final String? routeSummary;
  final String? vehiclePlate;
  final String? vehicleType;
  final DateTime? plannedStartAt;
  final DateTime? plannedEndAt;
  final DateTime? actualStartAt;
  final DateTime? actualEndAt;
  final int codExpectedTotal;
  final int codActualTotal;
  final int driverBonusAmount;
  final String? note;
  final String? orderNote;
  final int attachmentCount;
  final List<DriverStop> stops;
  final List<DriverCargo> cargoLines;
  final List<DriverIncidentBrief> incidents;
  final List<TripStatus> allowedNextStatuses;
  final DateTime? lastLocationAt;
  final bool pendingSync;

  bool get isRunning => tripRunningStatuses.contains(status);
  bool get isClosed => tripClosedStatuses.contains(status);
  int get completedStopCount => stops.where((s) => s.isDone).length;
  DriverStop? get nextStop => stops.where((s) => !s.isDone).firstOrNull;
  String get route => routeSummary ?? stops.map((s) => s.title).join(' → ');
  List<DriverIncidentBrief> get openIncidents => incidents.where((i) => i.status == IncidentStatus.OPEN || i.status == IncidentStatus.IN_PROGRESS).toList();

  /// Trạng thái kế tiếp chính (không tính tạm dừng) để hiện nút lớn.
  TripStatus? get primaryNext => allowedNextStatuses.where((s) => s != TripStatus.PAUSED && s != TripStatus.CANCELLED).firstOrNull;

  factory DriverTrip.fromJson(Map<String, dynamic> j) => DriverTrip(
        id: j['id'] as String,
        code: (j['code'] ?? '') as String,
        status: tripStatusFromApi(j['status'] as String?) ?? TripStatus.SCHEDULED,
        previousStatusBeforePause: tripStatusFromApi(j['previousStatusBeforePause'] as String?),
        pauseReason: j['pauseReason'] as String?,
        orderId: (j['orderId'] ?? '') as String,
        orderCode: (j['orderCode'] ?? '') as String,
        customerName: (j['customerName'] ?? '') as String,
        routeSummary: j['routeSummary'] as String?,
        vehiclePlate: j['vehiclePlate'] as String?,
        vehicleType: j['vehicleType'] as String?,
        plannedStartAt: _dt(j['plannedStartAt']),
        plannedEndAt: _dt(j['plannedEndAt']),
        actualStartAt: _dt(j['actualStartAt']),
        actualEndAt: _dt(j['actualEndAt']),
        codExpectedTotal: _int(j['codExpectedTotal']) ?? 0,
        codActualTotal: _int(j['codActualTotal']) ?? 0,
        driverBonusAmount: _int(j['driverBonusAmount']) ?? 0,
        note: j['note'] as String?,
        orderNote: j['orderNote'] as String?,
        attachmentCount: _int(j['attachmentCount']) ?? 0,
        stops: ((j['stops'] as List?) ?? const []).map((e) => DriverStop.fromJson(e as Map<String, dynamic>)).toList(),
        cargoLines: ((j['cargoLines'] as List?) ?? const []).map((e) => DriverCargo.fromJson(e as Map<String, dynamic>)).toList(),
        incidents: ((j['incidents'] as List?) ?? const []).map((e) => DriverIncidentBrief.fromJson(e as Map<String, dynamic>)).toList(),
        allowedNextStatuses: ((j['allowedNextStatuses'] as List?) ?? const []).map((e) => tripStatusFromApi(e.toString())).whereType<TripStatus>().toList(),
        lastLocationAt: _dt(j['lastLocationAt']),
      );

  DriverTrip copyWith({TripStatus? status, TripStatus? previousStatusBeforePause, List<DriverStop>? stops, List<TripStatus>? allowedNextStatuses, bool? pendingSync, String? pauseReason}) => DriverTrip(
        id: id,
        code: code,
        status: status ?? this.status,
        previousStatusBeforePause: previousStatusBeforePause ?? this.previousStatusBeforePause,
        pauseReason: pauseReason ?? this.pauseReason,
        orderId: orderId,
        orderCode: orderCode,
        customerName: customerName,
        routeSummary: routeSummary,
        vehiclePlate: vehiclePlate,
        vehicleType: vehicleType,
        plannedStartAt: plannedStartAt,
        plannedEndAt: plannedEndAt,
        actualStartAt: actualStartAt,
        actualEndAt: actualEndAt,
        codExpectedTotal: codExpectedTotal,
        codActualTotal: codActualTotal,
        driverBonusAmount: driverBonusAmount,
        note: note,
        orderNote: orderNote,
        attachmentCount: attachmentCount,
        stops: stops ?? this.stops,
        cargoLines: cargoLines,
        incidents: incidents,
        allowedNextStatuses: allowedNextStatuses ?? this.allowedNextStatuses,
        lastLocationAt: lastLocationAt,
        pendingSync: pendingSync ?? this.pendingSync,
      );

  TripCardData toCard({int pendingSyncCount = 0}) => TripCardData(
        id: id,
        code: code,
        routeSummary: route,
        status: status,
        plannedStartAt: plannedStartAt,
        plannedEndAt: plannedEndAt,
        vehiclePlate: vehiclePlate,
        codExpected: codExpectedTotal,
        orderCode: orderCode,
        pendingSyncCount: pendingSyncCount,
      );
}

/// Trạng thái kế tiếp dự kiến khi thao tác offline (backend là nguồn sự thật khi đồng bộ).
List<TripStatus> localAllowedNext(TripStatus s, TripStatus? previous) {
  if (s == TripStatus.PAUSED) return [previous ?? TripStatus.IN_TRANSIT];
  if (tripClosedStatuses.contains(s)) return const [];
  final n = tripNextStatus(s);
  return [?n, if (s == TripStatus.DELIVERING) TripStatus.IN_TRANSIT, if (tripRunningStatuses.contains(s)) TripStatus.PAUSED];
}

class CalendarDay {
  const CalendarDay({required this.date, required this.tripCount, required this.statuses});
  final DateTime date;
  final int tripCount;
  final List<TripStatus> statuses;

  factory CalendarDay.fromJson(Map<String, dynamic> j) => CalendarDay(
        date: DateTime.parse(j['date'] as String),
        tripCount: _int(j['tripCount']) ?? 0,
        statuses: ((j['statuses'] as List?) ?? const []).map((e) => tripStatusFromApi(e.toString())).whereType<TripStatus>().toList(),
      );
}
