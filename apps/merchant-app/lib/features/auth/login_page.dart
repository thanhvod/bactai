import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';

import '../../core/app_scope.dart';
import '../../core/auth/auth_controller.dart';
import 'merchant_picker.dart';

/// MA-AUTH-01 — đăng nhập SĐT + mật khẩu (D-014). Mật khẩu do admin nhà xe cấp trên Web Merchant
/// hoặc nhân viên tự đặt ở menu tài khoản trên web. OTP làm sau.
class MerchantLoginPage extends StatefulWidget {
  const MerchantLoginPage({super.key});
  @override
  State<MerchantLoginPage> createState() => _MerchantLoginPageState();
}

class _MerchantLoginPageState extends State<MerchantLoginPage> {
  final _form = GlobalKey<FormState>();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;
  bool _obscure = true;

  @override
  void dispose() {
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    setState(() => _busy = true);
    await AppScope.authOf(context).login(_phone.text, _password.text);
    if (mounted) setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    final auth = AppScope.of(context).auth;
    return Scaffold(
      body: SafeArea(
        child: Form(
          key: _form,
          child: ListView(
            padding: const EdgeInsets.all(BtaSpace.s6),
            children: [
              const SizedBox(height: BtaSpace.s8),
              Row(children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: BtaColors.primary, borderRadius: BorderRadius.circular(BtaRadius.md)),
                  child: const Icon(Icons.local_shipping, color: Colors.white),
                ),
                const SizedBox(width: BtaSpace.s3),
                const Text('BTA Nhà xe', style: BtaText.headingLg),
              ]),
              const SizedBox(height: BtaSpace.s6),
              const Text('Đăng nhập', style: BtaText.displaySm),
              const SizedBox(height: BtaSpace.s1),
              Text('Dùng số điện thoại và mật khẩu app do nhà xe cấp.', style: BtaText.body.copyWith(color: BtaColors.textMuted)),
              const SizedBox(height: BtaSpace.s5),
              if (auth.error != null) ...[BtaBanner(tone: BtaTone.danger, message: auth.error!), const SizedBox(height: BtaSpace.s3)],
              if (auth.status == AuthStatus.noMembership) ...[
                BtaBanner(tone: BtaTone.warning, message: 'Tài khoản chưa thuộc nhà xe nào hoặc đã bị khóa. Liên hệ admin nhà xe.'),
                const SizedBox(height: BtaSpace.s3),
              ],
              TextFormField(
                key: const Key('phone'),
                controller: _phone,
                keyboardType: TextInputType.phone,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.telephoneNumber],
                decoration: const InputDecoration(labelText: 'Số điện thoại', hintText: '09xx xxx xxx', border: OutlineInputBorder(), prefixIcon: Icon(Icons.phone_outlined)),
                validator: (v) => AuthController.validatePhone(v ?? ''),
              ),
              const SizedBox(height: BtaSpace.s3),
              TextFormField(
                key: const Key('password'),
                controller: _password,
                obscureText: _obscure,
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => _submit(),
                autofillHints: const [AutofillHints.password],
                decoration: InputDecoration(
                  labelText: 'Mật khẩu',
                  border: const OutlineInputBorder(),
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    tooltip: _obscure ? 'Hiện mật khẩu' : 'Ẩn mật khẩu',
                    onPressed: () => setState(() => _obscure = !_obscure),
                    icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                  ),
                ),
                validator: (v) => (v ?? '').isEmpty ? 'Nhập mật khẩu' : null,
              ),
              const SizedBox(height: BtaSpace.s5),
              SizedBox(
                height: BtaSize.tapTarget,
                child: FilledButton(
                  key: const Key('login'),
                  onPressed: _busy ? null : _submit,
                  child: _busy ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Đăng nhập'),
                ),
              ),
              const SizedBox(height: BtaSpace.s4),
              Text('Quên mật khẩu? Nhờ admin nhà xe đặt lại trên Web Merchant (Cài đặt → Nhân viên).',
                  style: BtaText.caption.copyWith(color: BtaColors.textMuted)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Đổi mật khẩu — bắt buộc sau khi đăng nhập bằng mật khẩu tạm (`forced`), hoặc mở từ MA-PROFILE-01.
class ChangePasswordPage extends StatefulWidget {
  const ChangePasswordPage({super.key, this.forced = false});
  final bool forced;
  @override
  State<ChangePasswordPage> createState() => _ChangePasswordPageState();
}

class _ChangePasswordPageState extends State<ChangePasswordPage> {
  final _form = GlobalKey<FormState>();
  final _old = TextEditingController();
  final _new = TextEditingController();
  final _confirm = TextEditingController();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _old.dispose();
    _new.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    final auth = AppScope.authOf(context);
    final err = await auth.changePassword(_old.text, _new.text);
    if (!mounted) return;
    setState(() {
      _busy = false;
      _error = err;
    });
    if (err == null && !widget.forced) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã đổi mật khẩu')));
      Navigator.of(context).maybePop();
    }
  }

  InputDecoration _dec(String label) => InputDecoration(labelText: label, border: const OutlineInputBorder());

  @override
  Widget build(BuildContext context) {
    final auth = AppScope.of(context).auth;
    return Scaffold(
      appBar: MobileHeader(
        title: 'Đổi mật khẩu',
        actions: widget.forced ? [IconButton(tooltip: 'Đăng xuất', onPressed: auth.logout, icon: const Icon(Icons.logout))] : null,
      ),
      body: SafeArea(
        child: Form(
          key: _form,
          child: ListView(padding: const EdgeInsets.all(BtaSpace.s5), children: [
            if (widget.forced) ...[
              const BtaBanner(tone: BtaTone.warning, message: 'Bạn đang dùng mật khẩu tạm do nhà xe cấp. Đặt mật khẩu mới để tiếp tục.'),
              const SizedBox(height: BtaSpace.s4),
            ],
            if (_error != null) ...[BtaBanner(tone: BtaTone.danger, message: _error!), const SizedBox(height: BtaSpace.s3)],
            TextFormField(key: const Key('oldPassword'), controller: _old, obscureText: true, decoration: _dec(widget.forced ? 'Mật khẩu tạm' : 'Mật khẩu hiện tại'),
                validator: (v) => (v ?? '').isEmpty ? 'Nhập mật khẩu hiện tại' : null),
            const SizedBox(height: BtaSpace.s3),
            TextFormField(key: const Key('newPassword'), controller: _new, obscureText: true, decoration: _dec('Mật khẩu mới (≥ 6 ký tự)'),
                validator: (v) => (v ?? '').length < 6 ? 'Mật khẩu mới tối thiểu 6 ký tự' : null),
            const SizedBox(height: BtaSpace.s3),
            TextFormField(key: const Key('confirmPassword'), controller: _confirm, obscureText: true, decoration: _dec('Nhập lại mật khẩu mới'),
                validator: (v) => v != _new.text ? 'Mật khẩu nhập lại không khớp' : null),
            const SizedBox(height: BtaSpace.s5),
            SizedBox(
              height: BtaSize.tapTarget,
              child: FilledButton(
                key: const Key('savePassword'),
                onPressed: _busy ? null : _submit,
                child: _busy ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Lưu mật khẩu'),
              ),
            ),
          ]),
        ),
      ),
    );
  }
}

/// Màn chọn nhà xe khi tài khoản thuộc nhiều merchant (sau login).
class ChooseMerchantPage extends StatelessWidget {
  const ChooseMerchantPage({super.key});
  @override
  Widget build(BuildContext context) {
    final auth = AppScope.of(context).auth;
    return Scaffold(
      appBar: MobileHeader(title: 'Chọn nhà xe', subtitle: auth.me?.phone ?? auth.me?.email, actions: [IconButton(tooltip: 'Đăng xuất', onPressed: auth.logout, icon: const Icon(Icons.logout))]),
      body: MerchantPickerList(onSelect: auth.selectMerchant),
    );
  }
}
