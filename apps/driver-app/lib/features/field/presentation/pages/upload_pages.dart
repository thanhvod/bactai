import 'dart:async';

import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/di/di.dart';
import '../../../../core/media/photo_picker.dart';
import '../../../../core/ui/ui_helpers.dart';
import '../../data/field_repository.dart';
import '../../domain/field_models.dart';
import '../cubit/trip_cubit.dart';
import 'trip_detail_page.dart';

/// Trạng thái upload từng ảnh; dùng chung POD (DA-POD-01) và chứng từ (DA-ATT-01).
class _Uploader {
  _Uploader(this.onChange);
  final VoidCallback onChange;
  final List<PodPhoto> photos = [];
  final Map<String, LocalFile> files = {};

  Future<void> add(LocalFile f, Future<({bool queued})> Function(LocalFile) send) async {
    final id = f.path;
    files[id] = f;
    photos.add(PodPhoto(id: id, localPath: f.path, status: PodPhotoStatus.uploading));
    onChange();
    await _send(id, send);
  }

  Future<void> retry(String id, Future<({bool queued})> Function(LocalFile) send) => _send(id, send);

  Future<void> _send(String id, Future<({bool queued})> Function(LocalFile) send) async {
    _set(id, (p) => p.copyWith(status: PodPhotoStatus.uploading));
    try {
      final r = await send(files[id]!);
      _set(id, (p) => p.copyWith(status: r.queued ? PodPhotoStatus.queued : PodPhotoStatus.uploaded));
    } catch (e) {
      _set(id, (p) => p.copyWith(status: PodPhotoStatus.failed, error: e.toString()));
    }
  }

  void _set(String id, PodPhoto Function(PodPhoto) f) {
    final i = photos.indexWhere((p) => p.id == id);
    if (i >= 0) photos[i] = f(photos[i]);
    onChange();
  }

  int get uploaded => photos.where((p) => p.status == PodPhotoStatus.uploaded || p.status == PodPhotoStatus.queued).length;
  bool get busy => photos.any((p) => p.status == PodPhotoStatus.uploading);
}

/// DA-POD-01 — chụp/chọn ảnh POD cho điểm trả; mất mạng → ảnh vào hàng đợi (file giữ trong máy).
class PodCapturePage extends StatelessWidget {
  const PodCapturePage({super.key, required this.stopId});
  final String stopId;
  @override
  Widget build(BuildContext context) => BlocProvider(create: (_) => newTripCubit()..loadByStop(stopId), child: _PodView(stopId: stopId));
}

class _PodView extends StatefulWidget {
  const _PodView({required this.stopId});
  final String stopId;
  @override
  State<_PodView> createState() => _PodViewState();
}

class _PodViewState extends State<_PodView> {
  late final _up = _Uploader(() => setState(() {}));
  final _picker = getIt<PhotoPicker>();
  final _field = getIt<FieldRepository>();

  Future<({bool queued})> _send(LocalFile f) async {
    final st = context.read<TripCubit>().state.stop(widget.stopId);
    final r = await _field.uploadFile(entityType: 'ORDER_STOP', entityId: widget.stopId, category: 'POD', file: f, label: 'POD điểm ${st?.sequence ?? ''} ${st?.title ?? ''}'.trim());
    return (queued: r.queued);
  }

  Future<void> _camera() async {
    try {
      final f = await _picker.camera();
      if (f != null) await _up.add(f, _send);
    } catch (e) {
      if (mounted) showToast(context, 'Không mở được camera: $e', tone: BtaTone.danger);
    }
  }

  Future<void> _gallery() async {
    try {
      for (final f in await _picker.gallery(limit: 10 - _up.photos.length)) {
        unawaited(_up.add(f, _send));
      }
    } catch (e) {
      if (mounted) showToast(context, 'Không mở được thư viện ảnh: $e', tone: BtaTone.danger);
    }
  }

