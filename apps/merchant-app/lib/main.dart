import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'core/api/merchant_graphql_client.dart';
import 'core/app_scope.dart';
import 'core/auth/auth_controller.dart';
import 'core/auth/merchant_auth_api.dart';
import 'core/auth/merchant_session_store.dart';
import 'core/router/app_router.dart';
import 'data/graphql_merchant_repository.dart';
import 'data/merchant_repository.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  final config = ApiConfig.fromEnvironment();
  final auth = AuthController(store: MerchantSessionStore(), api: HttpMerchantAuthApi(config));
  final client = MerchantGraphqlClient(config: config, tokens: auth, merchantId: auth.currentMerchantId, onUnauthenticated: auth.onSessionLost);
  final repo = GraphqlMerchantRepository(client);
  auth.repository = repo;
  auth.bootstrap();
  runApp(MerchantApp(auth: auth, repository: repo));
}

class MerchantApp extends StatefulWidget {
  const MerchantApp({super.key, required this.auth, required this.repository});
  final AuthController auth;
  final MerchantRepository repository;
  @override
  State<MerchantApp> createState() => _MerchantAppState();
}

class _MerchantAppState extends State<MerchantApp> {
  late final GoRouter _router = buildMerchantRouter(widget.auth);

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
