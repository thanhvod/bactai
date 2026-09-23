import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:get_it/get_it.dart';

import '../../features/auth/data/auth_repository.dart';
import '../../features/auth/presentation/cubit/auth_cubit.dart';
import '../../features/field/data/field_repository.dart';
import '../../features/gps/presentation/cubit/gps_cubit.dart';
import '../../features/jobs/data/graphql_jobs_repository.dart';
import '../../features/jobs/data/mock_jobs_repository.dart';
import '../../features/jobs/domain/jobs_repository.dart';
import '../../features/money/data/money_repository.dart';
import '../../features/notifications/data/notifications_repository.dart';
import '../../features/notifications/presentation/cubit/notifications_cubit.dart';
import '../../features/sync/presentation/cubit/sync_cubit.dart';
import '../api/driver_api.dart';
import '../cache/json_cache.dart';
import '../gps/background_gps_controller.dart';
import '../gps/device_setup.dart';
import '../gps/location_source.dart';
import '../gps/tracking_store.dart';
import '../media/photo_picker.dart';

final getIt = GetIt.instance;

/// Mặc định dùng API thật. `--dart-define=USE_MOCK=true` để chạy UI với dữ liệu mẫu (không cần API).
const bool useMockData = bool.fromEnvironment('USE_MOCK', defaultValue: false);

Future<void> setupDi() async {
  final config = ApiConfig.fromEnvironment();
  final session = SessionStore();
  final authApi = DriverAuthApi(config);
  final gql = GraphqlClientFactory(
    config: config,
    sessionStore: session,
    authApi: authApi,
    onSessionLost: () => getIt<AuthCubit>().sessionLost(),
  );
  Future<String?> token() async => (await session.load())?.accessToken;
  final api = GraphqlDriverApi(gql);
  final jobs = useMockData ? MockJobsRepository() : GraphqlJobsRepository(api, PrefsJsonCache());
  final queue = OfflineQueue.open();
  final sync = SyncCubit(queue, ConnectivityWatcher(), onDrained: jobs.clearOverlays);
  final uploadApi = UploadApi(config, getToken: token);
  final gpsApi = GpsApi(config, getToken: token);
  final field = FieldRepository(api: api, jobs: jobs, queue: sync, upload: uploadApi, gps: gpsApi);
  sync.replayHandler = field.replay;

  getIt
    ..registerSingleton<ApiConfig>(config)
    ..registerSingleton<SessionStore>(session)
    ..registerSingleton<DriverAuthApi>(authApi)
    ..registerSingleton<GraphqlClientFactory>(gql)
    ..registerSingleton<DriverApi>(api)
    ..registerSingleton<UploadApi>(uploadApi)
    ..registerSingleton<GpsApi>(gpsApi)
    ..registerSingleton<JobsRepository>(jobs)
    ..registerSingleton<SyncCubit>(sync)
    ..registerSingleton<FieldRepository>(field)
    ..registerSingleton<PhotoPicker>(DevicePhotoPicker())
    ..registerSingleton<MoneyRepository>(MoneyRepository(api))
    ..registerSingleton<NotificationsRepository>(NotificationsRepository(api))
    ..registerLazySingleton<NotificationsCubit>(() => NotificationsCubit(getIt<NotificationsRepository>()))
    ..registerLazySingleton<GpsCubit>(() => GpsCubit(GeolocatorLocationSource(), createBackgroundGpsController(PrefsTrackingStore()), PermissionHandlerDeviceSetup()))
    ..registerSingleton<AuthRepository>(AuthRepository(authApi: authApi, session: session))
    ..registerLazySingleton<AuthCubit>(() => AuthCubit(getIt<AuthRepository>()));
}
