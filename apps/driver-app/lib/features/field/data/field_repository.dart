import 'dart:io';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:bta_flutter_ui/bta_flutter_ui.dart';

import '../../../core/api/driver_api.dart';
import '../../jobs/domain/jobs_repository.dart';
import '../../jobs/domain/models.dart';
import '../domain/field_models.dart';

/// Thao tác hiện trường của tài xế (DRV-ACT-001..004): online gọi API ngay; lỗi mạng → xếp hàng đợi offline
/// với cùng `clientRequestId` (= idempotencyKey backend) để gửi lại không bị ghi trùng.
class FieldRepository {
  FieldRepository({required this.api, required this.jobs, required this.queue, required this.upload, required this.gps, String Function()? newId})
      : _newId = newId ?? OfflineQueue.newClientRequestId;

  final DriverApi api;
  final JobsRepository jobs;
  final ActionQueue queue;
  final UploadApi upload;
  final GpsApi gps;
  final String Function() _newId;

  Future<ActionResult<R>> _run<R>({
    required QueueItemType type,
    required Map<String, dynamic> payload,
    required String label,
    required Future<R> Function(String key) online,
    required R Function() optimistic,
  }) async {
    final cid = _newId();
    try {
      return ActionResult(value: await online(cid));
    } on ApiException catch (e) {
      if (!e.isNetwork) rethrow;
      await queue.enqueue(type, {...payload, 'clientRequestId': cid}, entityLabel: label, clientRequestId: cid);
      return ActionResult(value: optimistic(), queued: true);
    }
  }

  List<String> _warnings(Map<String, dynamic> r) => ((r['warnings'] as List?) ?? const []).map((e) => e.toString()).toList();

  // ---------- Chuyến ----------

  Future<ActionResult<DriverTrip>> changeTripStatus(DriverTrip trip, TripStatus to, {String? reason, String? note, String? pauseReasonId, String? pauseReasonLabel}) async {
    final at = DateTime.now();
    final payload = {
      'tripId': trip.id,
      'status': to.name,
      'reason': ?reason,
      'note': ?note,
      'pauseReasonId': ?pauseReasonId,
      'actualAt': at.toUtc().toIso8601String(),
    };
    List<String> warnings = const [];
    final r = await _run<DriverTrip>(
      type: QueueItemType.TRIP_STATUS,
      payload: payload,
      label: '${trip.code}: ${tripStatusMeta[to]!.label}',
      online: (key) async {
        final res = await api.updateTripStatus({...payload, 'idempotencyKey': key});
        warnings = _warnings(res);
        final raw = res['trip'] as Map<String, dynamic>;
        await jobs.cacheTrip(DriverTrip.fromJson(raw), raw);
        return DriverTrip.fromJson(raw);
      },
      optimistic: () {
        final prev = to == TripStatus.PAUSED ? trip.status : trip.previousStatusBeforePause;
        return trip.copyWith(status: to, previousStatusBeforePause: prev, allowedNextStatuses: localAllowedNext(to, prev), pendingSync: true, pauseReason: pauseReasonLabel);
      },
    );
    if (r.queued) await jobs.cacheTrip(r.value!, null);
    return ActionResult(value: r.value, queued: r.queued, warnings: warnings);
  }

  Future<ActionResult<DriverTrip>> resumeTrip(DriverTrip trip, {String? note}) async {
    final payload = {'tripId': trip.id, 'resume': true, 'note': ?note};
    final r = await _run<DriverTrip>(
      type: QueueItemType.TRIP_STATUS,
      payload: payload,
      label: '${trip.code}: Tiếp tục chuyến',
      online: (key) async {
        final res = await api.resumeTrip(trip.id, note: note, idempotencyKey: key);
        final raw = res['trip'] as Map<String, dynamic>;
        await jobs.cacheTrip(DriverTrip.fromJson(raw), raw);
        return DriverTrip.fromJson(raw);
      },
      optimistic: () {
        final back = trip.previousStatusBeforePause ?? TripStatus.IN_TRANSIT;
        return trip.copyWith(status: back, allowedNextStatuses: localAllowedNext(back, null), pendingSync: true);
      },
    );
    if (r.queued) await jobs.cacheTrip(r.value!, null);
    return r;
  }

  // ---------- Điểm dừng ----------

