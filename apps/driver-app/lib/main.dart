import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'dart:async';

import 'package:bta_flutter_core/bta_flutter_core.dart';

import 'core/di/di.dart';
import 'core/push/driver_push.dart';
import 'core/router/app_router.dart';
import 'features/auth/presentation/cubit/auth_cubit.dart';
import 'features/gps/presentation/cubit/gps_cubit.dart';
import 'features/notifications/presentation/cubit/notifications_cubit.dart';
import 'features/sync/presentation/cubit/sync_cubit.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await setupDi();
  runApp(const DriverApp());
}

class DriverApp extends StatefulWidget {
  const DriverApp({super.key});

  @override
  State<DriverApp> createState() => _DriverAppState();
}

class _DriverAppState extends State<DriverApp> with WidgetsBindingObserver {
  late final AuthCubit _auth = getIt<AuthCubit>()..restore();
  late final SyncCubit _sync = getIt<SyncCubit>()..start();
  late final NotificationsCubit _noti = getIt<NotificationsCubit>();
  late final GpsCubit _gps = getIt<GpsCubit>();
  late final _router = buildRouter(_auth);
  late final PushManager _push = getIt<PushManager>();
  StreamSubscription<PushTarget>? _tapSub;
  StreamSubscription<PushTarget>? _recvSub;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // D-017 push FCM: bấm thông báo → mở màn liên quan; push khi đang mở → làm mới badge + danh sách chuyến.
    _push.start().then((_) => _openPendingTap());
    _tapSub = _push.taps.listen(_openTap);
    _recvSub = _push.received.listen((t) {
      onDriverPushReceived(t);
      _noti.pollUnread();
    });
    _auth.stream.listen((s) {
      if (s.status == AuthStatus.authenticated) {
        _push.onLogin(ownerKey: s.driver?.id);
        _openPendingTap();
        _noti.startPolling();
        // D-016: còn chuyến đang theo dõi (app bị tắt/khởi động lại, iOS được đánh thức) → ghi tiếp.
        _gps.resume();
      } else if (s.status == AuthStatus.unauthenticated) {
        _noti.stopPolling();
        _gps.stop();
      }
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Polling chỉ khi app mở; về foreground thì đồng bộ ngay.
    if (state == AppLifecycleState.resumed && _auth.state.status == AuthStatus.authenticated) {
      _noti.startPolling();
      _sync.replayAll();
    } else if (state == AppLifecycleState.paused) {
      _noti.stopPolling();
      _gps.flush();
    }
  }

  void _openTap(PushTarget t) {
    if (_auth.state.status != AuthStatus.authenticated) return;
    _router.push(driverPathForPush(t));
  }

  void _openPendingTap() {
    if (_auth.state.status != AuthStatus.authenticated) return;
    final t = _push.takePendingTap();
    if (t != null) _router.push(driverPathForPush(t));
  }

  @override
  void dispose() {
    _tapSub?.cancel();
    _recvSub?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider.value(value: _auth),
        BlocProvider.value(value: _sync),
        BlocProvider.value(value: _noti),
        BlocProvider.value(value: _gps),
      ],
      child: MaterialApp.router(
        title: 'BTA Tài xế',
        debugShowCheckedModeBanner: false,
        theme: btaTheme(textTheme: BtaFonts.textTheme()),
        routerConfig: _router,
      ),
    );
  }
}
