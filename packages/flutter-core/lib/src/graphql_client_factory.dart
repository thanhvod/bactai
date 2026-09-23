import 'package:graphql/client.dart';
import 'api_config.dart';
import 'api_error.dart';
import 'driver_auth_api.dart';
import 'session_store.dart';

/// GraphQL client có AuthLink lấy accessToken từ SessionStore, tự refresh 1 lần khi UNAUTHENTICATED rồi retry.
/// Scalar: Money = int (VND), DateTime = ISO string.
class GraphqlClientFactory {
  GraphqlClientFactory({required this.config, required this.sessionStore, required this.authApi, this.onSessionLost});

  final ApiConfig config;
  final SessionStore sessionStore;
  final DriverAuthApi authApi;
  /// Gọi khi refresh thất bại (app điều hướng về login).
  final void Function()? onSessionLost;

  GraphQLClient? _client;
  Future<DriverSession?>? _refreshing;

  GraphQLClient get client => _client ??= _build();

  GraphQLClient _build() {
    final auth = AuthLink(getToken: () async {
      final s = await sessionStore.load();
      if (s == null) return null;
      if (s.isExpired) {
        final r = await _refresh(s);
        return r == null ? null : 'Bearer ${r.accessToken}';
      }
      return 'Bearer ${s.accessToken}';
    });
    final link = auth.concat(HttpLink(config.graphqlUrl));
    return GraphQLClient(link: link, cache: GraphQLCache(), defaultPolicies: DefaultPolicies(query: Policies(fetch: FetchPolicy.networkOnly)));
  }

  Future<DriverSession?> _refresh(DriverSession current) {
    return _refreshing ??= () async {
      try {
        final s = await authApi.refresh(current.refreshToken);
        await sessionStore.save(s);
        return s;
      } on ApiException catch (e) {
        // Refresh token có thể đã được tiến trình khác (dịch vụ GPS nền) xoay vòng → dùng phiên mới trong storage.
        final latest = await sessionStore.reload();
        if (latest != null && latest.refreshToken != current.refreshToken) return latest;
        if (e.isUnauthenticated || e.code == 'FORBIDDEN' || e.code == 'NOT_FOUND') {
          await sessionStore.clear();
          onSessionLost?.call();
        }
        return null;
      } finally {
        _refreshing = null;
      }
    }();
  }

  /// Chạy query, ném ApiException nếu lỗi; retry 1 lần sau khi refresh khi gặp UNAUTHENTICATED.
  Future<Map<String, dynamic>> query(String document, {Map<String, dynamic> variables = const {}}) =>
      _run(() => client.query(QueryOptions(document: gql(document), variables: variables)));

  Future<Map<String, dynamic>> mutate(String document, {Map<String, dynamic> variables = const {}}) =>
      _run(() => client.mutate(MutationOptions(document: gql(document), variables: variables)));

  Future<Map<String, dynamic>> _run(Future<QueryResult> Function() op, {bool retried = false}) async {
    final r = await op();
    if (!r.hasException) return r.data ?? {};
    final ex = r.exception!;
    if (ex.linkException != null && ex.graphqlErrors.isEmpty) {
      final le = ex.linkException;
      if (le is HttpLinkServerException && le.response.statusCode == 401 && !retried) {
        final s = await sessionStore.load();
        if (s != null && await _refresh(s) != null) return _run(op, retried: true);
        throw ApiException(code: 'UNAUTHENTICATED', message: 'Phiên đăng nhập đã hết hạn', statusCode: 401);
      }
      throw ApiException.network(le);
    }
    final g = ex.graphqlErrors.first;
    final code = (g.extensions?['code'] ?? 'SERVER_ERROR').toString();
    if (code == 'UNAUTHENTICATED' && !retried) {
      final s = await sessionStore.load();
      if (s != null && await _refresh(s) != null) return _run(op, retried: true);
    }
    throw ApiException(code: code, message: g.message, details: g.extensions);
  }

  void reset() {
    _client = null;
  }
}
