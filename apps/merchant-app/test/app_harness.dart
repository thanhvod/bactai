import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:merchant_app/core/app_scope.dart';
import 'package:merchant_app/core/auth/auth_controller.dart';
import 'package:merchant_app/core/auth/merchant_auth_api.dart';
import 'package:merchant_app/core/auth/merchant_session_store.dart';
import 'package:merchant_app/core/router/app_router.dart';

import 'fake_auth_api.dart';
import 'mock_repository.dart';

/// Dựng app với repository mock + auth API giả (theme không tải Google Fonts để test offline).
Future<(AuthController, MockMerchantRepository)> pumpApp(WidgetTester tester, {MockMerchantRepository? repo, bool loggedIn = true, FakeMerchantAuthApi? api}) async {
  final r = repo ?? MockMerchantRepository();
  final store = MerchantSessionStore(MemoryKeyValueStore());
  if (loggedIn) {
    await store.saveSession(MerchantAuthSession(accessToken: 'usr.seed', refreshToken: 'refresh-seed', expiresAt: DateTime.now().add(const Duration(hours: 1)), phone: '0911000001'));
  }
  final auth = AuthController(store: store, api: api ?? FakeMerchantAuthApi());
  auth.repository = r;
  r.merchantHeader = auth.currentMerchantId;
  await auth.bootstrap();
  final router = buildMerchantRouter(auth);
  await tester.binding.setSurfaceSize(const Size(420, 900));
  await tester.pumpWidget(AppScope(auth: auth, repository: r, child: MaterialApp.router(theme: btaTheme(), routerConfig: router)));
  await tester.pumpAndSettle();
  return (auth, r);
}
