import 'package:bta_flutter_ui/bta_flutter_ui.dart';
import 'package:flutter/material.dart';

import '../../core/app_scope.dart';
import '../../models/models.dart';

/// Danh sách nhà xe (membership ACTIVE) — dùng ở màn chọn nhà xe và bottom sheet "Đổi nhà xe".
class MerchantPickerList extends StatelessWidget {
  const MerchantPickerList({super.key, required this.onSelect});
  final Future<void> Function(String merchantId) onSelect;

  @override
  Widget build(BuildContext context) {
    final auth = AppScope.of(context).auth;
    final items = auth.me?.activeMemberships ?? const <Membership>[];
    if (items.isEmpty) return const EmptyState(message: 'Chưa thuộc nhà xe nào');
    return ListView(
      shrinkWrap: true,
      children: [
        for (final m in items)
          ListRow(
            icon: Icons.local_shipping_outlined,
            label: m.merchantName,
            value: '${m.merchantCode} · ${roleLabels[m.role] ?? m.role}',
            trailing: m.merchantId == auth.merchantId ? const Icon(Icons.check, color: BtaColors.primary) : const Icon(Icons.chevron_right),
            onTap: () => onSelect(m.merchantId),
          ),
      ],
    );
  }
}

Future<void> showMerchantPicker(BuildContext context) {
  final auth = AppScope.authOf(context);
  return showModalBottomSheet<void>(
    context: context,
    backgroundColor: BtaColors.surface,
    builder: (ctx) => SafeArea(
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        const Padding(padding: EdgeInsets.all(BtaSpace.s4), child: Text('Đổi nhà xe', style: BtaText.headingMd)),
        MerchantPickerList(onSelect: (id) async {
          Navigator.of(ctx).pop();
          await auth.selectMerchant(id);
        }),
      ]),
    ),
  );
}
