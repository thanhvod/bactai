import 'package:flutter/widgets.dart';

import '../data/merchant_repository.dart';
import 'auth/auth_controller.dart';

/// DI đơn giản: repository + auth controller cho toàn app.
class AppScope extends InheritedNotifier<AuthController> {
  const AppScope({super.key, required this.repository, required AuthController auth, required super.child}) : super(notifier: auth);

  final MerchantRepository repository;

  AuthController get auth => notifier!;

  static AppScope of(BuildContext context) {
    final s = context.dependOnInheritedWidgetOfExactType<AppScope>();
    assert(s != null, 'AppScope chưa được gắn');
    return s!;
  }

  static MerchantRepository repo(BuildContext context) => context.getInheritedWidgetOfExactType<AppScope>()!.repository;
  static AuthController authOf(BuildContext context) => context.getInheritedWidgetOfExactType<AppScope>()!.notifier!;
}
