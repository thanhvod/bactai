import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../auth/presentation/cubit/auth_cubit.dart';

class ChangePasswordPage extends StatefulWidget {
  const ChangePasswordPage({super.key});

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
    try {
      await context.read<AuthCubit>().changePassword(_old.text, _new.text);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã đổi mật khẩu')));
      context.pop();
    } on ApiException catch (e) {
      setState(() => _error = e.code == 'VALIDATION_ERROR' || e.isUnauthenticated ? 'Mật khẩu hiện tại không đúng.' : e.message);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: MobileHeader(title: 'Đổi mật khẩu', onBack: () => context.pop()),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.all(BtaSpace.s4),
          children: [
            if (_error != null) ...[BtaBanner(tone: BtaTone.danger, message: _error!), const SizedBox(height: BtaSpace.s3)],
            TextFormField(controller: _old, obscureText: true, decoration: const InputDecoration(labelText: 'Mật khẩu hiện tại'), validator: (v) => (v ?? '').isEmpty ? 'Nhập mật khẩu hiện tại' : null),
            const SizedBox(height: BtaSpace.s3),
            TextFormField(controller: _new, obscureText: true, decoration: const InputDecoration(labelText: 'Mật khẩu mới (tối thiểu 6 ký tự)'), validator: (v) => (v ?? '').length < 6 ? 'Tối thiểu 6 ký tự' : null),
            const SizedBox(height: BtaSpace.s3),
            TextFormField(controller: _confirm, obscureText: true, decoration: const InputDecoration(labelText: 'Nhập lại mật khẩu mới'), validator: (v) => v != _new.text ? 'Không khớp mật khẩu mới' : null),
          ],
        ),
      ),
      bottomNavigationBar: PrimaryBottomAction(label: 'Lưu mật khẩu', loading: _busy, onPressed: _submit),
    );
  }
}
