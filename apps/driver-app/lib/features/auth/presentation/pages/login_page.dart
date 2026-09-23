import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/routes.dart';
import '../cubit/auth_cubit.dart';

/// DA-AUTH-02 — đăng nhập SĐT + mật khẩu do nhà xe cấp.
class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _form = GlobalKey<FormState>();
  final _phone = TextEditingController();
  final _password = TextEditingController();
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
    await context.read<AuthCubit>().login(_phone.text, _password.text);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthCubit>().state;
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(BtaSpace.s6),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Form(
                key: _form,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(color: BtaColors.primary, borderRadius: BorderRadius.circular(BtaRadius.md)),
                        child: const Icon(Icons.local_shipping, color: Colors.white),
                      ),
                      const SizedBox(width: BtaSpace.s3),
                      const Text('BTA Tài xế', style: BtaText.headingLg),
                    ]),
                    const SizedBox(height: BtaSpace.s6),
                    const Text('Đăng nhập', style: BtaText.displaySm),
                    const SizedBox(height: BtaSpace.s1),
                    Text('Dùng số điện thoại và mật khẩu do nhà xe cấp.', style: BtaText.body.copyWith(color: BtaColors.textMuted)),
                    const SizedBox(height: BtaSpace.s5),
                    if (auth.error != null) ...[
                      BtaBanner(tone: BtaTone.danger, message: auth.error!),
                      const SizedBox(height: BtaSpace.s3),
                    ],
                    Text('Số điện thoại', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
                    const SizedBox(height: BtaSpace.s1),
                    TextFormField(
                      controller: _phone,
                      keyboardType: TextInputType.phone,
                      autofillHints: const [AutofillHints.telephoneNumber],
                      textInputAction: TextInputAction.next,
                      style: BtaText.mobileKey,
                      decoration: const InputDecoration(hintText: '09xx xxx xxx', prefixIcon: Icon(Icons.phone_outlined)),
                      validator: (v) => (v == null || v.trim().length < 9) ? 'Nhập số điện thoại' : null,
                    ),
                    const SizedBox(height: BtaSpace.s4),
                    Text('Mật khẩu', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
                    const SizedBox(height: BtaSpace.s1),
                    TextFormField(
                      controller: _password,
                      obscureText: _obscure,
                      autofillHints: const [AutofillHints.password],
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _submit(),
                      style: BtaText.mobileKey,
                      decoration: InputDecoration(
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          tooltip: _obscure ? 'Hiện mật khẩu' : 'Ẩn mật khẩu',
                          onPressed: () => setState(() => _obscure = !_obscure),
                          icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                        ),
                      ),
                      validator: (v) => (v == null || v.isEmpty) ? 'Nhập mật khẩu' : null,
                    ),
                    const SizedBox(height: BtaSpace.s5),
                    FilledButton(
                      onPressed: auth.busy ? null : _submit,
                      child: auth.busy
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Đăng nhập'),
                    ),
                    const SizedBox(height: BtaSpace.s3),
                    TextButton(onPressed: () => context.push(DriverRoutes.pForgotPassword), child: const Text('Quên mật khẩu?')),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
