import 'package:bta_flutter_core/bta_flutter_core.dart';

/// Kết quả thao tác hiện trường: `queued` = mất mạng, đã xếp hàng đợi (UI cập nhật lạc quan).
class ActionResult<T> {
  const ActionResult({this.value, this.queued = false, this.warnings = const []});
  final T? value;
  final bool queued;
  final List<String> warnings;
}

/// Hàng đợi offline mà repository đẩy thao tác vào (SyncCubit implement).
abstract class ActionQueue {
  Future<void> enqueue(QueueItemType type, Map<String, dynamic> payload, {String? entityLabel, String? clientRequestId});
}

class CatalogOption {
  const CatalogOption({required this.id, required this.code, required this.name});
  final String id;
  final String code;
  final String name;
}

/// File đính kèm cục bộ chờ upload (ảnh POD, chứng từ, ảnh sự cố).
class LocalFile {
  const LocalFile({required this.path, required this.fileName, required this.contentType, this.capturedAt, this.lat, this.lng});
  final String path;
  final String fileName;
  final String contentType;
  final DateTime? capturedAt;
  final double? lat;
  final double? lng;
}
