import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/gps/location_source.dart';
import '../cubit/gps_cubit.dart';

/// DA-GPS-01 — ghi lộ trình chạy nền (D-016): trạng thái dịch vụ, quyền "Luôn cho phép", thông báo, tối ưu pin.
class GpsPermissionPage extends StatefulWidget {
  const GpsPermissionPage({super.key});
  @override
  State<GpsPermissionPage> createState() => _GpsPermissionPageState();
}

class _GpsPermissionPageState extends State<GpsPermissionPage> with WidgetsBindingObserver {
  late final GpsCubit _gps = context.read<GpsCubit>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _gps.refreshPermission();
    _gps.startStatusPolling();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Quay lại từ trang Cài đặt hệ thống → đọc lại quyền.
    if (state == AppLifecycleState.resumed) _gps.refreshPermission();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _gps.stopStatusPolling();
    super.dispose();
  }

  static String _label(GpsPermission p) => switch (p) {
        GpsPermission.always => 'Luôn cho phép',
        GpsPermission.whileInUse => 'Chỉ khi dùng app',
        GpsPermission.denied => 'Chưa cho phép',
        GpsPermission.deniedForever => 'Đã chặn — mở cài đặt để bật',
        GpsPermission.serviceDisabled => 'Định vị trên máy đang tắt',
        GpsPermission.unknown => 'Chưa kiểm tra',
      };

  Future<void> _askAlways() async {
    final ok = await showConfirmBottomSheet(
      context,
      title: 'Cho phép vị trí "Luôn luôn"',
      message: _gps.isAndroid
          ? 'Để điều phối thấy xe kể cả khi bạn tắt màn hình hoặc tắt app, hãy chọn "Luôn cho phép" ở trang tiếp theo. '
              'App chỉ ghi vị trí khi bạn có chuyến đang chạy và tự tắt khi hết chuyến.'
          : 'Để điều phối thấy xe khi app chạy nền, hãy chọn "Luôn cho phép". App chỉ ghi vị trí khi có chuyến đang chạy.',
      confirmLabel: 'Tiếp tục',
    );
    if (ok) await _gps.requestAlways();
  }

  @override
  Widget build(BuildContext context) {
    final g = context.watch<GpsCubit>().state;
    final needSettings = g.permission == GpsPermission.deniedForever || g.permission == GpsPermission.serviceDisabled;
    final android = _gps.isAndroid;

    final PrimaryBottomAction action;
    if (needSettings) {
      action = PrimaryBottomAction(label: 'Mở cài đặt vị trí', icon: Icons.settings_outlined, onPressed: _gps.openSettings, secondaryLabel: 'Kiểm tra lại', onSecondary: _gps.refreshPermission);
    } else if (!g.granted) {
      action = PrimaryBottomAction(label: 'Cho phép vị trí', icon: Icons.location_on_outlined, onPressed: _gps.requestPermission, secondaryLabel: 'Kiểm tra lại', onSecondary: _gps.refreshPermission);
    } else if (!g.backgroundReady) {
      action = PrimaryBottomAction(label: 'Cho phép "Luôn luôn"', icon: Icons.my_location, onPressed: _askAlways, secondaryLabel: 'Kiểm tra lại', onSecondary: _gps.refreshPermission);
    } else {
      action = PrimaryBottomAction(label: 'Gửi vị trí ngay', icon: Icons.cloud_upload_outlined, onPressed: () async {
        await _gps.flush();
        await _gps.refreshStatus();
      }, secondaryLabel: 'Kiểm tra lại', onSecondary: _gps.refreshPermission);
    }

    return Scaffold(
      appBar: MobileHeader(title: 'Ghi lộ trình', onBack: () => context.pop()),
      body: ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
        const BtaBanner(
          message: 'App tự ghi vị trí khi bạn có chuyến đang chạy — kể cả khi tắt màn hình hoặc tắt app — và tự dừng khi hết chuyến.',
          tone: BtaTone.info,
        ),
        const SizedBox(height: BtaSpace.s3),
        if (g.tripId != null && !g.backgroundReady) ...[
          BtaBanner(
            message: g.granted ? 'Chưa "Luôn cho phép": khi tắt app, điều phối sẽ không thấy xe.' : 'Chưa bật vị trí — điều phối không thấy xe đang ở đâu.',
            tone: BtaTone.warning,
            icon: Icons.location_off_outlined,
          ),
          const SizedBox(height: BtaSpace.s3),
        ],
        SectionCard(
          child: Column(children: [
            ListRow(icon: Icons.my_location, label: 'Quyền vị trí', value: _label(g.permission)),
            ListRow(
              icon: Icons.local_shipping_outlined,
              label: 'Chuyến đang ghi',
              value: g.tripId == null ? 'Không có chuyến chạy' : '${g.tripCode ?? 'Chuyến hiện tại'} · ${g.tracking ? 'đang ghi' : 'chờ cấp quyền'}',
            ),
            ListRow(icon: Icons.place_outlined, label: 'Vị trí mới nhất', value: g.lastPointAt == null ? '—' : BtaFormat.dateTime(g.lastPointAt)),
            ListRow(icon: Icons.schedule, label: 'Gửi lần cuối', value: g.lastSentAt == null ? '—' : BtaFormat.dateTime(g.lastSentAt)),
            ListRow(icon: Icons.cloud_off_outlined, label: 'Điểm chờ gửi', value: '${g.pendingPoints}'),
          ]),
        ),
        if (g.lastError != null) ...[
          const SizedBox(height: BtaSpace.s3),
          BtaBanner(message: g.lastError!, tone: BtaTone.warning),
        ],
        if (android) ...[
          const SizedBox(height: BtaSpace.s4),
          Text('Để ghi nền ổn định trên Android', style: BtaText.bodyStrong),
          const SizedBox(height: BtaSpace.s2),
          SectionCard(
            child: Column(children: [
              ListRow(
                icon: Icons.notifications_outlined,
                label: 'Thông báo "Đang ghi lộ trình"',
                value: g.notificationsGranted ? 'Đã bật' : 'Chưa bật — bấm để bật',
                onTap: g.notificationsGranted ? null : _gps.requestNotifications,
              ),
              ListRow(
                icon: Icons.battery_saver_outlined,
                label: 'Tối ưu pin cho BTA',
                value: g.batteryUnrestricted ? 'Đã tắt (tốt)' : 'Đang bật — bấm để tắt',
                onTap: g.batteryUnrestricted ? null : _gps.requestBatteryUnrestricted,
              ),
            ]),
          ),
          const SizedBox(height: BtaSpace.s2),
          Text(
            'Máy Xiaomi, Oppo, Vivo, Realme, Samsung có thể tự dừng app chạy nền: vào Cài đặt → Ứng dụng → BTA → Pin, chọn "Không hạn chế" và bật "Tự khởi động". '
            'Không bấm "Buộc dừng" khi đang chạy chuyến.',
            style: BtaText.caption.copyWith(color: BtaColors.textSubtle),
          ),
        ] else ...[
          const SizedBox(height: BtaSpace.s3),
          Text(
            'iPhone: khi app chạy nền vị trí được ghi liên tục. Nếu vuốt tắt hẳn app, iOS chỉ báo vị trí khi xe di chuyển đáng kể (khoảng 500m) — nên để app chạy nền trong chuyến.',
            style: BtaText.caption.copyWith(color: BtaColors.textSubtle),
          ),
        ],
      ]),
      bottomNavigationBar: action,
    );
  }
}
