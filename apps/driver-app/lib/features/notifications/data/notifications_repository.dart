import 'package:bta_flutter_ui/bta_flutter_ui.dart';

import '../../../core/api/driver_api.dart';

class DriverNotification {
  const DriverNotification({required this.id, required this.type, required this.title, this.body, this.entityType, this.entityId, this.readAt, required this.createdAt});
  final String id;
  final NotificationType? type;
  final String title;
  final String? body;
  final String? entityType;
  final String? entityId;
  final DateTime? readAt;
  final DateTime createdAt;

  bool get unread => readAt == null;

  factory DriverNotification.fromJson(Map<String, dynamic> j) => DriverNotification(
        id: j['id'] as String,
        type: notificationTypeFromApi(j['type'] as String?),
        title: (j['title'] ?? '') as String,
        body: j['body'] as String?,
        entityType: j['entityType'] as String?,
        entityId: j['entityId'] as String?,
        readAt: j['readAt'] == null ? null : DateTime.tryParse(j['readAt'] as String)?.toLocal(),
        createdAt: DateTime.tryParse((j['createdAt'] ?? '') as String)?.toLocal() ?? DateTime.now(),
      );

  DriverNotification read() => DriverNotification(id: id, type: type, title: title, body: body, entityType: entityType, entityId: entityId, readAt: DateTime.now(), createdAt: createdAt);
}

class NotificationsRepository {
  NotificationsRepository(this._api);
  final DriverApi _api;

  Future<({List<DriverNotification> items, int unread})> list({bool unreadOnly = false}) async {
    final r = await _api.notifications(unreadOnly: unreadOnly);
    return (
      items: ((r['nodes'] as List?) ?? const []).map((e) => DriverNotification.fromJson(e as Map<String, dynamic>)).toList(),
      unread: (r['unreadCount'] as num?)?.toInt() ?? 0,
    );
  }

  Future<int> unreadCount() => _api.unreadNotificationCount();
  Future<int> markRead(String id) => _api.markNotificationRead(id);
  Future<int> markAllRead() => _api.markAllNotificationsRead();
}
