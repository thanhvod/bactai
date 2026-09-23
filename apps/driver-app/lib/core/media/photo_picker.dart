import 'dart:io';

import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../../features/field/domain/field_models.dart';

/// Chụp/chọn ảnh và lưu bản sao vào thư mục app (không mất khi offline, hàng đợi upload đọc lại được).
/// Nén bằng image_picker (maxWidth 1600, quality 70) — ảnh POD ~200–400KB.
abstract class PhotoPicker {
  Future<LocalFile?> camera();
  Future<List<LocalFile>> gallery({int limit = 10});
}

class DevicePhotoPicker implements PhotoPicker {
  final _picker = ImagePicker();

  Future<LocalFile> _persist(XFile x) async {
    final dir = Directory(p.join((await getApplicationDocumentsDirectory()).path, 'pending_uploads'));
    await dir.create(recursive: true);
    final ext = p.extension(x.path).isEmpty ? '.jpg' : p.extension(x.path).toLowerCase();
    final name = 'IMG_${DateTime.now().millisecondsSinceEpoch}$ext';
    final dest = await File(x.path).copy(p.join(dir.path, name));
    final type = ext == '.png' ? 'image/png' : (ext == '.heic' ? 'image/heic' : 'image/jpeg');
    return LocalFile(path: dest.path, fileName: name, contentType: type, capturedAt: DateTime.now());
  }

  @override
  Future<LocalFile?> camera() async {
    final x = await _picker.pickImage(source: ImageSource.camera, maxWidth: 1600, imageQuality: 70);
    return x == null ? null : _persist(x);
  }

  @override
  Future<List<LocalFile>> gallery({int limit = 10}) async {
    final xs = await _picker.pickMultiImage(maxWidth: 1600, imageQuality: 70, limit: limit);
    return [for (final x in xs.take(limit)) await _persist(x)];
  }
}
