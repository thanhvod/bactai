import 'dart:async';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../field/domain/field_models.dart';

class SyncCubitState {
  const SyncCubitState({this.online = true, this.pendingCount = 0, this.items = const [], this.replaying = false, this.syncedAt, this.lastSyncedVersion = 0});
  final bool online;
  final int pendingCount;
  final List<QueueItem> items;
  final bool replaying;
  final DateTime? syncedAt;
  /// Tăng mỗi lần hàng đợi gửi xong ≥1 mục — màn hình lắng nghe để tải lại dữ liệu server.
  final int lastSyncedVersion;

  SyncState get syncState => !online ? SyncState.offline : (pendingCount > 0 ? SyncState.pending : SyncState.ok);
  int get failedCount => items.where((i) => i.status == QueueItemStatus.failed).length;

  /// Số mục chờ gắn với một chuyến (payload.tripId).
  int pendingForTrip(String tripId) => items.where((i) => i.payload['tripId'] == tripId).length;

  SyncCubitState copyWith({bool? online, int? pendingCount, List<QueueItem>? items, bool? replaying, DateTime? syncedAt, int? lastSyncedVersion}) => SyncCubitState(
        online: online ?? this.online,
        pendingCount: pendingCount ?? this.pendingCount,
        items: items ?? this.items,
        replaying: replaying ?? this.replaying,
        syncedAt: syncedAt ?? this.syncedAt,
        lastSyncedVersion: lastSyncedVersion ?? this.lastSyncedVersion,
      );
}

/// Theo dõi mạng + hàng đợi offline (DA-SYNC-01). `replayHandler` = FieldRepository.replay (gắn ở DI).
class SyncCubit extends Cubit<SyncCubitState> implements ActionQueue {
  SyncCubit(this._queueFuture, this._connectivity, {this.onDrained}) : super(const SyncCubitState());

  final Future<OfflineQueue> _queueFuture;
  final ConnectivityWatcher _connectivity;
  /// Gọi khi hàng đợi trống sau replay (xóa overlay cục bộ).
  final void Function()? onDrained;
  StreamSubscription<bool>? _sub;
  Timer? _retryTimer;
  ReplayHandler replayHandler = (_) async => ReplayOutcome.skip;

  Future<void> start() async {
    await _connectivity.start();
    emit(state.copyWith(online: _connectivity.isOnline));
    _sub = _connectivity.onChange.listen((online) {
      emit(state.copyWith(online: online));
      if (online) replayAll();
    });
    // Thử gửi lại định kỳ (mạng chập chờn mà connectivity vẫn báo online).
    _retryTimer = Timer.periodic(const Duration(minutes: 1), (_) {
      if (state.online && state.pendingCount > 0) replayAll();
    });
    await refresh();
    if (state.online && state.pendingCount > 0) unawaited(replayAll());
  }

  Future<void> refresh() async {
    final q = await _queueFuture;
    final items = await q.pending();
    if (isClosed) return;
    emit(state.copyWith(items: items, pendingCount: items.length));
  }

  @override
  Future<void> enqueue(QueueItemType type, Map<String, dynamic> payload, {String? entityLabel, String? clientRequestId}) async {
    final q = await _queueFuture;
    await q.enqueue(type, payload, entityLabel: entityLabel, clientRequestId: clientRequestId);
    await refresh();
  }

  Future<ReplaySummary?> replayAll({bool onlyFailed = false, Set<int>? ids}) async {
    if (state.replaying) return null;
    emit(state.copyWith(replaying: true));
    ReplaySummary? summary;
    try {
      final q = await _queueFuture;
      summary = await q.replay(replayHandler, onlyFailed: onlyFailed, ids: ids);
      await q.clearDone();
    } finally {
      if (!isClosed) {
        emit(state.copyWith(replaying: false));
        await refresh();
        if (summary != null && summary.done > 0) {
          emit(state.copyWith(syncedAt: DateTime.now(), lastSyncedVersion: state.lastSyncedVersion + 1));
        }
        if (state.pendingCount == 0) onDrained?.call();
      }
    }
    return summary;
  }

  Future<void> remove(int id) async {
    final q = await _queueFuture;
    await q.remove(id);
    await refresh();
  }

  @override
  Future<void> close() async {
    _retryTimer?.cancel();
    await _sub?.cancel();
    return super.close();
  }
}
