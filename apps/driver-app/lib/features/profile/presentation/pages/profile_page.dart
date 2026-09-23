import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/routes.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../../sync/presentation/cubit/sync_cubit.dart';

/// DA-PROFILE-01 — hồ sơ, đổi mật khẩu, đồng bộ, đăng xuất (cảnh báo nếu còn mục chưa gửi).
class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  Future<void> _logout(BuildContext context) async {
    final pending = context.read<SyncCubit>().state.pendingCount;
    final ok = await showConfirmBottomSheet(
      context,
      title: 'Đăng xuất?',
      message: pending > 0
          ? 'Còn $pending mục chưa đồng bộ. Đăng xuất bây giờ có thể mất dữ liệu đã nhập. Nên gửi hết trước.'
          : 'Bạn sẽ cần mật khẩu do nhà xe cấp để đăng nhập lại.',
      confirmLabel: pending > 0 ? 'Vẫn đăng xuất' : 'Đăng xuất',
      destructive: true,
    );
    if (ok && context.mounted) await context.read<AuthCubit>().logout();
  }

  @override
  Widget build(BuildContext context) {
    final driver = context.select((AuthCubit c) => c.state.driver);
    final sync = context.watch<SyncCubit>().state;
    return Scaffold(
      appBar: const MobileHeader(title: 'Tài khoản'),
      body: ListView(
        children: [
          Padding(
            padding: const EdgeInsets.all(BtaSpace.s4),
            child: Row(children: [
              CircleAvatar(radius: 28, backgroundColor: BtaColors.primarySoft, child: Text((driver?.name.isNotEmpty ?? false) ? driver!.name.characters.first : '?', style: BtaText.headingLg.copyWith(color: BtaColors.primary))),
              const SizedBox(width: BtaSpace.s3),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(driver?.name ?? '', style: BtaText.headingMd),
                  Text([driver?.code, driver?.phone].where((e) => e != null && e.isNotEmpty).join(' · '), style: BtaText.body.copyWith(color: BtaColors.textMuted)),
                  Text(driver?.merchantName ?? '', style: BtaText.bodySm.copyWith(color: BtaColors.textSubtle)),
                ]),
              ),
            ]),
          ),
          if (driver?.mustChangePassword ?? false)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: BtaSpace.s4),
              child: BtaBanner(tone: BtaTone.warning, message: 'Bạn đang dùng mật khẩu tạm. Hãy đổi mật khẩu.', actionLabel: 'Đổi', onAction: () => context.push('${DriverRoutes.pProfile}/change-password')),
            ),
          const Divider(height: BtaSpace.s4),
          ListRow(icon: Icons.sync, label: 'Đồng bộ dữ liệu', value: sync.pendingCount > 0 ? '${sync.pendingCount} chờ gửi' : 'Đã đồng bộ', onTap: () => context.push(DriverRoutes.pSync)),
          ListRow(icon: Icons.my_location_outlined, label: 'Theo dõi vị trí (GPS)', onTap: () => context.push(DriverRoutes.pGps)),
          ListRow(icon: Icons.account_balance_wallet_outlined, label: 'Thưởng & khoản ứng của tôi', onTap: () => context.push(DriverRoutes.pMoney)),
          ListRow(icon: Icons.history, label: 'Lịch sử chuyến', onTap: () => context.push(DriverRoutes.pHistory)),
          const Divider(),
          ListRow(icon: Icons.lock_outline, label: 'Đổi mật khẩu', onTap: () => context.push('${DriverRoutes.pProfile}/change-password')),
          ListRow(icon: Icons.logout, label: 'Đăng xuất', danger: true, onTap: () => _logout(context)),
        ],
      ),
    );
  }
}