  void _finish() {
    context.read<TripCubit>().podAdded(widget.stopId, _up.uploaded);
    final queued = _up.photos.where((p) => p.status == PodPhotoStatus.queued).length;
    if (queued > 0) showToast(context, '$queued ảnh sẽ tự gửi khi có mạng', tone: BtaTone.warning);
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final st = context.watch<TripCubit>().state.stop(widget.stopId);
    return Scaffold(
      appBar: MobileHeader(title: 'Chụp POD', subtitle: st == null ? null : 'Điểm ${st.sequence} · ${st.title}', onBack: () => context.pop()),
      body: ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
        const BtaBanner(message: 'Chụp rõ biên nhận/phiếu giao có chữ ký người nhận và hàng đã giao.', tone: BtaTone.info),
        const SizedBox(height: BtaSpace.s3),
        if (st != null && st.podCount > 0) ...[Text('Đã có ${st.podCount} ảnh POD trên hệ thống', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)), const SizedBox(height: BtaSpace.s2)],
        PodCapture(
          photos: _up.photos,
          onCapture: _camera,
          onPickGallery: _gallery,
          onRetry: (p) => _up.retry(p.id, _send),
          onRemove: (p) => setState(() => _up.photos.removeWhere((x) => x.id == p.id)),
        ),
      ]),
      bottomNavigationBar: PrimaryBottomAction(label: _up.photos.isEmpty ? 'Chụp ảnh POD' : 'Xong', icon: _up.photos.isEmpty ? Icons.photo_camera : Icons.check, loading: _up.busy, onPressed: _up.photos.isEmpty ? _camera : _finish),
    );
  }
}

/// DA-ATT-01 — upload chứng từ khác (phiếu giao, biên nhận bốc xếp, chứng từ chi phí...) cho chuyến/điểm dừng.
class AttachmentUploadPage extends StatefulWidget {
  const AttachmentUploadPage({super.key, required this.entityType, required this.entityId, this.label});
  final String entityType;
  final String entityId;
  final String? label;
  @override
  State<AttachmentUploadPage> createState() => _AttachmentUploadPageState();
}

class _AttachmentUploadPageState extends State<AttachmentUploadPage> {
  static const _categories = [
    ('WAREHOUSE_SLIP', 'Phiếu xuất kho'),
    ('LOADING_RECEIPT', 'Biên nhận bốc xếp'),
    ('EXPENSE_RECEIPT', 'Chứng từ chi phí (cầu đường...)'),
    ('INVOICE', 'Hóa đơn'),
    ('INCIDENT_PHOTO', 'Ảnh sự cố'),
    ('OTHER', 'Khác'),
  ];
  String _category = 'WAREHOUSE_SLIP';
  late final _up = _Uploader(() => setState(() {}));
  final _picker = getIt<PhotoPicker>();

  Future<({bool queued})> _send(LocalFile f) async {
    final r = await getIt<FieldRepository>().uploadFile(entityType: widget.entityType, entityId: widget.entityId, category: _category, file: f, label: '${widget.label ?? 'Chứng từ'}: ${f.fileName}');
    return (queued: r.queued);
  }

  Future<void> _pick(bool camera) async {
    try {
      final files = camera ? [?await _picker.camera()] : await _picker.gallery();
      for (final f in files) {
        unawaited(_up.add(f, _send));
      }
    } catch (e) {
      if (mounted) showToast(context, 'Không lấy được ảnh: $e', tone: BtaTone.danger);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: MobileHeader(title: 'Upload chứng từ', subtitle: widget.label, onBack: () => context.pop()),
      body: ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
        const Text('Loại chứng từ', style: BtaText.bodyStrong),
        const SizedBox(height: BtaSpace.s2),
        Wrap(spacing: BtaSpace.s2, runSpacing: BtaSpace.s2, children: [
          for (final (code, label) in _categories) ChoiceChip(label: Text(label), selected: _category == code, onSelected: (_) => setState(() => _category = code)),
        ]),
        const SizedBox(height: BtaSpace.s4),
        PodCapture(photos: _up.photos, onCapture: () => _pick(true), onPickGallery: () => _pick(false), onRetry: (p) => _up.retry(p.id, _send)),
      ]),
      bottomNavigationBar: PrimaryBottomAction(label: 'Lưu chứng từ', icon: Icons.check, loading: _up.busy, onPressed: _up.photos.isEmpty ? null : () => context.pop()),
    );
  }
}

/// DA-INC-01 — báo sự cố (tách khỏi trạng thái tạm dừng); offline → xếp hàng đợi.
class IncidentReportPage extends StatelessWidget {
  const IncidentReportPage({super.key, required this.tripId});
  final String tripId;
  @override
  Widget build(BuildContext context) => BlocProvider(create: (_) => newTripCubit()..load(tripId), child: TripMessageListener(child: _IncidentView(tripId: tripId)));
}

class _IncidentView extends StatefulWidget {
  const _IncidentView({required this.tripId});
  final String tripId;
  @override
  State<_IncidentView> createState() => _IncidentViewState();
}

