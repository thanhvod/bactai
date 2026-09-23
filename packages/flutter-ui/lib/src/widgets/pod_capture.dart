import 'dart:io';
import 'package:flutter/material.dart';
import '../tokens/bta_tokens.dart';

enum PodPhotoStatus { queued, uploading, uploaded, failed }

class PodPhoto {
  const PodPhoto({required this.id, this.localPath, this.remoteUrl, this.status = PodPhotoStatus.queued, this.progress = 0, this.error});
  final String id;
  final String? localPath;
  final String? remoteUrl;
  final PodPhotoStatus status;
  final double progress;
  final String? error;

  PodPhoto copyWith({PodPhotoStatus? status, double? progress, String? error, String? remoteUrl}) =>
      PodPhoto(id: id, localPath: localPath, remoteUrl: remoteUrl ?? this.remoteUrl, status: status ?? this.status, progress: progress ?? this.progress, error: error);
}

/// Lưới ảnh POD + trạng thái upload từng ảnh. Chỉ UI: app cung cấp callback chụp/thư viện/thử lại/xóa.
class PodCapture extends StatelessWidget {
  const PodCapture({super.key, required this.photos, this.onCapture, this.onPickGallery, this.onRetry, this.onRemove, this.maxPhotos = 10});
  final List<PodPhoto> photos;
  final VoidCallback? onCapture;
  final VoidCallback? onPickGallery;
  final ValueChanged<PodPhoto>? onRetry;
  final ValueChanged<PodPhoto>? onRemove;
  final int maxPhotos;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(children: [
          Expanded(child: FilledButton.icon(onPressed: photos.length >= maxPhotos ? null : onCapture, icon: const Icon(Icons.photo_camera_outlined), label: const Text('Chụp ảnh'))),
          const SizedBox(width: BtaSpace.s2),
          Expanded(child: OutlinedButton.icon(onPressed: photos.length >= maxPhotos ? null : onPickGallery, icon: const Icon(Icons.photo_library_outlined), label: const Text('Thư viện'))),
        ]),
        const SizedBox(height: BtaSpace.s3),
        if (photos.isEmpty)
          Container(
            height: 120,
            alignment: Alignment.center,
            decoration: BoxDecoration(border: Border.all(color: BtaColors.borderStrong), borderRadius: BorderRadius.circular(BtaRadius.md)),
            child: Text('Chưa có ảnh. Chụp ít nhất 1 ảnh POD tại điểm trả.', style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
          )
        else
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, mainAxisSpacing: BtaSpace.s2, crossAxisSpacing: BtaSpace.s2),
            itemCount: photos.length,
            itemBuilder: (_, i) => _Tile(photo: photos[i], onRetry: onRetry, onRemove: onRemove),
          ),
      ],
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({required this.photo, this.onRetry, this.onRemove});
  final PodPhoto photo;
  final ValueChanged<PodPhoto>? onRetry;
  final ValueChanged<PodPhoto>? onRemove;

  @override
  Widget build(BuildContext context) {
    Widget img;
    if (photo.localPath != null) {
      img = Image.file(File(photo.localPath!), fit: BoxFit.cover, errorBuilder: (_, _, _) => const ColoredBox(color: BtaColors.surfaceMuted));
    } else if (photo.remoteUrl != null) {
      img = Image.network(photo.remoteUrl!, fit: BoxFit.cover, errorBuilder: (_, _, _) => const ColoredBox(color: BtaColors.surfaceMuted));
    } else {
      img = const ColoredBox(color: BtaColors.surfaceMuted, child: Icon(Icons.image_outlined, color: BtaColors.textSubtle));
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(BtaRadius.md),
      child: Stack(
        fit: StackFit.expand,
        children: [
          img,
          Positioned(left: 0, right: 0, bottom: 0, child: _statusBar()),
          if (onRemove != null)
            Positioned(
              top: 0,
              right: 0,
              child: Material(
                color: Colors.black45,
                shape: const CircleBorder(),
                child: InkWell(customBorder: const CircleBorder(), onTap: () => onRemove!(photo), child: const Padding(padding: EdgeInsets.all(6), child: Icon(Icons.close, size: 16, color: Colors.white))),
              ),
            ),
          if (photo.status == PodPhotoStatus.failed && onRetry != null)
            Center(child: FilledButton.tonal(onPressed: () => onRetry!(photo), child: const Text('Thử lại'))),
        ],
      ),
    );
  }

  Widget _statusBar() {
    switch (photo.status) {
      case PodPhotoStatus.uploaded:
        return _bar(BtaColors.success, 'Đã tải lên', Icons.check);
      case PodPhotoStatus.uploading:
        return Column(mainAxisSize: MainAxisSize.min, children: [
          LinearProgressIndicator(value: photo.progress == 0 ? null : photo.progress, minHeight: 3),
          _bar(BtaColors.info, 'Đang tải...', Icons.cloud_upload_outlined),
        ]);
      case PodPhotoStatus.failed:
        return _bar(BtaColors.danger, 'Lỗi', Icons.error_outline);
      case PodPhotoStatus.queued:
        return _bar(BtaColors.warning, 'Chờ mạng', Icons.schedule);
    }
  }

  Widget _bar(Color c, String t, IconData i) => Container(
        color: c.withValues(alpha: 0.9),
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
        child: Row(children: [Icon(i, size: 12, color: Colors.white), const SizedBox(width: 4), Expanded(child: Text(t, style: BtaText.caption.copyWith(color: Colors.white), overflow: TextOverflow.ellipsis))]),
      );
}
