import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_scope.dart';
import '../../core/router/routes.dart';
import '../../models/models.dart';
import '../auth/merchant_picker.dart';

const appVersion = '1.0.0';

/// MA-PROFILE-01 — hồ sơ, nhà xe hiện tại, đổi nhà xe, đăng xuất.
class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = AppScope.of(context).auth;
    final me = auth.me;
    return Scaffold(
      appBar: const MobileHeader(title: 'Tài khoản'),
      body: ListView(children: [
        ListTile(
          leading: const CircleAvatar(child: Icon(Icons.person)),
          title: Text(me?.name ?? me?.email ?? '', style: BtaText.bodyStrong),
          subtitle: Text([me?.phone, me?.email].whereType<String>().join(' · ')),
        ),
        const Divider(),
        ListRow(icon: Icons.local_shipping_outlined, label: 'Nhà xe', value: '${auth.merchantName} · ${roleLabels[auth.role] ?? auth.role ?? ''}'),
        if ((me?.activeMemberships.length ?? 0) > 1) ListRow(icon: Icons.swap_horiz, label: 'Đổi nhà xe', trailing: const Icon(Icons.chevron_right), onTap: () => showMerchantPicker(context)),
        ListRow(icon: Icons.verified_user_outlined, label: 'Quyền', value: '${auth.permissions.length} quyền đang có'),
        ListRow(icon: Icons.phone_android, label: 'Đăng nhập bằng', value: 'SĐT ${me?.phone ?? ''}'),
        ListRow(icon: Icons.lock_reset, label: 'Đổi mật khẩu', trailing: const Icon(Icons.chevron_right), onTap: () => context.push(MerchantRoutes.pProfileChangePassword)),
        ListRow(icon: Icons.info_outline, label: 'Phiên bản', value: appVersion),
        const Divider(),
        ListRow(
          icon: Icons.logout,
          label: 'Đăng xuất',
          danger: true,
          onTap: () async {
            final ok = await showConfirmBottomSheet(context, title: 'Đăng xuất?', confirmLabel: 'Đăng xuất', destructive: true);
            if (ok) await auth.logout();
          },
        ),
      ]),
    );
  }
}
