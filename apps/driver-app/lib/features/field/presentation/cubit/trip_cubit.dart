import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../jobs/domain/jobs_repository.dart';
import '../../../jobs/domain/models.dart';
import '../../../jobs/presentation/cubit/jobs_cubit.dart' show errorMessage;
import '../../data/field_repository.dart';
import '../../domain/field_models.dart';

class TripViewState {
  const TripViewState({this.loading = true, this.trip, this.stale = false, this.error, this.errorCode, this.busy = false, this.message, this.messageTone = BtaTone.success, this.messageSeq = 0});
  final bool loading;
  final DriverTrip? trip;
  final bool stale;
  final String? error;
  final String? errorCode;
  final bool busy;
  /// Thông báo ngắn sau thao tác (snackbar). `messageSeq` tăng để UI biết có thông báo mới.
  final String? message;
  final BtaTone messageTone;
  final int messageSeq;

  TripViewState copyWith({bool? loading, DriverTrip? trip, bool? stale, String? error, String? errorCode, bool clearError = false, bool? busy, String? message, BtaTone? messageTone, bool bump = false}) => TripViewState(
        loading: loading ?? this.loading,
        trip: trip ?? this.trip,
        stale: stale ?? this.stale,
        error: clearError ? null : (error ?? this.error),
        errorCode: clearError ? null : (errorCode ?? this.errorCode),
        busy: busy ?? this.busy,
        message: message ?? this.message,
        messageTone: messageTone ?? this.messageTone,
        messageSeq: bump ? messageSeq + 1 : messageSeq,
      );

  DriverStop? stop(String id) => trip?.stops.where((s) => s.id == id).firstOrNull;
}

/// Chi tiết chuyến + mọi thao tác hiện trường trên chuyến/điểm dừng (DA-TRIP-01, DA-STOP-*, DA-STATUS-*, DA-COD-01).
class TripCubit extends Cubit<TripViewState> {
  TripCubit(this._jobs, this._field) : super(const TripViewState());
  final JobsRepository _jobs;
  final FieldRepository _field;

  Future<void> load(String tripId) async {
    emit(state.copyWith(loading: state.trip == null, clearError: true));
    try {
      final r = await _jobs.trip(tripId);
      if (!isClosed) emit(state.copyWith(loading: false, trip: r.trip, stale: r.stale));
    } on ApiException catch (e) {
      if (!isClosed) emit(state.copyWith(loading: false, error: e.code == 'NOT_FOUND' ? 'Bạn không có quyền xem chuyến này hoặc chuyến không còn tồn tại.' : e.message, errorCode: e.code));
    } catch (e) {
      if (!isClosed) emit(state.copyWith(loading: false, error: errorMessage(e)));
    }
  }

  /// Mở từ màn điểm dừng: tìm chuyến chứa stop.
  Future<void> loadByStop(String stopId) async {
    emit(state.copyWith(loading: true, clearError: true));
    try {
      final r = await _jobs.stop(stopId);
      if (!isClosed) emit(state.copyWith(loading: false, trip: r.trip, stale: r.stale));
    } on ApiException catch (e) {
      if (!isClosed) emit(state.copyWith(loading: false, error: e.message, errorCode: e.code));
    }
  }

  void _done(String ok, {required bool queued, List<String> warnings = const []}) {
    final msg = queued ? '$ok — đang offline, sẽ tự gửi khi có mạng' : [ok, ...warnings].join('\n');
    emit(state.copyWith(busy: false, message: msg, messageTone: queued ? BtaTone.warning : (warnings.isEmpty ? BtaTone.success : BtaTone.warning), bump: true));
  }

  void _fail(Object e) {
    emit(state.copyWith(busy: false, message: e is ApiException ? e.message : errorMessage(e), messageTone: BtaTone.danger, bump: true));
  }

  Future<bool> changeStatus(TripStatus to, {String? reason, String? note, String? pauseReasonId, String? pauseReasonLabel}) async {
    final t = state.trip;
    if (t == null || state.busy) return false;
    emit(state.copyWith(busy: true));
    try {
      final r = await _field.changeTripStatus(t, to, reason: reason, note: note, pauseReasonId: pauseReasonId, pauseReasonLabel: pauseReasonLabel);
      emit(state.copyWith(trip: r.value));
      _done('Đã cập nhật: ${tripStatusMeta[to]!.label}', queued: r.queued, warnings: r.warnings);
      return true;
    } catch (e) {
      _fail(e);
      return false;
    }
  }

  Future<bool> resume({String? note}) async {
    final t = state.trip;
    if (t == null || state.busy) return false;
    emit(state.copyWith(busy: true));
    try {
      final r = await _field.resumeTrip(t, note: note);
      emit(state.copyWith(trip: r.value));
      _done('Đã tiếp tục chuyến', queued: r.queued);
      return true;
    } catch (e) {
      _fail(e);
      return false;
    }
  }

  DriverTrip _withStop(DriverStop s) => state.trip!.copyWith(stops: [for (final x in state.trip!.stops) x.id == s.id ? s : x]);

  Future<bool> changeStopStatus(String stopId, StopStatus to, {String? reason}) async {
    final t = state.trip;
    final s = state.stop(stopId);
    if (t == null || s == null || state.busy) return false;
    emit(state.copyWith(busy: true));
    try {
      final r = await _field.changeStopStatus(t, s, to, reason: reason);
      emit(state.copyWith(trip: _withStop(r.value!)));
      _done('Điểm ${s.sequence}: ${stopStatusMeta[to]!.label}', queued: r.queued, warnings: r.warnings);
      if (!r.queued) await load(t.id);
      return true;
    } catch (e) {
      _fail(e);
      return false;
    }
  }

  Future<bool> submitCod(String stopId, int amount, {String? note, String? reason}) async {
    final t = state.trip;
    final s = state.stop(stopId);
    if (t == null || s == null || state.busy) return false;
    emit(state.copyWith(busy: true));
    try {
      final r = await _field.submitCod(t, s, amount, note: note, reason: reason);
      emit(state.copyWith(trip: _withStop(r.value!)));
      _done('Đã lưu COD ${BtaFormat.vnd(amount)}', queued: r.queued, warnings: r.warnings);
      return true;
    } catch (e) {
      _fail(e);
      return false;
    }
  }

  /// Sau khi upload POD: tăng podCount cục bộ.
  void podAdded(String stopId, int count) {
    final s = state.stop(stopId);
    if (s == null) return;
    emit(state.copyWith(trip: _withStop(s.copyWith(podCount: s.podCount + count))));
  }

  Future<ActionResult<DriverIncidentBrief>?> reportIncident({required String title, required IncidentSeverity severity, String? typeId, String? stopId, String? description, List<LocalFile> photos = const []}) async {
    final t = state.trip;
    if (t == null || state.busy) return null;
    emit(state.copyWith(busy: true));
    try {
      final r = await _field.reportIncident(trip: t, title: title, severity: severity, typeId: typeId, stopId: stopId, description: description, photos: photos);
      _done(r.queued ? 'Đã lưu sự cố' : 'Đã gửi sự cố ${r.value?.code ?? ''}', queued: r.queued);
      return r;
    } catch (e) {
      _fail(e);
      return null;
    }
  }
}
