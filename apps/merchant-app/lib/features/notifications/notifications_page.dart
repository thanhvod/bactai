import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';

import '../../core/push/merchant_push.dart';
import 'package:go_router/go_router.dart';

import '../../core/app_scope.dart';
import '../../core/router/routes.dart';
import '../../models/models.dart';
import '../../shared/async_view.dart';
import '../../shared/ui_helpers.dart';

/// Đường dẫn app tương ứng entity của thông báo (null nếu không mở được trên app).
String? notificationTarget(NotificationItem n) {
  final id = n.entityId;
  if (id == null) return null;
  switch (n.entityType) {
    case 'ORDER':
      return MerchantRoutes.orderDetailPath(id);
    case 'TRIP':
      return MerchantRoutes.tripDetailPath(id);
    case 'CUSTOMER':
      return MerchantRoutes.customerDetailPath(id);
    case 'PAYROLL':
      return MerchantRoutes.payrollDetailPath(id);
    case 'DRIVER':
      return MerchantRoutes.pCod;
    default:
      return null;
  }
}

/// MA-NOTI-01 — cảnh báo & việc cần duyệt/xử lý.
class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});
  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  bool _unreadOnly = false;
  final _key = GlobalKey<AsyncViewState<PageResult<NotificationItem>>>();

  @override
  Widget build(BuildContext context) {
    final repo = AppScope.repo(context);
    return Scaffold(
      appBar: MobileHeader(
        title: 'Thông báo',
        onBack: context.canPop() ? () => context.pop() : null,
        actions: [
          TextButton(
            onPressed: () async {
              if (await runAction(context, repo.markAllNotificationsRead, success: 'Đã đánh dấu tất cả đã đọc')) _key.currentState?.reload();
            },
            child: const Text('Đọc tất cả'),
          ),
        ],
      ),
      body: Column(children: [
        FilterChipsBar(options: const {'all': 'Tất cả', 'unread': 'Chưa đọc'}, value: _unreadOnly ? 'unread' : 'all', onChanged: (v) {
          setState(() => _unreadOnly = v == 'unread');
          _key.currentState?.reload();
        }),
        Expanded(
          child: AsyncView<PageResult<NotificationItem>>(
            key: _key,
            refreshOn: merchantPushTick,
            load: () => repo.notifications(unreadOnly: _unreadOnly),
            isEmpty: (p) => p.items.isEmpty,
            emptyMessage: 'Không có thông báo',
            emptyIcon: Icons.notifications_none,
            builder: (context, page, reload) => ListView.separated(
              itemCount: page.items.length,
              separatorBuilder: (_, _) => const Divider(height: 1),
              itemBuilder: (context, i) {
                final n = page.items[i];
                final meta = notificationTypeMeta[notificationTypeFromApi(n.type)];
                return ListTile(
                  tileColor: n.isRead ? null : BtaColors.primarySoft,
                  title: Text(n.title, style: n.isRead ? BtaText.body : BtaText.bodyStrong),
                  subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    if (n.body != null) Text(n.body!),
                    const SizedBox(height: 4),
                    Row(children: [
                      if (meta != null) StatusBadge(label: meta.label, tone: meta.tone, compact: true),
                      const SizedBox(width: 8),
                      Text(BtaFormat.dateTime(n.createdAt), style: BtaText.caption.copyWith(color: BtaColors.textSubtle)),
                    ]),
                  ]),
                  onTap: () async {
                    if (!n.isRead) await repo.markNotificationRead(n.id);
                    final target = notificationTarget(n);
                    if (!context.mounted) return;
                    if (target != null) {
                      context.push(target);
                    } else {
                      reload();
                    }
                  },
                );
              },
            ),
          ),
        ),
      ]),
    );
  }
}
