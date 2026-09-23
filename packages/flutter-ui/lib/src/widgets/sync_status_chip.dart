import 'package:flutter/material.dart';
import '../domain/status.dart';
import '../tokens/bta_tokens.dart';
import 'status_badge.dart';

/// Chip trạng thái đồng bộ: ok | pending(n) | offline.
class SyncStatusChip extends StatelessWidget {
  const SyncStatusChip({super.key, required this.state, this.pendingCount = 0, this.onTap});
  final SyncState state;
  final int pendingCount;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    late final StatusBadge badge;
    switch (state) {
      case SyncState.ok:
        badge = const StatusBadge(label: 'Đã đồng bộ', tone: BtaTone.success, icon: Icons.cloud_done_outlined);
      case SyncState.pending:
        badge = StatusBadge(label: 'Chờ đồng bộ $pendingCount', tone: BtaTone.warning, icon: Icons.sync);
      case SyncState.offline:
        badge = StatusBadge(label: pendingCount > 0 ? 'Offline · $pendingCount chờ' : 'Offline', tone: BtaTone.danger, icon: Icons.cloud_off_outlined);
    }
    if (onTap == null) return badge;
    return InkWell(onTap: onTap, borderRadius: BorderRadius.circular(BtaRadius.sm), child: Padding(padding: const EdgeInsets.all(4), child: badge));
  }
}
