/// Dữ liệu điều hướng của một push (payload `data` do API gửi: type, entityType, entityId, merchantId).
class PushTarget {
  const PushTarget({this.type = '', this.entityType = '', this.entityId = '', this.merchantId = '', this.title, this.body});

  factory PushTarget.fromData(Map<String, dynamic> data, {String? title, String? body}) => PushTarget(
        type: '${data['type'] ?? ''}',
        entityType: '${data['entityType'] ?? ''}',
        entityId: '${data['entityId'] ?? ''}',
        merchantId: '${data['merchantId'] ?? ''}',
        title: title,
        body: body,
      );

  final String type;
  final String entityType;
  final String entityId;
  final String merchantId;
  final String? title;
  final String? body;

  bool get hasEntity => entityType.isNotEmpty && entityId.isNotEmpty;

  Map<String, String> toData() => {'type': type, 'entityType': entityType, 'entityId': entityId, 'merchantId': merchantId};

  @override
  String toString() => 'PushTarget($type $entityType/$entityId m=$merchantId)';
}
