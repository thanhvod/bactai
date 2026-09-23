import 'package:bta_flutter_core/bta_flutter_core.dart';
import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../cubit/sync_cubit.dart';

/// DA-SYNC-01 — hàng đợi chưa gửi: retry tất cả / từng mục, xem lỗi.
class SyncPage extends StatelessWidget {
  const SyncPage({super.key});

  static String _typeLabel(QueueItemType t) {
    switch (t) {
      case QueueItemType.TRIP_STATUS:
        return 'Trạng thái chuyến';
      case QueueItemType.STOP_STATUS:
        return 'Trạng thái điểm dừng';
      case QueueItemType.COD:
        return 'COD thực thu';
      case QueueItemType.UPLOAD:
        return 'Chứng từ / POD';
      case QueueItemType.GPS_BATCH:
        return 'Vị trí GPS';
      case QueueItemType.INCIDENT:
        return 'Báo sự cố';
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = context.watch<SyncCubit>().state;
    return Scaffold(
      appBar: MobileHeader(title: 'Đồng bộ dữ liệu', subtitle: s.online ? 'Đang có mạng' : 'Mất kết nối', onBack: () => context.pop()),
      body: Column(
        children: [
          if (!s.online) OfflineBanner(pendingCount: s.pendingCount),
          if (s.syncedAt != null && s.items.isEmpty)
            Padding(padding: const EdgeInsets.all(BtaSpace.s4), child: BtaBanner(message: 'Đồng bộ xong lúc ${BtaFormat.time(s.syncedAt)}', tone: BtaTone.success)),
          Expanded(
            child: s.items.isEmpty
                ? const EmptyState(icon: Icons.cloud_done_outlined, title: 'Đã đồng bộ hết', message: 'Không có mục nào chờ gửi.')
                : ListView.separated(
                    padding: const EdgeInsets.all(BtaSpace.s4),
                    itemCount: s.items.length,
                    separatorBuilder: (_, _) => const SizedBox(height: BtaSpace.s2),
                    itemBuilder: (_, i) {
                      final it = s.items[i];
                      final failed = it.status == QueueItemStatus.failed;
                      return SectionCard(
                        padding: const EdgeInsets.all(BtaSpace.s3),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(children: [
                            Expanded(child: Text(_typeLabel(it.type), style: BtaText.bodyStrong)),
                            StatusBadge(label: failed ? 'Lỗi (${it.attempts})' : 'Chờ gửi', tone: failed ? BtaTone.danger : BtaTone.warning),
                          ]),
                          if (it.entityLabel != null) Text(it.entityLabel!, style: BtaText.body),
                          Text(BtaFormat.dateTime(it.capturedAt), style: BtaText.caption.copyWith(color: BtaColors.textSubtle)),
                          if (it.lastError != null) ...[
                            const SizedBox(height: BtaSpace.s1),
                            Text(it.lastError!, style: BtaText.bodySm.copyWith(color: BtaColors.danger)),
                          ],
                          const SizedBox(height: BtaSpace.s2),
                          Row(children: [
                            OutlinedButton(onPressed: s.replaying ? null : () => context.read<SyncCubit>().replayAll(ids: {it.id}), child: const Text('Thử lại')),
                            if (failed) ...[
                              const SizedBox(width: BtaSpace.s2),
                              TextButton(
                                style: TextButton.styleFrom(foregroundColor: BtaColors.danger),
                                onPressed: () async {
                                  final cubit = context.read<SyncCubit>();
                                  final ok = await showConfirmBottomSheet(context,
                                      title: 'Bỏ mục này?', message: 'Thao tác sẽ không được gửi lên hệ thống. Chỉ bỏ khi đã báo điều phối cập nhật thay.', confirmLabel: 'Bỏ mục', destructive: true);
                                  if (ok) await cubit.remove(it.id);
                                },
                                child: const Text('Bỏ mục'),
                              ),
                            ],
                          ]),
                        ]),
                      );
                    },
                  ),
          ),
        ],
      ),
      bottomNavigationBar: s.items.isEmpty
          ? null
          : PrimaryBottomAction(
              label: 'Thử lại tất cả',
              icon: Icons.sync,
              loading: s.replaying,
              onPressed: s.online ? () => context.read<SyncCubit>().replayAll() : null,
            ),
    );
  }
}
