import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

class ReasonOption {
  const ReasonOption({required this.id, required this.label});
  final String id;
  final String label;
}

class ReasonResult {
  const ReasonResult({this.reasonId, this.reasonLabel, this.note});
  final String? reasonId;
  final String? reasonLabel;
  final String? note;
}

/// Bottom sheet chọn lý do (danh mục) + ghi chú. Trả về null nếu hủy.
/// `requireNote` bắt buộc ghi chú (ví dụ sửa COD: lý do tự do ≥ 5 ký tự).
Future<ReasonResult?> showReasonBottomSheet(
  BuildContext context, {
  required String title,
  List<ReasonOption> reasons = const [],
  String confirmLabel = 'Xác nhận',
  bool requireNote = false,
  bool requireReason = true,
  String noteHint = 'Ghi chú thêm (không bắt buộc)',
  int minNoteLength = 5,
}) {
  return showModalBottomSheet<ReasonResult>(
    context: context,
    isScrollControlled: true,
    backgroundColor: BtaColors.surface,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(BtaRadius.lg))),
    builder: (ctx) => _ReasonSheet(
      title: title,
      reasons: reasons,
      confirmLabel: confirmLabel,
      requireNote: requireNote,
      requireReason: requireReason && reasons.isNotEmpty,
      noteHint: noteHint,
      minNoteLength: minNoteLength,
    ),
  );
}

class _ReasonSheet extends StatefulWidget {
  const _ReasonSheet({
    required this.title,
    required this.reasons,
    required this.confirmLabel,
    required this.requireNote,
    required this.requireReason,
    required this.noteHint,
    required this.minNoteLength,
  });
  final String title;
  final List<ReasonOption> reasons;
  final String confirmLabel;
  final bool requireNote;
  final bool requireReason;
  final String noteHint;
  final int minNoteLength;

  @override
  State<_ReasonSheet> createState() => _ReasonSheetState();
}

class _ReasonSheetState extends State<_ReasonSheet> {
  String? _reasonId;
  final _note = TextEditingController();

  bool get _valid {
    if (widget.requireReason && _reasonId == null) return false;
    if (widget.requireNote && _note.text.trim().length < widget.minNoteLength) return false;
    return true;
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    return AnimatedPadding(
      duration: const Duration(milliseconds: 150),
      padding: EdgeInsets.only(bottom: bottom),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(BtaSpace.s4, BtaSpace.s4, BtaSpace.s4, BtaSpace.s3),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(widget.title, style: BtaText.headingMd),
              const SizedBox(height: BtaSpace.s3),
              if (widget.reasons.isNotEmpty)
                ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 280),
                  child: RadioGroup<String>(
                    groupValue: _reasonId,
                    onChanged: (v) => setState(() => _reasonId = v),
                    child: ListView(
                      shrinkWrap: true,
                      children: [
                        for (final r in widget.reasons)
                          RadioListTile<String>(
                            value: r.id,
                            title: Text(r.label, style: BtaText.body),
                            contentPadding: EdgeInsets.zero,
                            dense: true,
                            visualDensity: VisualDensity.compact,
                          ),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: BtaSpace.s2),
              TextField(
                controller: _note,
                minLines: 2,
                maxLines: 4,
                onChanged: (_) => setState(() {}),
                decoration: InputDecoration(
                  hintText: widget.requireNote ? 'Lý do (tối thiểu ${widget.minNoteLength} ký tự)' : widget.noteHint,
                ),
              ),
              const SizedBox(height: BtaSpace.s4),
              Row(
                children: [
                  Expanded(child: OutlinedButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Hủy'))),
                  const SizedBox(width: BtaSpace.s3),
                  Expanded(
                    flex: 2,
                    child: FilledButton(
                      onPressed: _valid
                          ? () {
                              final r = widget.reasons.where((e) => e.id == _reasonId).firstOrNull;
                              Navigator.of(context).pop(ReasonResult(
                                reasonId: r?.id,
                                reasonLabel: r?.label,
                                note: _note.text.trim().isEmpty ? null : _note.text.trim(),
                              ));
                            }
                          : null,
                      child: Text(widget.confirmLabel),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
