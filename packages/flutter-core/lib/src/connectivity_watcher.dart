import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

/// Stream online/offline (true = có mạng). Chỉ dựa vào connectivity, không ping server.
class ConnectivityWatcher {
  ConnectivityWatcher({Connectivity? connectivity}) : _c = connectivity ?? Connectivity();

  final Connectivity _c;
  final _controller = StreamController<bool>.broadcast();
  StreamSubscription<List<ConnectivityResult>>? _sub;
  bool _online = true;

  bool get isOnline => _online;
  Stream<bool> get onChange => _controller.stream;

  Future<void> start() async {
    _online = _isOnline(await _c.checkConnectivity());
    _controller.add(_online);
    _sub ??= _c.onConnectivityChanged.listen((r) {
      final now = _isOnline(r);
      if (now != _online) {
        _online = now;
        _controller.add(now);
      }
    });
  }

  static bool _isOnline(List<ConnectivityResult> r) => r.any((x) => x != ConnectivityResult.none);

  Future<void> dispose() async {
    await _sub?.cancel();
    await _controller.close();
  }
}