  Future<ActionResult<DriverStop>> changeStopStatus(DriverTrip trip, DriverStop stop, StopStatus to, {String? reason, String? note}) async {
    final at = DateTime.now();
    final payload = {'stopId': stop.id, 'tripId': trip.id, 'status': to.name, 'reason': ?reason, 'note': ?note, 'actualAt': at.toUtc().toIso8601String()};
    List<String> warnings = const [];
    final r = await _run<DriverStop>(
      type: QueueItemType.STOP_STATUS,
      payload: payload,
      label: '${trip.code} · điểm ${stop.sequence}: ${stopStatusMeta[to]!.label}',
      online: (key) async {
        final res = await api.updateStopStatus({...payload, 'idempotencyKey': key});
        warnings = _warnings(res);
        return DriverStop.fromJson(res['stop'] as Map<String, dynamic>);
      },
      optimistic: () => stop.copyWith(
        status: to,
        pendingSync: true,
        arrivedAt: to == StopStatus.ARRIVED ? at : null,
        completedAt: to == StopStatus.COMPLETED ? at : null,
        skipReason: to == StopStatus.SKIPPED ? reason : null,
      ),
    );
    await _replaceStop(trip, r.value!, pending: r.queued);
    return ActionResult(value: r.value, queued: r.queued, warnings: warnings);
  }

  /// Nhập/sửa COD thực thu. Sửa COD đã lưu bắt buộc lý do ≥ 5 ký tự (backend cũng kiểm tra).
  Future<ActionResult<DriverStop>> submitCod(DriverTrip trip, DriverStop stop, int amount, {String? note, String? reason}) async {
    if (amount < 0) throw ApiException(code: 'VALIDATION_ERROR', message: 'Số tiền không hợp lệ');
    final isEdit = stop.codActual != null && stop.codActual != amount;
    if (isEdit && (reason == null || reason.trim().length < 5)) {
      throw ApiException(code: 'SENSITIVE_REASON_REQUIRED', message: 'Sửa COD đã lưu cần nhập lý do (tối thiểu 5 ký tự)');
    }
    final payload = {'stopId': stop.id, 'amount': amount, 'note': ?note, if (isEdit) 'reason': reason!.trim()};
    List<String> warnings = const [];
    final r = await _run<DriverStop>(
      type: QueueItemType.COD,
      payload: payload,
      label: '${trip.code} · điểm ${stop.sequence}: COD ${BtaFormat.vnd(amount)}',
      online: (key) async {
        final res = await api.submitCod({...payload, 'idempotencyKey': key});
        warnings = _warnings(res);
        return DriverStop.fromJson(res['stop'] as Map<String, dynamic>);
      },
      optimistic: () => stop.copyWith(codActual: amount, pendingSync: true),
    );
    await _replaceStop(trip, r.value!, pending: r.queued);
    return ActionResult(value: r.value, queued: r.queued, warnings: warnings);
  }

  Future<void> _replaceStop(DriverTrip trip, DriverStop stop, {required bool pending}) async {
    final t = trip.copyWith(stops: [for (final s in trip.stops) s.id == stop.id ? stop : s], pendingSync: pending || trip.pendingSync);
    await jobs.cacheTrip(t, null);
  }

  // ---------- Chứng từ / POD ----------

  /// Upload 1 file; mất mạng → xếp UPLOAD (file đã lưu vào thư mục app nên không mất).
  Future<ActionResult<String>> uploadFile({required String entityType, required String entityId, required String category, required LocalFile file, String? label}) async {
    final payload = {
      'entityType': entityType,
      'entityId': entityId,
      'category': category,
      'filePath': file.path,
      'fileName': file.fileName,
      'contentType': file.contentType,
      if (file.capturedAt != null) 'capturedAt': file.capturedAt!.toUtc().toIso8601String(),
      'lat': ?file.lat,
      'lng': ?file.lng,
    };
    return _run<String>(
      type: QueueItemType.UPLOAD,
      payload: payload,
      label: label ?? 'Chứng từ ${file.fileName}',
      online: (_) => _uploadNow(payload),
      optimistic: () => '',
    );
  }

  Future<String> _uploadNow(Map<String, dynamic> p) async {
    final f = File(p['filePath'] as String);
    if (!await f.exists()) throw ApiException(code: 'FILE_MISSING', message: 'Không còn file ảnh trên máy');
    final res = await upload.upload(
      entityType: p['entityType'] as String,
      entityId: p['entityId'] as String,
      category: p['category'] as String,
      fileName: p['fileName'] as String,
      contentType: p['contentType'] as String,
      bytes: await f.readAsBytes(),
      capturedAt: p['capturedAt'] == null ? null : DateTime.parse(p['capturedAt'] as String),
      lat: (p['lat'] as num?)?.toDouble(),
      lng: (p['lng'] as num?)?.toDouble(),
    );
    return (res['id'] ?? '') as String;
  }

  // ---------- Sự cố ----------

