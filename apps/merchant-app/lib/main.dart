import 'dart:async';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'core/api/merchant_graphql_client.dart';
import 'core/app_scope.dart';
import 'core/auth/auth_controller.dart';
import 'core/auth/merchant_auth_api.dart';
import 'core/auth/merchant_session_store.dart';
import 'core/push/merchant_push.dart';
import 'core/router/app_router.dart';
import 'data/graphql_merchant_repository.dart';
import 'data/merchant_repository.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final config = ApiConfig.fromEnvironment();
  final auth = AuthController(store: MerchantSessionStore(), api: HttpMerchantAuthApi(config));
  final client = MerchantGraphqlClient(config: config, tokens: auth, merchantId: auth.currentMerchantId, onUnauthenticated: auth.onSessionLost);
  final repo = GraphqlMerchantRepository(client);
  auth.repository = repo;
  // D-017: thiếu --dart-define Firebase → push tắt êm, app chạy bình thường.
  final push = PushManager(
    messaging: await FirebasePushMessaging.create(FirebasePushConfig.fromEnvironment(), channelName: 'Thông báo nhà xe'),
    registrar: MerchantPushRegistrar(client),
    store: SecurePushTokenStore(key: 'bta.merchant.pushToken'),
    platform: pushPlatformName(defaultTargetPlatform),
  );
  auth.beforeLogout = push.onLogout;
  auth.bootstrap();
  runApp(MerchantApp(auth: auth, repository: repo, push: push));
}

class MerchantApp extends StatefulWidget {
  const MerchantApp({super.key, required this.auth, required this.repository, this.push});
  final AuthController auth;
  final MerchantRepository repository;
  final PushManager? push;
  @override
  State<MerchantApp> createState() => _MerchantAppState();
}

class _MerchantAppState extends State<MerchantApp> {
  late final GoRouter _router = buildMerchantRouter(widget.auth);
  StreamSubscription<PushTarget>? _tapSub;
  StreamSubscription<PushTarget>? _recvSub;
  String? _registeredFor;

  @override
  void initState() {
    super.initState();
    final push = widget.push;
    if (push == null) return;
    push.start().then((_) => _openPending());
    _tapSub = push.taps.listen(_open);
    _recvSub = push.received.listen((_) => merchantPushTick.value++);
    widget.auth.addListener(_onAuth);
  }

  /// Vào trạng thái sẵn sàng → đăng ký token (1 lần cho mỗi tài khoản) + mở thông báo đang chờ.
  void _onAuth() {
    final auth = widget.auth;
    if (auth.status != AuthStatus.ready) {
      if (auth.status == AuthStatus.signedOut) _registeredFor = null;
      return;
    }
    final owner = auth.me?.email;
    if (owner != null && owner != _registeredFor) {
      _registeredFor = owner;
      widget.push?.onLogin(ownerKey: owner);
    }
    _openPending();
  }

  void _openPending() {
    if (widget.auth.status != AuthStatus.ready) return;
    final t = widget.push?.takePendingTap();
    if (t != null) _open(t);
  }

  Future<void> _open(PushTarget t) async {
    final auth = widget.auth;
    if (auth.status != AuthStatus.ready) return;
    final switchTo = merchantToSwitch(t, currentMerchantId: auth.merchantId, activeMerchantIds: (auth.me?.activeMemberships ?? const []).map((m) => m.merchantId));
    if (switchTo != null) await auth.selectMerchant(switchTo);
    _router.go(merchantPathForPush(t));
  }

  @override
  void dispose() {
    _tapSub?.cancel();
    _recvSub?.cancel();
    widget.auth.removeListener(_onAuth);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AppScope(
        auth: widget.auth,
        repository: widget.repository,
        child: MaterialApp.router(
          title: 'BTA Nhà xe',
          debugShowCheckedModeBanner: false,
          theme: btaTheme(textTheme: BtaFonts.textTheme()),
          routerConfig: _router,
        ),
      );
}