class _IncidentViewState extends State<_IncidentView> {
  List<CatalogOption> _types = const [];
  CatalogOption? _type;
  IncidentSeverity _severity = IncidentSeverity.MEDIUM;
  String? _stopId;
  final _title = TextEditingController();
  final _desc = TextEditingController();
  final List<LocalFile> _photos = [];
  bool _submitted = false;

  @override
  void initState() {
    super.initState();
    getIt<FieldRepository>().catalog('INCIDENT_TYPE').then((v) {
      if (mounted) setState(() => _types = v);
    }).catchError((_) {});
  }

  @override
  void dispose() {
    _title.dispose();
    _desc.dispose();
    super.dispose();
  }

  Future<void> _addPhoto() async {
    try {
      final f = await getIt<PhotoPicker>().camera();
      if (f != null) setState(() => _photos.add(f));
    } catch (e) {
      if (mounted) showToast(context, 'Không mở được camera: $e', tone: BtaTone.danger);
    }
  }

  Future<void> _submit() async {
    setState(() => _submitted = true);
    final title = _title.text.trim().isNotEmpty ? _title.text.trim() : (_type?.name ?? '');
    if (title.isEmpty) return;
    final r = await context.read<TripCubit>().reportIncident(
          title: title,
          severity: _severity,
          typeId: _type?.id,
          stopId: _stopId,
          description: _desc.text.trim().isEmpty ? null : _desc.text.trim(),
          photos: _photos,
        );
    if (r != null && mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final s = context.watch<TripCubit>().state;
    final t = s.trip;
    final missingTitle = _submitted && _title.text.trim().isEmpty && _type == null;
    return Scaffold(
      appBar: MobileHeader(title: 'Báo sự cố', subtitle: t?.code, onBack: () => context.pop()),
      body: ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: [
        const Text('Loại sự cố', style: BtaText.bodyStrong),
        const SizedBox(height: BtaSpace.s2),
        Wrap(spacing: BtaSpace.s2, runSpacing: BtaSpace.s2, children: [
          for (final ty in _types) ChoiceChip(label: Text(ty.name), selected: _type?.id == ty.id, onSelected: (_) => setState(() => _type = ty)),
        ]),
        const SizedBox(height: BtaSpace.s3),
        const Text('Mức độ', style: BtaText.bodyStrong),
        const SizedBox(height: BtaSpace.s2),
        Wrap(spacing: BtaSpace.s2, children: [
          for (final sv in [IncidentSeverity.LOW, IncidentSeverity.MEDIUM, IncidentSeverity.HIGH])
            ChoiceChip(label: Text(incidentSeverityMeta[sv]!.label), selected: _severity == sv, onSelected: (_) => setState(() => _severity = sv)),
        ]),
        const SizedBox(height: BtaSpace.s3),
        TextField(controller: _title, decoration: InputDecoration(labelText: 'Tiêu đề ngắn', hintText: 'VD: Thủng lốp trên QL1A', errorText: missingTitle ? 'Nhập tiêu đề hoặc chọn loại sự cố' : null)),
        const SizedBox(height: BtaSpace.s3),
        TextField(controller: _desc, maxLines: 4, decoration: const InputDecoration(labelText: 'Mô tả (không bắt buộc)')),
        if (t != null && t.stops.isNotEmpty) ...[
          const SizedBox(height: BtaSpace.s3),
          DropdownButtonFormField<String?>(
            initialValue: _stopId,
            decoration: const InputDecoration(labelText: 'Liên quan điểm dừng (không bắt buộc)'),
            items: [const DropdownMenuItem(value: null, child: Text('Cả chuyến')), for (final st in t.stops) DropdownMenuItem(value: st.id, child: Text('${st.sequence}. ${st.title}'))],
            onChanged: (v) => setState(() => _stopId = v),
          ),
        ],
        const SizedBox(height: BtaSpace.s3),
        Row(children: [
          OutlinedButton.icon(onPressed: _addPhoto, icon: const Icon(Icons.photo_camera_outlined), label: Text(_photos.isEmpty ? 'Chụp ảnh' : 'Thêm ảnh (${_photos.length})')),
        ]),
        if (_photos.isNotEmpty) ...[
          const SizedBox(height: BtaSpace.s2),
          PodCapture(photos: [for (final p in _photos) PodPhoto(id: p.path, localPath: p.path)], onRemove: (p) => setState(() => _photos.removeWhere((x) => x.path == p.id))),
        ],
      ]),
      bottomNavigationBar: PrimaryBottomAction(label: 'Gửi sự cố', icon: Icons.send, destructive: true, loading: s.busy, onPressed: t == null ? null : _submit),
    );
  }
}