  /// Online: upload ảnh lên chuyến rồi gắn vào sự cố. Offline: xếp ảnh (UPLOAD vào chuyến, category INCIDENT_PHOTO)
  /// và sự cố (không kèm ảnh) — web vẫn xem ảnh ở tab chứng từ của chuyến.
  Future<ActionResult<DriverIncidentBrief>> reportIncident({
    required DriverTrip trip,
    required String title,
    required IncidentSeverity severity,
    String? typeId,
    String? stopId,
    String? description,
    String? location,
    List<LocalFile> photos = const [],
  }) async {
    final ids = <String>[];
    var photosQueued = false;
    for (final ph in photos) {
      final r = await uploadFile(entityType: 'TRIP', entityId: trip.id, category: 'INCIDENT_PHOTO', file: ph, label: '${trip.code}: ảnh sự cố');
      if (r.queued) {
        photosQueued = true;
      } else if (r.value != null && r.value!.isNotEmpty) {
        ids.add(r.value!);
      }
    }
    final payload = {
      'tripId': trip.id,
      'stopId': ?stopId,
      'typeId': ?typeId,
      'title': title,
      'severity': severity.name,
      'description': ?description,
      'location': ?location,
      if (ids.isNotEmpty) 'attachmentIds': ids,
    };
    final r = await _run<DriverIncidentBrief>(
      type: QueueItemType.INCIDENT,
      payload: payload,
      label: '${trip.code}: sự cố "$title"',
      online: (key) async => DriverIncidentBrief.fromJson(await api.reportIncident({...payload, 'idempotencyKey': key})),
      optimistic: () => DriverIncidentBrief(id: '', code: 'Chờ gửi', title: title, severity: severity, status: IncidentStatus.OPEN, createdAt: DateTime.now()),
    );
    return ActionResult(value: r.value, queued: r.queued || photosQueued);
  }

  // ---------- GPS ----------

  Future<ActionResult<void>> sendGps(String tripId, List<GpsPoint> points) async {
    if (points.isEmpty) return const ActionResult();
    final payload = {'tripId': tripId, 'points': points.map((p) => p.toJson()).toList()};
    return _run<void>(
      type: QueueItemType.GPS_BATCH,
      payload: payload,
      label: 'GPS ${points.length} điểm',
      online: (key) async {
        await gps.sendBatch(clientRequestId: key, tripId: tripId, points: points);
      },
      optimistic: () {},
    );
  }

  Future<List<CatalogOption>> catalog(String type) async =>
      (await api.catalogItems(type)).map((j) => CatalogOption(id: j['id'] as String, code: (j['code'] ?? '') as String, name: (j['name'] ?? '') as String)).toList();

  // ---------- Replay hàng đợi (DA-SYNC-01) ----------

  /// Gửi lại 1 mục với idempotencyKey = clientRequestId. Mất mạng → skip (dừng vòng replay); lỗi nghiệp vụ → failed.
  Future<ReplayOutcome> replay(QueueItem item) async {
    final p = item.payload;
    final key = item.clientRequestId;
    try {
      switch (item.type) {
        case QueueItemType.TRIP_STATUS:
          if (p['resume'] == true) {
            await api.resumeTrip(p['tripId'] as String, note: p['note'] as String?, idempotencyKey: key);
          } else {
            await api.updateTripStatus({..._without(p, const ['clientRequestId', 'resume']), 'idempotencyKey': key});
          }
        case QueueItemType.STOP_STATUS:
          await api.updateStopStatus({..._without(p, const ['clientRequestId']), 'idempotencyKey': key});
        case QueueItemType.COD:
          await api.submitCod({..._without(p, const ['clientRequestId']), 'idempotencyKey': key});
        case QueueItemType.INCIDENT:
          await api.reportIncident({..._without(p, const ['clientRequestId']), 'idempotencyKey': key});
        case QueueItemType.UPLOAD:
          await _uploadNow(p);
        case QueueItemType.GPS_BATCH:
          await gps.sendBatch(
            clientRequestId: key,
            tripId: p['tripId'] as String,
            points: ((p['points'] as List?) ?? const []).map((e) => GpsPoint.fromJson(e as Map<String, dynamic>)).toList(),
          );
      }
      return ReplayOutcome.done;
    } on ApiException catch (e) {
      if (e.isNetwork) return ReplayOutcome.skip;
      // GPS gửi bù khi chuyến đã đóng quá lâu → bỏ, không giữ mãi trong hàng đợi.
      if (item.type == QueueItemType.GPS_BATCH && e.code == 'BUSINESS_RULE_VIOLATION') return ReplayOutcome.done;
      throw Exception(e.message);
    }
  }

  static Map<String, dynamic> _without(Map<String, dynamic> m, List<String> keys) => Map.of(m)..removeWhere((k, _) => keys.contains(k));
}
