import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../data/auth_repository.dart';

enum AuthStatus { unknown, unauthenticated, authenticated }

class AuthState {
  const AuthState({this.status = AuthStatus.unknown, this.driver, this.busy = false, this.error});
  final AuthStatus status;
  final DriverProfile? driver;
  final bool busy;
  final String? error;

  AuthState copyWith({AuthStatus? status, DriverProfile? driver, bool? busy, String? error, bool clearError = false}) => AuthState(
        status: status ?? this.status,
        driver: driver ?? this.driver,
        busy: busy ?? this.busy,
        error: clearError ? null : (error ?? this.error),
      );
}

class AuthCubit extends Cubit<AuthState> {
  AuthCubit(this._repo) : super(const AuthState());
  final AuthRepository _repo;

  Future<void> restore() async {
    final s = await _repo.restore();
    emit(s == null
        ? const AuthState(status: AuthStatus.unauthenticated)
        : AuthState(status: AuthStatus.authenticated, driver: s.driver));
  }

  Future<bool> login(String phone, String password) async {
    emit(state.copyWith(busy: true, clearError: true));
    try {
      final s = await _repo.login(phone, password);
      emit(AuthState(status: AuthStatus.authenticated, driver: s.driver));
      return true;
    } on ApiException catch (e) {
      final msg = e.isUnauthenticated || e.code == 'FORBIDDEN' || e.code == 'NOT_FOUND'
          ? 'Sai số điện thoại hoặc mật khẩu, hoặc tài khoản đã bị khóa.'
          : e.message;
      emit(state.copyWith(busy: false, error: msg));
      return false;
    } catch (e) {
      emit(state.copyWith(busy: false, error: 'Lỗi không xác định: $e'));
      return false;
    }
  }

  Future<void> logout() async {
    emit(state.copyWith(busy: true));
    try {
      await _repo.logout();
    } finally {
      emit(const AuthState(status: AuthStatus.unauthenticated));
    }
  }

  Future<void> changePassword(String oldPassword, String newPassword) async {
    await _repo.changePassword(oldPassword, newPassword);
    final s = await _repo.restore();
    emit(state.copyWith(driver: s?.driver));
  }

  /// Refresh token thất bại → về màn đăng nhập.
  Future<void> sessionLost() async {
    await _repo.clearLocal();
    emit(const AuthState(status: AuthStatus.unauthenticated, error: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.'));
  }
}
