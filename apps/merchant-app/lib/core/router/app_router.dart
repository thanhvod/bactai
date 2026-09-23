import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/login_page.dart';
import '../../features/customers/customer_detail_page.dart';
import '../../features/customers/customer_list_page.dart';
import '../../features/finance/cod_page.dart';
import '../../features/finance/finance_page.dart';
import '../../features/home/home_page.dart';
import '../../features/map/map_page.dart';
import '../../features/notifications/notifications_page.dart';
import '../../features/orders/order_detail_page.dart';
import '../../features/orders/order_list_page.dart';
import '../../features/orders/quick_order_page.dart';
import '../../features/payroll/payroll_detail_page.dart';
import '../../features/payroll/payroll_list_page.dart';
import '../../features/profile/profile_page.dart';
import '../../features/reports/reports_page.dart';
import '../../features/trips/trip_detail_page.dart';
import '../../features/trips/trip_list_page.dart';
import '../auth/auth_controller.dart';
import 'routes.dart';

/// Điều hướng theo trạng thái phiên (redirect) + 5 tab: Tổng quan · Đơn/Chuyến · Tài chính · Báo cáo · Tài khoản.
GoRouter buildMerchantRouter(AuthController auth) => GoRouter(
      initialLocation: MerchantRoutes.pHome,
      refreshListenable: auth,
      redirect: (context, state) {
        final loc = state.matchedLocation;
        switch (auth.status) {
          case AuthStatus.loading:
            return loc == '/loading' ? null : '/loading';
          case AuthStatus.signedOut:
          case AuthStatus.noMembership:
            return loc == MerchantRoutes.pLogin ? null : MerchantRoutes.pLogin;
          case AuthStatus.mustChangePassword:
            return loc == MerchantRoutes.pChangePassword ? null : MerchantRoutes.pChangePassword;
          case AuthStatus.chooseMerchant:
            return loc == MerchantRoutes.pChooseMerchant ? null : MerchantRoutes.pChooseMerchant;
          case AuthStatus.ready:
            if (loc == MerchantRoutes.pLogin || loc == MerchantRoutes.pChooseMerchant || loc == MerchantRoutes.pChangePassword || loc == '/loading') return MerchantRoutes.pHome;
            return null;
        }
      },
      routes: [
        GoRoute(path: '/loading', builder: (_, _) => const Scaffold(body: Center(child: CircularProgressIndicator()))),
        GoRoute(name: MerchantRoutes.login, path: MerchantRoutes.pLogin, builder: (_, _) => const MerchantLoginPage()),
        GoRoute(name: MerchantRoutes.changePassword, path: MerchantRoutes.pChangePassword, builder: (_, _) => const ChangePasswordPage(forced: true)),
        GoRoute(name: MerchantRoutes.chooseMerchant, path: MerchantRoutes.pChooseMerchant, builder: (_, _) => const ChooseMerchantPage()),
        StatefulShellRoute.indexedStack(
          builder: (context, state, shell) => Scaffold(
            body: shell,
            bottomNavigationBar: BtaBottomNav(
              index: shell.currentIndex,
              onSelect: (i) => shell.goBranch(i, initialLocation: i == shell.currentIndex),
              tabs: const [
                BottomNavTab(icon: Icons.dashboard_outlined, selectedIcon: Icons.dashboard, label: 'Tổng quan'),
                BottomNavTab(icon: Icons.receipt_long_outlined, selectedIcon: Icons.receipt_long, label: 'Đơn/Chuyến'),
                BottomNavTab(icon: Icons.account_balance_wallet_outlined, selectedIcon: Icons.account_balance_wallet, label: 'Tài chính'),
                BottomNavTab(icon: Icons.bar_chart_outlined, selectedIcon: Icons.bar_chart, label: 'Báo cáo'),
                BottomNavTab(icon: Icons.person_outline, selectedIcon: Icons.person, label: 'Tài khoản'),
              ],
            ),
          ),
          branches: [
            StatefulShellBranch(routes: [
              GoRoute(name: MerchantRoutes.home, path: MerchantRoutes.pHome, builder: (_, _) => const HomePage(), routes: [
                GoRoute(name: MerchantRoutes.notifications, path: 'notifications', builder: (_, _) => const NotificationsPage()),
                GoRoute(name: MerchantRoutes.map, path: 'map', builder: (_, _) => const MapPage()),
              ]),
            ]),
            StatefulShellBranch(routes: [
              GoRoute(
                name: MerchantRoutes.orderList,
                path: MerchantRoutes.pOrders,
                builder: (_, s) => OrderListPage(key: ValueKey(s.uri.query), initialNeedsAction: s.uri.queryParameters['needsAction'] == '1'),
                routes: [
                  GoRoute(name: MerchantRoutes.quickOrderCreate, path: 'new', builder: (_, s) => QuickOrderPage(customerId: s.uri.queryParameters['customerId'])),
                  GoRoute(name: MerchantRoutes.orderDetail, path: ':orderId', builder: (_, s) => OrderDetailPage(orderId: s.pathParameters['orderId']!)),
                ],
              ),
              GoRoute(
                name: MerchantRoutes.tripList,
                path: MerchantRoutes.pTrips,
                builder: (_, s) => TripListPage(key: ValueKey(s.uri.query), initialRunning: s.uri.queryParameters['running'] == '1'),
                routes: [
                  GoRoute(name: MerchantRoutes.tripDetail, path: ':tripId', builder: (_, s) => TripDetailPage(tripId: s.pathParameters['tripId']!)),
                ],
              ),
              GoRoute(
                name: MerchantRoutes.customerList,
                path: MerchantRoutes.pCustomers,
                builder: (_, s) => CustomerListPage(key: ValueKey(s.uri.query), initialDebt: s.uri.queryParameters['debt']),
                routes: [
                  GoRoute(name: MerchantRoutes.customerDetail, path: ':customerId', builder: (_, s) => CustomerDetailPage(customerId: s.pathParameters['customerId']!)),
                ],
              ),
            ]),
            StatefulShellBranch(routes: [
              GoRoute(name: MerchantRoutes.finance, path: MerchantRoutes.pFinance, builder: (_, _) => const FinancePage(), routes: [
                GoRoute(name: MerchantRoutes.cod, path: 'cod', builder: (_, _) => const CodPage()),
              ]),
              GoRoute(name: MerchantRoutes.payrollApproval, path: MerchantRoutes.pPayroll, builder: (_, _) => const PayrollListPage(), routes: [
                GoRoute(name: MerchantRoutes.payrollDetail, path: ':payrollId', builder: (_, s) => PayrollDetailPage(payrollId: s.pathParameters['payrollId']!)),
              ]),
            ]),
            StatefulShellBranch(routes: [
              GoRoute(name: MerchantRoutes.reports, path: MerchantRoutes.pReports, builder: (_, _) => const ReportsPage()),
            ]),
            StatefulShellBranch(routes: [
              GoRoute(name: MerchantRoutes.profile, path: MerchantRoutes.pProfile, builder: (_, _) => const ProfilePage(), routes: [
                GoRoute(path: 'password', builder: (_, _) => const ChangePasswordPage()),
              ]),
            ]),
          ],
        ),
      ],
    );
