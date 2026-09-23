import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// DA-AUTH-03 — theo D-009 không có OTP: tài xế liên hệ nhà xe để được đặt lại mật khẩu trên Web Merchant.
class ForgotPasswordPage extends StatelessWidget {
  const ForgotPasswordPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: MobileHeader(title: 'Quên mật khẩu', onBack: () => context.pop()),
      body: Padding(
        padding: const EdgeInsets.all(BtaSpace.s4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const BtaBanner(tone: BtaTone.info, message: 'Mật khẩu do nhà xe quản lý. App không gửi mã OTP.'),
            const SizedBox(height: BtaSpace.s4),
            const Text('Cách đặt lại mật khẩu', style: BtaText.headingSm),
            const SizedBox(height: BtaSpace.s2),
            const _Step(1, 'Gọi cho điều phối / quản lý của nhà xe bạn đang chạy.'),
            const _Step(2, 'Nhà xe bấm "Đặt lại tài khoản app" trong hồ sơ tài xế trên Web Merchant.'),
            const _Step(3, 'Nhận mật khẩu tạm, đăng nhập rồi đổi mật khẩu trong Tài khoản.'),
            const Spacer(),
            OutlinedButton(onPressed: () => context.pop(), child: const Text('Quay lại đăng nhập')),
          ],
        ),
      ),
    );
  }
}

class _Step extends StatelessWidget {
  const _Step(this.n, this.text);
  final int n;
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: BtaSpace.s2),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 28,
            height: 28,
            alignment: Alignment.center,
            decoration: const BoxDecoration(color: BtaColors.primarySoft, shape: BoxShape.circle),
            child: Text('$n', style: BtaText.caption.copyWith(color: BtaColors.primary)),
          ),
          const SizedBox(width: BtaSpace.s3),
          Expanded(child: Text(text, style: BtaText.mobileKey.copyWith(fontWeight: FontWeight.w400))),
        ]),
      );
}
