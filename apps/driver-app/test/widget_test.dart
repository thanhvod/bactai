import 'dart:async';

import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:driver_app/core/api/driver_api.dart';
import 'package:driver_app/core/cache/json_cache.dart';
import 'package:driver_app/core/di/di.dart';
import 'package:driver_app/features/auth/data/auth_repository.dart';
import 'package:driver_app/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:driver_app/features/field/data/field_repository.dart';
import 'package:driver_app/features/field/presentation/pages/trip_detail_page.dart';
import 'package:driver_app/features/gps/presentation/cubit/gps_cubit.dart';
import 'package:driver_app/features/jobs/data/graphql_jobs_repository.dart';
import 'package:driver_app/features/jobs/domain/jobs_repository.dart';
import 'package:driver_app/features/jobs/presentation/pages/home_page.dart';
import 'package:driver_app/features/sync/presentation/cubit/sync_cubit.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:driver_app/core/gps/device_setup.dart';

import 'fakes.dart';

void main() {
  late FakeDriverApi api;
  late SyncCubit sync;
  late GpsCubit gps;
  late AuthCubit auth;

  setUp(() async {
    await getIt.reset();
    api = FakeDriverApi();
    final jobs = GraphqlJobsRepository(api, MemoryJsonCache());
    sync = SyncCubit(Completer<OfflineQueue>().future, FakeConnectivity());
    final field = FieldRepository(api: api, jobs: jobs, queue: sync, upload: FakeUploadApi(), gps: FakeGpsApi());
    gps = GpsCubit(FakeLocationSource(), FakeBackgroundGpsController(), FakeDeviceSetup());
    auth = AuthCubit(AuthRepository(authApi: DriverAuthApi(const ApiConfig(baseUrl: 'http://fake')), session: SessionStore(MemoryKeyValueStore())));
    getIt
      ..registerSingleton<DriverApi>(api)
      ..registerSingleton<JobsRepository>(jobs)
      ..registerSingleton<FieldRepository>(field);
  });

  Widget wrap(Widget child) => MultiBlocProvider(
        providers: [BlocProvider.value(value: sync), BlocProvider.value(value: gps), BlocProvider.value(value: auth)],
        child: MaterialApp(home: child),
      );

  testWidgets('DA-HOME-01: hiện chuyến đang chạy + nút mở chuyến, bật GPS cho chuyến chạy', (tester) async {
    await tester.pumpWidget(wrap(const HomePage()));
    for (var i = 0; i < 10; i++) {
      await tester.pump(const Duration(milliseconds: 100));
    }
    expect(find.text('Chuyến đang chạy'), findsOneWidget);
    expect(find.text('Mở chuyến đang chạy'), findsOneWidget);
    expect(find.text('CX-202609-0001'), findsWidgets);
    expect(find.textContaining('nhận việc'), findsNothing);
    expect(gps.state.tripId, 'trip-1');
    unawaited(gps.stop());
    await tester.pump();
  });

  testWidgets('DA-HOME-01: lỗi tải → ErrorState có Thử lại', (tester) async {
    api.failWith = ApiException(code: 'SERVER_ERROR', message: 'Máy chủ gặp lỗi');
    await tester.pumpWidget(wrap(const HomePage()));
    await tester.pumpAndSettle();
    expect(find.text('Thử lại'), findsOneWidget);
  });

  testWidgets('DA-TRIP-01: nút chính theo trạng thái, tạm dừng và báo sự cố tách riêng; bấm → cập nhật', (tester) async {
    await tester.pumpWidget(wrap(const TripDetailPage(tripId: 'trip-1')));
    await tester.pumpAndSettle();
    expect(find.text('Đến điểm trả'), findsOneWidget);
    expect(find.text('Kho Bình Dương'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Báo sự cố'), 300);
    expect(find.text('Tạm dừng'), findsOneWidget);
    await tester.tap(find.text('Đến điểm trả'));
    await tester.pumpAndSettle();
    expect(api.calls.any((c) => c.$1 == 'updateTripStatus' && c.$2['status'] == 'DELIVERING'), isTrue);
    expect(find.text('Hoàn thành chuyến'), findsOneWidget);
    expect(gps.state.tripId, 'trip-1');
    unawaited(gps.stop());
    await tester.pump(const Duration(seconds: 6));
  });

  testWidgets('DA-TRIP-01: chuyến không thuộc tài xế → thông báo không có quyền, không có nút thử lại', (tester) async {
    api.failWith = ApiException(code: 'NOT_FOUND', message: 'Không tìm thấy chuyến');
    await tester.pumpWidget(wrap(const TripDetailPage(tripId: 'x')));
    await tester.pumpAndSettle();
    expect(find.textContaining('không có quyền'), findsOneWidget);
    expect(find.text('Thử lại'), findsNothing);
  });
}
