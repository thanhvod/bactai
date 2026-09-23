import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../cubit/trip_cubit.dart';
import 'trip_detail_page.dart';

/// DA-COD-01 — nhập COD thực thu ngay lúc nhận tiền. Khác dự kiến → xác nhận + lý do; sửa sau khi lưu → lý do bắt buộc (audit).
/// COD thực thu làm tăng "COD đang giữ" của tài xế; nộp lại cho kế toán KHÔNG phải doanh thu.
class CodInputPage extends StatelessWidget {
  const CodInputPage({super.key, required this.stopId});
  final String stopId;

  @override
  Widget build(BuildContext context) => BlocProvider(create: (_) => newTripCubit()..loadByStop(stopId), child: TripMessageListener(child: _CodView(stopId: stopId)));
}

class _CodView extends StatefulWidget {
  const _CodView({required this.stopId});
  final String stopId;
  @override
  State<_CodView> createState() => _CodViewState();
}

class _CodViewState extends State<_CodView> {
  int? _amount;
  bool _touched = false;
  final _note = TextEditingController();

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final cubit = context.read<TripCubit>();
    final st = cubit.state.stop(widget.stopId);
    final amount = _amount ?? (_touched ? null : (st?.codActual ?? st?.codExpected));
    if (st == null || amount == null || amount < 0) {
      setState(() => _touched = true);
      return;
    }
    final isEdit = st.codActual != null && st.codActual != amount;
    final differs = st.codExpected != null && amount != st.codExpected;
    String? reason;
    if (isEdit || differs) {
      final r = await showReasonBottomSheet(
        context,
        title: isEdit ? 'Sửa COD ${BtaFormat.vnd(st.codActual)} → ${BtaFormat.vnd(amount)}' : 'Thực thu ${BtaFormat.vnd(amount)} khác dự kiến ${BtaFormat.vnd(st.codExpected)}',
        requireNote: isEdit,
        noteHint: isEdit ? 'Lý do sửa (bắt buộc, ≥ 5 ký tự)' : 'Lý do chênh lệch (khách trả thiếu/thừa...)',
        confirmLabel: 'Xác nhận lưu COD',
      );
      if (r == null) return;
      reason = r.note;
    }
    final note = [_note.text.trim(), if (!isEdit && reason != null && reason.isNotEmpty) 'Chênh lệch: $reason'].where((e) => e.isNotEmpty).join(' · ');
    final ok = await cubit.submitCod(st.id, amount, note: note.isEmpty ? null : note, reason: isEdit ? reason : null);
    if (ok && mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final s = context.watch<TripCubit>().state;
    final st = s.stop(widget.stopId);
    return Scaffold(
      appBar: MobileHeader(title: 'Nhập COD thực thu', subtitle: st == null ? null : 'Điểm ${st.sequence} · ${st.title}', onBack: () => context.pop()),
      body: s.loading
          ? const Padding(padding: EdgeInsets.all(BtaSpace.s4), child: SkeletonCard())
          : st == null
              ? ErrorState(message: s.error ?? 'Không tìm thấy điểm dừng', onRetry: () => context.read<TripCubit>().loadByStop(widget.stopId))
              : ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
                  CodInput(
                    expected: st.codExpected,
                    initialActual: st.codActual,
                    previousAmount: st.codActual,
                    noteController: _note,
                    onChanged: (v) => setState(() {
                      _amount = v;
                      _touched = true;
                    }),
                  ),
                  if (_touched && _amount == null) ...[
                    const SizedBox(height: BtaSpace.s2),
                    Text('Nhập số tiền đã thu (0 nếu khách không trả)', style: BtaText.bodySm.copyWith(color: BtaColors.danger)),
                  ],
                  const SizedBox(height: BtaSpace.s3),
                  const BtaBanner(message: 'Tiền COD bạn đang giữ là tiền của công ty — nộp lại cho kế toán khi về.', tone: BtaTone.info),
                ]),
      bottomNavigationBar: PrimaryBottomAction(label: st?.codActual == null ? 'Lưu COD' : 'Lưu thay đổi', icon: Icons.save_outlined, loading: s.busy, onPressed: st == null ? null : _save),
    );
  }
}
