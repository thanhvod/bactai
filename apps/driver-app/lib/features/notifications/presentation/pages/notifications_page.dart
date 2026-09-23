import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/routes.dart';
import '../../data/notifications_repository.dart';
import '../cubit/notifications_cubit.dart';

/// DA-NOTI-01 — chuyến mới/thay đổi, yêu cầu xử lý, cảnh báo COD. Chạm để mở chuyến.
class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});
  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  @override
  void initState() {
    super.initState();
    context.read<NotificationsCubit>().load();
  }

  void _open(DriverNotification n) {
    context.read<NotificationsCubit>().markRead(n);
    if (n.entityType == 'TRIP' && n.entityId != null) context.push(DriverRoutes.tripDetailPath(n.entityId!));
    if (n.entityType == 'ORDER_STOP' && n.entityId != null) context.push(DriverRoutes.stopDetailPath(n.entityId!));
    if (n.entityType == 'DRIVER') context.push(DriverRoutes.pMoney);
  }

  @override
  Widget build(BuildContext context) {
    final s = context.watch<NotificationsCubit>().state;
    return Scaffold(
      appBar: MobileHeader(
        title: 'Thông báo',
        subtitle: s.unread > 0 ? '${s.unread} chưa đọc' : null,
        actions: [if (s.unread > 0) TextButton(onPressed: () => context.read<NotificationsCubit>().markAllRead(), child: const Text('Đọc hết'))],
      ),
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(BtaSpace.s4, BtaSpace.s2, BtaSpace.s4, 0),
          child: Row(children: [
            ChoiceChip(label: const Text('Tất cả'), selected: !s.onlyUnread, onSelected: (_) => context.read<NotificationsCubit>().load(onlyUnread: false)),
            const SizedBox(width: BtaSpace.s2),
            ChoiceChip(label: const Text('Chưa đọc'), selected: s.onlyUnread, onSelected: (_) => context.read<NotificationsCubit>().load(onlyUnread: true)),
          ]),
        ),
        Expanded(
          child: s.loading && s.items.isEmpty
              ? ListView(padding: const EdgeInsets.all(BtaSpace.s4), children: const [SkeletonCard(), SizedBox(height: BtaSpace.s2), SkeletonCard()])
              : s.error != null && s.items.isEmpty
                  ? ErrorState(message: s.error!, onRetry: () => context.read<NotificationsCubit>().load())
                  : s.items.isEmpty
                      ? const EmptyState(icon: Icons.notifications_none, message: 'Chưa có thông báo.')
                      : RefreshIndicator(
                          onRefresh: () => context.read<NotificationsCubit>().load(),
                          child: ListView.separated(
                            padding: const EdgeInsets.all(BtaSpace.s4),
                            itemCount: s.items.length,
                            separatorBuilder: (_, _) => const SizedBox(height: BtaSpace.s2),
                            itemBuilder: (_, i) {
                              final n = s.items[i];
                              final meta = n.type == null ? null : notificationTypeMeta[n.type];
                              return SectionCard(
                                onTap: () => _open(n),
                                padding: const EdgeInsets.all(BtaSpace.s3),
                                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    margin: const EdgeInsets.only(top: 8, right: BtaSpace.s2),
                                    decoration: BoxDecoration(shape: BoxShape.circle, color: n.unread ? BtaColors.primary : Colors.transparent),
                                  ),
                                  Expanded(
                                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                      if (meta != null) StatusBadge(label: meta.label, tone: meta.tone, compact: true),
                                      const SizedBox(height: 4),
                                      Text(n.title, style: n.unread ? BtaText.bodyStrong : BtaText.body),
                                      if (n.body != null) Text(n.body!, style: BtaText.bodySm.copyWith(color: BtaColors.textMuted)),
                                      Text(BtaFormat.dateTime(n.createdAt), style: BtaText.caption.copyWith(color: BtaColors.textSubtle)),
                                    ]),
                                  ),
                                ]),
                              );
                            },
                          ),
                        ),
        ),
      ]),
    );
  }
}
