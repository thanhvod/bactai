import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';

/// DA-AUTH-01 — kiểm tra phiên; router tự điều hướng khi AuthCubit đổi trạng thái.
class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _Logo(),
            SizedBox(height: BtaSpace.s4),
            Text('BTA Tài xế', style: BtaText.headingLg),
            SizedBox(height: BtaSpace.s6),
            SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2)),
            SizedBox(height: BtaSpace.s3),
            Text('Đang kiểm tra phiên đăng nhập…', style: BtaText.bodySm),
          ],
        ),
      ),
    );
  }
}

class _Logo extends StatelessWidget {
  const _Logo();
  @override
  Widget build(BuildContext context) => Container(
        width: 64,
        height: 64,
        decoration: BoxDecoration(color: BtaColors.primary, borderRadius: BorderRadius.circular(BtaRadius.lg)),
        child: const Icon(Icons.local_shipping, color: Colors.white, size: 36),
      );
}
