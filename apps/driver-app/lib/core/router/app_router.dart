import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/cubit/auth_cubit.dart';
import '../../features/auth/presentation/pages/forgot_password_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/splash_page.dart';
import '../../features/jobs/presentation/pages/home_page.dart';
import '../../features/jobs/presentation/pages/job_calendar_page.dart';
import '../../features/jobs/presentation/pages/job_list_page.dart';
import '../../features/field/presentation/pages/cod_input_page.dart';
import '../../features/field/presentation/pages/status_pages.dart';
import '../../features/field/presentation/pages/stop_detail_page.dart';
import '../../features/field/presentation/pages/stop_list_page.dart';
import '../../features/field/presentation/pages/trip_detail_page.dart';
import '../../features/field/presentation/pages/upload_pages.dart';
import '../../features/gps/presentation/pages/gps_page.dart';
import '../../features/history/presentation/pages/history_page.dart';
import '../../features/money/presentation/pages/money_page.dart';
import '../../features/notifications/presentation/cubit/notifications_cubit.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/profile/presentation/pages/change_password_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/sync/presentation/cubit/sync_cubit.dart';
import '../../features/sync/presentation/pages/sync_page.dart';
import 'routes.dart';

GoRouter buildRouter(AuthCubit auth) {
  return GoRouter(
    initialLocation: DriverRoutes.pSplash,
    refreshListenable: _CubitListenable(auth),
    redirect: (context, state) {
      final s = auth.state;
      final loc = state.matchedLocation;
      final isAuthPage = loc == DriverRoutes.pLogin || loc == DriverRoutes.pForgotPassword;
      if (s.status == AuthStatus.unknown) return loc == DriverRoutes.pSplash ? null : DriverRoutes.pSplash;
      if (s.status == AuthStatus.unauthenticated) return isAuthPage ? null : DriverRoutes.pLogin;
      if (isAuthPage || loc == DriverRoutes.pSplash) return DriverRoutes.pHome;
      return null;
    },
    routes: [
      GoRoute(name: DriverRoutes.splash, path: DriverRoutes.pSplash, builder: (_, _) => const SplashPage()),
      GoRoute(name: DriverRoutes.login, path: DriverRoutes.pLogin, builder: (_, _) => const LoginPage()),
      GoRoute(name: DriverRoutes.forgotPassword, path: DriverRoutes.pForgotPassword, builder: (_, _) => const ForgotPasswordPage()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => _ShellScaffold(shell: shell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(name: DriverRoutes.home, path: DriverRoutes.pHome, builder: (_, _) => const HomePage()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              name: DriverRoutes.jobList,
              path: DriverRoutes.pJobs,
              builder: (_, _) => const JobListPage(),
              routes: [
                GoRoute(name: DriverRoutes.jobCalendar, path: 'calendar', builder: (_, _) => const JobCalendarPage()),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(name: DriverRoutes.notifications, path: DriverRoutes.pNotifications, builder: (_, _) => const NotificationsPage()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(name: DriverRoutes.profile, path: DriverRoutes.pProfile, builder: (_, _) => const ProfilePage(), routes: [
              GoRoute(path: 'change-password', builder: (_, _) => const ChangePasswordPage()),
            ]),
          ]),
        ],
      ),
      // Màn ngoài shell (full screen, có back)
      GoRoute(
        name: DriverRoutes.tripDetail,
        path: '/trips/:tripId',
        builder: (_, s) => TripDetailPage(tripId: s.pathParameters['tripId']!),
        routes: [
          GoRoute(name: DriverRoutes.stopList, path: 'stops', builder: (_, s) => StopListPage(tripId: s.pathParameters['tripId']!)),
          GoRoute(name: DriverRoutes.statusUpdate, path: 'status', builder: (_, s) => StatusUpdatePage(tripId: s.pathParameters['tripId']!)),
          GoRoute(name: DriverRoutes.pauseTrip, path: 'pause', builder: (_, s) => PauseTripPage(tripId: s.pathParameters['tripId']!)),
          GoRoute(name: DriverRoutes.incidentReport, path: 'incident', builder: (_, s) => IncidentReportPage(tripId: s.pathParameters['tripId']!)),
        ],
      ),
      GoRoute(
        name: DriverRoutes.stopDetail,
        path: '/stops/:stopId',
        builder: (_, s) => StopDetailPage(stopId: s.pathParameters['stopId']!),
        routes: [
          GoRoute(name: DriverRoutes.podCapture, path: 'pod', builder: (_, s) => PodCapturePage(stopId: s.pathParameters['stopId']!)),
          GoRoute(name: DriverRoutes.codInput, path: 'cod', builder: (_, s) => CodInputPage(stopId: s.pathParameters['stopId']!)),
        ],
      ),
      GoRoute(name: DriverRoutes.attachmentUpload, path: DriverRoutes.pAttachmentUpload, builder: (_, s) => AttachmentUploadPage(entityType: s.uri.queryParameters['entityType'] ?? 'TRIP', entityId: s.uri.queryParameters['entityId'] ?? '', label: s.uri.queryParameters['label'])),
      GoRoute(name: DriverRoutes.gpsPermission, path: DriverRoutes.pGps, builder: (_, _) => const GpsPermissionPage()),
      GoRoute(name: DriverRoutes.sync, path: DriverRoutes.pSync, builder: (_, _) => const SyncPage()),
      GoRoute(name: DriverRoutes.money, path: DriverRoutes.pMoney, builder: (_, _) => const MoneyPage()),
      GoRoute(name: DriverRoutes.history, path: DriverRoutes.pHistory, builder: (_, _) => const HistoryPage()),
    ],
  );
}

class _ShellScaffold extends StatelessWidget {
  const _ShellScaffold({required this.shell});
  final StatefulNavigationShell shell;

  @override
  Widget build(BuildContext context) {
    final pending = context.select((SyncCubit c) => c.state.pendingCount);
    final unread = context.select((NotificationsCubit c) => c.state.unread);
    return Scaffold(
      body: shell,
      bottomNavigationBar: BtaBottomNav(
        index: shell.currentIndex,
        onSelect: (i) => shell.goBranch(i, initialLocation: i == shell.currentIndex),
        tabs: const [
          BottomNavTab(icon: Icons.today_outlined, selectedIcon: Icons.today, label: 'Hôm nay'),
          BottomNavTab(icon: Icons.local_shipping_outlined, selectedIcon: Icons.local_shipping, label: 'Chuyến'),
          BottomNavTab(icon: Icons.notifications_outlined, selectedIcon: Icons.notifications, label: 'Thông báo'),
          BottomNavTab(icon: Icons.person_outline, selectedIcon: Icons.person, label: 'Tài khoản'),
        ],
        badges: {2: unread, 3: pending},
      ),
    );
  }
}

class _CubitListenable extends ChangeNotifier {
  _CubitListenable(AuthCubit cubit) {
    _sub = cubit.stream.listen((_) => notifyListeners());
  }
  late final dynamic _sub;
  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }
}
