import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../data/notifications_repository.dart';

class NotificationsState {
  const NotificationsState({this.loading = false, this.items = const [], this.unread = 0, this.error, this.onlyUnread = false});
  final bool loading;
  final List<DriverNotification> items;
  final int unread;
  final String? error;
  final bool onlyUnread;

  NotificationsState copyWith({bool? loading, List<DriverNotification>? items, int? unread, String? error, bool clearError = false, bool? onlyUnread}) => NotificationsState(
        loading: loading ?? this.loading,
        items: items ?? this.items,
        unread: unread ?? this.unread,
        error: clearError ? null : (error ?? this.error),
        onlyUnread: onlyUnread ?? this.onlyUnread,
      );
}

/// DA-NOTI-01: polling 30s khi app mở (chưa có push FCM phase 1).
class NotificationsCubit extends Cubit<NotificationsState> {
  NotificationsCubit(this._repo, {this.interval = const Duration(seconds: 30)}) : super(const NotificationsState());
  final NotificationsRepository _repo;
  final Duration interval;
  Timer? _timer;

  void startPolling() {
    _timer?.cancel();
    _timer = Timer.periodic(interval, (_) => pollUnread());
    pollUnread();
  }

  void stopPolling() => _timer?.cancel();

  Future<void> pollUnread() async {
    try {
      final n = await _repo.unreadCount();
      if (!isClosed) emit(state.copyWith(unread: n));
    } catch (_) {/* offline: giữ số cũ */}
  }

  Future<void> load({bool? onlyUnread}) async {
    final u = onlyUnread ?? state.onlyUnread;
    emit(state.copyWith(loading: true, clearError: true, onlyUnread: u));
    try {
      final r = await _repo.list(unreadOnly: u);
      if (!isClosed) emit(state.copyWith(loading: false, items: r.items, unread: r.unread));
    } catch (e) {
      if (!isClosed) emit(state.copyWith(loading: false, error: e.toString()));
    }
  }

  Future<void> markRead(DriverNotification n) async {
    if (!n.unread) return;
    emit(state.copyWith(items: [for (final x in state.items) x.id == n.id ? x.read() : x], unread: (state.unread - 1).clamp(0, 1 << 30)));
    try {
      final left = await _repo.markRead(n.id);
      if (!isClosed) emit(state.copyWith(unread: left));
    } catch (_) {}
  }

  Future<void> markAllRead() async {
    emit(state.copyWith(items: [for (final x in state.items) x.read()], unread: 0));
    try {
      await _repo.markAllRead();
    } catch (_) {}
  }

  @override
  Future<void> close() {
    _timer?.cancel();
    return super.close();
  }
}
